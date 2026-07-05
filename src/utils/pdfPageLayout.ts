import type { jsPDF } from 'jspdf'
import type { ActiveReceipt } from '../types/receipt'
import type { PaymentTableDocument } from './paymentTableContent'
import { formatCurrency, formatGenerationDate } from './formatters'

export const PDF_LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 14,
  titleBarHeight: 22,
  footerHeight: 28,
  contentGap: 6,
} as const

const M = PDF_LAYOUT.margin
const TITLE_H = PDF_LAYOUT.titleBarHeight
const GAP = 3
const CARD_GAP = 4

interface HeaderParties {
  sellerName: string
  sellerCpf: string
  buyerName: string
  buyerCpf: string
  propertyLocation: string
  totalValue: number
  installmentCount: number
  installmentValue: number
  paidTotalFormatted?: string
  pendingTotalFormatted?: string
}

export function getContentBottom(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight() - PDF_LAYOUT.footerHeight - 4
}

function measureLines(doc: jsPDF, text: string, maxWidth: number): number {
  return (doc.splitTextToSize(text, maxWidth) as string[]).length
}

function colWidth(doc: jsPDF): number {
  return (doc.internal.pageSize.getWidth() - M * 2 - CARD_GAP) / 2 - 6
}

function fullCardWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - M * 2
}

export function computeModernHeaderHeight(
  doc: jsPDF,
  parties: HeaderParties,
): number {
  const cardInner = colWidth(doc)
  const nameLines = Math.max(
    measureLines(doc, parties.sellerName, cardInner),
    measureLines(doc, parties.buyerName, cardInner),
  )
  const partyBlock = 24 + Math.max(0, nameLines - 1) * 3.6
  const propertyLines = measureLines(
    doc,
    parties.propertyLocation.replace(/\n/g, ', '),
    fullCardWidth(doc) - 10,
  )
  const propertyBlock = 24 + Math.max(0, propertyLines - 1) * 3.6
  const metricsBlock = 12
  const panelPadding = 8

  return (
    TITLE_H +
    panelPadding +
    partyBlock +
    GAP +
    propertyBlock +
    GAP +
    metricsBlock +
    panelPadding +
    PDF_LAYOUT.contentGap
  )
}

export function computeHeaderHeight(doc: jsPDF, infoLines: string[]): number {
  void infoLines
  return computeModernHeaderHeight(doc, {
    sellerName: 'Nome do Vendedor Exemplo',
    sellerCpf: '000.000.000-00',
    buyerName: 'Nome do Comprador Exemplo',
    buyerCpf: '000.000.000-00',
    propertyLocation: 'Endereço completo do imóvel vendido',
    totalValue: 360000,
    installmentCount: 72,
    installmentValue: 5000,
  })
}

export function getContentTop(headerHeight: number): number {
  return headerHeight
}

export function drawSignatureFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerTop = pageHeight - PDF_LAYOUT.footerHeight

  const lineY = footerTop + 6
  doc.setDrawColor(51, 65, 85)
  doc.setLineWidth(0.35)
  doc.line(pageWidth / 2 - 42, lineY, pageWidth / 2 + 42, lineY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Assinatura do Vendedor', pageWidth / 2, lineY + 5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text(formatGenerationDate(), pageWidth / 2, lineY + 10, { align: 'center' })
}

