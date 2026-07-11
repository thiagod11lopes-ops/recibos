import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useViewportMode } from '../hooks/useViewportMode'
import { RotateToLandscapeModal } from './RotateToLandscapeModal'

interface CollapsibleParcelSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
}

export function CollapsibleParcelSection({
  title = 'Parcelas do contrato',
  subtitle,
  children,
}: CollapsibleParcelSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const { isCompactDevice, isLandscape } = useViewportMode()

  const showRotateModal = expanded && isCompactDevice && !isLandscape
  const showTable = expanded && (!isCompactDevice || isLandscape)

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#16161f]/80 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/3"
        >
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            )}
            {!subtitle && !expanded && (
              <p className="mt-1 text-xs text-zinc-500">
                Toque para expandir a tabela
              </p>
            )}
          </div>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-zinc-300 transition-transform duration-300 ${
              expanded ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            showTable ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-white/6 p-6">{children}</div>
          </div>
        </div>
      </section>

      <RotateToLandscapeModal open={showRotateModal} />
    </>
  )
}
