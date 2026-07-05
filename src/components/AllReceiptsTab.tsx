import {
  Archive,
  Download,
  FileText,
  Layers,
  Printer,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ArchivedReceipt } from '../utils/monthlyReceipts'
import {
  archivedReceipts,
  groupReceiptsByYear,
} from '../utils/monthlyReceipts'
import {
  downloadReceiptDoc,
  downloadReceiptHtml,
  printReceipt,
} from '../utils/docGenerator'
import { getReceiptFilename } from '../utils/receiptContent'
import { downloadReceiptPdf } from '../utils/pdfGenerator'
import { formatCurrency, formatDateBR } from '../utils/formatters'
import { ReceiptDocument, ReceiptDocumentMeta } from './ReceiptDocument'
import { Button, Card } from './ui'

export function AllReceiptsTab() {
  const [selectedKey, setSelectedKey] = useState(archivedReceipts[0]?.monthKey ?? '')
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  const grouped = useMemo(() => groupReceiptsByYear(archivedReceipts), [])
  const years = useMemo(
    () => Object.keys(grouped).map(Number).sort(),
    [grouped],
  )

  const filteredReceipts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return archivedReceipts.filter((receipt) => {
      if (yearFilter !== 'all' && receipt.year !== yearFilter) return false
      if (!query) return true
      return (
        receipt.monthLabel.toLowerCase().includes(query) ||
        String(receipt.installment.number).includes(query) ||
        formatDateBR(receipt.installment.paymentDate).includes(query)
      )
    })
  }, [search, yearFilter])

  const selectedReceipt: ArchivedReceipt | undefined =
    archivedReceipts.find((r) => r.monthKey === selectedKey) ??
    filteredReceipts[0]

  const handleBulkDownload = (type: 'pdf' | 'doc') => {
    const items = filteredReceipts.length > 0 ? filteredReceipts : archivedReceipts
    items.forEach((receipt, index) => {
      setTimeout(() => {
        const filename = getReceiptFilename(receipt, type, receipt.monthLabel)
        if (type === 'pdf') {
          downloadReceiptPdf(receipt, filename)
        } else {
          downloadReceiptDoc(receipt, receipt.monthLabel, filename)
        }
      }, index * 350)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Todos os Recibos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {archivedReceipts.length} recibos mensais — Janeiro/2025 a Julho/2026,
            sempre no dia 15 de cada mês.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleBulkDownload('pdf')}>
            <Layers className="h-3.5 w-3.5" />
            Baixar todos PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleBulkDownload('doc')}>
            <FileText className="h-3.5 w-3.5" />
            Baixar todos Word
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mês, parcela ou data..."
            className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setYearFilter('all')}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              yearFilter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                : 'bg-white/4 text-zinc-400 hover:bg-white/6'
            }`}
          >
            Todos
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setYearFilter(year)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                yearFilter === year
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-white/4 text-zinc-400 hover:bg-white/6'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <Card title="Arquivo mensal" className="xl:max-h-[calc(100vh-280px)] xl:overflow-hidden">
          <div className="max-h-[520px] space-y-6 overflow-y-auto pr-1 xl:max-h-[calc(100vh-360px)]">
            {(yearFilter === 'all' ? years : [yearFilter as number]).map((year) => {
              const yearReceipts = (grouped[year] ?? []).filter((r) =>
                filteredReceipts.some((f) => f.monthKey === r.monthKey),
              )
              if (yearReceipts.length === 0) return null

              return (
                <div key={year}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {year}
                  </h3>
                  <ul className="space-y-1">
                    {yearReceipts.map((receipt) => {
                      const isSelected = receipt.monthKey === selectedReceipt?.monthKey
                      return (
                        <li key={receipt.monthKey}>
                          <button
                            type="button"
                            onClick={() => setSelectedKey(receipt.monthKey)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                              isSelected
                                ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30'
                                : 'hover:bg-white/4'
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isSelected
                                  ? 'bg-indigo-500/30 text-indigo-200'
                                  : 'bg-white/6 text-zinc-400'
                              }`}
                            >
                              {String(receipt.installment.number).padStart(2, '0')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-medium ${
                                  isSelected ? 'text-white' : 'text-zinc-300'
                                }`}
                              >
                                {receipt.monthLabel}
                              </p>
                              <p className="text-xs text-zinc-500">
                                15/{String(parseInt(receipt.monthKey.split('-')[1], 10)).padStart(2, '0')}/{receipt.year} ·{' '}
                                {formatCurrency(receipt.installment.value)}
                              </p>
                            </div>
                            <Archive
                              className={`h-4 w-4 shrink-0 ${
                                isSelected ? 'text-indigo-400' : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}

            {filteredReceipts.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">
                Nenhum recibo encontrado para esta busca.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {selectedReceipt ? (
            <>
              <Card
                title={selectedReceipt.monthLabel}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => printReceipt(selectedReceipt)}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        downloadReceiptDoc(
                          selectedReceipt,
                          selectedReceipt.monthLabel,
                        )
                      }
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Word
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        downloadReceiptHtml(
                          selectedReceipt,
                          selectedReceipt.monthLabel,
                        )
                      }
                      title="Abrir no LibreOffice Writer"
                    >
                      LibreOffice
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        downloadReceiptPdf(
                          selectedReceipt,
                          getReceiptFilename(
                            selectedReceipt,
                            'pdf',
                            selectedReceipt.monthLabel,
                          ),
                        )
                      }
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </div>
                }
              >
                <ReceiptDocumentMeta receipt={selectedReceipt} />
                <div className="mt-4">
                  <ReceiptDocument receipt={selectedReceipt} />
                </div>
              </Card>

              <p className="text-xs text-zinc-500">
                Os arquivos <strong className="text-zinc-400">Word (.doc)</strong> e{' '}
                <strong className="text-zinc-400">HTML</strong> podem ser abertos no Microsoft
                Word ou LibreOffice Writer para edição antes de imprimir.
              </p>
            </>
          ) : (
            <Card title="Pré-visualização">
              <p className="py-12 text-center text-sm text-zinc-500">
                Selecione um recibo na lista ao lado.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
