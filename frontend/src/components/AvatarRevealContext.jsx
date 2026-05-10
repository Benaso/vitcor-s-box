import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AvatarRevealContext = createContext(null)

export function AvatarRevealProvider({ children }) {
  const [isAvatarRevealed, setIsAvatarRevealed] = useState(false)
  const resetAvatarReveal = useCallback(() => setIsAvatarRevealed(false), [])
  const revealAvatar = useCallback(() => setIsAvatarRevealed(true), [])

  const value = useMemo(() => ({
    isAvatarRevealed,
    resetAvatarReveal,
    revealAvatar
  }), [isAvatarRevealed, resetAvatarReveal, revealAvatar])

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
