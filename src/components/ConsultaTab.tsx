import { CheckCircle2, Clock, Eye, FileSpreadsheet, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import type { PaymentStatus } from '../utils/installmentStatus'
import { exportPaymentTable } from '../utils/paymentTableExport'
import { formatCurrency, formatDateBR } from '../utils/formatters'
import { ExportFormatModal } from './ExportFormatModal'
import { Button, Card } from './ui'

interface ConsultaTabProps {
  permissions: ConsultaPermissions
  publishedData: ConsultaPublishedData | null
  isPublicMode?: boolean
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

function InfoBlock({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/3 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  )
}

export function ConsultaTab({
  permissions,
  publishedData,
  isPublicMode = false,
}: ConsultaTabProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const filteredRows = useMemo(() => {
    if (!publishedData || !permissions.installmentTable) return []
    const query = search.trim().toLowerCase()
    return publishedData.rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!query) return true
      return (
        String(row.number).includes(query) ||
        row.monthLabel.toLowerCase().includes(query) ||
        formatDateBR(row.dueDate).includes(query) ||
        (row.paymentDate && formatDateBR(row.paymentDate).includes(query))
      )
    })
  }, [publishedData, permissions.installmentTable, search, statusFilter])

  const showContractSection =
    permissions.sellerName ||
    permissions.sellerCpf ||
    permissions.buyerName ||
    permissions.buyerCpf ||
    permissions.property ||
    permissions.propertyFinancials

  const visibleColumnCount =
    1 +
    (permissions.showReference ? 1 : 0) +
    (permissions.showDueDate ? 1 : 0) +
    (permissions.showPaymentDate ? 1 : 0) +
    (permissions.showValue ? 1 : 0) +
    (permissions.showStatus ? 1 : 0)

  if (!publishedData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Eye className="mb-4 h-12 w-12 text-zinc-600" />
        <h2 className="text-lg font-semibold text-zinc-300">
          Nenhum dado publicado
        </h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          {isPublicMode
            ? 'O administrador ainda não publicou informações para consulta. Tente novamente mais tarde.'
            : 'Publique os dados na aba Administração para que os usuários possam consultá-los.'}
        </p>
      </div>
    )
  }

  const { seller, buyer, property, summary, totalCount } = publishedData

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Consulta de Pagamentos
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Visualização somente leitura das informações autorizadas pelo administrador.
        </p>
      </div>

      {showContractSection && (
        <Card title="Dados do contrato">
          <div className="grid gap-3 sm:grid-cols-2">
            {permissions.sellerName && (
              <InfoBlock label="Vendedor" value={seller.name} />
            )}
            {permissions.sellerCpf && (
              <InfoBlock label="CPF do vendedor" value={seller.cpf} />
            )}
            {permissions.buyerName && (
              <InfoBlock label="Comprador" value={buyer.name} />
            )}
            {permissions.buyerCpf && (
              <InfoBlock label="CPF do comprador" value={buyer.cpf} />
            )}
            {permissions.property && (
              <div className="sm:col-span-2">
                <InfoBlock
                  label="Imóvel"
                  value={property.location.replace(/\n/g, ', ')}
                />
              </div>
            )}
            {permissions.propertyFinancials && (
              <>
                <InfoBlock
                  label="Valor total"
                  value={formatCurrency(property.totalValue)}
                />
                <InfoBlock
                  label="Parcelas"
                  value={`${property.installmentCount} × ${formatCurrency(property.installmentValue)}`}
                />
              </>
            )}
          </div>
        </Card>
      )}

      {(permissions.paymentSummary || permissions.paymentTableExport) && (
        <div className="space-y-4">
          {permissions.paymentSummary && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Parcelas pagas
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {summary.paidCount}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{summary.paidTotalFormatted}</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Parcelas pendentes
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {summary.pendingCount}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {summary.pendingTotalFormatted}
                </p>
              </div>
              {permissions.progressBar && (
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
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{
                        width: `${(summary.paidCount / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {permissions.paymentTableExport && (
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setExportModalOpen(true)}>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Gerar Tabela de Pagamento
              </Button>
            </div>
          )}
        </div>
      )}

      {permissions.paymentTableExport && (
        <ExportFormatModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          paidCount={summary.paidCount}
          pendingCount={summary.pendingCount}
          onSelect={(options) =>
            exportPaymentTable(
              options,
              seller,
              buyer,
              property,
              publishedData.rows,
            )
          }
        />
      )}

      {permissions.installmentTable && (
        <Card title="Parcelas do contrato">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar parcela..."
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pago', 'pendente'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    statusFilter === filter
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-white/4 text-zinc-400 hover:bg-white/6'
                  }`}
                >
                  {filter === 'all' ? 'Todas' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/6">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/6 bg-white/3 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Parcela</th>
                  {permissions.showReference && (
                    <th className="px-4 py-3 font-medium">Referência</th>
                  )}
                  {permissions.showDueDate && (
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                  )}
                  {permissions.showPaymentDate && (
                    <th className="px-4 py-3 font-medium">Data de pagamento</th>
                  )}
                  {permissions.showValue && (
                    <th className="px-4 py-3 font-medium">Valor</th>
                  )}
                  {permissions.showStatus && (
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.number}
                    className="border-b border-white/4 last:border-0"
                  >
                    <td className="px-4 py-3 text-zinc-200">
                      {String(row.number).padStart(2, '0')} / {row.totalInstallments}
                    </td>
                    {permissions.showReference && (
                      <td className="px-4 py-3 text-zinc-400">{row.monthLabel}</td>
                    )}
                    {permissions.showDueDate && (
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDateBR(row.dueDate)}
                      </td>
                    )}
                    {permissions.showPaymentDate && (
                      <td className="px-4 py-3 text-zinc-400">
                        {row.paymentDate ? formatDateBR(row.paymentDate) : '—'}
                      </td>
                    )}
                    {permissions.showValue && (
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        {formatCurrency(row.value)}
                      </td>
                    )}
                    {permissions.showStatus && (
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={row.status} />
                      </td>
                    )}
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleColumnCount}
                      className="px-4 py-12 text-center text-zinc-500"
                    >
                      Nenhuma parcela encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!showContractSection &&
        !permissions.paymentSummary &&
        !permissions.paymentTableExport &&
        !permissions.installmentTable && (
          <Card>
            <p className="text-center text-sm text-zinc-500">
              O administrador não liberou nenhuma informação para consulta no momento.
            </p>
          </Card>
        )}
    </div>
  )
}
