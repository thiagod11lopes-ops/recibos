import { useCallback, useState } from 'react'
import { defaultReceiptData } from '../data/defaultReceipt'
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
  const [data, setData] = useState<ReceiptData>(defaultReceiptData)
  const [selectedId, setSelectedId] = useState<string>('')

  const updateSeller = useCallback((field: 'name' | 'cpf', value: string) => {
    setData((prev) => ({
      ...prev,
      seller: {
        ...prev.seller,
        [field]: field === 'cpf' ? formatCpf(value) : value,
      },
    }))
  }, [])

  const updateBuyer = useCallback((field: 'name' | 'cpf', value: string) => {
    setData((prev) => ({
      ...prev,
      buyer: {
        ...prev.buyer,
        [field]: field === 'cpf' ? formatCpf(value) : value,
      },
    }))
  }, [])

  const updateProperty = useCallback(
    (field: keyof ReceiptData['property'], value: string | number) => {
      setData((prev) => ({
        ...prev,
        property: { ...prev.property, [field]: value },
      }))
    },
    [],
  )

  const addInstallment = useCallback(() => {
    setData((prev) => {
      const existingNumbers = prev.installments.map((i) => i.number)
      const nextPending = getNextPendingInstallment(existingNumbers)
      if (!nextPending) return prev

      const today = todayISO()
      const newInstallment: Installment = {
        id: generateId(),
        number: nextPending.number,
        value: prev.property.installmentValue,
        paymentDate: today,
        receiptDate: today,
        city: 'Rio de Janeiro',
        generated: false,
      }

      setSelectedId(newInstallment.id)
      return {
        ...prev,
        installments: [...prev.installments, newInstallment],
      }
    })
  }, [getNextPendingInstallment])

  const updateInstallment = useCallback(
    (id: string, field: keyof Installment, value: string | number | boolean) => {
      setData((prev) => ({
        ...prev,
        installments: prev.installments.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }))
    },
    [],
  )

  const removeInstallment = useCallback((id: string) => {
    setData((prev) => {
      const filtered = prev.installments.filter((i) => i.id !== id)
      setSelectedId((current) =>
        current === id ? (filtered[0]?.id ?? '') : current,
      )
      return { ...prev, installments: filtered }
    })
  }, [])

  const generateBatch = useCallback(
    (count: number) => {
      setData((prev) => {
        const existingNumbers = prev.installments.map((i) => i.number)
        const pendingRows = getNextPendingInstallments(existingNumbers, count)
        if (pendingRows.length === 0) return prev

        const today = todayISO()
        const newItems: Installment[] = pendingRows.map((row) => ({
          id: generateId(),
          number: row.number,
          value: prev.property.installmentValue,
          paymentDate: today,
          receiptDate: today,
          city: 'Rio de Janeiro',
          generated: false,
        }))

        const lastItem = newItems[newItems.length - 1]
        if (lastItem) setSelectedId(lastItem.id)

        return {
          ...prev,
          installments: [...prev.installments, ...newItems],
        }
      })
    },
    [getNextPendingInstallments],
  )

  const generateReceipt = useCallback((id: string) => {
    setSelectedId(id)
    setData((prev) => ({
      ...prev,
      installments: prev.installments.map((item) =>
        item.id === id ? { ...item, generated: true } : item,
      ),
    }))
  }, [])

  const nextPendingInstallment = getNextPendingInstallment(
    data.installments.map((i) => i.number),
  )

  const selectedInstallment =
    data.installments.find((i) => i.id === selectedId) ?? null

  return {
    data,
    selectedId,
    setSelectedId,
    selectedInstallment,
    updateSeller,
    updateBuyer,
    updateProperty,
    addInstallment,
    updateInstallment,
    removeInstallment,
    generateBatch,
    generateReceipt,
    nextPendingInstallment,
  }
}
