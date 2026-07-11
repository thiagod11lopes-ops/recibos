import { Eye, FileDown } from 'lucide-react'
import { useState } from 'react'
import type { ReceiptPdfMeta } from '../types/receiptPdf'
import {
  createReceiptPdfObjectUrl,
  downloadUploadedReceiptPdf,
} from '../utils/receiptPdfStore'
import { ClipboardReceiptModal } from './ClipboardReceiptModal'

interface UploadedPdfActionsProps {
  installmentNumber: number
  uploadedPdf?: ReceiptPdfMeta
}

export function UploadedPdfActions({
  installmentNumber,
  uploadedPdf,
}: UploadedPdfActionsProps) {
  const [pdfSrc, setPdfSrc] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!uploadedPdf) {
    return <span className="text-xs text-zinc-600">—</span>
  }

  const closeView = () => {
    setPdfSrc((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
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
