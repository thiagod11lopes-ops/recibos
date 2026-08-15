import { Eye, FileDown, FilePlus } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import type { ReceiptPdfMeta } from '../types/receiptPdf'
import {
  createReceiptPdfObjectUrl,
  downloadUploadedReceiptPdf,
} from '../utils/receiptPdfStore'
import { ClipboardReceiptModal } from './ClipboardReceiptModal'

interface UploadedPdfActionsProps {
  installmentNumber: number
  uploadedPdf?: ReceiptPdfMeta
  /** Quando true e não há PDF, mostra botão para anexar. */
  allowAdd?: boolean
  onAddPdf?: (installmentNumber: number, file: File) => Promise<void>
}

export function UploadedPdfActions({
  installmentNumber,
  uploadedPdf,
  allowAdd = false,
  onAddPdf,
}: UploadedPdfActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pdfSrc, setPdfSrc] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const closeView = () => {
    setPdfSrc((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }

  const handleAddClick = () => {
    fileInputRef.current?.click()
  }

  const handlePdfSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onAddPdf) return

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      window.alert('Selecione um arquivo PDF válido.')
      return
    }

    setBusy(true)
    try {
      await onAddPdf(installmentNumber, file)
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o PDF.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (!uploadedPdf) {
    if (!allowAdd || !onAddPdf) {
      return <span className="text-xs text-zinc-600">—</span>
    }

    return (
      <>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-40"
          title={`Anexar PDF à parcela ${installmentNumber}`}
        >
          <FilePlus className="h-3.5 w-3.5" />
          {busy ? 'Enviando...' : 'Add PDF'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => void handlePdfSelected(event)}
        />
      </>
    )
  }

  const handleView = async () => {
    setBusy(true)
    try {
      const url = await createReceiptPdfObjectUrl(
        installmentNumber,
        uploadedPdf.storagePath,
      )
      if (!url) {
        window.alert(
          'PDF anexado não encontrado. Anexe novamente em Parcelas Pagas.',
        )
        return
      }
      setPdfSrc((current) => {
        if (current) URL.revokeObjectURL(current)
        return url
      })
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async () => {
    setBusy(true)
    try {
      const downloaded = await downloadUploadedReceiptPdf(
        installmentNumber,
        uploadedPdf.fileName,
        uploadedPdf.storagePath,
      )
      if (!downloaded) {
        window.alert(
          'Não foi possível baixar o PDF. Anexe novamente em Parcelas Pagas.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => void handleView()}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
          title={`Visualizar PDF: ${uploadedPdf.fileName}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </button>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20 disabled:opacity-40"
          title={`Baixar PDF: ${uploadedPdf.fileName}`}
        >
          <FileDown className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>
      <ClipboardReceiptModal
        pdfSrc={pdfSrc}
        fileName={uploadedPdf.fileName}
        onClose={closeView}
      />
    </>
  )
}
