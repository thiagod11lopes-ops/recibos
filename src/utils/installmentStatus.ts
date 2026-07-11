import { defaultReceiptData } from '../data/defaultReceipt'
import { formatCurrency } from './formatters'

export type PaymentStatus = 'pago' | 'pendente'

export interface InstallmentStatusRow {
  number: number
  totalInstallments: number
  value: number
  dueDate: string
  paymentDate?: string
  monthLabel: string
  status: PaymentStatus
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const PAID_UP_TO = 18

/** Parcelas com vencimento até esta data usam o vencimento como data de pagamento. */
export const HISTORICAL_PAYMENT_CUTOFF = '2026-06-15'

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addMonths(year: number, month: number, count: number) {
  const total = (year * 12 + (month - 1)) + count
  return {
    year: Math.floor(total / 12),
    month: (total % 12) + 1,
  }
}

export function generateInstallmentStatusRows(
  totalInstallments = defaultReceiptData.property.installmentCount,
  installmentValue = defaultReceiptData.property.installmentValue,
  startYear = 2025,
  startMonth = 1,
  dayOfMonth = 15,
  paidUpTo = PAID_UP_TO,
): InstallmentStatusRow[] {
  return Array.from({ length: totalInstallments }, (_, index) => {
    const number = index + 1
    const { year, month } = addMonths(startYear, startMonth, index)
    const dueDate = toISODate(year, month, dayOfMonth)

    return {
      number,
      totalInstallments,
      value: installmentValue,
      dueDate,
      monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
      status: number <= paidUpTo ? 'pago' : 'pendente',
    }
  })
}

export const installmentStatusRows = generateInstallmentStatusRows()

/**
 * Datas de pagamento históricas: iguais ao vencimento até 15/06/2026.
 * Parcelas a partir de 15/07/2026 não entram aqui — são preenchidas ao gerar recibo.
 */
export function buildHistoricalPaymentDates(
  rows: InstallmentStatusRow[] = generateInstallmentStatusRows(),
): Record<string, string> {
  const dates: Record<string, string> = {}
  for (const row of rows) {
    if (row.dueDate <= HISTORICAL_PAYMENT_CUTOFF) {
      dates[String(row.number)] = row.dueDate
    }
  }
  return dates
}

export function mergeHistoricalPaymentDates(
  paymentDates: Record<string, string> = {},
): Record<string, string> {
  return {
    ...paymentDates,
    ...buildHistoricalPaymentDates(),
  }
}

export function getNextPendingInstallment(
  existingNumbers: number[],
): InstallmentStatusRow | null {
  return (
    installmentStatusRows.find(
      (row) =>
        row.status === 'pendente' && !existingNumbers.includes(row.number),
    ) ?? null
  )
}

export function getNextPendingInstallments(
  existingNumbers: number[],
  count: number,
): InstallmentStatusRow[] {
  return installmentStatusRows
    .filter(
      (row) =>
        row.status === 'pendente' && !existingNumbers.includes(row.number),
    )
    .slice(0, count)
}

export function getPaymentSummary(rows: InstallmentStatusRow[]) {
  const paid = rows.filter((r) => r.status === 'pago')
  const pending = rows.filter((r) => r.status === 'pendente')

  return {
    paidCount: paid.length,
    pendingCount: pending.length,
    paidTotal: paid.reduce((sum, r) => sum + r.value, 0),
    pendingTotal: pending.reduce((sum, r) => sum + r.value, 0),
    paidTotalFormatted: formatCurrency(paid.reduce((sum, r) => sum + r.value, 0)),
    pendingTotalFormatted: formatCurrency(
      pending.reduce((sum, r) => sum + r.value, 0),
    ),
  }
}
