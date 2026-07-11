import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerSrc

interface PdfClipboardPreviewProps {
  pdfSrc: string
  fileName?: string
}

export function PdfClipboardPreview({ pdfSrc, fileName }: PdfClipboardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    let pdf: PDFDocumentProxy | null = null

    async function renderPages() {
      setStatus('loading')
      setErrorMessage('')
      const container = containerRef.current
      if (!container) return
      container.replaceChildren()

      try {
        const loadingTask = getDocument({ url: pdfSrc })
        pdf = await loadingTask.promise
        if (cancelled) return

        const maxWidth = Math.min(container.clientWidth || 420, 520)

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return
          const page = await pdf.getPage(pageNumber)
          const baseViewport = page.getViewport({ scale: 1 })
          const scale = maxWidth / baseViewport.width
          const viewport = page.getViewport({ scale: Math.min(scale, 2) })

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          const outputScale = window.devicePixelRatio || 1
          canvas.width = Math.floor(viewport.width * outputScale)
          canvas.height = Math.floor(viewport.height * outputScale)
          canvas.style.width = `${Math.floor(viewport.width)}px`
          canvas.style.height = `${Math.floor(viewport.height)}px`
          canvas.className =
            'mx-auto block w-full max-w-full bg-white shadow-sm ring-1 ring-black/5'
          canvas.setAttribute(
            'aria-label',
            `Página ${pageNumber} de ${pdf.numPages}${fileName ? ` — ${fileName}` : ''}`,
          )

          const transform =
            outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform,
          }).promise

          if (cancelled) return
          container.appendChild(canvas)

          if (pageNumber < pdf.numPages) {
            const spacer = document.createElement('div')
            spacer.className = 'h-3'
            container.appendChild(spacer)
          }
        }

        if (!cancelled) setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o PDF na prancheta.',
        )
      }
    }

    void renderPages()

    return () => {
      cancelled = true
      void pdf?.cleanup()
    }
  }, [pdfSrc, fileName])

  return (
    <div className="relative min-h-[16rem]">
      {status === 'loading' && (
        <div className="flex h-[min(68vh,38rem)] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-700/20 border-t-amber-800/70" />
          Carregando página do PDF…
        </div>
      )}
      {status === 'error' && (
        <div className="flex h-[min(40vh,20rem)] items-center justify-center px-6 text-center text-sm text-red-700/80">
          {errorMessage}
        </div>
      )}
      <div
        ref={containerRef}
        className={`max-h-[min(68vh,38rem)] space-y-0 overflow-y-auto px-1 py-1 ${
          status === 'ready' ? 'block' : 'hidden'
        }`}
      />
    </div>
  )
}
