/**
 * Keyboard Shortcuts Hook
 * Manages keyboard shortcuts for the application
 */

import { useEffect, useCallback, useRef } from 'react'
import { KeyboardShortcut } from '../types'

// ============================================================================
// Hook Options Interface
// ============================================================================

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean
  /** Context for shortcuts (e.g., 'chart', 'global') */
  context?: string
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean
  /** Whether to stop event propagation */
  stopPropagation?: boolean
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseKeyboardShortcutsReturn {
  /** Register a new shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void
  /** Unregister a shortcut */
  unregisterShortcut: (keys: string[]) => void
  /** Enable/disable shortcuts */
  setEnabled: (enabled: boolean) => void
  /** Get all registered shortcuts */
  getShortcuts: () => KeyboardShortcut[]
  /** Check if a key combination is registered */
  isRegistered: (keys: string[]) => boolean
}

// ============================================================================
// Default Shortcuts
// ============================================================================

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['Escape'],
    description: 'Close modals and overlays',
    handler: () => {
      // This will be overridden by components
    },
    global: true
  },
  {
    keys: ['Control', 'k'],
    description: 'Quick search',
    handler: () => {
      // This will be overridden by components
    },
    global: true,
    context: 'search'
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    handler: () => {
      // This will be overridden by components
    },
    global: true,
    context: 'help'
  }
]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize key combinations for consistent comparison
 */
function normalizeKeys(keys: string[]): string[] {
  return keys
    .map(key => {
      // Normalize common key names
      const normalized = key
        .replace(/cmd|command/gi, 'Meta')
        .replace(/ctrl|control/gi, 'Control')
        .replace(/alt|option/gi, 'Alt')
        .replace(/shift/gi, 'Shift')
        .replace(/space/gi, ' ')
        .replace(/enter|return/gi, 'Enter')
        .replace(/esc|escape/gi, 'Escape')
        .replace(/del|delete/gi, 'Delete')
        .replace(/backspace|bksp/gi, 'Backspace')
        .replace(/tab/gi, 'Tab')
        .replace(/up|arrowup/gi, 'ArrowUp')
        .replace(/down|arrowdown/gi, 'ArrowDown')
        .replace(/left|arrowleft/gi, 'ArrowLeft')
        .replace(/right|arrowright/gi, 'ArrowRight')
      
      return normalized
    })
    .sort() // Sort for consistent comparison
}

/**
 * Check if the current pressed keys match a shortcut
 */
function keysMatch(pressedKeys: string[], shortcutKeys: string[]): boolean {
  const normalizedPressed = normalizeKeys(pressedKeys)
  const normalizedShortcut = normalizeKeys(shortcutKeys)
  
  if (normalizedPressed.length !== normalizedShortcut.length) {
    return false
  }
  
  return normalizedPressed.every(key => normalizedShortcut.includes(key))
}

/**
 * Get currently pressed modifier and regular keys from event
 */
function getKeysFromEvent(event: KeyboardEvent): string[] {
  const keys: string[] = []
  
  // Add modifier keys
  if (event.ctrlKey) keys.push('Control')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')
  if (event.metaKey) keys.push('Meta')
  
  // Add the main key (avoid duplicating modifiers)
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
    keys.push(event.key)
  }
  
  return keys
}

