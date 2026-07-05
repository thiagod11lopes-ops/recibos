import type { Party, Property } from './receipt'
import type { InstallmentStatusRow } from '../utils/installmentStatus'

export interface ConsultaPermissions {
  sellerName: boolean
  sellerCpf: boolean
  buyerName: boolean
  buyerCpf: boolean
  property: boolean
  propertyFinancials: boolean
  paymentSummary: boolean
  progressBar: boolean
  paymentTableExport: boolean
  installmentTable: boolean
  showReference: boolean
  showDueDate: boolean
  showPaymentDate: boolean
  showValue: boolean
  showStatus: boolean
}

export interface ConsultaPublishedSummary {
  paidCount: number
  pendingCount: number
  paidTotalFormatted: string
  pendingTotalFormatted: string
}

export interface ConsultaPublishedData {
  publishedAt: string
  seller: Party
  buyer: Party
  property: Property
  rows: InstallmentStatusRow[]
  summary: ConsultaPublishedSummary
  totalCount: number
}

export const DEFAULT_CONSULTA_PERMISSIONS: ConsultaPermissions = {
  sellerName: true,
  sellerCpf: false,
  buyerName: true,
  buyerCpf: false,
  property: true,
  propertyFinancials: true,
  paymentSummary: true,
  progressBar: true,
  paymentTableExport: false,
  installmentTable: true,
  showReference: true,
  showDueDate: true,
  showPaymentDate: true,
  showValue: true,
  showStatus: true,
}

export const PERMISSION_GROUPS: {
  title: string
  description: string
  items: { key: keyof ConsultaPermissions; label: string }[]
}[] = [
  {
    title: 'Dados do contrato',
    description: 'Informações exibidas no topo da página de consulta.',
    items: [
      { key: 'sellerName', label: 'Nome do vendedor' },
      { key: 'sellerCpf', label: 'CPF do vendedor' },
      { key: 'buyerName', label: 'Nome do comprador' },
      { key: 'buyerCpf', label: 'CPF do comprador' },
      { key: 'property', label: 'Localização do imóvel' },
      { key: 'propertyFinancials', label: 'Valor total e parcelas' },
    ],
  },
  {
    title: 'Resumo de pagamento',
    description: 'Cards e indicadores de progresso.',
    items: [
      { key: 'paymentSummary', label: 'Totais pagos e pendentes' },
      { key: 'progressBar', label: 'Barra de progresso' },
      { key: 'paymentTableExport', label: 'Gerar Tabela de Pagamento' },
    ],
  },
  {
    title: 'Tabela de parcelas',
    description: 'Controle a tabela e as colunas visíveis na consulta.',
    items: [
      { key: 'installmentTable', label: 'Exibir tabela de parcelas' },
      { key: 'showReference', label: 'Coluna referência (mês/ano)' },
      { key: 'showDueDate', label: 'Coluna vencimento' },
      { key: 'showPaymentDate', label: 'Coluna data de pagamento' },
      { key: 'showValue', label: 'Coluna valor' },
      { key: 'showStatus', label: 'Coluna status' },
    ],
  },
]
