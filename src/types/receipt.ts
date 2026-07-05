export interface Party {
  name: string
  cpf: string
}

export interface Property {
  location: string
  totalValue: number
  installmentCount: number
  installmentValue: number
}

export interface Installment {
  id: string
  number: number
  value: number
  paymentDate: string
  receiptDate: string
  city: string
  generated: boolean
}

export interface ReceiptData {
  seller: Party
  buyer: Party
  property: Property
  installments: Installment[]
}

export interface ActiveReceipt {
  installment: Installment
  seller: Party
  buyer: Party
  property: Property
}
