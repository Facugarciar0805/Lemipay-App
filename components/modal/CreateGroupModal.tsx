"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateGroup } from "@/hooks/useCreateGroup"
import { Loader2, CheckCircle2, ExternalLink, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const STELLAR_ADDRESS_REGEX = /^[GC][A-Z2-7]{55}$/

const createGroupSchema = z
    .object({
      members: z.array(z.string()),
      approvals_required: z
          .number({ invalid_type_error: "Debe ser un número" })
          .int("Debe ser un número entero")
          .min(1, "Mínimo 1 aprobación"),
    })
    .refine(
        (data) => {
          const valid = data.members.map((s) => s.trim()).filter(Boolean)
          return valid.length >= 1 && valid.every((a) => STELLAR_ADDRESS_REGEX.test(a))
        },
        {
          message: "Al menos una dirección válida (G... o C..., 56 caracteres)",
          path: ["members"],
        }
    )

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>
const STELLAR_EXPERT_TX_URL = "https://stellar.expert/explorer/testnet/tx"

export interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const router = useRouter()
  const {
    createGroup,
    isLoading,
    error,
    txHash,
    reset: resetCreateGroup,
    isWalletAvailable,
  } = useCreateGroup()

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      members: [""],
      approvals_required: 1,
    },
  })

  const { reset: resetForm } = form
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  // Función para resetear estados de forma limpia
  const handleReset = useCallback(() => {
    resetForm({ members: [""], approvals_required: 1 })
    resetCreateGroup()
  }, [resetForm, resetCreateGroup])

  const handleClose = useCallback(
      (isOpen: boolean) => {
        if (!isOpen) {
          handleReset()
        }
        onOpenChange(isOpen)
      },
      [handleReset, onOpenChange]
  )

  // Este useEffect ya no provocará bucles infinitos porque handleReset es estable
  useEffect(() => {
    if (!open) {
      handleReset()
    }
  }, [open, handleReset])

  async function onSubmit(values: CreateGroupFormValues) {
    const members = values.members.map((m) => m.trim()).filter(Boolean)
    const result = await createGroup({
      members,
      approvals_required: values.approvals_required,
    })

    // Si el grupo se creó con éxito (el hook ya se encargó de Supabase vía /api/groups/link)
    if (result?.groupId) {
      handleClose(false)
      router.push(`/groups/${result.groupId}`)
    }
  }

  const showSuccess = Boolean(txHash) && !error && !isLoading

  return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md min-w-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Crear grupo</DialogTitle>
            <DialogDescription>
              Definí los miembros y el quórum necesario. Firmarás con Freighter.
            </DialogDescription>
          </DialogHeader>

          {!isWalletAvailable && (
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
                Necesitás Freighter para crear un grupo.
              </div>
          )}

          {error && (
              <div className="max-h-40 overflow-auto rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <pre className="whitespace-pre-wrap">{error.message}</pre>
              </div>
          )}

          {showSuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Grupo creado correctamente.</span>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleClose(false)}>Ir al Dashboard</Button>
                </DialogFooter>
              </div>
          ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <div className="space-y-3">
                    <FormLabel>Miembros del grupo</FormLabel>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                          <FormField
                              key={field.id}
                              control={form.control}
                              name={`members.${index}`}
                              render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex gap-2">
                                        <Input
                                            placeholder="G... o C..."
                                            className="font-mono text-sm"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 1 || isLoading}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />
                      ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => append("")}
                        disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" /> Agregar miembro
                    </Button>
                  </div>

                  <FormField
                      control={form.control}
                      name="approvals_required"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Firmas requeridas</FormLabel>
                            <FormControl>
                              <Input
                                  type="number"
                                  min={1}
                                  disabled={isLoading}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear grupo"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
          )}
        </DialogContent>
      </Dialog>
  )
}