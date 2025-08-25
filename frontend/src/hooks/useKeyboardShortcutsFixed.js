// Simplified keyboard shortcuts hook for the fixed version
import { useEffect } from 'react'

export const useKeyboardShortcuts = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { ctrlKey, shiftKey, altKey, key } = event
      
      // Export data - Ctrl+Shift+E
      if (ctrlKey && shiftKey && key === 'E') {
        event.preventDefault()
        callbacks.onExport?.()
        return
      }
      
      // Refresh data - F5 or Ctrl+R
      if (key === 'F5' || (ctrlKey && key === 'r')) {
        event.preventDefault()
        callbacks.onRefresh?.()
        return
      }
      
      // Help - F1 or Ctrl+?
      if (key === 'F1' || (ctrlKey && key === '?')) {
        event.preventDefault()
        callbacks.onToggleHelp?.()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}