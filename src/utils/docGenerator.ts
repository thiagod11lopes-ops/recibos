import type { ActiveReceipt } from '../types/receipt'
import { buildReceiptHtml, getReceiptFilename } from './receiptContent'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadReceiptDoc(
  receipt: ActiveReceipt,
  monthLabel?: string,
  filename?: string,
) {
  const html = buildReceiptHtml(receipt)
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8',
  })
  const name =
    filename ?? getReceiptFilename(receipt, 'doc', monthLabel)
  downloadBlob(blob, name)
}

export function downloadReceiptHtml(
  receipt: ActiveReceipt,
  monthLabel?: string,
  filename?: string,
) {
  const html = buildReceiptHtml(receipt)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const baseName =
    filename?.replace(/\.(doc|html)$/i, '') ??
    getReceiptFilename(receipt, 'doc', monthLabel).replace(/\.doc$/, '')
  downloadBlob(blob, `${baseName}.html`)
}

export function printReceipt(receipt: ActiveReceipt) {
  const html = buildReceiptHtml(receipt)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => {
    printWindow.print()
  }
}
