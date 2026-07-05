import { FileText, FileType, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
  PaymentTableExportFormat,
  PaymentTableExportOptions,
  PaymentTableParcelFilter,
} from '../utils/paymentTableExport'
import { Button } from './ui'

interface ExportFormatModalProps {
  open: boolean
  onClose: () => void
  onSelect: (options: PaymentTableExportOptions) => void
  paidCount: number
  pendingCount: number
}

const FORMAT_OPTIONS: {
  id: PaymentTableExportFormat
  label: string
  description: string
  icon: typeof FileText
}[] = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Documento pronto para imprimir ou arquivar',
    icon: FileType,
  },
  {
    id: 'word',
    label: 'Word',
    description: 'Arquivo .doc editável no Microsoft Word',
    icon: FileText,
  },
  {
    id: 'libreoffice',
    label: 'LibreOffice',
    description: 'Arquivo HTML compatível com LibreOffice Writer',
    icon: FileText,
  },
]

const PARCEL_FILTER_OPTIONS: {
  id: PaymentTableParcelFilter
  label: string
  description: (paid: number, pending: number) => string
}[] = [
  {
    id: 'pago',
    label: 'Somente pagas',
    description: (paid) => `${paid} parcela(s) marcada(s) como paga`,
  },
  {
    id: 'pendente',
    label: 'Somente pendentes',
    description: (_, pending) => `${pending} parcela(s) pendente(s)`,
  },
  {
    id: 'all',
    label: 'Ambas',
    description: (paid, pending) => `${paid + pending} parcelas — pagas e pendentes`,
  },
]

export function ExportFormatModal({
  open,
  onClose,
  onSelect,
  paidCount,
  pendingCount,
}: ExportFormatModalProps) {
  const [parcelFilter, setParcelFilter] =
    useState<PaymentTableParcelFilter>('all')
  const [selectedFormat, setSelectedFormat] =
    useState<PaymentTableExportFormat>('pdf')

  useEffect(() => {
    if (open) {
      setParcelFilter('all')
      setSelectedFormat('pdf')
    }
  }, [open])

  if (!open) return null

  const filteredCount =
    parcelFilter === 'all'
      ? paidCount + pendingCount
      : parcelFilter === 'pago'
        ? paidCount
        : pendingCount

  const canGenerate = filteredCount > 0

  const handleGenerate = () => {
    if (!canGenerate) return
    onSelect({ format: selectedFormat, parcelFilter })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#16161f] p-6 shadow-2xl shadow-black/50">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          id="export-modal-title"
          className="text-lg font-semibold text-white"
        >
          Gerar Tabela de Pagamento
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Escolha quais parcelas incluir e o formato do documento.
        </p>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Parcelas a incluir
          </p>
          <div className="space-y-2">
            {PARCEL_FILTER_OPTIONS.map(({ id, label, description }) => {
              const isSelected = parcelFilter === id
              const count =
                id === 'all'
                  ? paidCount + pendingCount
                  : id === 'pago'
                    ? paidCount
                    : pendingCount

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setParcelFilter(id)}
                  disabled={count === 0}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/6'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500'
                        : 'border-zinc-600 bg-transparent'
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-100">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {description(paidCount, pendingCount)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Formato do documento
          </p>
          <div className="space-y-2">
            {FORMAT_OPTIONS.map(({ id, label, description, icon: Icon }) => {
              const isSelected = selectedFormat === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedFormat(id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/6'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-indigo-500/15 text-indigo-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {!canGenerate && (
          <p className="mt-4 text-xs text-amber-400">
            Não há parcelas disponíveis para o filtro selecionado.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            Gerar documento
          </Button>
        </div>
      </div>
    </div>
  )
}
