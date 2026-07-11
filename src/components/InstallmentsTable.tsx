import {
  CheckSquare,
  FilePlus,
  FileText,
  ListChecks,
  Plus,
  Replace,
  Trash2,
  Wand2,
} from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { Installment } from '../types/receipt'
import type { ReceiptPdfsMap } from '../types/receiptPdf'
import type { InstallmentStatusRow } from '../utils/installmentStatus'
import { formatCurrency, formatDateBR } from '../utils/formatters'
import { Button, Card } from './ui'

interface InstallmentsTableProps {
  installments: Installment[]
  totalInstallments: number
  selectedId: string
  nextPending: InstallmentStatusRow | null
  paidRows: InstallmentStatusRow[]
  receiptPdfs: ReceiptPdfsMap
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onRemoveSelected: (ids: string[]) => void
  onRemovePaid: (numbers: number[]) => void
  onUpdate: (
    id: string,
    field: keyof Installment,
    value: string | number | boolean,
  ) => void
  onGenerateBatch: (count: number) => void
  onGenerateReceipt: (id: string) => void
  onAddPdf: (installmentNumber: number, file: File) => Promise<void>
}

export function InstallmentsTable({
  installments,
  totalInstallments,
  selectedId,
  nextPending,
  paidRows,
  receiptPdfs,
  onSelect,
  onAdd,
  onRemove,
  onRemoveSelected,
  onRemovePaid,
  onUpdate,
  onGenerateBatch,
  onGenerateReceipt,
  onAddPdf,
}: InstallmentsTableProps) {
  const canAdd = nextPending !== null
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfTargetNumberRef = useRef<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showPaid, setShowPaid] = useState(false)
  const [selectedPaid, setSelectedPaid] = useState<Set<number>>(new Set())
  const [selectedDraft, setSelectedDraft] = useState<Set<string>>(new Set())

  const selectedInstallment =
    installments.find((item) => item.id === selectedId) ?? null

  const paidInstallments = useMemo(
    () => paidRows.filter((row) => row.status === 'pago'),
    [paidRows],
  )

  const singleSelectedPaidNumber =
    selectedPaid.size === 1 ? [...selectedPaid][0] : null
  const singleSelectedPaidPdf =
    singleSelectedPaidNumber != null
      ? receiptPdfs[String(singleSelectedPaidNumber)]
      : undefined

  const openPdfPicker = (installmentNumber: number) => {
    pdfTargetNumberRef.current = installmentNumber
    fileInputRef.current?.click()
  }

  const handleAddPdfClick = () => {
    if (!selectedInstallment) {
      window.alert(
        'Selecione uma parcela na tabela antes de adicionar o PDF.',
      )
      return
    }
    openPdfPicker(selectedInstallment.number)
  }

  const handlePaidPdfClick = () => {
    if (singleSelectedPaidNumber == null) {
      window.alert(
        'Selecione uma parcela paga no checklist para adicionar ou substituir o PDF.',
      )
      return
    }
    openPdfPicker(singleSelectedPaidNumber)
  }

  const handlePdfSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const targetNumber = pdfTargetNumberRef.current
    pdfTargetNumberRef.current = null
    if (!file || targetNumber == null) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      window.alert('Selecione um arquivo PDF válido.')
      return
    }

    setUploading(true)
    try {
      await onAddPdf(targetNumber, file)
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o PDF.',
      )
    } finally {
      setUploading(false)
    }
  }

  const togglePaidView = () => {
    setShowPaid((prev) => {
      if (prev) {
        setSelectedPaid(new Set())
        return false
      }
      setSelectedDraft(new Set())
      return true
    })
  }

  const togglePaidSelection = (number: number) => {
    setSelectedPaid((prev) => {
      const next = new Set(prev)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })
  }

  const toggleAllPaid = () => {
    setSelectedPaid((prev) => {
      if (prev.size === paidInstallments.length) return new Set()
      return new Set(paidInstallments.map((row) => row.number))
    })
  }

  const toggleDraftSelection = (id: string) => {
    setSelectedDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelectedPaid = () => {
    if (selectedPaid.size === 0) return
    const numbers = [...selectedPaid]
    const confirmed = window.confirm(
      `Excluir ${numbers.length} parcela(s) paga(s) selecionada(s)? Elas voltarão para pendente.`,
    )
    if (!confirmed) return
    onRemovePaid(numbers)
    setSelectedPaid(new Set())
  }

  const handleDeleteSelectedDraft = () => {
    if (selectedDraft.size === 0) return
    const ids = [...selectedDraft]
    const confirmed = window.confirm(
      `Excluir ${ids.length} parcela(s) selecionada(s) da tabela?`,
    )
    if (!confirmed) return
    onRemoveSelected(ids)
    setSelectedDraft(new Set())
  }

  return (
    <Card
      title={showPaid ? 'Parcelas Pagas' : 'Tabela de Parcelas'}
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showPaid ? 'primary' : 'secondary'}
            size="sm"
            onClick={togglePaidView}
            title={
              showPaid
                ? 'Voltar à tabela de parcelas do recibo'
                : 'Abrir todas as parcelas pagas'
            }
          >
            <ListChecks className="h-3.5 w-3.5" />
            Parcelas Pagas
          </Button>
          {!showPaid && (
            <>
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
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddPdfClick}
                disabled={uploading || !selectedInstallment}
                title={
                  selectedInstallment
                    ? `Anexar PDF à parcela ${selectedInstallment.number}`
                    : 'Selecione uma parcela para anexar o PDF'
                }
              >
                <FilePlus className="h-3.5 w-3.5" />
                {uploading ? 'Enviando...' : 'Add PDF'}
              </Button>
            </>
          )}
          {showPaid && singleSelectedPaidNumber != null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePaidPdfClick}
              disabled={uploading}
              title={
                singleSelectedPaidPdf
                  ? `Substituir PDF da parcela ${singleSelectedPaidNumber} (${singleSelectedPaidPdf.fileName})`
                  : `Adicionar PDF à parcela ${singleSelectedPaidNumber}`
              }
            >
              {singleSelectedPaidPdf ? (
                <Replace className="h-3.5 w-3.5" />
              ) : (
                <FilePlus className="h-3.5 w-3.5" />
              )}
              {uploading
                ? 'Enviando...'
                : singleSelectedPaidPdf
                  ? 'Substituir PDF'
                  : 'Add PDF'}
            </Button>
          )}
          {showPaid && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelectedPaid}
              disabled={selectedPaid.size === 0}
              title="Excluir parcelas pagas selecionadas"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir ({selectedPaid.size})
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handlePdfSelected}
          />
          {!showPaid && selectedDraft.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelectedDraft}
              title="Excluir parcelas selecionadas da tabela"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir ({selectedDraft.size})
            </Button>
          )}
        </div>
      }
    >
      {showPaid ? (
        <p className="mb-4 text-xs text-zinc-500">
          Marque uma parcela no checklist para adicionar ou substituir o PDF.
          Use Excluir para remover as selecionadas (voltam para pendente).
        </p>
      ) : (
        canAdd && (
          <p className="mb-4 text-xs text-zinc-500">
            Próxima parcela pendente:{' '}
            <span className="text-indigo-400">
              {nextPending.number}/{totalInstallments} — {nextPending.monthLabel}{' '}
              ({formatDateBR(nextPending.dueDate)})
            </span>
          </p>
        )
      )}

      <div className="overflow-x-auto rounded-xl border border-white/6">
        {showPaid ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 bg-white/3 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium w-12">
                  <button
                    type="button"
                    onClick={toggleAllPaid}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                    title="Selecionar todas"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Parcela</th>
                <th className="px-4 py-3 font-medium">Referência</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Data pagamento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">PDF</th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {paidInstallments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    Nenhuma parcela paga cadastrada.
                  </td>
                </tr>
              ) : (
                paidInstallments.map((row) => {
                  const checked = selectedPaid.has(row.number)
                  const uploadedPdf = receiptPdfs[String(row.number)]
                  return (
                    <tr
                      key={row.number}
                      onClick={() => togglePaidSelection(row.number)}
                      className={`cursor-pointer border-b border-white/4 transition-colors last:border-0 ${
                        checked
                          ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/25'
                          : 'hover:bg-white/3'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePaidSelection(row.number)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0"
                          aria-label={`Selecionar parcela ${row.number}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        {String(row.number).padStart(2, '0')} /{' '}
                        {row.totalInstallments}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{row.monthLabel}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDateBR(row.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {row.paymentDate
                          ? formatDateBR(row.paymentDate)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        {formatCurrency(row.value)}
                      </td>
                      <td className="px-4 py-3">
                        {uploadedPdf ? (
                          <span
                            className="inline-flex max-w-[140px] truncate rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300"
                            title={uploadedPdf.fileName}
                          >
                            {uploadedPdf.fileName}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">Sem PDF</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPaid(new Set([row.number]))
                              openPdfPicker(row.number)
                            }}
                            disabled={uploading}
                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-40"
                            title={
                              uploadedPdf
                                ? `Substituir PDF (${uploadedPdf.fileName})`
                                : 'Adicionar PDF'
                            }
                          >
                            {uploadedPdf ? (
                              <Replace className="h-4 w-4" />
                            ) : (
                              <FilePlus className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const confirmed = window.confirm(
                                `Excluir a parcela ${row.number}? Ela voltará para pendente.`,
                              )
                              if (!confirmed) return
                              onRemovePaid([row.number])
                              setSelectedPaid((prev) => {
                                const next = new Set(prev)
                                next.delete(row.number)
                                return next
                              })
                            }}
                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Excluir parcela paga"
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
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 bg-white/3 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium w-12"></th>
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
                    colSpan={7}
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
                  const isChecked = selectedDraft.has(item.id)
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
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDraftSelection(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0"
                          aria-label={`Selecionar parcela ${item.number}`}
                        />
                      </td>
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
                        <span className="ml-1 text-zinc-500">
                          / {totalInstallments}
                        </span>
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
        )}
      </div>

      {showPaid ? (
        paidInstallments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>{paidInstallments.length} parcela(s) paga(s)</span>
            <span>
              Total:{' '}
              {formatCurrency(
                paidInstallments.reduce((sum, row) => sum + row.value, 0),
              )}
            </span>
            {selectedPaid.size > 0 && (
              <span className="text-emerald-400">
                {selectedPaid.size} selecionada(s)
              </span>
            )}
          </div>
        )
      ) : (
        installments.length > 0 && (
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
                {installments.find((i) => i.id === selectedId)?.number} —
                pagamento{' '}
                {formatDateBR(
                  installments.find((i) => i.id === selectedId)?.paymentDate ??
                    '',
                )}
              </span>
            )}
          </div>
        )
      )}
    </Card>
  )
}
