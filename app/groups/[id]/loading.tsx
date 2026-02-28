import { Loader2 } from "lucide-react"

export default function LoadingGroupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-display">
            Cargando grupo...
          </p>
        </div>
      </div>
    </div>
  )
}

