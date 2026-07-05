import type { ReceiptData } from '../types/receipt'

export const defaultReceiptData: ReceiptData = {
  seller: {
    name: 'Thiago Lopes de Oliveira',
    cpf: '108.971.107-73',
  },
  buyer: {
    name: 'Leonardo da Silva Bezerra',
    cpf: '126.007.197-92',
  },
  property: {
    location:
      'Travessa Saturno, LT 30, QD 02\nVila São João, São João de Meriti, CEP: 25570-236',
    totalValue: 360000,
    installmentCount: 72,
    installmentValue: 5000,
  },
  installments: [],
}
