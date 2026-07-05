import { defaultReceiptData } from '../data/defaultReceipt'
import type { ActiveReceipt } from '../types/receipt'
import { generateId } from './formatters'

export interface ArchivedReceipt extends ActiveReceipt {
  monthKey: string
  monthLabel: string
  year: number
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

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function generateMonthlyReceipts(
  base = defaultReceiptData,
  startYear = 2025,
  startMonth = 1,
  endYear = 2026,
  endMonth = 7,
  dayOfMonth = 15,
): ArchivedReceipt[] {
  const receipts: ArchivedReceipt[] = []
  let installmentNumber = 1

  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const dateISO = toISODate(year, month, dayOfMonth)
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

    receipts.push({
      seller: base.seller,
      buyer: base.buyer,
      property: base.property,
      installment: {
        id: generateId(),
        number: installmentNumber,
        value: base.property.installmentValue,
        paymentDate: dateISO,
        receiptDate: dateISO,
        city: 'Rio de Janeiro',
        generated: true,
      },
      monthKey,
      monthLabel,
      year,
    })

    installmentNumber++
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return receipts
}

export const archivedReceipts = generateMonthlyReceipts()

export function groupReceiptsByYear(
  receipts: ArchivedReceipt[],
): Record<number, ArchivedReceipt[]> {
  return receipts.reduce<Record<number, ArchivedReceipt[]>>((groups, receipt) => {
    if (!groups[receipt.year]) groups[receipt.year] = []
    groups[receipt.year].push(receipt)
    return groups
  }, {})
}
