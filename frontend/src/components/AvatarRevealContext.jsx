import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AvatarRevealContext = createContext(null)

export function AvatarRevealProvider({ children }) {
  const [isAvatarRevealed, setIsAvatarRevealed] = useState(false)
  const [hasEverRevealed, setHasEverRevealed] = useState(false)

  const resetAvatarReveal = useCallback(() => setIsAvatarRevealed(false), [])
  const revealAvatar = useCallback(() => {
    setIsAvatarRevealed(true)
    setHasEverRevealed(true)
  }, [])

  const value = useMemo(() => ({
    hasEverRevealed,
    isAvatarRevealed,
    resetAvatarReveal,
    revealAvatar
  }), [hasEverRevealed, isAvatarRevealed, resetAvatarReveal, revealAvatar])

  return (
    <AvatarRevealContext.Provider value={value}>
      {children}
    </AvatarRevealContext.Provider>
  )
}

export function useAvatarReveal() {
  const context = useContext(AvatarRevealContext)

  if (!context) {
    throw new Error('useAvatarReveal must be used inside AvatarRevealProvider')
  }

  return context
}