function drawTitleBar(
  doc: jsPDF,
  title: string,
  subtitle: string,
  badge?: string,
): void {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(30, 27, 75)
  doc.rect(0, 0, pageWidth, TITLE_H, 'F')
  doc.setFillColor(79, 70, 229)
  doc.rect(pageWidth * 0.55, 0, pageWidth * 0.45, TITLE_H, 'F')

  doc.setFillColor(255, 255, 255)
  doc.circle(pageWidth - 18, 6, 12, 'F')
  doc.setFillColor(30, 27, 75)
  doc.circle(pageWidth - 18, 6, 8, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(title, M, 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(224, 231, 255)
  doc.text(subtitle, M, 15.5)

  if (badge) {
    const badgeW = doc.getTextWidth(badge) + 10
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(pageWidth - M - badgeW, 7, badgeW, 7, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(67, 56, 202)
    doc.text(badge, pageWidth - M - badgeW / 2, 11.5, { align: 'center' })
  }
}

function drawInfoCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  role: string,
  primaryText: string,
  secondaryText: string,
  accent: [number, number, number],
  roleBg: [number, number, number],
  roleText: [number, number, number],
): number {
  const primaryLines = doc.splitTextToSize(primaryText, width - 10) as string[]
  const visibleLines = primaryLines.slice(0, 3)
  const cardH = 11 + visibleLines.length * 3.5 + 5

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.25)
  doc.roundedRect(x, y, width, cardH, 2.5, 2.5, 'FD')

  doc.setFillColor(...accent)
  doc.rect(x, y + 4, 1.5, cardH - 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  const roleW = doc.getTextWidth(role) + 6
  doc.setFillColor(...roleBg)
  doc.roundedRect(x + 5, y + 3.5, roleW, 5, 1.5, 1.5, 'F')
  doc.setTextColor(...roleText)
  doc.text(role, x + 8, y + 6.8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  visibleLines.forEach((line, i) => {
    doc.text(line, x + 5, y + 12 + i * 3.5)
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text(secondaryText, x + 5, y + cardH - 3.5)

  return cardH
}

function drawPartyCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  role: string,
  name: string,
  cpf: string,
  accent: [number, number, number],
  roleBg: [number, number, number],
  roleText: [number, number, number],
): number {
  return drawInfoCard(
    doc,
    x,
    y,
    width,
    role,
    name,
    `CPF ${cpf}`,
    accent,
    roleBg,
    roleText,
  )
}

function drawMetricPill(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  fill: [number, number, number],
  textColor: [number, number, number],
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  const w = doc.getTextWidth(text) + 10
  doc.setFillColor(...fill)
  doc.setDrawColor(fill[0] - 15, fill[1] - 15, fill[2] - 5)
  doc.setLineWidth(0.2)
  doc.roundedRect(x, y, w, 7, 2, 2, 'FD')
  doc.setTextColor(...textColor)
  doc.text(text, x + 5, y + 4.8)
  return w + 4
}

function drawModernInfoPanel(
  doc: jsPDF,
  parties: HeaderParties,
  badge?: string,
): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const panelTop = TITLE_H
  const headerHeight = computeModernHeaderHeight(doc, parties)

  doc.setFillColor(248, 250, 252)
  doc.rect(0, panelTop, pageWidth, headerHeight - TITLE_H - PDF_LAYOUT.contentGap, 'F')

  const cardW = (pageWidth - M * 2 - CARD_GAP) / 2
  let y = panelTop + 5

  const cardH = drawPartyCard(
    doc,
    M,
    y,
    cardW,
    'VENDEDOR',
    parties.sellerName,
    parties.sellerCpf,
    [99, 102, 241],
    [238, 242, 255],
    [67, 56, 202],
  )
  drawPartyCard(
    doc,
    M + cardW + CARD_GAP,
    y,
    cardW,
    'COMPRADOR',
    parties.buyerName,
    parties.buyerCpf,
    [139, 92, 246],
    [245, 243, 255],
    [109, 40, 217],
  )
  y += cardH + GAP

  const propertyCardH = drawInfoCard(
    doc,
    M,
    y,
    fullCardWidth(doc),
    'IMÓVEL',
    parties.propertyLocation.replace(/\n/g, ', '),
    `Valor total · ${formatCurrency(parties.totalValue)}`,
    [20, 184, 166],
    [236, 253, 245],
    [15, 118, 110],
  )
  y += propertyCardH + GAP

  let pillX = M
  pillX += drawMetricPill(
    doc,
    pillX,
    y,
    `${parties.installmentCount} parcelas · ${formatCurrency(parties.installmentValue)}`,
    [245, 243, 255],
    [91, 33, 182],
  )

  if (parties.paidTotalFormatted && parties.pendingTotalFormatted) {
    pillX += drawMetricPill(
      doc,
      pillX,
      y,
      `Pago · ${parties.paidTotalFormatted}`,
      [220, 252, 231],
      [21, 128, 61],
    )
    drawMetricPill(
      doc,
      pillX,
      y,
      `Pendente · ${parties.pendingTotalFormatted}`,
      [254, 243, 199],
      [180, 83, 9],
    )
  }

  void badge
  return headerHeight
}

function partiesFromReceipt(receipt: ActiveReceipt): HeaderParties {
  const { seller, buyer, property } = receipt
  return {
    sellerName: seller.name,
    sellerCpf: seller.cpf,
    buyerName: buyer.name,
    buyerCpf: buyer.cpf,
    propertyLocation: property.location,
    totalValue: property.totalValue,
    installmentCount: property.installmentCount,
    installmentValue: property.installmentValue,
  }
}

function partiesFromPaymentTable(data: PaymentTableDocument): HeaderParties {
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

export function drawReceiptPageHeader(doc: jsPDF, receipt: ActiveReceipt): number {
  const parties = partiesFromReceipt(receipt)
  const badge = `Parcela ${receipt.installment.number}/${receipt.property.installmentCount}`

  drawTitleBar(
    doc,
    'RECIBO DE PAGAMENTO',
    `${formatCurrency(receipt.installment.value)} · ${receipt.installment.city}`,
    badge,
  )
  return drawModernInfoPanel(doc, parties, badge)
}

export function drawPaymentTablePageHeader(
  doc: jsPDF,
  data: PaymentTableDocument,
): number {
  const parties = partiesFromPaymentTable(data)

  drawTitleBar(
    doc,
    'TABELA DE PAGAMENTO',
    `Contrato de compra e venda · ${parties.installmentCount} parcelas`,
  )
  return drawModernInfoPanel(doc, parties)
}

export function applyPageChromeToAllPages(
  doc: jsPDF,
  drawHeader: (doc: jsPDF) => number,
): void {
  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawHeader(doc)
    drawSignatureFooter(doc)
  }
}

export function setupPdfPage(
  doc: jsPDF,
  drawHeader: (doc: jsPDF) => number,
): number {
  const headerHeight = drawHeader(doc)
  drawSignatureFooter(doc)
  return getContentTop(headerHeight)
}

export function addPdfPage(
  doc: jsPDF,
  drawHeader: (doc: jsPDF) => number,
): number {
  doc.addPage()
  return setupPdfPage(doc, drawHeader)
}

export function ensureVerticalSpace(
  doc: jsPDF,
  currentY: number,
  requiredHeight: number,
  drawHeader: (doc: jsPDF) => number,
): number {
  if (currentY + requiredHeight <= getContentBottom(doc)) {
    return currentY
  }
  return addPdfPage(doc, drawHeader)
}

export function getDefaultHeaderHeight(doc: jsPDF): number {
  return computeModernHeaderHeight(doc, {
    sellerName: 'Nome do Vendedor',
    sellerCpf: '000.000.000-00',
    buyerName: 'Nome do Comprador',
    buyerCpf: '000.000.000-00',
    propertyLocation: 'Endereço do imóvel',
    totalValue: 360000,
    installmentCount: 72,
    installmentValue: 5000,
  })
}
