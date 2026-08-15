import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import type { Party, Property } from '../types/receipt'
import type { ReceiptPdfsMap } from '../types/receiptPdf'

export interface ContractDocument {
  seller: Party
  buyer: Party
  property: Property
  paidNumbers: number[]
  paymentDates: Record<string, string>
  receiptPdfs: ReceiptPdfsMap
  consultaPermissions: ConsultaPermissions
  publishedConsulta: ConsultaPublishedData | null
  updatedAt: string | null
}

export type ContractPatch = Partial<Omit<ContractDocument, 'updatedAt'>>
