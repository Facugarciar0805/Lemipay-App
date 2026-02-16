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
  members: string[]
}

export type CreateGroupErrorCode =
    | "WALLET_NOT_INSTALLED"
    | "WALLET_NOT_CONNECTED"
    | "USER_REJECTED"
    | "SIMULATION_FAILED"
    | "SEND_FAILED"
    | "TX_FAILED"
    | "DB_SYNC_FAILED"
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

async function getPublicKey(): Promise<string> {
  if (typeof window === "undefined") {
    throw {
      code: "WALLET_NOT_INSTALLED" as const,
      message: "Freighter no está disponible. Instalá la extensión.",
    } satisfies CreateGroupError
  }
  const connectedRes = await freighterApi.isConnected()
  if (connectedRes.error || !connectedRes.isConnected) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message: "Desbloqueá Freighter para continuar.",
    } satisfies CreateGroupError
  }
  const addressRes = await freighterApi.getAddress()
  if (addressRes.error || !addressRes.address) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message: "Autorizá Lemipay en tu wallet.",
      } satisfies CreateGroupError
    }
    return accessRes.address
  }
  return addressRes.address
}

async function pollTransaction(server: rpc.Server, txHash: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const response = await server.getTransaction(txHash)
    if (response.status === rpc.Api.GetTransactionStatus.SUCCESS) return
    if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw { code: "TX_FAILED" as const, message: "La transacción falló en la red." } satisfies CreateGroupError
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw { code: "TX_FAILED" as const, message: "Tiempo de espera agotado." } satisfies CreateGroupError
}

export function useCreateGroup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<CreateGroupError | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Función reset estable para evitar bucles infinitos en useEffect
  const reset = useCallback(() => {
    setError(null)
    setTxHash(null)
  }, [])

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
          const allMembers = [publicKey, ...params.members.map((addr) => addr.trim()).filter(Boolean)]

          if (allMembers.length < 2) {
            throw { code: "SIMULATION_FAILED", message: "Mínimo 2 miembros requeridos." } satisfies CreateGroupError
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
            throw { code: "SIMULATION_FAILED", message: simulation.error || "Error de simulación" } satisfies CreateGroupError
          }

          const preparedTx = rpc.assembleTransaction(rawTx, simulation).build()
          const envelopeXdr = preparedTx.toEnvelope().toXDR("base64")

          const signRes = await freighterApi.signTransaction(envelopeXdr, {
            networkPassphrase: STELLAR_CONFIG.networkPassphrase,
            address: publicKey,
          })

          if (signRes.error) throw { code: "USER_REJECTED", message: "Firma rechazada." } satisfies CreateGroupError

          const signedTx = TransactionBuilder.fromXDR(signRes.signedTxXdr, STELLAR_CONFIG.networkPassphrase)
          const sendResponse = await server.sendTransaction(signedTx)

          if (sendResponse.status === "ERROR") throw { code: "SEND_FAILED", message: "Rechazado por la red." } satisfies CreateGroupError

          const hash = sendResponse.hash
          await pollTransaction(server, hash)

          const txResponse = await server.getTransaction(hash)
          if (txResponse.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
            return { txHash: hash, groupId: "", members: allMembers }
          }

          const returnValue = "returnValue" in txResponse ? txResponse.returnValue : undefined
          const groupId = returnValue ? String(scValToNative(returnValue)) : ""

          setTxHash(hash)

          // SINCRONIZAR CON SUPABASE
          if (groupId) {
            try {
              await fetch("/api/groups/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  groupId: Number(groupId),
                  members: allMembers,
                }),
              });
            } catch (dbErr) {
              console.error("Fallo el linkeo en Supabase:", dbErr);
            }
          }

          return { txHash: hash, groupId, members: allMembers }

        } catch (err: unknown) {
          if (isCreateGroupError(err)) {
            setError(err)
            return null
          }
          setError({ code: "UNKNOWN", message: err instanceof Error ? err.message : "Error inesperado" })
          return null
        } finally {
          setIsLoading(false)
        }
      },
      []
  )

  return {
    createGroup,
    isLoading,
    error,
    txHash,
    reset, // Ahora pasamos la versión estable con useCallback
    isWalletAvailable: typeof window !== "undefined"
  }
}