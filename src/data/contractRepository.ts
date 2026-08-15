import { defaultReceiptData } from './defaultReceipt'
import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import { mergeHistoricalPaymentDates } from '../utils/installmentStatus'
import { INITIAL_PAID_NUMBERS, LOCAL_STORAGE_KEY } from './constants'
import type { ContractDocument } from './types'

const LEGACY_PERMISSIONS_KEY = 'recibos-consulta-permissions'
const LEGACY_PUBLISHED_KEY = 'recibos-consulta-published'

function loadLegacyPublished() {
  try {
    const raw = localStorage.getItem(LEGACY_PUBLISHED_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadLegacyPermissions() {
  try {
    const raw = localStorage.getItem(LEGACY_PERMISSIONS_KEY)
    if (!raw) return { ...DEFAULT_CONSULTA_PERMISSIONS }
    return { ...DEFAULT_CONSULTA_PERMISSIONS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONSULTA_PERMISSIONS }
  }
}

export function createDefaultContractDocument(): ContractDocument {
  const { seller, buyer, property } = defaultReceiptData
  return {
    seller,
    buyer,
    property,
    paidNumbers: [...INITIAL_PAID_NUMBERS],
    paymentDates: mergeHistoricalPaymentDates(),
    receiptPdfs: {},
    consultaPermissions: loadLegacyPermissions(),
    publishedConsulta: loadLegacyPublished(),
    updatedAt: null,
  }
}

function normalizeContractDocument(
  data: Partial<ContractDocument>,
): ContractDocument {
  const defaults = createDefaultContractDocument()
  return {
    seller: { ...defaults.seller, ...data.seller },
    buyer: { ...defaults.buyer, ...data.buyer },
    property: { ...defaults.property, ...data.property },
    paidNumbers: Array.isArray(data.paidNumbers)
      ? data.paidNumbers
      : defaults.paidNumbers,
    paymentDates: mergeHistoricalPaymentDates(data.paymentDates ?? {}),
    receiptPdfs: data.receiptPdfs ?? defaults.receiptPdfs,
    consultaPermissions: {
      ...defaults.consultaPermissions,
      ...data.consultaPermissions,
    },
    publishedConsulta: data.publishedConsulta ?? defaults.publishedConsulta,
    updatedAt:
      typeof data.updatedAt === 'string' ? data.updatedAt : defaults.updatedAt,
  }
}

export function loadLocalContractDocument(): ContractDocument {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return createDefaultContractDocument()
    return normalizeContractDocument(JSON.parse(raw) as Partial<ContractDocument>)
  } catch {
    return createDefaultContractDocument()
  }
}

export function saveLocalContractDocument(document: ContractDocument): void {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      ...document,
      paymentDates: mergeHistoricalPaymentDates(document.paymentDates),
    }),
  )
}
