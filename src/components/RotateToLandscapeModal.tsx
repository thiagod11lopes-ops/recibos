import { Smartphone } from 'lucide-react'

interface RotateToLandscapeModalProps {
  open: boolean
  onCancel: () => void
}

export function RotateToLandscapeModal({
  open,
  onCancel,
}: RotateToLandscapeModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotate-device-title"
    >
      <div className="absolute inset-0 bg-[#05050a]/80 backdrop-blur-md animate-fade-in" />

      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a1a28] to-[#101018] p-8 text-center shadow-2xl shadow-indigo-500/20 animate-modal-pop">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-pulse-ring" />
          <div className="absolute inset-3 rounded-full border border-indigo-400/10" />
          <div className="phone-tilt flex h-16 w-10 items-center justify-center rounded-xl border-2 border-indigo-300/80 bg-indigo-500/20 shadow-lg shadow-indigo-500/30">
            <Smartphone className="h-7 w-7 text-indigo-200" />
          </div>
        </div>

        <h3
          id="rotate-device-title"
          className="relative text-xl font-semibold tracking-tight text-white"
        >
          Gire o dispositivo
        </h3>
        <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">
          Para visualizar a tabela de parcelas com conforto, vire o celular ou
          tablet na horizontal.
        </p>

        <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          Aguardando orientação paisagem
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="relative mt-6 w-full rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/25 hover:text-red-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
