import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ActiveReceipt } from '../types/receipt'
import { ReceiptDocument } from './ReceiptDocument'

interface ClipboardReceiptModalProps {
  receipt: ActiveReceipt | null
  onClose: () => void
}

export function ClipboardReceiptModal({
  receipt,
  onClose,
}: ClipboardReceiptModalProps) {
  useEffect(() => {
    if (!receipt) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [receipt, onClose])

  if (!receipt) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clipboard-receipt-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#1a1208]/75 backdrop-blur-md animate-fade-in"
        aria-label="Fechar visualização"
        onClick={onClose}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[92] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white shadow-lg shadow-black/40 backdrop-blur-md transition-all hover:scale-105 hover:bg-red-500/80 hover:border-red-400/40 sm:right-8 sm:top-8"
        aria-label="Fechar"
        title="Fechar"
      >
        <X className="h-5 w-5" strokeWidth={2.5} />
      </button>

      <div className="clipboard-stage relative z-[91] w-full max-w-[28rem] animate-clipboard-enter">
        <div className="clipboard-board relative rounded-[1.35rem] px-3 pb-4 pt-10 shadow-[0_28px_80px_-12px_rgba(0,0,0,0.65),0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] sm:px-4 sm:pb-5 sm:pt-12">
          <div className="clipboard-grain pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-40" />

          <div className="clipboard-clip absolute left-1/2 top-0 z-20 w-[42%] max-w-[9.5rem] -translate-x-1/2 -translate-y-[38%]">
            <div className="relative">
              <div className="clip-hinge mx-auto h-3 w-[72%] rounded-t-md bg-gradient-to-b from-[#c8ced8] to-[#8a929e] shadow-md" />
              <div className="relative overflow-hidden rounded-b-[0.85rem] rounded-t-sm border border-[#9aa3b0]/70 bg-gradient-to-b from-[#e8ecf2] via-[#b8c0cc] to-[#7a8492] px-2 pb-3 pt-2 shadow-[0_10px_18px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#5c6572]/70 shadow-inner" />
                <div className="mx-auto h-8 w-[78%] rounded-sm bg-gradient-to-b from-[#f4f6f8] to-[#d5dbe4] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_3px_rgba(0,0,0,0.2)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
              </div>
            </div>
          </div>

          <div className="clipboard-paper relative z-10 mx-auto max-h-[min(72vh,40rem)] overflow-y-auto rounded-sm bg-[#fbf8f1] px-1 py-1 shadow-[0_2px_0_rgba(0,0,0,0.08),0_14px_28px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_18%,transparent_82%,rgba(180,150,100,0.08))]" />
            <h2 id="clipboard-receipt-title" className="sr-only">
              Visualização do recibo
            </h2>
            <ReceiptDocument
              receipt={receipt}
              id="clipboard-receipt"
              className="!mx-0 !max-w-none !rounded-none !border-0 !bg-transparent !p-5 !shadow-none sm:!p-7"
            />
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/15 blur-[1px]" />
        </div>

        <p className="mt-4 text-center text-xs font-medium tracking-wide text-amber-100/55">
          Toque no X ou fora da prancheta para fechar
        </p>
      </div>
    </div>,
    document.body,
  )
}
