import { useCallback, useState } from 'react'
import type { Party, Property } from '../types/receipt'
import type {
  ConsultaPermissions,
  ConsultaPublishedData,
} from '../types/consulta'
import { DEFAULT_CONSULTA_PERMISSIONS } from '../types/consulta'
import type { InstallmentStatusRow } from '../utils/installmentStatus'
import type { getPaymentSummary } from '../utils/installmentStatus'

const PERMISSIONS_KEY = 'recibos-consulta-permissions'
const PUBLISHED_KEY = 'recibos-consulta-published'

function loadPermissions(): ConsultaPermissions {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY)
    if (!raw) return { ...DEFAULT_CONSULTA_PERMISSIONS }
    return { ...DEFAULT_CONSULTA_PERMISSIONS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONSULTA_PERMISSIONS }
  }
}

function loadPublished(): ConsultaPublishedData | null {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsultaPublishedData
  } catch {
    return null
  }
}

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
  const [permissions, setPermissions] = useState<ConsultaPermissions>(loadPermissions)
  const [publishedData, setPublishedData] = useState<ConsultaPublishedData | null>(
    loadPublished,
  )

  const persistPermissions = useCallback((next: ConsultaPermissions) => {
    setPermissions(next)
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(next))
  }, [])

  const setPermission = useCallback(
    (key: keyof ConsultaPermissions, value: boolean) => {
      persistPermissions({ ...permissions, [key]: value })
    },
    [permissions, persistPermissions],
  )

  const resetPermissions = useCallback(() => {
    persistPermissions({ ...DEFAULT_CONSULTA_PERMISSIONS })
  }, [persistPermissions])

  const publishForConsulta = useCallback((input: PublishInput) => {
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
    }
    setPublishedData(snapshot)
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(snapshot))
    return snapshot
  }, [])

  return {
    permissions,
    publishedData,
    setPermission,
    resetPermissions,
    publishForConsulta,
    consultaUrl: getConsultaPublicUrl(),
  }
}
