import { Download, Eye } from 'lucide-react'
import type { ActiveReceipt } from '../types/receipt'
import { ReceiptDocument } from './ReceiptDocument'
import { Button, Card } from './ui'

interface ReceiptPreviewProps {
  receipt: ActiveReceipt | null
  onDownload: () => void
}

export function ReceiptPreview({ receipt, onDownload }: ReceiptPreviewProps) {
  if (!receipt) {
    return (
      <Card title="Pré-visualização">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Eye className="mb-4 h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">
            Adicione uma parcela na tabela para visualizar o recibo.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title="Pré-visualização"
      action={
        <Button variant="primary" size="sm" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" />
          Baixar PDF
        </Button>
      }
    >
      <ReceiptDocument receipt={receipt} id="receipt-preview" />
    </Card>
  )
}
