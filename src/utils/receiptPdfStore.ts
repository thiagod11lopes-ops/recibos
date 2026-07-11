import { CONTRACT_ID } from '../supabase/constants'
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/config'

const DB_NAME = 'recibos-receipt-pdfs'
const STORE_NAME = 'pdfs'
const DB_VERSION = 1
export const RECEIPT_PDF_BUCKET = 'receipt-pdfs'

interface StoredPdf {
  installmentNumber: number
  fileName: string
  blob: Blob
  uploadedAt: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'installmentNumber' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB.'))
  })
}

function storagePathFor(installmentNumber: number): string {
  return `${CONTRACT_ID}/${installmentNumber}.pdf`
}

export async function saveReceiptPdfFile(
  installmentNumber: number,
  file: File,
): Promise<{ fileName: string; uploadedAt: string; storagePath?: string }> {
  const uploadedAt = new Date().toISOString()
  const blob = file.slice(0, file.size, 'application/pdf')

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({
      installmentNumber,
      fileName: file.name,
      blob,
      uploadedAt,
    } satisfies StoredPdf)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Falha ao salvar PDF localmente.'))
  })
  db.close()

  let storagePath: string | undefined
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient()
      const path = storagePathFor(installmentNumber)
      const { error } = await supabase.storage
        .from(RECEIPT_PDF_BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: 'application/pdf',
        })
      if (!error) storagePath = path
    } catch {
      // Mantém apenas o armazenamento local se o bucket ainda não existir.
    }
  }

  return { fileName: file.name, uploadedAt, storagePath }
}

export async function getReceiptPdfBlob(
  installmentNumber: number,
  storagePath?: string,
): Promise<Blob | null> {
  const db = await openDb()
  const local = await new Promise<StoredPdf | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(installmentNumber)
    request.onsuccess = () => resolve(request.result as StoredPdf | undefined)
    request.onerror = () => reject(request.error ?? new Error('Falha ao ler PDF local.'))
  })
  db.close()

  if (local?.blob) return local.blob

  if (storagePath && isSupabaseConfigured()) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage
      .from(RECEIPT_PDF_BUCKET)
      .download(storagePath)
    if (!error && data) return data
  }

  return null
}

export async function openReceiptPdf(
  installmentNumber: number,
  storagePath?: string,
): Promise<boolean> {
  const blob = await getReceiptPdfBlob(installmentNumber, storagePath)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}

export async function printReceiptPdf(
  installmentNumber: number,
  storagePath?: string,
): Promise<boolean> {
  const blob = await getReceiptPdfBlob(installmentNumber, storagePath)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (!printWindow) {
    URL.revokeObjectURL(url)
    return false
  }

  printWindow.addEventListener('load', () => {
    printWindow.focus()
    printWindow.print()
  })
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
  return true
}
