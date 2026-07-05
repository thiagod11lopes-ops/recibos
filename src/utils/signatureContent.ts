import { formatGenerationDate } from './formatters'

export const SIGNATURE_STYLES = `
  .signature { margin-top: 48px; text-align: center; }
  .signature-line { margin: 0 auto; width: 280px; border-top: 2px solid #334155; }
  .signature .label { font-weight: 700; font-size: 13px; margin: 8px 0 0; color: #0f172a; }
  .signature .date { font-size: 12px; margin: 6px 0 0; color: #475569; font-weight: 400; }
`

export function buildSignatureHtml(): string {
  return `
      <div class="signature">
        <div class="signature-line"></div>
        <p class="label">Assinatura do Vendedor</p>
        <p class="date">${formatGenerationDate()}</p>
      </div>`
}
