import { FileText, Plus, Trash2, Wand2 } from 'lucide-react'
import type { Installment } from '../types/receipt'
import type { InstallmentStatusRow } from '../utils/installmentStatus'
import { formatCurrency, formatDateBR } from '../utils/formatters'
import { Button, Card } from './ui'

interface InstallmentsTableProps {
  installments: Installment[]
  totalInstallments: number
  selectedId: string
  nextPending: InstallmentStatusRow | null
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (
    id: string,
    field: keyof Installment,
    value: string | number | boolean,
  ) => void
  onGenerateBatch: (count: number) => void
  onGenerateReceipt: (id: string) => void
}

export function InstallmentsTable({
  installments,
  totalInstallments,
  selectedId,
  nextPending,
  onSelect,
  onAdd,
  onRemove,
  onUpdate,
  onGenerateBatch,
  onGenerateReceipt,
}: InstallmentsTableProps) {
  const canAdd = nextPending !== null

  return (
    <Card
      title="Tabela de Parcelas"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGenerateBatch(12)}
            disabled={!canAdd}
            title={
              canAdd
                ? 'Gerar próximas 12 parcelas pendentes'
                : 'Não há parcelas pendentes disponíveis'
            }
          >
            <Wand2 className="h-3.5 w-3.5" />
            +12 parcelas
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAdd}
            disabled={!canAdd}
            title={
              canAdd
                ? `Adicionar parcela ${nextPending.number} (${nextPending.monthLabel})`
                : 'Todas as parcelas pendentes já foram adicionadas'
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      }
    >
      {canAdd && (
        <p className="mb-4 text-xs text-zinc-500">
          Próxima parcela pendente:{' '}
          <span className="text-indigo-400">
            {nextPending.number}/{totalInstallments} — {nextPending.monthLabel} (
            {formatDateBR(nextPending.dueDate)})
          </span>
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/6">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Parcela</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Data pagamento</th>
              <th className="px-4 py-3 font-medium">Data recibo</th>
              <th className="px-4 py-3 font-medium">Cidade</th>
              <th className="px-4 py-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-zinc-500"
                >
                  Nenhuma parcela cadastrada. Clique em &quot;Adicionar&quot; para
                  incluir a próxima parcela pendente
                  {nextPending
                    ? ` (${nextPending.number}/${totalInstallments} — ${nextPending.monthLabel}).`
                    : '.'}
                </td>
              </tr>
            ) : (
              installments.map((item) => {
                const isSelected = item.id === selectedId
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`cursor-pointer border-b border-white/4 transition-colors last:border-0 ${
                      isSelected
                        ? 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/30'
                        : 'hover:bg-white/3'
                    }`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={1}
                        max={totalInstallments}
                        value={item.number}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdate(
                            item.id,
                            'number',
                            parseInt(e.target.value, 10) || 1,
                          )
                        }
                        className="w-16 rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-center text-sm outline-none focus:border-indigo-500/50"
                      />
                      <span className="ml-1 text-zinc-500">/ {totalInstallments}</span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.value}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdate(
                            item.id,
                            'value',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-28 rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-sm outline-none focus:border-indigo-500/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={item.paymentDate}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdate(item.id, 'paymentDate', e.target.value)
                        }
                        className="rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-sm outline-none focus:border-indigo-500/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={item.receiptDate}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdate(item.id, 'receiptDate', e.target.value)
                        }
                        className="rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-sm outline-none focus:border-indigo-500/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.city}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdate(item.id, 'city', e.target.value)
                        }
                        className="w-full min-w-[120px] rounded-lg border border-white/8 bg-white/4 px-2 py-1.5 text-sm outline-none focus:border-indigo-500/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onGenerateReceipt(item.id)
                          }}
                          className={`rounded-lg p-2 transition-colors ${
                            item.generated
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400'
                          }`}
                          title={
                            item.generated
                              ? 'Recibo gerado — ver na pré-visualização'
                              : 'Gerar recibo'
                          }
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(item.id)
                          }}
                          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Remover parcela"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {installments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>{installments.length} parcela(s) na tabela</span>
          <span>
            Total:{' '}
            {formatCurrency(
              installments.reduce((sum, i) => sum + i.value, 0),
            )}
          </span>
          {selectedId && (
            <span>
              Selecionada: parcela{' '}
              {installments.find((i) => i.id === selectedId)?.number} — pagamento{' '}
              {formatDateBR(
                installments.find((i) => i.id === selectedId)?.paymentDate ?? '',
              )}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