// ============================================================================
// Main Hook
// ============================================================================

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[] = [],
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const {
    enabled = true,
    context,
    preventDefault = true,
    stopPropagation = true
  } = options
  
  // ============================================================================
  // State Management
  // ============================================================================
  
  const shortcutsRef = useRef<KeyboardShortcut[]>([...DEFAULT_SHORTCUTS, ...shortcuts])
  const enabledRef = useRef(enabled)
  const contextRef = useRef(context)
  
  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = [...DEFAULT_SHORTCUTS, ...shortcuts]
  }, [shortcuts])
  
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])
  
  useEffect(() => {
    contextRef.current = context
  }, [context])
  
  // ============================================================================
  // Event Handler
  // ============================================================================
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabledRef.current) return
    
    // Skip if typing in input fields (unless global shortcut)
    const target = event.target as HTMLElement
    const isInputField = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    )
    
    // Get currently pressed keys
    const pressedKeys = getKeysFromEvent(event)
    
    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      // Check key combination match
      if (!keysMatch(pressedKeys, shortcut.keys)) return false
      
      // Check context match
      if (contextRef.current && shortcut.context && shortcut.context !== contextRef.current) {
        return false
      }
      
      // Check if global shortcut or not in input field
      if (!shortcut.global && isInputField) return false
      
      return true
    })
    
    if (matchingShortcut) {
      // Prevent default browser behavior if requested
      if (preventDefault) {
        event.preventDefault()
      }
      
      // Stop event propagation if requested
      if (stopPropagation) {
        event.stopPropagation()
      }
      
      // Execute the shortcut handler
      try {
        matchingShortcut.handler(event)
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error)
      }
    }
  }, [preventDefault, stopPropagation])
  
  // ============================================================================
  // Effect Setup
  // ============================================================================
  
  useEffect(() => {
    if (!enabled) return
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown, true)
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown, enabled])
  
  // ============================================================================
  // API Methods
  // ============================================================================
  
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current = [...shortcutsRef.current, shortcut]
  }, [])
  
  const unregisterShortcut = useCallback((keys: string[]) => {
    shortcutsRef.current = shortcutsRef.current.filter(
      shortcut => !keysMatch(keys, shortcut.keys)
    )
  }, [])
  
  const setEnabled = useCallback((newEnabled: boolean) => {
    enabledRef.current = newEnabled
  }, [])
  
  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    return [...shortcutsRef.current]
  }, [])
  
  const isRegistered = useCallback((keys: string[]): boolean => {
    return shortcutsRef.current.some(shortcut => keysMatch(keys, shortcut.keys))
  }, [])
  
  // ============================================================================
  // Return API
  // ============================================================================
  
  return {
    registerShortcut,
    unregisterShortcut,
    setEnabled,
    getShortcuts,
    isRegistered
  }
}

// ============================================================================
// Predefined Shortcut Sets
// ============================================================================

/**
 * Chart-specific keyboard shortcuts
 */
export const CHART_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['Control', '='],
    description: 'Zoom in on chart',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  },
  {
    keys: ['Control', '-'],
    description: 'Zoom out on chart',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  },
  {
    keys: ['Control', '0'],
    description: 'Reset chart zoom',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  },
  {
    keys: ['ArrowLeft'],
    description: 'Pan chart left',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  },
  {
    keys: ['ArrowRight'],
    description: 'Pan chart right',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  },
  {
    keys: ['r'],
    description: 'Refresh chart data',
    handler: () => {
      // Will be implemented by chart component
    },
    context: 'chart'
  }
]

/**
 * Navigation keyboard shortcuts
 */
export const NAVIGATION_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['g', 'h'],
    description: 'Go to home',
    handler: () => {
      // Will be implemented by navigation component
    },
    global: true
  },
  {
    keys: ['g', 'c'],
    description: 'Go to chart',
    handler: () => {
      // Will be implemented by navigation component
    },
    global: true
  },
  {
    keys: ['g', 's'],
    description: 'Go to settings',
    handler: () => {
      // Will be implemented by navigation component
    },
    global: true
  }
]

/**
 * Symbol selection shortcuts
 */
export const SYMBOL_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['s'],
    description: 'Open symbol search',
    handler: () => {
      // Will be implemented by symbol selector
    },
    global: true,
    context: 'symbol'
  },
  {
    keys: ['1'],
    description: '1 minute timeframe',
    handler: () => {
      // Will be implemented by timeframe selector
    },
    context: 'symbol'
  },
  {
    keys: ['5'],
    description: '5 minute timeframe',
    handler: () => {
      // Will be implemented by timeframe selector
    },
    context: 'symbol'
  },
  {
    keys: ['h'],
    description: '1 hour timeframe',
    handler: () => {
      // Will be implemented by timeframe selector
    },
    context: 'symbol'
  },
  {
    keys: ['d'],
    description: '1 day timeframe',
    handler: () => {
      // Will be implemented by timeframe selector
    },
    context: 'symbol'
  }
]

// ============================================================================
// Export Default
// ============================================================================

export default useKeyboardShortcuts