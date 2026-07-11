import { CheckCircle2, Clock, FileDown, FileSpreadsheet, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Party, Property } from '../types/receipt'
import type { usePaymentStatus } from '../hooks/usePaymentStatus'
import type { InstallmentStatusRow, PaymentStatus } from '../utils/installmentStatus'
import { exportPaymentTable } from '../utils/paymentTableExport'
import { downloadReceiptPdf } from '../utils/pdfGenerator'
import { formatCurrency, formatDateBR, generateId } from '../utils/formatters'
import { ExportFormatModal } from './ExportFormatModal'
import { CollapsibleParcelSection } from './CollapsibleParcelSection'
import { Button } from './ui'

type PaymentStatusState = ReturnType<typeof usePaymentStatus>

interface PaymentStatusTabProps {
  rows: PaymentStatusState['rows']
  summary: PaymentStatusState['summary']
  totalCount: PaymentStatusState['totalCount']
  isPaid: PaymentStatusState['isPaid']
  onTogglePaid: PaymentStatusState['togglePaid']
  seller: Party
  buyer: Party
  property: Property
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'pago') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/25">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pago
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/25">
      <Clock className="h-3.5 w-3.5" />
      Pendente
    </span>
  )
}

function SummaryCard({
  label,
  count,
  total,
  variant,
}: {
  label: string
  count: number
  total: string
  variant: 'paid' | 'pending'
}) {
  const styles =
    variant === 'paid'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : 'border-amber-500/20 bg-amber-500/5'

  const countColor = variant === 'paid' ? 'text-emerald-400' : 'text-amber-400'

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${countColor}`}>{count}</p>
      <p className="mt-1 text-sm text-zinc-400">{total}</p>
    </div>
  )
}

export function PaymentStatusTab({
  rows,
  summary,
  totalCount,
  isPaid,
  onTogglePaid,
  seller,
  buyer,
  property,
}: PaymentStatusTabProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!query) return true
      return (
        String(row.number).includes(query) ||
        row.monthLabel.toLowerCase().includes(query) ||
        formatDateBR(row.dueDate).includes(query) ||
        (row.paymentDate && formatDateBR(row.paymentDate).includes(query)) ||
        row.status.includes(query)
      )
    })
  }, [rows, search, statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Status de Pagamento
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Marque as parcelas pagas na coluna de checkbox — o status é atualizado
          automaticamente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Parcelas pagas"
          count={summary.paidCount}
          total={summary.paidTotalFormatted}
          variant="paid"
        />
        <SummaryCard
          label="Parcelas pendentes"
          count={summary.pendingCount}
          total={summary.pendingTotalFormatted}
          variant="pending"
        />
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5 sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Progresso
          </p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-bold text-white">
              {Math.round((summary.paidCount / totalCount) * 100)}%
            </p>
            <p className="text-sm text-zinc-400">
              {summary.paidCount} de {totalCount} parcelas
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{
                width: `${(summary.paidCount / totalCount) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por parcela, mês ou data..."
            className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pago', 'pendente'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-white/4 text-zinc-400 hover:bg-white/6'
              }`}
            >
              {filter === 'all' ? 'Todas' : filter}
            </button>
          ))}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Gerar Tabela de Pagamento
          </Button>
        </div>
      </div>

      <ExportFormatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        paidCount={summary.paidCount}
        pendingCount={summary.pendingCount}
        onSelect={(options) =>
          exportPaymentTable(options, seller, buyer, property, rows)
        }
      />

      <CollapsibleParcelSection>
        <div className="overflow-x-auto rounded-xl border border-white/6">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 bg-white/3 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Parcela</th>
                <th className="px-4 py-3 font-medium">Referência</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Data de pagamento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 text-center font-medium">Pago</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
                <th className="px-4 py-3 text-center font-medium">Gerar PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <InstallmentRow
                  key={row.number}
                  row={row}
                  checked={isPaid(row.number)}
                  onToggle={() => onTogglePaid(row.number)}
                  seller={seller}
                  buyer={buyer}
                  property={property}
                />
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    Nenhuma parcela encontrada para esta busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleParcelSection>
    </div>
  )
}

function InstallmentRow({
  row,
  checked,
  onToggle,
  seller,
  buyer,
  property,
}: {
  row: InstallmentStatusRow
  checked: boolean
  onToggle: () => void
  seller: Party
  buyer: Party
  property: Property
}) {
  const isPaid = row.status === 'pago'
  const canGeneratePdf = isPaid && Boolean(row.paymentDate)

  const handleGeneratePdf = () => {
    if (!canGeneratePdf || !row.paymentDate) return

    downloadReceiptPdf({
      seller,
      buyer,
      property,
      installment: {
        id: generateId(),
        number: row.number,
        value: row.value,
        paymentDate: row.paymentDate,
        receiptDate: row.paymentDate,
        city: 'Rio de Janeiro',
        generated: true,
      },
    })
  }

  return (
    <tr
      className={`border-b border-white/4 transition-colors last:border-0 ${
        isPaid ? 'hover:bg-emerald-500/5' : 'hover:bg-amber-500/5'
      }`}
    >
      <td className="px-4 py-3">
        <span className="font-medium text-zinc-200">
          {String(row.number).padStart(2, '0')}
        </span>
        <span className="text-zinc-500"> / {row.totalInstallments}</span>
      </td>
      <td className="px-4 py-3 text-zinc-300">{row.monthLabel}</td>
      <td className="px-4 py-3 text-zinc-400">{formatDateBR(row.dueDate)}</td>
      <td className="px-4 py-3 text-zinc-400">
        {row.paymentDate ? formatDateBR(row.paymentDate) : '—'}
      </td>
      <td className="px-4 py-3 font-medium text-zinc-200">
        {formatCurrency(row.value)}
      </td>
      <td className="px-4 py-3 text-center">
        <label className="inline-flex cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0"
            aria-label={`Marcar parcela ${row.number} como paga`}
          />
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 text-center">
        {canGeneratePdf ? (
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
            title={`Gerar PDF do recibo da parcela ${row.number}`}
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </button>
        ) : (
          <span className="text-xs text-zinc-600">—</span>
        )}
      </td>
    </tr>
  )
}
