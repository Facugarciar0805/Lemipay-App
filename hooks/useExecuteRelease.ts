"use client"

import { useState, useCallback } from "react"
import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  BASE_FEE,
  rpc,
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

export type ExecuteReleaseErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "USER_REJECTED"
  | "SIMULATION_FAILED"
  | "SEND_FAILED"
  | "TX_FAILED"
  | "UNKNOWN"

export interface ExecuteReleaseError {
  code: ExecuteReleaseErrorCode
  message: string
}

async function getPublicKey(): Promise<string> {
  if (typeof window === "undefined") {
    throw {
      code: "WALLET_NOT_INSTALLED" as const,
      message: "Freighter no está disponible. Instalá la extensión y recargá.",
    } satisfies ExecuteReleaseError
  }
  const connectedRes = await freighterApi.isConnected()
  if (connectedRes.error || !connectedRes.isConnected) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message:
          accessRes.error?.message ??
          "Autorizá este sitio en Freighter para ejecutar el pago.",
      } satisfies ExecuteReleaseError
    }
    return accessRes.address
  }
  const addressRes = await freighterApi.getAddress()
  if (addressRes.error || !addressRes.address) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message:
          accessRes.error?.message ??
          "Autorizá este sitio en Freighter para ejecutar el pago.",
      } satisfies ExecuteReleaseError
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
      } satisfies ExecuteReleaseError
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw {
    code: "TX_FAILED" as const,
    message: "Tiempo de espera agotado. Revisá la red o intentá de nuevo.",
  } satisfies ExecuteReleaseError
}

/**
 * execute_release(proposal_id: u64) - ejecuta el pago de una propuesta que alcanzó el quórum.
 */
export function useExecuteRelease() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ExecuteReleaseError | null>(null)

  const executeRelease = useCallback(
    async (proposalId: bigint): Promise<string | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const publicKey = await getPublicKey()
        const server = getSorobanServer()

        const account: Account = await server.getAccount(publicKey)
        const contract = new Contract(TREASURY_CONTRACT_ID)

        const invokeOp = contract.call(
          "execute_release",
          nativeToScVal(proposalId, { type: "u64" })
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
          } satisfies ExecuteReleaseError
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
            } satisfies ExecuteReleaseError
          }
          throw {
            code: "USER_REJECTED" as const,
            message: msg,
          } satisfies ExecuteReleaseError
        }

        const signedTx = TransactionBuilder.fromXDR(
          signRes.signedTxXdr,
          STELLAR_CONFIG.networkPassphrase
        )
        const sendResponse = await server.sendTransaction(signedTx)

        if (sendResponse.status === "ERROR") {
          throw {
            code: "SEND_FAILED" as const,
            message:
              "La red rechazó la transacción. Intentá de nuevo o revisá los datos.",
          } satisfies ExecuteReleaseError
        }

        const hash = sendResponse.hash
        await pollTransaction(server, hash)

        return hash
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          "message" in err
        ) {
          setError(err as ExecuteReleaseError)
          return null
        }
        const message =
          err instanceof Error ? err.message : "Ocurrió un error inesperado"
        setError({ code: "UNKNOWN", message })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    executeRelease,
    isLoading,
    error,
    reset,
  }
}
