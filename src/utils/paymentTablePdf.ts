import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PaymentTableDocument } from './paymentTableContent'
import { PAYMENT_TABLE_FILENAME } from './paymentTableContent'
import { formatCurrency, formatDateBR } from './formatters'
import {
  computeModernHeaderHeight,
  drawPaymentTablePageHeader,
  drawSignatureFooter,
  getContentBottom,
  getContentTop,
  PDF_LAYOUT,
} from './pdfPageLayout'

const MARGIN = PDF_LAYOUT.margin
const PAGE_WIDTH = PDF_LAYOUT.pageWidth

function headerParties(data: PaymentTableDocument) {
  const { seller, buyer, property, summary } = data
  return {
    sellerName: seller.name,
    sellerCpf: seller.cpf,
    buyerName: buyer.name,
    buyerCpf: buyer.cpf,
    propertyLocation: property.location,
    totalValue: property.totalValue,
    installmentCount: property.installmentCount,
    installmentValue: property.installmentValue,
    paidTotalFormatted: summary.paidTotalFormatted,
    pendingTotalFormatted: summary.pendingTotalFormatted,
  }
}

function drawSummary(doc: jsPDF, data: PaymentTableDocument, startY: number, contentTop: number): number {
  let y = startY + 8
  const bottom = getContentBottom(doc)

  if (y + 12 > bottom) {
    doc.addPage()
    drawPaymentTablePageHeader(doc, data)
    drawSignatureFooter(doc)
    y = contentTop
  }

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(21, 128, 61)
  doc.text(
    `Parcelas pagas: ${data.summary.paidCount} — ${data.summary.paidTotalFormatted}`,
    MARGIN,
    y,
  )
  doc.setTextColor(180, 83, 9)
  doc.text(
    `Parcelas pendentes: ${data.summary.pendingCount} — ${data.summary.pendingTotalFormatted}`,
    PAGE_WIDTH / 2,
    y,
  )

  return y
}

export function generatePaymentTablePdf(data: PaymentTableDocument): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const headerHeight = computeModernHeaderHeight(pdf, headerParties(data))
  const contentTop = getContentTop(headerHeight)

  autoTable(pdf, {
    startY: contentTop,
    head: [['Parcela', 'Referência', 'Vencimento', 'Valor', 'Status']],
    body: data.rows.map((row) => [
      `${String(row.number).padStart(2, '0')} / ${row.totalInstallments}`,
      row.monthLabel,
      formatDateBR(row.dueDate),
      formatCurrency(row.value),
      row.status === 'pago' ? 'Pago' : 'Pendente',
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [67, 56, 202],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 24 },
    },
    didParseCell(cell) {
      if (cell.section === 'body' && cell.column.index === 4) {
        const isPaid = cell.cell.raw === 'Pago'
        cell.cell.styles.fillColor = isPaid ? [220, 252, 231] : [254, 243, 199]
        cell.cell.styles.textColor = isPaid ? [21, 128, 61] : [180, 83, 9]
        cell.cell.styles.fontStyle = 'bold'
      }
    },
    margin: {
      left: MARGIN,
      right: MARGIN,
      top: contentTop,
      bottom: PDF_LAYOUT.footerHeight + 6,
    },
    willDrawPage: () => {
      drawPaymentTablePageHeader(pdf, data)
    },
    didDrawPage: () => {
      drawSignatureFooter(pdf)
    },
  })

  const finalY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? contentTop

  drawSummary(pdf, data, finalY, contentTop)

  return pdf
}

export function downloadPaymentTablePdf(
  data: PaymentTableDocument,
  filename = PAYMENT_TABLE_FILENAME,
) {
  generatePaymentTablePdf(data).save(`${filename}.pdf`)
}
