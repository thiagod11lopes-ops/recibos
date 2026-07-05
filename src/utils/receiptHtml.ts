import type { ActiveReceipt } from '../types/receipt'
import {
  buildModernDocumentHeaderHtml,
  MODERN_HEADER_STYLES,
} from './documentHeaderContent'
import {
  formatCurrency,
  formatDateLong,
} from './formatters'
import { getReceiptBodyText } from './receiptContent'
import { buildSignatureHtml, SIGNATURE_STYLES } from './signatureContent'

export function buildReceiptHtml(receipt: ActiveReceipt): string {
  const { seller, buyer, property, installment } = receipt

  const headerHtml = buildModernDocumentHeaderHtml({
    title: 'RECIBO DE PAGAMENTO',
    subtitle: `${formatCurrency(installment.value)} · ${installment.city}`,
    badge: `Parcela ${installment.number}/${property.installmentCount}`,
    seller: { name: seller.name, cpf: seller.cpf },
    buyer: { name: buyer.name, cpf: buyer.cpf },
    property: {
      location: property.location,
      totalValue: formatCurrency(property.totalValue),
      installmentCount: property.installmentCount,
      installmentValue: formatCurrency(property.installmentValue),
    },
  })

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>Recibo de Pagamento - Parcela ${installment.number}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #f1f5f9; }
  .page { max-width: 920px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,0.12); }
  ${MODERN_HEADER_STYLES}
  .content { padding: 28px 32px 40px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #6366f1; margin: 0 0 10px; }
  .receipt-text { text-align: justify; font-size: 13px; line-height: 1.7; color: #334155; margin: 0; }
  .date-line { margin-top: 24px; font-size: 13px; color: #475569; }
  ${SIGNATURE_STYLES}
</style>
</head>
<body>
  <div class="page">
    ${headerHtml}
    <div class="content">
      <p class="section-title">Recebimento</p>
      <p class="receipt-text">${getReceiptBodyText(receipt)}</p>
      <p class="date-line">${installment.city}, ${formatDateLong(installment.receiptDate)}.</p>
      ${buildSignatureHtml()}
    </div>
  </div>
</body>
</html>`
}
