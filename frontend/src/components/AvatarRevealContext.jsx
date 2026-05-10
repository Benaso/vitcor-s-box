import { createContext, useContext, useMemo, useState } from 'react'

const AvatarRevealContext = createContext(null)

export function AvatarRevealProvider({ children }) {
  const [isAvatarRevealed, setIsAvatarRevealed] = useState(false)

  const value = useMemo(() => ({
    isAvatarRevealed,
    revealAvatar: () => setIsAvatarRevealed(true)
  }), [isAvatarRevealed])

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
