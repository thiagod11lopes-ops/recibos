import { jsPDF } from 'jspdf'
import type { ActiveReceipt } from '../types/receipt'
import {
  formatCurrency,
  formatDateBR,
  formatDateLong,
} from './formatters'
import {
  applyPageChromeToAllPages,
  drawReceiptPageHeader,
  ensureVerticalSpace,
  PDF_LAYOUT,
  setupPdfPage,
} from './pdfPageLayout'
import { numberToWords } from './numberToWords'

const CONTENT_WIDTH = PDF_LAYOUT.pageWidth - PDF_LAYOUT.margin * 2
const MARGIN = PDF_LAYOUT.margin

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 7,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight)
  })
  return y + lines.length * lineHeight
}

function measureWrappedHeight(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  lineHeight = 7,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  return lines.length * lineHeight
}

export function generateReceiptPdf(receipt: ActiveReceipt): jsPDF {
  const { seller, buyer, property, installment } = receipt
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  let headerHeight = 0
  const drawHeader = () => {
    headerHeight = drawReceiptPageHeader(doc, receipt)
    return headerHeight
  }

  let y = setupPdfPage(doc, drawHeader)

  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)

  y = ensureVerticalSpace(doc, y, 28, drawHeader)
  doc.setFont('helvetica', 'bold')
  doc.text('Vendedor:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(seller.name, MARGIN + 22, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('CPF:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(seller.cpf, MARGIN + 12, y)
  y += 12

  y = ensureVerticalSpace(doc, y, 28, drawHeader)
  doc.setFont('helvetica', 'bold')
  doc.text('Comprador:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(buyer.name, MARGIN + 26, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('CPF:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(buyer.cpf, MARGIN + 12, y)
  y += 12

  y = ensureVerticalSpace(doc, y, 40, drawHeader)
  doc.setFont('helvetica', 'bold')
  doc.text('Imóvel:', MARGIN, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Localização:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  const locationHeight = measureWrappedHeight(
    doc,
    property.location,
    CONTENT_WIDTH - 28,
  )
  y = ensureVerticalSpace(doc, y, locationHeight + 4, drawHeader)
  y = addWrappedText(doc, property.location, MARGIN + 28, y, CONTENT_WIDTH - 28)
  y += 5

  y = ensureVerticalSpace(doc, y, 14, drawHeader)
  doc.setFont('helvetica', 'bold')
  doc.text('Valor Total do Imóvel:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCurrency(property.totalValue), MARGIN + 52, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Forma de Pagamento:', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${property.installmentCount} parcelas de ${formatCurrency(property.installmentValue)}`,
    MARGIN + 48,
    y,
  )
  y += 14

  y = ensureVerticalSpace(doc, y, 20, drawHeader)
  doc.setFont('helvetica', 'bold')
  doc.text('Recebimento:', MARGIN, y)
  y += 8

  const receiptText =
    `Recebemos do comprador a quantia de ${formatCurrency(installment.value)} ` +
    `(${numberToWords(installment.value)}) referente a parcela ` +
    `${installment.number}/${property.installmentCount}. Pago em ${formatDateBR(installment.paymentDate)}.`

  doc.setFont('helvetica', 'normal')
  const receiptHeight = measureWrappedHeight(doc, receiptText, CONTENT_WIDTH)
  y = ensureVerticalSpace(doc, y, receiptHeight + 4, drawHeader)
  y = addWrappedText(doc, receiptText, MARGIN, y, CONTENT_WIDTH)
  y += 20

  y = ensureVerticalSpace(doc, y, 10, drawHeader)
  doc.text(
    `${installment.city}, ${formatDateLong(installment.receiptDate)}.`,
    MARGIN,
    y,
  )

  applyPageChromeToAllPages(doc, drawHeader)

  return doc
}

export function downloadReceiptPdf(receipt: ActiveReceipt, filename?: string) {
  const doc = generateReceiptPdf(receipt)
  const name =
    filename ??
    `Recibo_Parcela_${receipt.installment.number}_${receipt.buyer.name.split(' ')[0]}.pdf`
  doc.save(name)
}
