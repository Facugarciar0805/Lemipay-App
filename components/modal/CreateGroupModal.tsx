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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        form.reset({ members: [""], approvals_required: 1 })
        resetCreateGroup()
      }
      onOpenChange(isOpen)
    },
    [form, resetCreateGroup, onOpenChange]
  )

  useEffect(() => {
    if (!open) {
      form.reset({ members: [""], approvals_required: 1 })
      resetCreateGroup()
    }
  }, [open, form, resetCreateGroup])

  async function onSubmit(values: CreateGroupFormValues) {
    const members = values.members.map((m) => m.trim()).filter(Boolean)
    const result = await createGroup({
      members,
      approvals_required: values.approvals_required,
    })
    if (result?.groupId && result.members?.length) {
      try {
        await fetch("/api/groups/sync-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: result.groupId,
            members: result.members,
          }),
          credentials: "include",
        })
      } catch {
        // Grupo ya creado on-chain; el listado en Supabase se puede corregir después
      }
      handleClose(false)
      router.push(`/groups/${result.groupId}`)
    } else if (result?.groupId) {
      handleClose(false)
      router.push(`/groups/${result.groupId}`)
    }
  }

  const showSuccess = Boolean(txHash) && !error && !isLoading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md min-w-0 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}
      >
        <DialogHeader className="min-w-0">
          <DialogTitle>Crear grupo</DialogTitle>
          <DialogDescription className="break-words">
            Definí los miembros del grupo y cuántas aprobaciones se necesitan
            para retirar fondos. Vas a firmar con Freighter.
          </DialogDescription>
        </DialogHeader>

        {!isWalletAvailable && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            Necesitás Freighter para crear un grupo.{" "}
            <a
              href="https://www.freighterapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Instalar Freighter
            </a>
          </div>
        )}

        {error && (
          <div
            className="max-h-40 overflow-y-auto overflow-x-auto rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <pre className="whitespace-pre-wrap break-words font-sans">
              {error.message}
            </pre>
          </div>
        )}

        {showSuccess ? (
          <div className="min-w-0 space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Grupo creado correctamente.</span>
            </div>
            <div className="min-w-0 space-y-1">
              <Label className="text-muted-foreground">Transaction hash</Label>
              <div className="flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
                  {txHash}
                </code>
                <a
                  href={`${STELLAR_EXPERT_TX_URL}/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary hover:underline"
                  aria-label="Ver en Stellar Expert"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2"
            >
              <div className="space-y-3">
                <FormLabel>Miembros del grupo</FormLabel>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`members.${index}`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="G... o C... (56 caracteres)"
                                className="font-mono text-sm"
                                disabled={!isWalletAvailable || isLoading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1 || !isWalletAvailable || isLoading}
                                aria-label="Quitar miembro"
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
                  disabled={!isWalletAvailable || isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Agregar miembro
                </Button>
                {form.formState.errors.members?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.members.message}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="approvals_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprobaciones necesarias para retirar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="1"
                        disabled={!isWalletAvailable || isLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!isWalletAvailable || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando…
                    </>
                  ) : (
                    "Crear grupo"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
