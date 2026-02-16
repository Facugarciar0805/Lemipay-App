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
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const STELLAR_ADDRESS_REGEX = /^[GC][A-Z2-7]{55}$/

export interface CreatePaymentProposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (params: { amountUsdc: number; destination: string; description?: string }) => Promise<void>
  isSubmitting?: boolean
}

export function CreatePaymentProposalModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreatePaymentProposalModalProps) {
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const amountNum = parseFloat(amount.replace(",", "."))
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Ingresá un monto válido mayor a 0.")
      return
    }
    const dest = destination.trim()
    if (!STELLAR_ADDRESS_REGEX.test(dest)) {
      setError("La dirección debe ser una cuenta Stellar válida (G... o C..., 56 caracteres).")
      return
    }
    try {
      await onSubmit({
        amountUsdc: amountNum,
        destination: dest,
        description: description.trim() || undefined,
      })
      setAmount("")
      setDestination("")
      setDescription("")
      onOpenChange(false)
    } catch {
      setError("No se pudo crear la propuesta. Intentá de nuevo.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear propuesta de pago</DialogTitle>
          <DialogDescription>
            Definí el monto en USDC y la dirección Stellar a la que se enviará el pago cuando se apruebe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Monto (USDC)</Label>
              <Input
                id="payment-amount"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-destination">Dirección de destino</Label>
              <Input
                id="payment-destination"
                type="text"
                placeholder="G... o C... (56 caracteres)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-description">Descripción (opcional)</Label>
              <Textarea
                id="payment-description"
                placeholder="Ej: Reembolso gastos viaje"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={2}
                className="resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
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
                  Creando…
                </>
              ) : (
                "Crear propuesta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
