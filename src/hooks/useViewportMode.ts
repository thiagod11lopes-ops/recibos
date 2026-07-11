import { useEffect, useState } from 'react'

function getIsCompactDevice(): boolean {
  if (typeof window === 'undefined') return false
  const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  const narrow = window.matchMedia('(max-width: 1024px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return (touch && narrow) || coarse
}

function getIsLandscape(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(orientation: landscape)').matches
}

export function useViewportMode() {
  const [isCompactDevice, setIsCompactDevice] = useState(getIsCompactDevice)
  const [isLandscape, setIsLandscape] = useState(getIsLandscape)

  useEffect(() => {
    const update = () => {
      setIsCompactDevice(getIsCompactDevice())
      setIsLandscape(getIsLandscape())
    }

    const orientationQuery = window.matchMedia('(orientation: landscape)')
    const widthQuery = window.matchMedia('(max-width: 1024px)')

    update()
    orientationQuery.addEventListener('change', update)
    widthQuery.addEventListener('change', update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      orientationQuery.removeEventListener('change', update)
      widthQuery.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return { isCompactDevice, isLandscape }
}
