import { defaultReceiptData } from '../data/defaultReceipt'
import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import {
  CONTRACT_ID,
  CONTRACTS_TABLE,
  INITIAL_PAID_NUMBERS,
  LOCAL_STORAGE_KEY,
} from './constants'
import { getSupabaseClient, isSupabaseConfigured } from './config'
import type { ContractDocument, ContractPatch, ContractRow } from './types'

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
    paymentDates: {},
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
    paymentDates: data.paymentDates ?? defaults.paymentDates,
    consultaPermissions: {
      ...defaults.consultaPermissions,
      ...data.consultaPermissions,
    },
    publishedConsulta: data.publishedConsulta ?? defaults.publishedConsulta,
    updatedAt:
      typeof data.updatedAt === 'string' ? data.updatedAt : defaults.updatedAt,
  }
}

function rowToDocument(row: ContractRow): ContractDocument {
  return normalizeContractDocument({
    seller: row.seller,
    buyer: row.buyer,
    property: row.property,
    paidNumbers: row.paid_numbers,
    paymentDates: row.payment_dates ?? {},
    consultaPermissions: row.consulta_permissions,
    publishedConsulta: row.published_consulta,
    updatedAt: row.updated_at,
  })
}

function documentToRow(
  document: ContractDocument,
  id = CONTRACT_ID,
): Omit<ContractRow, 'updated_at'> & { updated_at?: string } {
  return {
    id,
    seller: document.seller,
    buyer: document.buyer,
    property: document.property,
    paid_numbers: document.paidNumbers,
    payment_dates: document.paymentDates,
    consulta_permissions: document.consultaPermissions,
    published_consulta: document.publishedConsulta,
    updated_at: new Date().toISOString(),
  }
}

function patchToRow(patch: ContractPatch): Record<string, unknown> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.seller !== undefined) row.seller = patch.seller
  if (patch.buyer !== undefined) row.buyer = patch.buyer
  if (patch.property !== undefined) row.property = patch.property
  if (patch.paidNumbers !== undefined) row.paid_numbers = patch.paidNumbers
  if (patch.paymentDates !== undefined) row.payment_dates = patch.paymentDates
  if (patch.consultaPermissions !== undefined) {
    row.consulta_permissions = patch.consultaPermissions
  }
  if (patch.publishedConsulta !== undefined) {
    row.published_consulta = patch.publishedConsulta
  }
  return row
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
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(document))
}

export async function ensureRemoteContractDocument(): Promise<ContractDocument> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(CONTRACTS_TABLE)
    .select('*')
    .eq('id', CONTRACT_ID)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data) {
    return rowToDocument(data as ContractRow)
  }

  const initial = loadLocalContractDocument()
  const { data: inserted, error: insertError } = await supabase
    .from(CONTRACTS_TABLE)
    .insert(documentToRow(initial))
    .select('*')
    .single()

  if (insertError) throw new Error(insertError.message)
  return rowToDocument(inserted as ContractRow)
}

export function subscribeRemoteContract(
  onData: (document: ContractDocument) => void,
  onError: (message: string) => void,
): () => void {
  const supabase = getSupabaseClient()
  let active = true

  void (async () => {
    try {
      const document = await ensureRemoteContractDocument()
      if (active) onData(document)
    } catch (error) {
      if (active) {
        onError(
          error instanceof Error
            ? error.message
            : 'Falha ao inicializar contrato no Supabase.',
        )
      }
    }
  })()

  const channel = supabase
    .channel(`contracts:${CONTRACT_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CONTRACTS_TABLE,
        filter: `id=eq.${CONTRACT_ID}`,
      },
      (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          onData(rowToDocument(payload.new as ContractRow))
        }
      },
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(err?.message ?? `Falha na sincronização em tempo real (${status}).`)
      }
    })

  return () => {
    active = false
    void supabase.removeChannel(channel)
  }
}

export async function patchRemoteContract(patch: ContractPatch): Promise<void> {
  const supabase = getSupabaseClient()

  const { data: existing, error: readError } = await supabase
    .from(CONTRACTS_TABLE)
    .select('id')
    .eq('id', CONTRACT_ID)
    .maybeSingle()

  if (readError) throw new Error(readError.message)

  if (!existing) {
    await ensureRemoteContractDocument()
  }

  const { error } = await supabase
    .from(CONTRACTS_TABLE)
    .update(patchToRow(patch))
    .eq('id', CONTRACT_ID)

  if (error) throw new Error(error.message)
}

export function getContractStorageLabel(): 'supabase' | 'local' {
  return isSupabaseConfigured() ? 'supabase' : 'local'
}
