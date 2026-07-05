import type { ActiveReceipt } from '../types/receipt'
import {
  formatCurrency,
  formatDateBR,
  formatDateLong,
  formatGenerationDate,
} from '../utils/formatters'
import { getReceiptBodyText } from '../utils/receiptContent'

interface ReceiptDocumentProps {
  receipt: ActiveReceipt
  className?: string
  id?: string
}

export function ReceiptDocument({ receipt, className = '', id }: ReceiptDocumentProps) {
  const { seller, buyer, property, installment } = receipt

  return (
    <article
      id={id}
      className={`mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-2xl shadow-black/20 ${className}`}
    >
      <h3 className="mb-8 text-center font-serif text-xl font-normal tracking-wide">
        RECIBO DE PAGAMENTO
      </h3>

      <div className="space-y-5 text-sm leading-relaxed">
        <div>
          <p>
            <strong>Vendedor:</strong> {seller.name}
          </p>
          <p>
            <strong>CPF:</strong> {seller.cpf}
          </p>
        </div>

        <div>
          <p>
            <strong>Comprador:</strong> {buyer.name}
          </p>
          <p>
            <strong>CPF:</strong> {buyer.cpf}
          </p>
        </div>

        <div>
          <p>
            <strong>Imóvel:</strong>
          </p>
          <p>
            <strong>Localização:</strong>{' '}
            {property.location.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <p className="mt-2">
            <strong>Valor Total do Imóvel:</strong>{' '}
            {formatCurrency(property.totalValue)}
          </p>
          <p>
            <strong>Forma de Pagamento:</strong>{' '}
            {property.installmentCount} parcelas de{' '}
            {formatCurrency(property.installmentValue)}
          </p>
        </div>

        <div>
          <p>
            <strong>Recebimento:</strong>
          </p>
          <p className="mt-2 text-justify">{getReceiptBodyText(receipt)}</p>
        </div>

        <p className="pt-4">
          {installment.city}, {formatDateLong(installment.receiptDate)}.
        </p>

        <div className="pt-8 text-center">
          <div className="mx-auto mb-3 w-48 border-t border-zinc-400" />
          <p className="font-semibold">Assinatura do Vendedor</p>
          <p className="mt-1.5 text-sm text-zinc-600">{formatGenerationDate()}</p>
        </div>
      </div>
    </article>
  )
}

export function ReceiptDocumentMeta({ receipt }: { receipt: ActiveReceipt }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
      <span>
        Parcela {receipt.installment.number}/{receipt.property.installmentCount}
      </span>
      <span>{formatCurrency(receipt.installment.value)}</span>
      <span>Pagamento: {formatDateBR(receipt.installment.paymentDate)}</span>
    </div>
  )
}
