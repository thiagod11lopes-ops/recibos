import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
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
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      title="Dados do contrato"
      action={
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/6 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10"
          aria-expanded={expanded}
        >
          {expanded ? 'Ocultar' : 'Expandir'}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              expanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      }
    >
      {!expanded ? (
        <p className="text-sm text-zinc-500">
          Vendedor, comprador e imóvel estão ocultos. Clique em Expandir para
          editar.
        </p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Vendedor
            </h3>
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
          </section>

          <section className="space-y-4 border-t border-white/6 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Comprador
            </h3>
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
          </section>

          <section className="space-y-4 border-t border-white/6 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Imóvel
            </h3>
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
                    onPropertyChange(
                      'totalValue',
                      parseFloat(e.target.value) || 0,
                    )
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
          </section>
        </div>
      )}
    </Card>
  )
}
