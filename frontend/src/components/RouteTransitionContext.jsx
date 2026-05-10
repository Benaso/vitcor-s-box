import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const RouteTransitionContext = createContext(null)

export function RouteTransitionProvider({ children }) {
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)
  const [transitionLabel, setTransitionLabel] = useState('')
  const completeRef = useRef(null)

  const startRouteTransition = useCallback((label, onComplete) => {
    if (isRouteTransitioning) {
      return false
    }

    completeRef.current = onComplete
    setTransitionLabel(label)
    setIsRouteTransitioning(true)
    return true
  }, [isRouteTransitioning])

  const finishRouteTransition = useCallback(() => {
    const complete = completeRef.current
    completeRef.current = null

    if (complete) {
      complete()
    }

    setIsRouteTransitioning(false)
    setTransitionLabel('')
  }, [])

  const value = useMemo(() => ({
    isRouteTransitioning,
    transitionLabel,
    startRouteTransition,
    finishRouteTransition
  }), [finishRouteTransition, isRouteTransitioning, startRouteTransition, transitionLabel])

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
    </RouteTransitionContext.Provider>
  )
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext)

  if (!context) {
    throw new Error('useRouteTransition must be used inside RouteTransitionProvider')
  }

  return context
}
