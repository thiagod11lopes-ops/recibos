export interface ReceiptPdfMeta {
  fileName: string
  uploadedAt: string
}

export type ReceiptPdfsMap = Record<string, ReceiptPdfMeta>
