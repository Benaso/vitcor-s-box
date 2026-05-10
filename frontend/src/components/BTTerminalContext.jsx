import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const BTTerminalContext = createContext(null)

export function BTTerminalProvider({ children }) {
  const [isBTTerminalEnabled, setIsBTTerminalEnabled] = useState(false)
  const [isBTTerminalOpen, setIsBTTerminalOpen] = useState(false)

  const enableBTTerminal = useCallback(() => {
    setIsBTTerminalEnabled(true)
    setIsBTTerminalOpen(true)
  }, [])

  const openBTTerminal = useCallback(() => {
    setIsBTTerminalOpen(true)
  }, [])

  const closeBTTerminal = useCallback(() => {
    setIsBTTerminalOpen(false)
  }, [])

  const value = useMemo(() => ({
    closeBTTerminal,
    enableBTTerminal,
    isBTTerminalOpen,
    isBTTerminalEnabled,
    openBTTerminal
  }), [closeBTTerminal, enableBTTerminal, isBTTerminalEnabled, isBTTerminalOpen, openBTTerminal])

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
