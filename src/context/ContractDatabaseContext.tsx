import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import type { Property } from '../types/receipt'
import type { ReceiptPdfMeta } from '../types/receiptPdf'
import type { InstallmentStatusRow } from '../utils/installmentStatus'
import type { getPaymentSummary } from '../utils/installmentStatus'
import {
  loadLocalContractDocument,
  saveLocalContractDocument,
  createDefaultContractDocument,
} from '../data/contractRepository'
import { offlineContractDocument } from '../data/offlineContract'
import type { ContractDocument, ContractPatch } from '../data/types'
import { isSupabaseConfigured } from '../supabase/config'
import {
  patchRemoteContract,
  subscribeRemoteContract,
} from '../supabase/contractRepository'
import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import {
  deleteReceiptPdfFile,
  saveReceiptPdfFile,
} from '../utils/receiptPdfStore'

interface PublishInput {
  seller: ContractDocument['seller']
  buyer: ContractDocument['buyer']
  property: Property
  rows: InstallmentStatusRow[]
  summary: ReturnType<typeof getPaymentSummary>
  totalCount: number
}

interface ContractDatabaseContextValue {
  loading: boolean
  error: string | null
  notice: string | null
  storage: 'supabase' | 'local'
  contract: ContractDocument
  patchContract: (patch: ContractPatch) => Promise<void>
  updateSeller: (field: 'name' | 'cpf', value: string) => Promise<void>
  updateBuyer: (field: 'name' | 'cpf', value: string) => Promise<void>
  updateProperty: (
    field: keyof ContractDocument['property'],
    value: string | number,
  ) => Promise<void>
  markAsPaid: (number: number, paymentDate: string) => Promise<void>
  togglePaid: (number: number, paymentDate: string) => Promise<void>
  unmarkPaid: (numbers: number[]) => Promise<void>
  setPermission: (key: keyof ConsultaPermissions, value: boolean) => Promise<void>
  resetPermissions: () => Promise<void>
  publishForConsulta: (input: PublishInput) => Promise<ConsultaPublishedData>
  saveReceiptPdf: (
    installmentNumber: number,
    file: File,
  ) => Promise<ReceiptPdfMeta>
  deleteReceiptPdf: (installmentNumber: number) => Promise<void>
}

const ContractDatabaseContext = createContext<ContractDatabaseContextValue | null>(
  null,
)

async function persistContract(
  next: ContractDocument,
  patch: ContractPatch,
  storage: 'supabase' | 'local',
): Promise<void> {
  if (storage === 'supabase') {
    await patchRemoteContract(patch)
    return
  }
  saveLocalContractDocument(next)
}

