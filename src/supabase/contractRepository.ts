import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import {
  buildHistoricalPaymentDates,
  mergeHistoricalPaymentDates,
} from '../utils/installmentStatus'
import type { ReceiptPdfsMap } from '../types/receiptPdf'
import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import type { Party, Property } from '../types/receipt'
import {
  createDefaultContractDocument,
  loadLocalContractDocument,
} from '../data/contractRepository'
import type { ContractDocument, ContractPatch } from '../data/types'
import { getSupabaseClient, isSupabaseConfigured } from './config'
import { CONTRACT_ID, CONTRACTS_TABLE } from './constants'

export interface ContractRow {
  id: string
  seller: Party
  buyer: Party
  property: Property
  paid_numbers: number[]
  payment_dates: Record<string, string>
  receipt_pdfs?: ReceiptPdfsMap | null
  consulta_permissions: ConsultaPermissions
  published_consulta: ConsultaPublishedData | null
  updated_at: string | null
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

function rowToDocument(row: ContractRow): ContractDocument {
  return normalizeContractDocument({
    seller: row.seller,
    buyer: row.buyer,
    property: row.property,
    paidNumbers: row.paid_numbers,
    paymentDates: row.payment_dates ?? {},
    receiptPdfs: row.receipt_pdfs ?? {},
    consultaPermissions: {
      ...DEFAULT_CONSULTA_PERMISSIONS,
      ...(row.consulta_permissions ?? {}),
    },
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
    receipt_pdfs: document.receiptPdfs,
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
  if (patch.receiptPdfs !== undefined) row.receipt_pdfs = patch.receiptPdfs
  if (patch.consultaPermissions !== undefined) {
    row.consulta_permissions = patch.consultaPermissions
  }
  if (patch.publishedConsulta !== undefined) {
    row.published_consulta = patch.publishedConsulta
  }
  return row
}

function needsHistoricalPaymentBackfill(
  paymentDates: Record<string, string>,
): boolean {
  const historical = buildHistoricalPaymentDates()
  return Object.entries(historical).some(
    ([number, dueDate]) => paymentDates[number] !== dueDate,
  )
}

async function backfillHistoricalPaymentDates(
  document: ContractDocument,
  rawPaymentDates: Record<string, string>,
): Promise<ContractDocument> {
  const paymentDates = mergeHistoricalPaymentDates(rawPaymentDates)
  if (!needsHistoricalPaymentBackfill(rawPaymentDates)) {
    return { ...document, paymentDates }
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from(CONTRACTS_TABLE)
    .update({
      payment_dates: paymentDates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', CONTRACT_ID)

  if (error) throw new Error(error.message)
  return { ...document, paymentDates }
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
    const row = data as ContractRow
    const document = rowToDocument(row)
    return backfillHistoricalPaymentDates(document, row.payment_dates ?? {})
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
