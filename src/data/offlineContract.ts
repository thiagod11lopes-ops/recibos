import type { ContractDocument } from './types'

/** Copia do backup do Supabase (16/09/2026), usada quando o projeto nao responde. */
export const offlineContractDocument = {
  "seller": {
    "cpf": "108.971.107-73",
    "name": "Thiago Lopes de Oliveira"
  },
  "buyer": {
    "cpf": "126.007.197-92",
    "name": "Leonardo da Silva Bezerra"
  },
  "property": {
    "location": "Travessa Saturno, LT 30, QD 02\nVila São João, São João de Meriti, CEP: 25570-236",
    "totalValue": 360000,
    "installmentCount": 72,
    "installmentValue": 5000
  },
  "paidNumbers": [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    14,
    15,
    16,
    17,
    18,
    13,
    19
  ],
  "paymentDates": {
    "1": "2025-01-15",
    "2": "2025-02-15",
    "3": "2025-03-15",
    "4": "2025-04-15",
    "5": "2025-05-15",
    "6": "2025-06-15",
    "7": "2025-07-15",
    "8": "2025-08-15",
    "9": "2025-09-15",
    "10": "2025-10-15",
    "11": "2025-11-15",
    "12": "2025-12-15",
    "13": "2026-01-15",
    "14": "2026-02-15",
    "15": "2026-03-15",
    "16": "2026-04-15",
    "17": "2026-05-15",
    "18": "2026-06-15",
    "19": "2026-08-15"
  },
  "receiptPdfs": {
    "1": {
      "fileName": "RECIBO_DE_JANEIRO_assinado.pdf",
      "uploadedAt": "2026-08-15T15:25:07.757Z",
      "storagePath": "default/1.pdf"
    },
    "2": {
      "fileName": "RECIBO_DE_FEVEREIRO_assinado.pdf",
      "uploadedAt": "2026-08-15T15:26:59.942Z",
      "storagePath": "default/2.pdf"
    },
    "3": {
      "fileName": "RECIBO_DE_MARCO_assinado.pdf",
      "uploadedAt": "2026-08-15T15:26:16.098Z",
      "storagePath": "default/3.pdf"
    },
    "4": {
      "fileName": "Abril_assinado.pdf",
      "uploadedAt": "2026-08-15T15:28:15.051Z",
      "storagePath": "default/4.pdf"
    },
    "5": {
      "fileName": "Maio_assinado.pdf",
      "uploadedAt": "2026-08-15T15:28:55.501Z",
      "storagePath": "default/5.pdf"
    },
    "6": {
      "fileName": "Junho_assinado.pdf",
      "uploadedAt": "2026-08-15T15:29:34.151Z",
      "storagePath": "default/6.pdf"
    },
    "7": {
      "fileName": "Julho_assinado.pdf",
      "uploadedAt": "2026-08-15T15:30:03.592Z",
      "storagePath": "default/7.pdf"
    },
    "8": {
      "fileName": "Agosto_assinado.pdf",
      "uploadedAt": "2026-08-15T15:30:28.204Z",
      "storagePath": "default/8.pdf"
    },
    "9": {
      "fileName": "Setembro_assinado.pdf",
      "uploadedAt": "2026-08-15T15:30:55.034Z",
      "storagePath": "default/9.pdf"
    },
    "10": {
      "fileName": "Outubro_assinado.pdf",
      "uploadedAt": "2026-08-15T15:31:35.222Z",
      "storagePath": "default/10.pdf"
    },
    "11": {
      "fileName": "Novembro_assinado.pdf",
      "uploadedAt": "2026-08-15T15:31:51.268Z",
      "storagePath": "default/11.pdf"
    },
    "12": {
      "fileName": "Recibo_Parcela_12_Leonardo_%281%29_assinado.pdf",
      "uploadedAt": "2026-08-15T17:17:42.746Z",
      "storagePath": "default/12.pdf"
    },
    "13": {
      "fileName": "Recibo_Parcela_13_Leonardo_assinado.pdf",
      "uploadedAt": "2026-08-15T17:17:49.524Z",
      "storagePath": "default/13.pdf"
    },
    "14": {
      "fileName": "Marco_26_assinado.pdf",
      "uploadedAt": "2026-08-15T15:34:32.759Z",
      "storagePath": "default/14.pdf"
    },
    "15": {
      "fileName": "Abril_26_assinado.pdf",
      "uploadedAt": "2026-08-15T15:33:10.711Z",
      "storagePath": "default/15.pdf"
    },
    "16": {
      "fileName": "Recibo_Parcela_16_Leonardo_assinado.pdf",
      "uploadedAt": "2026-08-15T17:17:54.605Z",
      "storagePath": "default/16.pdf"
    },
    "17": {
      "fileName": "Recibo_Parcela_17_Leonardo_%281%29_assinado.pdf",
      "uploadedAt": "2026-08-15T17:17:58.539Z",
      "storagePath": "default/17.pdf"
    },
    "18": {
      "fileName": "Recibo_Parcela_18_Leonardo_%283%29_assinado.pdf",
      "uploadedAt": "2026-08-15T17:18:02.658Z",
      "storagePath": "default/18.pdf"
    },
    "19": {
      "fileName": "Recibo_Parcela_19_Leonardo_assinado.pdf",
      "uploadedAt": "2026-08-15T14:43:14.432Z",
      "storagePath": "default/19.pdf"
    }
  },
  "consultaPermissions": {
    "buyerCpf": false,
    "property": true,
    "buyerName": true,
    "sellerCpf": false,
    "showValue": true,
    "sellerName": true,
    "showStatus": true,
    "progressBar": true,
    "showDueDate": true,
    "showReference": true,
    "paymentSummary": true,
    "showPdfActions": true,
    "showPaymentDate": true,
    "installmentTable": true,
    "paymentTableExport": false,
    "propertyFinancials": true
  },
  "publishedConsulta": {
    "rows": [
      {
        "value": 5000,
        "number": 1,
        "status": "pago",
        "dueDate": "2025-01-15",
        "monthLabel": "Janeiro 2025",
        "paymentDate": "2025-01-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 2,
        "status": "pago",
        "dueDate": "2025-02-15",
        "monthLabel": "Fevereiro 2025",
        "paymentDate": "2025-02-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 3,
        "status": "pago",
        "dueDate": "2025-03-15",
        "monthLabel": "Março 2025",
        "paymentDate": "2025-03-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 4,
        "status": "pago",
        "dueDate": "2025-04-15",
        "monthLabel": "Abril 2025",
        "paymentDate": "2025-04-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 5,
        "status": "pago",
        "dueDate": "2025-05-15",
        "monthLabel": "Maio 2025",
        "paymentDate": "2025-05-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 6,
        "status": "pago",
        "dueDate": "2025-06-15",
        "monthLabel": "Junho 2025",
        "paymentDate": "2025-06-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 7,
        "status": "pago",
        "dueDate": "2025-07-15",
        "monthLabel": "Julho 2025",
        "paymentDate": "2025-07-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 8,
        "status": "pago",
        "dueDate": "2025-08-15",
        "monthLabel": "Agosto 2025",
        "paymentDate": "2025-08-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 9,
        "status": "pago",
        "dueDate": "2025-09-15",
        "monthLabel": "Setembro 2025",
        "paymentDate": "2025-09-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 10,
        "status": "pago",
        "dueDate": "2025-10-15",
        "monthLabel": "Outubro 2025",
        "paymentDate": "2025-10-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 11,
        "status": "pago",
        "dueDate": "2025-11-15",
        "monthLabel": "Novembro 2025",
        "paymentDate": "2025-11-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 12,
        "status": "pago",
        "dueDate": "2025-12-15",
        "monthLabel": "Dezembro 2025",
        "paymentDate": "2025-12-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 13,
        "status": "pago",
        "dueDate": "2026-01-15",
        "monthLabel": "Janeiro 2026",
        "paymentDate": "2026-01-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 14,
        "status": "pago",
        "dueDate": "2026-02-15",
        "monthLabel": "Fevereiro 2026",
        "paymentDate": "2026-02-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 15,
        "status": "pago",
        "dueDate": "2026-03-15",
        "monthLabel": "Março 2026",
        "paymentDate": "2026-03-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 16,
        "status": "pago",
        "dueDate": "2026-04-15",
        "monthLabel": "Abril 2026",
        "paymentDate": "2026-04-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 17,
        "status": "pago",
        "dueDate": "2026-05-15",
        "monthLabel": "Maio 2026",
        "paymentDate": "2026-05-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 18,
        "status": "pago",
        "dueDate": "2026-06-15",
        "monthLabel": "Junho 2026",
        "paymentDate": "2026-06-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 19,
        "status": "pago",
        "dueDate": "2026-07-15",
        "monthLabel": "Julho 2026",
        "paymentDate": "2026-08-15",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 20,
        "status": "pendente",
        "dueDate": "2026-08-15",
        "monthLabel": "Agosto 2026",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 21,
        "status": "pendente",
        "dueDate": "2026-09-15",
        "monthLabel": "Setembro 2026",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 22,
        "status": "pendente",
        "dueDate": "2026-10-15",
        "monthLabel": "Outubro 2026",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 23,
        "status": "pendente",
        "dueDate": "2026-11-15",
        "monthLabel": "Novembro 2026",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 24,
        "status": "pendente",
        "dueDate": "2026-12-15",
        "monthLabel": "Dezembro 2026",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 25,
        "status": "pendente",
        "dueDate": "2027-01-15",
        "monthLabel": "Janeiro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 26,
        "status": "pendente",
        "dueDate": "2027-02-15",
        "monthLabel": "Fevereiro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 27,
        "status": "pendente",
        "dueDate": "2027-03-15",
        "monthLabel": "Março 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 28,
        "status": "pendente",
        "dueDate": "2027-04-15",
        "monthLabel": "Abril 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 29,
        "status": "pendente",
        "dueDate": "2027-05-15",
        "monthLabel": "Maio 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 30,
        "status": "pendente",
        "dueDate": "2027-06-15",
        "monthLabel": "Junho 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 31,
        "status": "pendente",
        "dueDate": "2027-07-15",
        "monthLabel": "Julho 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 32,
        "status": "pendente",
        "dueDate": "2027-08-15",
        "monthLabel": "Agosto 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 33,
        "status": "pendente",
        "dueDate": "2027-09-15",
        "monthLabel": "Setembro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 34,
        "status": "pendente",
        "dueDate": "2027-10-15",
        "monthLabel": "Outubro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 35,
        "status": "pendente",
        "dueDate": "2027-11-15",
        "monthLabel": "Novembro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 36,
        "status": "pendente",
        "dueDate": "2027-12-15",
        "monthLabel": "Dezembro 2027",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 37,
        "status": "pendente",
        "dueDate": "2028-01-15",
        "monthLabel": "Janeiro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 38,
        "status": "pendente",
        "dueDate": "2028-02-15",
        "monthLabel": "Fevereiro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 39,
        "status": "pendente",
        "dueDate": "2028-03-15",
        "monthLabel": "Março 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 40,
        "status": "pendente",
        "dueDate": "2028-04-15",
        "monthLabel": "Abril 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 41,
        "status": "pendente",
        "dueDate": "2028-05-15",
        "monthLabel": "Maio 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 42,
        "status": "pendente",
        "dueDate": "2028-06-15",
        "monthLabel": "Junho 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 43,
        "status": "pendente",
        "dueDate": "2028-07-15",
        "monthLabel": "Julho 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 44,
        "status": "pendente",
        "dueDate": "2028-08-15",
        "monthLabel": "Agosto 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 45,
        "status": "pendente",
        "dueDate": "2028-09-15",
        "monthLabel": "Setembro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 46,
        "status": "pendente",
        "dueDate": "2028-10-15",
        "monthLabel": "Outubro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 47,
        "status": "pendente",
        "dueDate": "2028-11-15",
        "monthLabel": "Novembro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 48,
        "status": "pendente",
        "dueDate": "2028-12-15",
        "monthLabel": "Dezembro 2028",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 49,
        "status": "pendente",
        "dueDate": "2029-01-15",
        "monthLabel": "Janeiro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 50,
        "status": "pendente",
        "dueDate": "2029-02-15",
        "monthLabel": "Fevereiro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 51,
        "status": "pendente",
        "dueDate": "2029-03-15",
        "monthLabel": "Março 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 52,
        "status": "pendente",
        "dueDate": "2029-04-15",
        "monthLabel": "Abril 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 53,
        "status": "pendente",
        "dueDate": "2029-05-15",
        "monthLabel": "Maio 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 54,
        "status": "pendente",
        "dueDate": "2029-06-15",
        "monthLabel": "Junho 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 55,
        "status": "pendente",
        "dueDate": "2029-07-15",
        "monthLabel": "Julho 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 56,
        "status": "pendente",
        "dueDate": "2029-08-15",
        "monthLabel": "Agosto 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 57,
        "status": "pendente",
        "dueDate": "2029-09-15",
        "monthLabel": "Setembro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 58,
        "status": "pendente",
        "dueDate": "2029-10-15",
        "monthLabel": "Outubro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 59,
        "status": "pendente",
        "dueDate": "2029-11-15",
        "monthLabel": "Novembro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 60,
        "status": "pendente",
        "dueDate": "2029-12-15",
        "monthLabel": "Dezembro 2029",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 61,
        "status": "pendente",
        "dueDate": "2030-01-15",
        "monthLabel": "Janeiro 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 62,
        "status": "pendente",
        "dueDate": "2030-02-15",
        "monthLabel": "Fevereiro 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 63,
        "status": "pendente",
        "dueDate": "2030-03-15",
        "monthLabel": "Março 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 64,
        "status": "pendente",
        "dueDate": "2030-04-15",
        "monthLabel": "Abril 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 65,
        "status": "pendente",
        "dueDate": "2030-05-15",
        "monthLabel": "Maio 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 66,
        "status": "pendente",
        "dueDate": "2030-06-15",
        "monthLabel": "Junho 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 67,
        "status": "pendente",
        "dueDate": "2030-07-15",
        "monthLabel": "Julho 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 68,
        "status": "pendente",
        "dueDate": "2030-08-15",
        "monthLabel": "Agosto 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 69,
        "status": "pendente",
        "dueDate": "2030-09-15",
        "monthLabel": "Setembro 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 70,
        "status": "pendente",
        "dueDate": "2030-10-15",
        "monthLabel": "Outubro 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 71,
        "status": "pendente",
        "dueDate": "2030-11-15",
        "monthLabel": "Novembro 2030",
        "totalInstallments": 72
      },
      {
        "value": 5000,
        "number": 72,
        "status": "pendente",
        "dueDate": "2030-12-15",
        "monthLabel": "Dezembro 2030",
        "totalInstallments": 72
      }
    ],
    "buyer": {
      "cpf": "126.007.197-92",
      "name": "Leonardo da Silva Bezerra"
    },
    "seller": {
      "cpf": "108.971.107-73",
      "name": "Thiago Lopes de Oliveira"
    },
    "summary": {
      "paidCount": 19,
      "pendingCount": 53,
      "paidTotalFormatted": "R$ 95.000,00",
      "pendingTotalFormatted": "R$ 265.000,00"
    },
    "property": {
      "location": "Travessa Saturno, LT 30, QD 02\\nVila São João, São João de Meriti, CEP: 25570-236",
      "totalValue": 360000,
      "installmentCount": 72,
      "installmentValue": 5000
    },
    "totalCount": 72,
    "publishedAt": "2026-08-15T14:58:25.331Z",
    "receiptPdfs": {
      "19": {
        "fileName": "Recibo_Parcela_19_Leonardo_assinado.pdf",
        "uploadedAt": "2026-08-15T14:43:14.432Z",
        "storagePath": "default/19.pdf"
      }
    }
  },
  "updatedAt": "2026-08-15T17:18:41.583+00:00"
} as ContractDocument
