import { Smartphone } from 'lucide-react'

interface RotateScreenHintProps {
  visible?: boolean
}

export function RotateScreenHint({ visible = true }: RotateScreenHintProps) {
  if (!visible) return null

  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 animate-rotate-hint"
      aria-live="polite"
    >
      <span className="phone-tilt-sm flex h-5 w-5 items-center justify-center">
        <Smartphone className="h-3.5 w-3.5" />
      </span>
      Gire a Tela
    </span>
  )
}
