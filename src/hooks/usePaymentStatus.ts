import { useCallback, useMemo } from 'react'
import { useContractDatabase } from '../context/ContractDatabaseContext'
import {
  generateInstallmentStatusRows,
  getPaymentSummary,
  type InstallmentStatusRow,
  type PaymentStatus,
} from '../utils/installmentStatus'
import { todayISO } from '../utils/formatters'

const baseRows = generateInstallmentStatusRows()

export function usePaymentStatus() {
  const { contract, markAsPaid, togglePaid } = useContractDatabase()

  const paidNumbers = useMemo(
    () => new Set(contract.paidNumbers),
    [contract.paidNumbers],
  )

  const rows = useMemo<InstallmentStatusRow[]>(
    () =>
      baseRows.map((row) => ({
        ...row,
        status: (paidNumbers.has(row.number) ? 'pago' : 'pendente') as PaymentStatus,
        paymentDate: contract.paymentDates[String(row.number)],
      })),
    [paidNumbers, contract.paymentDates],
  )

  const summary = useMemo(() => getPaymentSummary(rows), [rows])

  const isPaid = useCallback(
    (number: number) => paidNumbers.has(number),
    [paidNumbers],
  )

  const markAsPaidWithDate = useCallback(
    (number: number, paymentDate: string = todayISO()) => {
      void markAsPaid(number, paymentDate)
    },
    [markAsPaid],
  )

  const togglePaidWithDate = useCallback(
    (number: number) => {
      void togglePaid(number, todayISO())
    },
    [togglePaid],
  )

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
    markAsPaid: markAsPaidWithDate,
    togglePaid: togglePaidWithDate,
    getNextPendingInstallment,
    getNextPendingInstallments,
  }
}
