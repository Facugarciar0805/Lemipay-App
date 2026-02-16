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
import { Loader2 } from "lucide-react"

export interface ProposeFundRoundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPropose: (totalAmountUsdc: number) => Promise<void>
  isSubmitting?: boolean
}

export function ProposeFundRoundModal({
  open,
  onOpenChange,
  onPropose,
  isSubmitting = false,
}: ProposeFundRoundModalProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = parseFloat(amount.replace(",", "."))
    if (Number.isNaN(value) || value <= 0) {
      setError("Ingresá un monto válido mayor a 0.")
      return
    }
    try {
      await onPropose(value)
      setAmount("")
      onOpenChange(false)
    } catch {
      setError("No se pudo crear la ronda. Intentá de nuevo.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear ronda de fondeo</DialogTitle>
          <DialogDescription>
            Definí el monto objetivo en USDC que el grupo quiere recaudar en esta ronda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto objetivo (USDC)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="font-mono"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Crear ronda"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
