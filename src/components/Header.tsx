import { FileText, Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="relative overflow-hidden border-b border-white/6 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.18),transparent)]" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
            <FileText className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Recibos
            </h1>
            <p className="text-xs text-zinc-500">
              Geração de recibos de pagamento
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Recibo de Pagamento de Imóvel
        </div>
      </div>
    </header>
  )
}
