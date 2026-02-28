"use client"

import { useState, useCallback } from "react"
import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  BASE_FEE,
  rpc,
  Address,
} from "@stellar/stellar-sdk"
import type { Account } from "@stellar/stellar-sdk"
import freighterApi from "@stellar/freighter-api"
import {
  getSorobanServer,
  TREASURY_CONTRACT_ID,
  STELLAR_CONFIG,
} from "@/lib/stellar-client"

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 60

export type CancelReleaseErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "USER_REJECTED"
  | "SIMULATION_FAILED"
  | "SEND_FAILED"
  | "TX_FAILED"
  | "UNKNOWN"

export interface CancelReleaseError {
  code: CancelReleaseErrorCode
  message: string
}

function isCancelReleaseError(err: unknown): err is CancelReleaseError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err
  )
}

async function getPublicKey(): Promise<string> {
  if (typeof window === "undefined") {
    throw {
      code: "WALLET_NOT_INSTALLED" as const,
      message: "Freighter no está disponible. Instalá la extensión y recargá.",
    } satisfies CancelReleaseError
  }
  const connectedRes = await freighterApi.isConnected()
  if (connectedRes.error) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message:
        connectedRes.error.message ??
        "No se pudo conectar con Freighter. Desbloqueá la wallet.",
    } satisfies CancelReleaseError
  }
  if (!connectedRes.isConnected) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message: "Abrí Freighter y desbloqueá tu wallet.",
    } satisfies CancelReleaseError
  }
  const addressRes = await freighterApi.getAddress()
  if (addressRes.error || !addressRes.address) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message:
          accessRes.error?.message ??
          "Autorizá este sitio en Freighter para cancelar la propuesta.",
      } satisfies CancelReleaseError
    }
    return accessRes.address
  }
  return addressRes.address
}

function parseSimulationError(
  sim: rpc.Api.SimulateTransactionResponse
): string {
  if (rpc.Api.isSimulationError(sim)) {
    return sim.error ?? "Simulation failed"
  }
  return "Simulation failed"
}

async function pollTransaction(
  server: rpc.Server,
  txHash: string
): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const response = await server.getTransaction(txHash)
    if (response.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return
    }
    if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw {
        code: "TX_FAILED" as const,
        message: "La transacción falló en la red.",
      } satisfies CancelReleaseError
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw {
    code: "TX_FAILED" as const,
    message: "Tiempo de espera agotado. Revisá la red o intentá de nuevo.",
  } satisfies CancelReleaseError
}

/**
 * Hook for canceling a release proposal.
 * cancel_release_proposal(proposal_id: u64, user: Address) -> Result<Void, Error>
 */
export function useCancelReleaseProposal() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CancelReleaseError | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const cancelReleaseProposal = useCallback(
    async (proposalId: bigint): Promise<string | null> => {
      setIsLoading(true)
      setError(null)
      setTxHash(null)

      try {
        const publicKey = await getPublicKey()
        const server = getSorobanServer()

        const account: Account = await server.getAccount(publicKey)
        const contract = new Contract(TREASURY_CONTRACT_ID)

        const invokeOp = contract.call(
          "cancel_release_proposal",
          nativeToScVal(proposalId, { type: "u64" }),
          nativeToScVal(Address.fromString(publicKey))
        )

        const builder = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        })
          .addOperation(invokeOp)
          .setTimeout(60)

        const rawTx = builder.build()
        const simulation = await server.simulateTransaction(rawTx)

        if (rpc.Api.isSimulationError(simulation)) {
          throw {
            code: "SIMULATION_FAILED" as const,
            message: parseSimulationError(simulation),
          } satisfies CancelReleaseError
        }

        const preparedBuilder = rpc.assembleTransaction(rawTx, simulation)
        const preparedTx = preparedBuilder.build()

        const envelopeXdr = preparedTx.toEnvelope().toXDR("base64")
        const signRes = await freighterApi.signTransaction(envelopeXdr, {
          networkPassphrase: STELLAR_CONFIG.networkPassphrase,
          address: publicKey,
        })
        if (signRes.error) {
          const msg = signRes.error.message ?? "Firma rechazada"
          if (
            msg.toLowerCase().includes("reject") ||
            msg.toLowerCase().includes("denied") ||
            msg.toLowerCase().includes("cancel")
          ) {
            throw {
              code: "USER_REJECTED" as const,
              message: "Rechazaste la firma de la transacción.",
            } satisfies CancelReleaseError
          }
          throw {
            code: "USER_REJECTED" as const,
            message: msg,
          } satisfies CancelReleaseError
        }
        const signedXdr = signRes.signedTxXdr

        const signedTx = TransactionBuilder.fromXDR(
          signedXdr,
          STELLAR_CONFIG.networkPassphrase
        )
        const sendResponse = await server.sendTransaction(signedTx)

        if (sendResponse.status === "ERROR") {
          throw {
            code: "SEND_FAILED" as const,
            message:
              "La red rechazó la transacción. Intentá de nuevo o revisá los datos.",
          } satisfies CancelReleaseError
        }

        const hash = sendResponse.hash
        await pollTransaction(server, hash)

        setTxHash(hash)
        return hash
      } catch (err: unknown) {
        if (isCancelReleaseError(err)) {
          setError(err)
          return null
        }
        const message =
          err instanceof Error ? err.message : "Ocurrió un error inesperado"
        const cancelErr: CancelReleaseError = {
          code: "UNKNOWN",
          message,
        }
        setError(cancelErr)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setError(null)
    setTxHash(null)
  }, [])

  return {
    cancelReleaseProposal,
    isLoading,
    error,
    txHash,
    reset,
    isWalletAvailable: typeof window !== "undefined",
  }
}

