import { useCallback, useMemo, useState } from 'react'
import { useContractDatabase } from '../context/ContractDatabaseContext'
import type { Installment, ReceiptData } from '../types/receipt'
import { formatCpf, generateId, todayISO } from '../utils/formatters'
import type { InstallmentStatusRow } from '../utils/installmentStatus'

interface UseReceiptFormOptions {
  getNextPendingInstallment: (
    existingNumbers: number[],
  ) => InstallmentStatusRow | null
  getNextPendingInstallments: (
    existingNumbers: number[],
    count: number,
  ) => InstallmentStatusRow[]
}

export function useReceiptForm({
  getNextPendingInstallment,
  getNextPendingInstallments,
}: UseReceiptFormOptions) {
  const { contract, updateSeller, updateBuyer, updateProperty } =
    useContractDatabase()

  const [installments, setInstallments] = useState<Installment[]>([])
  const [selectedId, setSelectedId] = useState<string>('')

  const data: ReceiptData = useMemo(
    () => ({
      seller: contract.seller,
      buyer: contract.buyer,
      property: contract.property,
      installments,
    }),
    [contract.seller, contract.buyer, contract.property, installments],
  )

  const updateSellerField = useCallback(
    (field: 'name' | 'cpf', value: string) => {
      void updateSeller(field, field === 'cpf' ? formatCpf(value) : value)
    },
    [updateSeller],
  )

  const updateBuyerField = useCallback(
    (field: 'name' | 'cpf', value: string) => {
      void updateBuyer(field, field === 'cpf' ? formatCpf(value) : value)
    },
    [updateBuyer],
  )

  const updatePropertyField = useCallback(
    (field: keyof ReceiptData['property'], value: string | number) => {
      void updateProperty(field, value)
    },
    [updateProperty],
  )

  const addInstallment = useCallback(() => {
    const existingNumbers = installments.map((item) => item.number)
    const nextPending = getNextPendingInstallment(existingNumbers)
    if (!nextPending) return

    const today = todayISO()
    const newInstallment: Installment = {
      id: generateId(),
      number: nextPending.number,
      value: contract.property.installmentValue,
      paymentDate: today,
      receiptDate: today,
      city: 'Rio de Janeiro',
      generated: false,
    }

    setInstallments((prev) => [...prev, newInstallment])
    setSelectedId(newInstallment.id)
  }, [contract.property.installmentValue, getNextPendingInstallment, installments])

  const updateInstallment = useCallback(
    (id: string, field: keyof Installment, value: string | number | boolean) => {
      setInstallments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      )
    },
    [],
  )

  const removeInstallment = useCallback((id: string) => {
    setInstallments((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      setSelectedId((current) =>
        current === id ? (filtered[0]?.id ?? '') : current,
      )
      return filtered
    })
  }, [])

  const generateBatch = useCallback(
    (count: number) => {
      const existingNumbers = installments.map((item) => item.number)
      const pendingRows = getNextPendingInstallments(existingNumbers, count)
      if (pendingRows.length === 0) return

      const today = todayISO()
      const newItems: Installment[] = pendingRows.map((row) => ({
        id: generateId(),
        number: row.number,
        value: contract.property.installmentValue,
        paymentDate: today,
        receiptDate: today,
        city: 'Rio de Janeiro',
        generated: false,
      }))

      setInstallments((prev) => [...prev, ...newItems])
      const lastItem = newItems[newItems.length - 1]
      if (lastItem) setSelectedId(lastItem.id)
    },
    [contract.property.installmentValue, getNextPendingInstallments, installments],
  )

  const generateReceipt = useCallback((id: string) => {
    setSelectedId(id)
    setInstallments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, generated: true } : item,
      ),
    )
  }, [])

  const nextPendingInstallment = getNextPendingInstallment(
    installments.map((item) => item.number),
  )

  const selectedInstallment =
    installments.find((item) => item.id === selectedId) ?? null

  return {
    data,
    selectedId,
    setSelectedId,
    selectedInstallment,
    updateSeller: updateSellerField,
    updateBuyer: updateBuyerField,
    updateProperty: updatePropertyField,
    addInstallment,
    updateInstallment,
    removeInstallment,
    generateBatch,
    generateReceipt,
    nextPendingInstallment,
  }
}
