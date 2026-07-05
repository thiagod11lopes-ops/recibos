export const MODERN_HEADER_STYLES = `
  .doc-header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%); color: #fff; padding: 28px 32px 24px; position: relative; overflow: hidden; }
  .doc-header::after { content: ''; position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: rgba(255,255,255,0.08); border-radius: 50%; }
  .doc-header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; }
  .doc-header .subtitle { margin: 8px 0 0; font-size: 12px; opacity: 0.88; }
  .doc-header .badge { display: inline-block; margin-top: 12px; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
  .doc-panel { padding: 20px 24px 22px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-bottom: 1px solid #e2e8f0; }
  .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .party-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 16px 14px 18px; position: relative; box-shadow: 0 4px 16px rgba(15,23,42,0.04); }
  .party-card::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 4px; border-radius: 0 4px 4px 0; }
  .party-card.seller::before { background: linear-gradient(180deg, #6366f1, #818cf8); }
  .party-card.buyer::before { background: linear-gradient(180deg, #8b5cf6, #a78bfa); }
  .party-card.property { grid-column: 1 / -1; }
  .party-card.property::before { background: linear-gradient(180deg, #14b8a6, #2dd4bf); }
  .party-card .role { display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; margin-bottom: 10px; }
  .party-card.seller .role { background: #eef2ff; color: #4338ca; }
  .party-card.buyer .role { background: #f5f3ff; color: #6d28d9; }
  .party-card.property .role { background: #ecfdf5; color: #0f766e; }
  .party-card .name { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px; line-height: 1.35; }
  .party-card .cpf { font-size: 11px; color: #64748b; margin: 0; font-variant-numeric: tabular-nums; }
  .metrics { display: flex; flex-wrap: wrap; gap: 10px; }
  .metric-pill { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .metric-pill.total { background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #3730a3; border: 1px solid #c7d2fe; }
  .metric-pill.installment { background: linear-gradient(135deg, #f5f3ff, #ede9fe); color: #5b21b6; border: 1px solid #ddd6fe; }
  .metric-pill.paid { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #15803d; border: 1px solid #bbf7d0; }
  .metric-pill.pending { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #b45309; border: 1px solid #fde68a; }
`

export interface DocumentHeaderData {
  title: string
  subtitle: string
  badge?: string
  seller: { name: string; cpf: string }
  buyer: { name: string; cpf: string }
  property: {
    location: string
    totalValue: string
    installmentCount: number
    installmentValue: string
  }
  paymentSummary?: {
    paidTotal: string
    pendingTotal: string
  }
}

export function buildModernDocumentHeaderHtml(data: DocumentHeaderData): string {
  const locationHtml = data.property.location.split('\n').join(', ')

  const summaryPills = data.paymentSummary
    ? `
          <span class="metric-pill paid">Pago · ${data.paymentSummary.paidTotal}</span>
          <span class="metric-pill pending">Pendente · ${data.paymentSummary.pendingTotal}</span>
        `
    : ''

  return `
    <div class="doc-header">
      <h1>${data.title}</h1>
      <p class="subtitle">${data.subtitle}</p>
      ${data.badge ? `<span class="badge">${data.badge}</span>` : ''}
    </div>
    <div class="doc-panel">
      <div class="party-grid">
        <div class="party-card seller">
          <span class="role">Vendedor</span>
          <p class="name">${data.seller.name}</p>
          <p class="cpf">CPF ${data.seller.cpf}</p>
        </div>
        <div class="party-card buyer">
          <span class="role">Comprador</span>
          <p class="name">${data.buyer.name}</p>
          <p class="cpf">CPF ${data.buyer.cpf}</p>
        </div>
        <div class="party-card property">
          <span class="role">Imóvel</span>
          <p class="name">${locationHtml}</p>
          <p class="cpf">Valor total · ${data.property.totalValue}</p>
        </div>
      </div>
      <div class="metrics">
        <span class="metric-pill installment">${data.property.installmentCount} parcelas · ${data.property.installmentValue}</span>
        ${summaryPills}
      </div>
    </div>
  `
}
