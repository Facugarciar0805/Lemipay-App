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
  USDC_CONTRACT_ID,
  STELLAR_CONFIG,
} from "@/lib/stellar-client"

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 60
const USDC_DECIMALS = 10_000_000

export type ContributeErrorCode =
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_CONNECTED"
  | "USER_REJECTED"
  | "SIMULATION_FAILED"
  | "SEND_FAILED"
  | "TX_FAILED"
  | "UNKNOWN"

export interface ContributeError {
  code: ContributeErrorCode
  message: string
}

function isContributeError(err: unknown): err is ContributeError {
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
    } satisfies ContributeError
  }
  const connectedRes = await freighterApi.isConnected()
  if (connectedRes.error) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message:
        connectedRes.error.message ??
        "No se pudo conectar con Freighter. Desbloqueá la wallet.",
    } satisfies ContributeError
  }
  if (!connectedRes.isConnected) {
    throw {
      code: "WALLET_NOT_CONNECTED" as const,
      message: "Abrí Freighter y desbloqueá tu wallet.",
    } satisfies ContributeError
  }
  const addressRes = await freighterApi.getAddress()
  if (addressRes.error || !addressRes.address) {
    const accessRes = await freighterApi.requestAccess()
    if (accessRes.error || !accessRes.address) {
      throw {
        code: "WALLET_NOT_CONNECTED" as const,
        message:
          accessRes.error?.message ??
          "Autorizá este sitio en Freighter para aportar.",
      } satisfies ContributeError
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
      } satisfies ContributeError
      }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw {
    code: "TX_FAILED" as const,
    message: "Tiempo de espera agotado. Revisá la red o intentá de nuevo.",
  } satisfies ContributeError
}

function runApproveTx(amountRaw: bigint, publicKey: string): Promise<string | null> {
  return (async () => {
    const server = getSorobanServer()
    const userAddress = Address.fromString(publicKey)
    const treasuryAddress = Address.fromString(TREASURY_CONTRACT_ID)
    const { sequence } = await server.getLatestLedger()
    const expirationLedger = sequence + 100_000

    const account: Account = await server.getAccount(publicKey)
    const tokenContract = new Contract(USDC_CONTRACT_ID)
    const allowanceOp = tokenContract.call(
      "approve",
      nativeToScVal(userAddress),
      nativeToScVal(treasuryAddress),
      nativeToScVal(amountRaw, { type: "i128" }),
      nativeToScVal(expirationLedger, { type: "u32" })
    )
    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    })
      .addOperation(allowanceOp)
      .setTimeout(60)
      .build()

    const simulation = await server.simulateTransaction(rawTx)
    if (rpc.Api.isSimulationError(simulation)) throw new Error(parseSimulationError(simulation))
    const preparedTx = rpc.assembleTransaction(rawTx, simulation).build()
    const signRes = await freighterApi.signTransaction(
      preparedTx.toEnvelope().toXDR("base64"),
      { networkPassphrase: STELLAR_CONFIG.networkPassphrase, address: publicKey }
    )
    if (signRes.error) throw new Error(signRes.error.message ?? "Firma rechazada")
    const signedTx = TransactionBuilder.fromXDR(
      signRes.signedTxXdr,
      STELLAR_CONFIG.networkPassphrase
    )
    const sendResponse = await server.sendTransaction(signedTx)
    if (sendResponse.status === "ERROR") throw new Error("La red rechazó la transacción.")
    await pollTransaction(server, sendResponse.hash)
    return sendResponse.hash
  })()
}

function runContributeTx(
  roundId: bigint,
  amountRaw: bigint,
  publicKey: string
): Promise<string | null> {
  return (async () => {
    const server = getSorobanServer()
    const userAddress = Address.fromString(publicKey)
    const account = await server.getAccount(publicKey)
    const treasuryContract = new Contract(TREASURY_CONTRACT_ID)
    const contributeOp = treasuryContract.call(
      "contribute_to_fund_round",
      nativeToScVal(roundId, { type: "u64" }),
      nativeToScVal(amountRaw, { type: "i128" }),
      nativeToScVal(userAddress)
    )
    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    })
      .addOperation(contributeOp)
      .setTimeout(60)
      .build()

    const simulation = await server.simulateTransaction(rawTx)
    if (rpc.Api.isSimulationError(simulation)) throw new Error(parseSimulationError(simulation))
    const preparedTx = rpc.assembleTransaction(rawTx, simulation).build()
    const signRes = await freighterApi.signTransaction(
      preparedTx.toEnvelope().toXDR("base64"),
      { networkPassphrase: STELLAR_CONFIG.networkPassphrase, address: publicKey }
    )
    if (signRes.error) throw new Error(signRes.error.message ?? "Firma rechazada")
    const signedTx = TransactionBuilder.fromXDR(
      signRes.signedTxXdr,
      STELLAR_CONFIG.networkPassphrase
    )
    const sendResponse = await server.sendTransaction(signedTx)
    if (sendResponse.status === "ERROR") throw new Error("La red rechazó la transacción.")
    await pollTransaction(server, sendResponse.hash)
    return sendResponse.hash
  })()
}

export function useContributeToFundRound() {
  const [isApproving, setIsApproving] = useState(false)
  const [isContributing, setIsContributing] = useState(false)
  const [error, setError] = useState<ContributeError | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const approve = useCallback(async (amountUsdc: number): Promise<string | null> => {
    setIsApproving(true)
    setError(null)
    try {
      const publicKey = await getPublicKey()
      const amountRaw = BigInt(Math.round(amountUsdc * USDC_DECIMALS))
      const hash = await runApproveTx(amountRaw, publicKey)
      return hash
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al dar permiso."
      setError({ code: "SIMULATION_FAILED", message: msg })
      return null
    } finally {
      setIsApproving(false)
    }
  }, [])

  const contribute = useCallback(
    async (roundId: bigint, amountUsdc: number): Promise<string | null> => {
      setIsContributing(true)
      setError(null)
      setTxHash(null)
      try {
        const publicKey = await getPublicKey()
        const amountRaw = BigInt(Math.round(amountUsdc * USDC_DECIMALS))
        const hash = await runContributeTx(roundId, amountRaw, publicKey)
        setTxHash(hash ?? null)
        return hash
      } catch (err: unknown) {
        if (isContributeError(err)) {
          setError(err)
          return null
        }
        const rawMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado"
        const isBalanceMissing =
          /MissingValue|Storage|non-existing|balance|contract call failed/i.test(rawMessage)
        const message = isBalanceMissing
          ? "Tu saldo de USDC no está registrado on-chain todavía. Asegurate de tener USDC en tu wallet y de haber recibido al menos una transferencia para que exista tu balance en la red. Si acabás de fondear, esperá a que se confirme."
          : rawMessage
        setError({ code: "UNKNOWN", message })
        return null
      } finally {
        setIsContributing(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setError(null)
    setTxHash(null)
  }, [])

  return {
    approve,
    contribute,
    isApproving,
    isContributing,
    isLoading: isApproving || isContributing,
    error,
    txHash,
    reset,
    isWalletAvailable: typeof window !== "undefined",
  }
}
