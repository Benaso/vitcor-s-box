import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const BTTerminalContext = createContext(null)

export function BTTerminalProvider({ children }) {
  const [isBTTerminalEnabled, setIsBTTerminalEnabled] = useState(false)
  const [isBTTerminalOpen, setIsBTTerminalOpen] = useState(false)
  const [isSplitMode, setIsSplitMode] = useState(false)

  const enableBTTerminal = useCallback(() => {
    setIsBTTerminalEnabled(true)
    setIsBTTerminalOpen(true)
    setIsSplitMode(true)
  }, [])

  const openBTTerminal = useCallback(() => {
    setIsSplitMode(true)
    setIsBTTerminalOpen(true)
  }, [])

  const closeBTTerminal = useCallback(() => {
    setIsSplitMode(false)
    setIsBTTerminalOpen(false)
  }, [])

  const value = useMemo(() => ({
    closeBTTerminal,
    enableBTTerminal,
    isBTTerminalOpen,
    isBTTerminalEnabled,
    isSplitMode,
    openBTTerminal
  }), [closeBTTerminal, enableBTTerminal, isBTTerminalEnabled, isBTTerminalOpen, isSplitMode, openBTTerminal])

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
