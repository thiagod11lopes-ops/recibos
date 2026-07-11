export interface ReceiptPdfMeta {
  fileName: string
  uploadedAt: string
  storagePath?: string
}

export type ReceiptPdfsMap = Record<string, ReceiptPdfMeta>
