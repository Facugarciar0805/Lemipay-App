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

export interface WithdrawContributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWithdraw: () => Promise<void>
  isSubmitting?: boolean
  roundId?: bigint
}

export function WithdrawContributionModal({
  open,
  onOpenChange,
  onWithdraw,
  isSubmitting = false,
  roundId,
}: WithdrawContributionModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleWithdraw = async () => {
    setError(null)
    try {
      await onWithdraw()
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo retirar el aporte. Intentá de nuevo."
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
          <DialogTitle>Retirar aporte</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés retirar tu aporte de esta ronda de fondeo?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Se transferirá tu USDC de vuelta a tu billetera una vez que se confirme la transacción.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleWithdraw}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retirando…
              </>
            ) : (
              "Retirar aporte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

