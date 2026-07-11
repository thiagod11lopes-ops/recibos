import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const [allowPortraitTable, setAllowPortraitTable] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { isCompactDevice, isLandscape } = useViewportMode()

  const showRotateModal =
    expanded && isCompactDevice && !isLandscape && !allowPortraitTable
  const showTable =
    expanded && (!isCompactDevice || isLandscape || allowPortraitTable)
  const immersive = showTable && isCompactDevice && isLandscape

  useEffect(() => {
    if (!expanded) {
      setAllowPortraitTable(false)
    }
  }, [expanded])

  useEffect(() => {
    if (isLandscape) {
      setAllowPortraitTable(false)
    }
  }, [isLandscape])

  useEffect(() => {
    if (!immersive || !sectionRef.current) return

    const frame = window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      })
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [immersive])

  useEffect(() => {
    if (!immersive) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [immersive])

  return (
    <>
      <section
        ref={sectionRef}
        className={
          immersive
            ? 'fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#0a0a0f] animate-fade-in'
            : 'overflow-hidden rounded-2xl border border-white/8 bg-[#16161f]/80 backdrop-blur-xl'
        }
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={`flex w-full shrink-0 items-center justify-between gap-4 text-left transition-colors hover:bg-white/3 ${
            immersive
              ? 'border-b border-white/8 bg-[#12121a] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]'
              : 'px-6 py-4'
          }`}
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
            {immersive && (
              <p className="mt-1 text-xs text-indigo-300/80">
                Modo horizontal — toque na seta para fechar
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
          className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-out ${
            showTable ? 'grid-rows-[1fr] flex-1' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`h-full overflow-auto border-t border-white/6 ${
                immersive
                  ? 'p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
                  : 'p-6'
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </section>

      {immersive && <div aria-hidden className="h-0" />}

      <RotateToLandscapeModal
        open={showRotateModal}
        onCancel={() => setAllowPortraitTable(true)}
      />
    </>
  )
}
