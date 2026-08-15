const DB_NAME = 'recibos-receipt-pdfs'
const STORE_NAME = 'pdfs'
const DB_VERSION = 1

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

export async function saveReceiptPdfFile(
  installmentNumber: number,
  file: File,
): Promise<{ fileName: string; uploadedAt: string }> {
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

  return { fileName: file.name, uploadedAt }
}

export async function getReceiptPdfBlob(
  installmentNumber: number,
): Promise<Blob | null> {
  const db = await openDb()
  const local = await new Promise<StoredPdf | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(installmentNumber)
    request.onsuccess = () => resolve(request.result as StoredPdf | undefined)
    request.onerror = () => reject(request.error ?? new Error('Falha ao ler PDF local.'))
  })
  db.close()

  return local?.blob ?? null
}

export async function openReceiptPdf(installmentNumber: number): Promise<boolean> {
  const blob = await getReceiptPdfBlob(installmentNumber)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}

export async function createReceiptPdfObjectUrl(
  installmentNumber: number,
): Promise<string | null> {
  const blob = await getReceiptPdfBlob(installmentNumber)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export async function downloadUploadedReceiptPdf(
  installmentNumber: number,
  fileName: string,
): Promise<boolean> {
  const blob = await getReceiptPdfBlob(installmentNumber)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}

export async function printReceiptPdf(
  installmentNumber: number,
): Promise<boolean> {
  const blob = await getReceiptPdfBlob(installmentNumber)
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
