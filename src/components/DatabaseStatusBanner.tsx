import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface DatabaseStatusBannerProps {
  loading: boolean
  error: string | null
  storage?: 'local'
}

export function DatabaseStatusBanner({
  loading,
  error,
}: DatabaseStatusBannerProps) {
  if (loading) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando dados...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Erro ao salvar dados: {error}
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
      <span className="text-zinc-400">Armazenamento de dados</span>
      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
        Navegador (local)
      </span>
    </div>
  )
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm">Carregando dados...</p>
      </div>
    </div>
  )
}

export function DatabaseLoadingGate({
  loading,
  children,
}: {
  loading: boolean
  children: ReactNode
}) {
  if (loading) return <FullPageLoader />
  return children
}
