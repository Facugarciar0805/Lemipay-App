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
import { Loader2, AlertCircle } from "lucide-react"

export interface CancelReleaseProposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => Promise<void>
  isSubmitting?: boolean
  destination?: string
  amount?: string
}

export function CancelReleaseProposalModal({
  open,
  onOpenChange,
  onCancel,
  isSubmitting = false,
  destination,
  amount,
}: CancelReleaseProposalModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setError(null)
    try {
      await onCancel()
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar la propuesta. Intentá de nuevo."
      )
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar propuesta de pago</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés cancelar esta propuesta de pago?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {amount && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Monto</p>
                <p className="font-semibold">{amount} USDC</p>
              </div>
              {destination && (
                <div>
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="text-sm font-mono break-all">{destination}</p>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Una vez cancelada, la propuesta no podrá ser ejecutada y los fondos permanecerán en la tesorería.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Seguir adelante
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando…
              </>
            ) : (
              "Cancelar propuesta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

