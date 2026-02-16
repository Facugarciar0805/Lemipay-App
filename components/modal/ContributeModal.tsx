"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, Check, Shield, Send } from "lucide-react"

export interface ContributeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (amountUsdc: number) => Promise<void>
  onContribute: (amountUsdc: number) => Promise<void>
  isApproving?: boolean
  isContributing?: boolean
}

export function ContributeModal({
  open,
  onOpenChange,
  onApprove,
  onContribute,
  isApproving = false,
  isContributing = false,
}: ContributeModalProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [permissionDone, setPermissionDone] = useState(false)

  const amountNum = (() => {
    const v = parseFloat(amount.replace(",", "."))
    return Number.isNaN(v) || v <= 0 ? null : v
  })()

  const handleApprove = async () => {
    if (amountNum == null) {
      setError("Ingresá un monto válido mayor a 0.")
      return
    }
    setError(null)
    try {
      await onApprove(amountNum)
      setPermissionDone(true)
    } catch {
      setError("No se pudo dar permiso. Intentá de nuevo.")
    }
  }

  const handleContribute = async () => {
    if (amountNum == null) return
    setError(null)
    try {
      await onContribute(amountNum)
      setAmount("")
      setPermissionDone(false)
      onOpenChange(false)
    } catch {
      setError("No se pudo aportar. Intentá de nuevo.")
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setPermissionDone(false)
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Aportar a la ronda
          </DialogTitle>
          <DialogDescription>
            Ingresá el monto en USDC. Primero dale permiso al contrato para usar tus tokens y después enviá el aporte.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="contribute-amount">Monto (USDC)</Label>
            <Input
              id="contribute-amount"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 50"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setPermissionDone(false)
              }}
              disabled={isApproving || isContributing}
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Pasos
            </p>
            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    permissionDone ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {permissionDone ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Dar permiso</p>
                  <p className="text-xs text-muted-foreground">
                    Autorizá al contrato a usar este monto de USDC.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={permissionDone ? "secondary" : "default"}
                  onClick={handleApprove}
                  disabled={amountNum == null || isApproving || isContributing}
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : permissionDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <>
                      <Shield className="mr-1.5 h-3.5 w-3.5" />
                      Dar permiso
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    permissionDone ? "bg-muted" : "bg-muted opacity-60"
                  }`}
                >
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Contribuir</p>
                  <p className="text-xs text-muted-foreground">
                    Enviá el aporte a la ronda de fondeo.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={handleContribute}
                  disabled={!permissionDone || amountNum == null || isApproving || isContributing}
                >
                  {isContributing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Contribuir
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isApproving || isContributing}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
