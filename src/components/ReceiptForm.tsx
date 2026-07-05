import type { ReceiptData } from '../types/receipt'
import { Card, Input, TextArea } from './ui'

interface ReceiptFormProps {
  data: ReceiptData
  onSellerChange: (field: 'name' | 'cpf', value: string) => void
  onBuyerChange: (field: 'name' | 'cpf', value: string) => void
  onPropertyChange: (
    field: keyof ReceiptData['property'],
    value: string | number,
  ) => void
}

export function ReceiptForm({
  data,
  onSellerChange,
  onBuyerChange,
  onPropertyChange,
}: ReceiptFormProps) {
  return (
    <div className="space-y-6">
      <Card title="Vendedor">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            value={data.seller.name}
            onChange={(e) => onSellerChange('name', e.target.value)}
            placeholder="Nome do vendedor"
          />
          <Input
            label="CPF"
            value={data.seller.cpf}
            onChange={(e) => onSellerChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
      </Card>

      <Card title="Comprador">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            value={data.buyer.name}
            onChange={(e) => onBuyerChange('name', e.target.value)}
            placeholder="Nome do comprador"
          />
          <Input
            label="CPF"
            value={data.buyer.cpf}
            onChange={(e) => onBuyerChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
      </Card>

      <Card title="Imóvel">
        <div className="space-y-4">
          <TextArea
            label="Localização"
            value={data.property.location}
            onChange={(e) => onPropertyChange('location', e.target.value)}
            placeholder="Endereço completo do imóvel"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Valor total (R$)"
              type="number"
              min={0}
              step={0.01}
              value={data.property.totalValue || ''}
              onChange={(e) =>
                onPropertyChange('totalValue', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Nº de parcelas"
              type="number"
              min={1}
              value={data.property.installmentCount || ''}
              onChange={(e) =>
                onPropertyChange(
                  'installmentCount',
                  parseInt(e.target.value, 10) || 0,
                )
              }
            />
            <Input
              label="Valor da parcela (R$)"
              type="number"
              min={0}
              step={0.01}
              value={data.property.installmentValue || ''}
              onChange={(e) =>
                onPropertyChange(
                  'installmentValue',
                  parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
