import { useCallback } from 'react'
import { useContractDatabase } from '../context/ContractDatabaseContext'
import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import type { Party, Property } from '../types/receipt'
import type { InstallmentStatusRow } from '../utils/installmentStatus'
import type { getPaymentSummary } from '../utils/installmentStatus'

export function getConsultaPublicUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/#consulta`
}

interface PublishInput {
  seller: Party
  buyer: Party
  property: Property
  rows: InstallmentStatusRow[]
  summary: ReturnType<typeof getPaymentSummary>
  totalCount: number
}

export function useConsultaSettings() {
  const {
    contract,
    storage,
    loading,
    error,
    setPermission,
    resetPermissions,
    publishForConsulta,
  } = useContractDatabase()

  const publish = useCallback(
    (input: PublishInput) => {
      void publishForConsulta(input)
    },
    [publishForConsulta],
  )

  return {
    permissions: {
      ...DEFAULT_CONSULTA_PERMISSIONS,
      ...contract.consultaPermissions,
    },
    publishedData: contract.publishedConsulta,
    storage,
    loading,
    error,
    setPermission: (key: Parameters<typeof setPermission>[0], value: boolean) => {
      void setPermission(key, value)
    },
    resetPermissions: () => {
      void resetPermissions()
    },
    publishForConsulta: publish,
    consultaUrl: getConsultaPublicUrl(),
  }
}
