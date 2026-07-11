import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import type { Party, Property } from '../types/receipt'

export interface ContractDocument {
  seller: Party
  buyer: Party
  property: Property
  paidNumbers: number[]
  paymentDates: Record<string, string>
  consultaPermissions: ConsultaPermissions
  publishedConsulta: ConsultaPublishedData | null
  updatedAt: string | null
}

export type ContractPatch = Partial<Omit<ContractDocument, 'updatedAt'>>

/** Linha da tabela `contracts` no Postgres/Supabase */
export interface ContractRow {
  id: string
  seller: Party
  buyer: Party
  property: Property
  paid_numbers: number[]
  payment_dates: Record<string, string>
  consulta_permissions: ConsultaPermissions
  published_consulta: ConsultaPublishedData | null
  updated_at: string | null
}
