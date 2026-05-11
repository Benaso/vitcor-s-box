import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const BTTerminalContext = createContext(null)

export function BTTerminalProvider({ children }) {
  const [isBTTerminalOpen, setIsBTTerminalOpen] = useState(false)
  const [dockEdge, setDockEdge] = useState('bottom')

  const openBTTerminal = useCallback(() => {
    setIsBTTerminalOpen(true)
  }, [])

  const closeBTTerminal = useCallback(() => {
    setIsBTTerminalOpen(false)
  }, [])

  const value = useMemo(() => ({
    closeBTTerminal,
    dockEdge,
    isBTTerminalOpen,
    openBTTerminal,
    setDockEdge
  }), [closeBTTerminal, dockEdge, isBTTerminalOpen, openBTTerminal])

  return (
    <BTTerminalContext.Provider value={value}>
      {children}
    </BTTerminalContext.Provider>
  )
}

export function useBTTerminal() {
  const context = useContext(BTTerminalContext)

  if (!context) {
    throw new Error('useBTTerminal must be used inside BTTerminalProvider')
  }

  return context
}
