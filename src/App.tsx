import {
  Archive,
  Download,
  Eye,
  FilePlus2,
  Layers,
  ListChecks,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdministrationTab } from './components/AdministrationTab'
import { AllReceiptsTab } from './components/AllReceiptsTab'
import { ConsultaTab } from './components/ConsultaTab'
import { Header } from './components/Header'
import { InstallmentsTable } from './components/InstallmentsTable'
import { PaymentStatusTab } from './components/PaymentStatusTab'
import { ReceiptForm } from './components/ReceiptForm'
import { ReceiptPreview } from './components/ReceiptPreview'
import { Tabs } from './components/Tabs'
import { Button } from './components/ui'
import { useConsultaSettings } from './hooks/useConsultaSettings'
import { usePaymentStatus } from './hooks/usePaymentStatus'
import { useReceiptForm } from './hooks/useReceiptForm'
import { archivedReceipts } from './utils/monthlyReceipts'
import { todayISO } from './utils/formatters'
import { downloadReceiptPdf } from './utils/pdfGenerator'

const APP_TABS = [
  { id: 'create', label: 'Novo Recibo', icon: FilePlus2 },
  {
    id: 'archive',
    label: 'Todos os Recibos',
    icon: Archive,
    badge: archivedReceipts.length,
  },
  {
    id: 'status',
    label: 'Status de Pagamento',
    icon: ListChecks,
    badge: 72,
  },
  { id: 'admin', label: 'Administração', icon: Settings },
  { id: 'consulta', label: 'Consulta', icon: Eye },
] as const

type AppTab = (typeof APP_TABS)[number]['id']

function useConsultaMode() {
  const [isConsultaMode, setIsConsultaMode] = useState(
    () => window.location.hash === '#consulta',
  )

  useEffect(() => {
    const onHashChange = () => {
      setIsConsultaMode(window.location.hash === '#consulta')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return isConsultaMode
}

export default function App() {
  const isConsultaMode = useConsultaMode()
  const [activeTab, setActiveTab] = useState<AppTab>('create')

  const paymentStatus = usePaymentStatus()
  const consultaSettings = useConsultaSettings()

  const {
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
  } = useReceiptForm({
    getNextPendingInstallment: paymentStatus.getNextPendingInstallment,
    getNextPendingInstallments: paymentStatus.getNextPendingInstallments,
  })

  const handleGenerateReceipt = (id: string) => {
    const installment = data.installments.find((item) => item.id === id)
    if (!installment) return

    generateReceipt(id)
    paymentStatus.markAsPaid(installment.number, todayISO())
  }

  const handlePublishConsulta = () =>
    consultaSettings.publishForConsulta({
      seller: data.seller,
      buyer: data.buyer,
      property: data.property,
      rows: paymentStatus.rows,
      summary: paymentStatus.summary,
      totalCount: paymentStatus.totalCount,
    })

  const activeReceipt = selectedInstallment
    ? {
        seller: data.seller,
        buyer: data.buyer,
        property: data.property,
        installment: selectedInstallment,
      }
    : null

  const handleDownload = () => {
    if (activeReceipt) {
      downloadReceiptPdf(activeReceipt)
    }
  }

  const handleDownloadAll = () => {
    data.installments.forEach((installment, index) => {
      setTimeout(() => {
        downloadReceiptPdf({
          seller: data.seller,
          buyer: data.buyer,
          property: data.property,
          installment,
        })
      }, index * 300)
    })
  }

  if (isConsultaMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_0%,rgba(99,102,241,0.08),transparent)]" />
        <Header subtitle="Consulta de pagamentos" />
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ConsultaTab
            permissions={consultaSettings.permissions}
            publishedData={consultaSettings.publishedData}
            isPublicMode
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_0%,rgba(99,102,241,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_100%,rgba(139,92,246,0.06),transparent)]" />

      <Header />
      <Tabs
        tabs={[...APP_TABS]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as AppTab)}
      />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'create' ? (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Novo Recibo
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Preencha os dados, gerencie as parcelas na tabela e exporte em PDF.
                </p>
              </div>
              {data.installments.length > 1 && (
                <Button variant="secondary" onClick={handleDownloadAll}>
                  <Layers className="h-4 w-4" />
                  Baixar todos ({data.installments.length})
                </Button>
              )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
              <div className="space-y-8">
                <ReceiptForm
                  data={data}
                  onSellerChange={updateSeller}
                  onBuyerChange={updateBuyer}
                  onPropertyChange={updateProperty}
                />
                <InstallmentsTable
                  installments={data.installments}
                  totalInstallments={data.property.installmentCount}
                  selectedId={selectedId}
                  nextPending={nextPendingInstallment}
                  onSelect={setSelectedId}
                  onAdd={addInstallment}
                  onRemove={removeInstallment}
                  onUpdate={updateInstallment}
                  onGenerateBatch={generateBatch}
                  onGenerateReceipt={handleGenerateReceipt}
                />
              </div>

              <div className="xl:sticky xl:top-8 xl:self-start">
                <ReceiptPreview
                  receipt={activeReceipt}
                  onDownload={handleDownload}
                />
              </div>
            </div>

            {activeReceipt && (
              <div className="fixed bottom-6 right-6 z-50 sm:hidden">
                <Button variant="primary" size="lg" onClick={handleDownload}>
                  <Download className="h-5 w-5" />
                  PDF
                </Button>
              </div>
            )}
          </>
        ) : activeTab === 'archive' ? (
          <AllReceiptsTab />
        ) : activeTab === 'status' ? (
          <PaymentStatusTab
            rows={paymentStatus.rows}
            summary={paymentStatus.summary}
            totalCount={paymentStatus.totalCount}
            isPaid={paymentStatus.isPaid}
            onTogglePaid={paymentStatus.togglePaid}
            seller={data.seller}
            buyer={data.buyer}
            property={data.property}
          />
        ) : activeTab === 'admin' ? (
          <AdministrationTab
            permissions={consultaSettings.permissions}
            publishedData={consultaSettings.publishedData}
            consultaUrl={consultaSettings.consultaUrl}
            onPermissionChange={consultaSettings.setPermission}
            onResetPermissions={consultaSettings.resetPermissions}
            onPublish={handlePublishConsulta}
          />
        ) : (
          <ConsultaTab
            permissions={consultaSettings.permissions}
            publishedData={consultaSettings.publishedData}
          />
        )}
      </main>
    </div>
  )
}
