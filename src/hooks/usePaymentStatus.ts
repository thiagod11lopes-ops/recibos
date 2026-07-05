import { useCallback, useMemo, useState } from 'react'
import {
  generateInstallmentStatusRows,
  getPaymentSummary,
  type InstallmentStatusRow,
  type PaymentStatus,
} from '../utils/installmentStatus'
import { todayISO } from '../utils/formatters'

const PAID_UP_TO = 18

function createInitialPaidNumbers(): Set<number> {
  return new Set(Array.from({ length: PAID_UP_TO }, (_, i) => i + 1))
}

const baseRows = generateInstallmentStatusRows()

export function usePaymentStatus() {
  const [paidNumbers, setPaidNumbers] = useState<Set<number>>(createInitialPaidNumbers)
  const [paymentDates, setPaymentDates] = useState<Record<number, string>>({})

  const rows = useMemo<InstallmentStatusRow[]>(
    () =>
      baseRows.map((row) => ({
        ...row,
        status: (paidNumbers.has(row.number) ? 'pago' : 'pendente') as PaymentStatus,
        paymentDate: paymentDates[row.number],
      })),
    [paidNumbers, paymentDates],
  )

  const summary = useMemo(() => getPaymentSummary(rows), [rows])

  const isPaid = useCallback(
    (number: number) => paidNumbers.has(number),
    [paidNumbers],
  )

  const markAsPaid = useCallback((number: number, paymentDate: string = todayISO()) => {
    setPaidNumbers((prev) => {
      const next = new Set(prev)
      next.add(number)
      return next
    })
    setPaymentDates((prev) => ({ ...prev, [number]: paymentDate }))
  }, [])

  const togglePaid = useCallback((number: number) => {
    setPaidNumbers((prev) => {
      const next = new Set(prev)
      if (next.has(number)) {
        next.delete(number)
        setPaymentDates((dates) => {
          const updated = { ...dates }
          delete updated[number]
          return updated
        })
      } else {
        next.add(number)
        setPaymentDates((dates) => ({ ...dates, [number]: todayISO() }))
      }
      return next
    })
  }, [])

  const getNextPendingInstallment = useCallback(
    (existingNumbers: number[]): InstallmentStatusRow | null =>
      rows.find(
        (row) =>
          row.status === 'pendente' && !existingNumbers.includes(row.number),
      ) ?? null,
    [rows],
  )

  const getNextPendingInstallments = useCallback(
    (existingNumbers: number[], count: number): InstallmentStatusRow[] =>
      rows
        .filter(
          (row) =>
            row.status === 'pendente' && !existingNumbers.includes(row.number),
        )
        .slice(0, count),
    [rows],
  )

  return {
    rows,
    summary,
    totalCount: baseRows.length,
    isPaid,
    markAsPaid,
    togglePaid,
    getNextPendingInstallment,
    getNextPendingInstallments,
  }
}
