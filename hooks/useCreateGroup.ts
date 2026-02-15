"use client"

import { useState, useCallback } from "react"
import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  rpc,
  Address,
} from "@stellar/stellar-sdk"
import type { Account } from "@stellar/stellar-sdk"
import freighterApi from "@stellar/freighter-api"
import {
  getSorobanServer,
  CREATE_GROUP_CONTRACT_ID,
  STELLAR_CONFIG,
} from "@/lib/stellar-client"

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 60

export interface CreateGroupParams {
  members: string[]
  approvals_required: number
}

export interface CreateGroupResult {
  txHash: string
  groupId: string
}

export type CreateGroupErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "USER_REJECTED"
  | "SIMULATION_FAILED"
  | "SEND_FAILED"
  | "TX_FAILED"
  | "UNKNOWN"

export interface CreateGroupError {
  code: CreateGroupErrorCode
  message: string
}

function isCreateGroupError(err: unknown): err is CreateGroupError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err
  )
}

/** Get current wallet address via @stellar/freighter-api (same as login). */
async function getPublicKey(): Promise<string> {
  if (typeof window === "undefined") {
    throw {
      code: "WALLET_NOT_INSTALLED" as const,
      message: "Freighter no está disponible. Instalá la extensión y recargá.",
    } satisfies CreateGroupError
  }
  const connectedRes = await freighterApi.isConnected()
  if (connectedRes.error) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message:
        connectedRes.error.message ??
        "No se pudo conectar con Freighter. Desbloqueá la wallet.",
    } satisfies CreateGroupError
  }
  if (!connectedRes.isConnected) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message: "Abrí Freighter y desbloqueá tu wallet.",
    } satisfies CreateGroupError
  }
  const addressRes = await freighterApi.getAddress()
  if (addressRes.error || !addressRes.address) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message:
          accessRes.error?.message ??
          "Autorizá este sitio en Freighter para crear grupos.",
      } satisfies CreateGroupError
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
        message: "Transaction failed on the network.",
      } satisfies CreateGroupError
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw {
    code: "TX_FAILED" as const,
    message: "Transaction timed out. Check the network or try again.",
  } satisfies CreateGroupError
}

export function useCreateGroup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CreateGroupError | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const createGroup = useCallback(
    async (params: CreateGroupParams): Promise<CreateGroupResult | null> => {
      setIsLoading(true)
      setError(null)
      setTxHash(null)

      try {
        const publicKey = await getPublicKey()
        const server = getSorobanServer()

        const account: Account = await server.getAccount(publicKey)
        const contract = new Contract(CREATE_GROUP_CONTRACT_ID)

        const approvalsRequired = Math.floor(params.approvals_required)
        if (approvalsRequired < 1 || approvalsRequired > 0xffff_ffff) {
          throw {
            code: "SIMULATION_FAILED" as const,
            message: "approvals_required must be between 1 and 4294967295",
          } satisfies CreateGroupError
        }
        // Primero la address con la que me logué, después las que inputió el usuario
        const allMembers = [publicKey, ...params.members.map((addr) => addr.trim()).filter(Boolean)]
        if (allMembers.length < 2) {
          throw {
            code: "SIMULATION_FAILED" as const,
            message: "Agregá al menos una dirección además de la tuya.",
          } satisfies CreateGroupError
        }

        const membersScVal = nativeToScVal(
          allMembers.map((addr) => Address.fromString(addr)),
          { type: "vec" }
        )

        const invokeOp = contract.call(
          "create_group",
          membersScVal,
          nativeToScVal(approvalsRequired, { type: "u32" })
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
          } satisfies CreateGroupError
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
            } satisfies CreateGroupError
          }
          throw {
            code: "USER_REJECTED" as const,
            message: msg,
          } satisfies CreateGroupError
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
              "Transaction was rejected by the network. Try again or check your inputs.",
          } satisfies CreateGroupError
        }

        const hash = sendResponse.hash
        await pollTransaction(server, hash)

        const txResponse = await server.getTransaction(hash)
        if (txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
          setTxHash(hash)
          return { txHash: hash, groupId: "" }
        }
        const returnValue =
          "returnValue" in txResponse ? txResponse.returnValue : undefined
        const groupIdNative = returnValue
          ? scValToNative(returnValue)
          : undefined
        const groupId =
          groupIdNative !== undefined && groupIdNative !== null
            ? String(groupIdNative)
            : ""

        setTxHash(hash)
        return { txHash: hash, groupId }
      } catch (err: unknown) {
        if (isCreateGroupError(err)) {
          setError(err)
          return null
        }
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred"
        const createErr: CreateGroupError = {
          code: "UNKNOWN",
          message,
        }
        setError(createErr)
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
    createGroup,
    isLoading,
    error,
    txHash,
    reset,
    isWalletAvailable: typeof window !== "undefined",
  }
}
