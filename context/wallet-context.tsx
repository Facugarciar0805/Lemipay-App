"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  shortAddress: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Simulated Freighter wallet addresses for demo
const DEMO_ADDRESSES = [
  "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
  "GCFONE23AB7Y6C5YZOMKUKGETPIAJA752AHTQLNM7CVDXWG7NKBXSX5N",
]

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    // Simulate Freighter wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const randomAddr =
      DEMO_ADDRESSES[Math.floor(Math.random() * DEMO_ADDRESSES.length)]
    setAddress(randomAddr)
    setIsConnecting(false)
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
  }, [])

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : ""

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
        shortAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