export function ContractDatabaseProvider({ children }: { children: ReactNode }) {
  const remoteConfigured = isSupabaseConfigured()
  const [storage, setStorage] = useState<'supabase' | 'local'>(
    remoteConfigured ? 'supabase' : 'local',
  )
  const [contract, setContract] = useState<ContractDocument>(() =>
    remoteConfigured
      ? createDefaultContractDocument()
      : loadLocalContractDocument(),
  )
  const [loading, setLoading] = useState(remoteConfigured)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const loadedFromRemote = useRef(false)

  useEffect(() => {
    if (!remoteConfigured) return

    const unsubscribe = subscribeRemoteContract(
      (document) => {
        loadedFromRemote.current = true
        setContract(document)
        setStorage('supabase')
        setNotice(null)
        setLoading(false)
        setError(null)
      },
      (message) => {
        if (!loadedFromRemote.current) {
          const copy = offlineContractDocument
          setContract(copy)
          saveLocalContractDocument(copy)
          setStorage('local')
          setNotice(
            'O Supabase não respondeu. A consulta está usando a cópia salva em 15/08/2026.',
          )
          setError(null)
        } else {
          setError(message)
        }
        setLoading(false)
      },
    )

    return unsubscribe
  }, [remoteConfigured])

  const patchContract = useCallback(
    async (patch: ContractPatch) => {
      const next = {
        ...contract,
        ...patch,
        seller: patch.seller ? { ...contract.seller, ...patch.seller } : contract.seller,
        buyer: patch.buyer ? { ...contract.buyer, ...patch.buyer } : contract.buyer,
        property: patch.property
          ? { ...contract.property, ...patch.property }
          : contract.property,
        consultaPermissions: patch.consultaPermissions
          ? { ...contract.consultaPermissions, ...patch.consultaPermissions }
          : contract.consultaPermissions,
        updatedAt: new Date().toISOString(),
      }

      setContract(next)

      try {
        await persistContract(next, patch, storage)
        setError(null)
      } catch (persistError) {
        setError(
          persistError instanceof Error
            ? persistError.message
            : 'Falha ao salvar dados.',
        )
        throw persistError
      }
    },
    [contract, storage],
  )

  const updateSeller = useCallback(
    async (field: 'name' | 'cpf', value: string) => {
      await patchContract({
        seller: { ...contract.seller, [field]: value },
      })
    },
    [contract.seller, patchContract],
  )

  const updateBuyer = useCallback(
    async (field: 'name' | 'cpf', value: string) => {
      await patchContract({
        buyer: { ...contract.buyer, [field]: value },
      })
    },
    [contract.buyer, patchContract],
  )

  const updateProperty = useCallback(
    async (field: keyof Property, value: string | number) => {
      await patchContract({
        property: { ...contract.property, [field]: value },
      })
    },
    [contract.property, patchContract],
  )

  const markAsPaid = useCallback(
    async (number: number, paymentDate: string) => {
      const paidNumbers = contract.paidNumbers.includes(number)
        ? contract.paidNumbers
        : [...contract.paidNumbers, number]

      await patchContract({
        paidNumbers,
        paymentDates: {
          ...contract.paymentDates,
          [String(number)]: paymentDate,
        },
      })
    },
    [contract.paidNumbers, contract.paymentDates, patchContract],
  )

  const togglePaid = useCallback(
    async (number: number, paymentDate: string) => {
      const isPaid = contract.paidNumbers.includes(number)

      if (isPaid) {
        const paidNumbers = contract.paidNumbers.filter((item) => item !== number)
        const paymentDates = { ...contract.paymentDates }
        delete paymentDates[String(number)]
        await patchContract({ paidNumbers, paymentDates })
        return
      }

      await patchContract({
        paidNumbers: [...contract.paidNumbers, number],
        paymentDates: {
          ...contract.paymentDates,
          [String(number)]: paymentDate,
        },
      })
    },
    [contract.paidNumbers, contract.paymentDates, patchContract],
  )

  const unmarkPaid = useCallback(
    async (numbers: number[]) => {
      if (numbers.length === 0) return
      const toRemove = new Set(numbers)
      const paidNumbers = contract.paidNumbers.filter(
        (item) => !toRemove.has(item),
      )
      const paymentDates = { ...contract.paymentDates }
      for (const number of numbers) {
        delete paymentDates[String(number)]
      }
      await patchContract({ paidNumbers, paymentDates })
    },
    [contract.paidNumbers, contract.paymentDates, patchContract],
  )

  const setPermission = useCallback(
    async (key: keyof ConsultaPermissions, value: boolean) => {
      await patchContract({
        consultaPermissions: {
          ...contract.consultaPermissions,
          [key]: value,
        },
      })
    },
    [contract.consultaPermissions, patchContract],
  )

  const resetPermissions = useCallback(async () => {
    await patchContract({
      consultaPermissions: { ...DEFAULT_CONSULTA_PERMISSIONS },
    })
  }, [patchContract])

  const publishForConsulta = useCallback(
    async (input: PublishInput) => {
      const snapshot: ConsultaPublishedData = {
        publishedAt: new Date().toISOString(),
        seller: input.seller,
        buyer: input.buyer,
        property: input.property,
        rows: input.rows,
        summary: {
          paidCount: input.summary.paidCount,
          pendingCount: input.summary.pendingCount,
          paidTotalFormatted: input.summary.paidTotalFormatted,
          pendingTotalFormatted: input.summary.pendingTotalFormatted,
        },
        totalCount: input.totalCount,
        receiptPdfs: contract.receiptPdfs,
      }

      await patchContract({ publishedConsulta: snapshot })
      return snapshot
    },
    [contract.receiptPdfs, patchContract],
  )

  const saveReceiptPdf = useCallback(
    async (installmentNumber: number, file: File) => {
      const saved = await saveReceiptPdfFile(installmentNumber, file)
      const meta: ReceiptPdfMeta = {
        fileName: saved.fileName,
        uploadedAt: saved.uploadedAt,
        storagePath: saved.storagePath,
      }
      await patchContract({
        receiptPdfs: {
          ...contract.receiptPdfs,
          [String(installmentNumber)]: meta,
        },
      })
      return meta
    },
    [contract.receiptPdfs, patchContract],
  )

  const deleteReceiptPdf = useCallback(
    async (installmentNumber: number) => {
      const key = String(installmentNumber)
      const existing = contract.receiptPdfs[key]
      await deleteReceiptPdfFile(installmentNumber, existing?.storagePath)
      const nextPdfs = { ...contract.receiptPdfs }
      delete nextPdfs[key]
      await patchContract({ receiptPdfs: nextPdfs })
    },
    [contract.receiptPdfs, patchContract],
  )

  const value = useMemo<ContractDatabaseContextValue>(
    () => ({
      loading,
      error,
      notice,
      storage,
      contract,
      patchContract,
      updateSeller,
      updateBuyer,
      updateProperty,
      markAsPaid,
      togglePaid,
      unmarkPaid,
      setPermission,
      resetPermissions,
      publishForConsulta,
      saveReceiptPdf,
      deleteReceiptPdf,
    }),
    [
      loading,
      error,
      notice,
      storage,
      contract,
      patchContract,
      updateSeller,
      updateBuyer,
      updateProperty,
      markAsPaid,
      togglePaid,
      unmarkPaid,
      setPermission,
      resetPermissions,
      publishForConsulta,
      saveReceiptPdf,
      deleteReceiptPdf,
    ],
  )

  return (
    <ContractDatabaseContext.Provider value={value}>
      {children}
    </ContractDatabaseContext.Provider>
  )
}

export function useContractDatabase(): ContractDatabaseContextValue {
  const context = useContext(ContractDatabaseContext)
  if (!context) {
    throw new Error(
      'useContractDatabase deve ser usado dentro de ContractDatabaseProvider.',
    )
  }
  return context
}
