import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmModal } from './ConfirmModal'

interface DeletePdfButtonProps {
  installmentNumber: number
  fileName: string
  onDelete: (installmentNumber: number) => Promise<void>
}

export function DeletePdfButton({
  installmentNumber,
  fileName,
  onDelete,
}: DeletePdfButtonProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onDelete(installmentNumber)
      setOpen(false)
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o PDF.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15 p-2 text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-40"
        title={`Excluir PDF: ${fileName}`}
        aria-label={`Excluir PDF da parcela ${installmentNumber}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmModal
        open={open}
        title="Excluir PDF anexado?"
        message={`O arquivo "${fileName}" da parcela ${String(installmentNumber).padStart(2, '0')} será removido. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir PDF"
        busy={busy}
        onConfirm={() => void handleConfirm()}
        onClose={() => {
          if (!busy) setOpen(false)
        }}
      />
    </>
  )
}
