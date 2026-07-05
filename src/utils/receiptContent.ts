import type { ActiveReceipt } from '../types/receipt'
import {
  formatCurrency,
  formatDateBR,
} from './formatters'
import { numberToWords } from './numberToWords'

export function getReceiptBodyText(receipt: ActiveReceipt): string {
  const { property, installment } = receipt
  return (
    `Recebemos do comprador a quantia de ${formatCurrency(installment.value)} ` +
    `(${numberToWords(installment.value)}) referente a parcela ` +
    `${installment.number}/${property.installmentCount}. Pago em ${formatDateBR(installment.paymentDate)}.`
  )
}

export { buildReceiptHtml } from './receiptHtml'

export function getReceiptFilename(
  receipt: ActiveReceipt,
  extension: 'pdf' | 'doc',
  monthLabel?: string,
): string {
  const parcel = String(receipt.installment.number).padStart(2, '0')
  const prefix = monthLabel
    ? `Recibo_${monthLabel.replace(/\s+/g, '_')}`
    : `Recibo_Parcela_${parcel}`
  return `${prefix}_Parcela_${parcel}.${extension}`
}
