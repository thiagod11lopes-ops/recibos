import {
  buildPaymentTableHtml,
  createPaymentTableDocument,
  PAYMENT_TABLE_FILENAME,
  type PaymentTableDocument,
} from './paymentTableContent'
import { downloadPaymentTablePdf } from './paymentTablePdf'
import type { Party, Property } from '../types/receipt'
import type { InstallmentStatusRow } from './installmentStatus'

export type PaymentTableExportFormat = 'pdf' | 'word' | 'libreoffice'

export type PaymentTableParcelFilter = 'all' | 'pago' | 'pendente'

export interface PaymentTableExportOptions {
  format: PaymentTableExportFormat
  parcelFilter: PaymentTableParcelFilter
}

function filterRowsByStatus(
  rows: InstallmentStatusRow[],
  parcelFilter: PaymentTableParcelFilter,
): InstallmentStatusRow[] {
  if (parcelFilter === 'all') return rows
  return rows.filter((row) => row.status === parcelFilter)
}

function getFilenameSuffix(parcelFilter: PaymentTableParcelFilter): string {
  switch (parcelFilter) {
    case 'pago':
      return '_Pagas'
    case 'pendente':
      return '_Pendentes'
    default:
      return ''
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downloadPaymentTableDoc(doc: PaymentTableDocument, filename: string) {
  const html = buildPaymentTableHtml(doc)
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  downloadBlob(blob, `${filename}.doc`)
}

function downloadPaymentTableHtml(doc: PaymentTableDocument, filename: string) {
  const html = buildPaymentTableHtml(doc)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${filename}.html`)
}

export function exportPaymentTable(
  options: PaymentTableExportOptions,
  seller: Party,
  buyer: Party,
  property: Property,
  rows: InstallmentStatusRow[],
) {
  const filteredRows = filterRowsByStatus(rows, options.parcelFilter)
  if (filteredRows.length === 0) return

  const document = createPaymentTableDocument(
    seller,
    buyer,
    property,
    filteredRows,
    rows,
  )
  const filename = `${PAYMENT_TABLE_FILENAME}${getFilenameSuffix(options.parcelFilter)}`

  switch (options.format) {
    case 'pdf':
      downloadPaymentTablePdf(document, filename)
      break
    case 'word':
      downloadPaymentTableDoc(document, filename)
      break
    case 'libreoffice':
      downloadPaymentTableHtml(document, filename)
      break
  }
}

export { createPaymentTableDocument }
