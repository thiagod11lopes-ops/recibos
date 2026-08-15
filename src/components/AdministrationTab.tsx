import { Check, Copy, ExternalLink, RotateCcw, Upload } from 'lucide-react'
import { useState } from 'react'
import type { ConsultaPermissions, ConsultaPublishedData } from '../types/consulta'
import { PERMISSION_GROUPS } from '../types/consulta'
import { formatDateLong } from '../utils/formatters'
import { Button, Card } from './ui'
import { DatabaseStatusBanner } from './DatabaseStatusBanner'

interface AdministrationTabProps {
  permissions: ConsultaPermissions
  publishedData: ConsultaPublishedData | null
  consultaUrl: string
  storage: 'supabase' | 'local'
  loading: boolean
  error: string | null
  onPermissionChange: (key: keyof ConsultaPermissions, value: boolean) => void
  onResetPermissions: () => void
  onPublish: () => void
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-indigo-500' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function AdministrationTab({
  permissions,
  publishedData,
  consultaUrl,
  storage,
  loading,
  error,
  onPermissionChange,
  onResetPermissions,
  onPublish,
}: AdministrationTabProps) {
  const [copied, setCopied] = useState(false)
  const [justPublished, setJustPublished] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(consultaUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublish = () => {
    onPublish()
    setJustPublished(true)
    setTimeout(() => setJustPublished(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Administração
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Defina o que os usuários podem visualizar na página de consulta e publique
          os dados atualizados.
        </p>
      </div>

      <DatabaseStatusBanner loading={loading} error={error} storage={storage} />

      <Card title="Link de consulta para usuários">
        <p className="mb-4 text-sm text-zinc-400">
          Compartilhe este endereço. Os usuários verão apenas as informações que
          você autorizar abaixo — sem acesso às abas administrativas.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <code className="flex-1 truncate rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-indigo-300">
            {consultaUrl}
          </code>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopyLink}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open(consultaUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir
            </Button>
          </div>
        </div>
        {publishedData && (
          <p className="mt-4 text-xs text-zinc-500">
            Última publicação:{' '}
            {formatDateLong(publishedData.publishedAt.split('T')[0])} às{' '}
            {new Date(publishedData.publishedAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            Publicar dados para consulta
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Envia o contrato e o status de pagamento atual para a página pública.
          </p>
        </div>
        <Button variant="primary" onClick={handlePublish}>
          <Upload className="h-4 w-4" />
          {justPublished ? 'Publicado!' : 'Publicar atualização'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.title} title={group.title}>
            <p className="mb-4 text-xs text-zinc-500">{group.description}</p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  checked={permissions[item.key]}
                  onChange={(value) => onPermissionChange(item.key, value)}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onResetPermissions}>
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar permissões padrão
        </Button>
      </div>
    </div>
  )
}
