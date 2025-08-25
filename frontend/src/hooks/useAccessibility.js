/**
 * Accessibility React Hook
 * Provides accessibility features and utilities for React components
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  generateAriaId,
  announceToScreenReader,
  trapFocus,
  getFocusableElements,
  globalFocusManager,
  prefersReducedMotion,
  detectHighContrastMode,
  formatNumberForScreenReader,
  formatPercentageForScreenReader,
  meetsContrastRequirement
} from '../utils/accessibility'

// ============================================================================
// Main Accessibility Hook
// ============================================================================

export function useAccessibility(options = {}) {
  const {
    announceUpdates = true,
    manageFocus = true,
    respectMotionPreferences = true
  } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [isHighContrast, setIsHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReaderActive, setScreenReaderActive] = useState(false)
  
  // ============================================================================
  // Refs for Tracking
  // ============================================================================

  const liveRegionRef = useRef(null)
  const previousAnnouncementRef = useRef('')
  const lastFocusRef = useRef(null)

  // ============================================================================
  // Initialize Accessibility Features
  // ============================================================================

  useEffect(() => {
    // Detect initial accessibility preferences
    setIsHighContrast(detectHighContrastMode())
    setReducedMotion(prefersReducedMotion())
    
    // Detect screen reader (heuristic approach)
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelector('[aria-live]')
      const hasScreenReaderText = document.querySelector('.sr-only')
      const hasAriaLabels = document.querySelector('[aria-label]')
      
      setScreenReaderActive(!!(hasAriaLive || hasScreenReaderText || hasAriaLabels))
    }
    
    detectScreenReader()
    
    // Listen for media query changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e) => setReducedMotion(e.matches)
    motionQuery.addListener(handleMotionChange)
    
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const handleContrastChange = (e) => setIsHighContrast(e.matches)
    contrastQuery.addListener(handleContrastChange)
    
    // Create live region for announcements
    if (announceUpdates && !liveRegionRef.current) {
      const liveRegion = document.createElement('div')
      liveRegion.id = 'accessibility-live-region'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
      liveRegionRef.current = liveRegion
    }
    
    return () => {
      motionQuery.removeListener(handleMotionChange)
      contrastQuery.removeListener(handleContrastChange)
      
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current)
        liveRegionRef.current = null
      }
    }
  }, [announceUpdates])

  // ============================================================================
  // Announcement Functions
  // ============================================================================

  const announce = useCallback((message, priority = 'polite') => {
    if (!announceUpdates || !message) return
    
    // Avoid duplicate announcements
    if (message === previousAnnouncementRef.current) return
    previousAnnouncementRef.current = message
    
    if (liveRegionRef.current) {
      // Clear and then set content to ensure announcement
      liveRegionRef.current.textContent = ''
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message
        }
      }, 100)
    } else {
      announceToScreenReader(message, priority)
    }
  }, [announceUpdates])

  const announceError = useCallback((error) => {
    announce(`Error: ${error}`, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])

  const announceLoading = useCallback((message = 'Loading') => {
    announce(message, 'polite')
  }, [announce])

  const announceDataUpdate = useCallback((description) => {
    announce(`Data updated: ${description}`, 'polite')
  }, [announce])

  // ============================================================================
  // Focus Management
  // ============================================================================

  const saveFocus = useCallback(() => {
    if (manageFocus) {
      lastFocusRef.current = document.activeElement
      globalFocusManager.saveFocus()
    }
  }, [manageFocus])

  const restoreFocus = useCallback(() => {
    if (manageFocus) {
      if (lastFocusRef.current && lastFocusRef.current.focus) {
        lastFocusRef.current.focus()
      }
      globalFocusManager.restoreFocus()
    }
  }, [manageFocus])

  const focusFirst = useCallback((container) => {
    if (!manageFocus || !container) return
    
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [manageFocus])

  // ============================================================================
  // Animation Utilities
  // ============================================================================

  const getAnimationDuration = useCallback((defaultDuration) => {
    if (!respectMotionPreferences) return defaultDuration
    return reducedMotion ? 0 : defaultDuration
  }, [respectMotionPreferences, reducedMotion])

  const shouldAnimate = useCallback(() => {
    return respectMotionPreferences ? !reducedMotion : true
  }, [respectMotionPreferences, reducedMotion])

  // ============================================================================
  // Formatting Utilities
  // ============================================================================

  const formatNumber = useCallback((value) => {
    return formatNumberForScreenReader(value)
  }, [])

  const formatPercentage = useCallback((value) => {
    return formatPercentageForScreenReader(value)
  }, [])

  const formatPrice = useCallback((current, previous) => {
    if (previous === undefined) {
      return `Price: ${current}`
    }
    
    const change = current - previous
    const direction = change >= 0 ? 'increased' : 'decreased'
    const percentChange = ((change / previous) * 100)
    
    return `Price ${direction} to ${current}, ${formatPercentageForScreenReader(percentChange)}`
  }, [])

  // ============================================================================
  // Return Hook API
  // ============================================================================

  return {
    // State
    isHighContrast,
    reducedMotion,
    screenReaderActive,
    
    // Announcements
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    announceDataUpdate,
    
    // Focus management
    saveFocus,
    restoreFocus,
    focusFirst,
    
    // Animation utilities
    getAnimationDuration,
    shouldAnimate,
    
    // Formatting utilities
    formatNumber,
    formatPercentage,
    formatPrice,
    
    // Utility functions
    generateId: generateAriaId,
    checkContrast: meetsContrastRequirement
  }
}

// ============================================================================
// Focus Trap Hook
// ============================================================================

export function useFocusTrap(isActive = false) {
  const containerRef = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current)
    } else if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [isActive])

  return containerRef
}

// ============================================================================
// Keyboard Navigation Hook
// ============================================================================

export function useKeyboardNavigation(items = [], options = {}) {
  const {
    loop = true,
    orientation = 'vertical', // 'vertical' | 'horizontal' | 'both'
    onActivate = () => {}
  } = options

  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)

  const handleKeyDown = useCallback((event) => {
    if (!items.length) return

    const { key } = event
    let newIndex = activeIndex

    const isVertical = orientation === 'vertical' || orientation === 'both'
    const isHorizontal = orientation === 'horizontal' || orientation === 'both'

    switch (key) {
      case 'ArrowDown':
        if (isVertical) {
          event.preventDefault()
          newIndex = loop 
            ? (activeIndex + 1) % items.length
            : Math.min(activeIndex + 1, items.length - 1)
        }
        break

      case 'ArrowUp':
        if (isVertical) {
          event.preventDefault()
          newIndex = loop
            ? activeIndex <= 0 ? items.length - 1 : activeIndex - 1
            : Math.max(activeIndex - 1, 0)
        }
        break

      case 'ArrowRight':
        if (isHorizontal) {
          event.preventDefault()
          newIndex = loop 
            ? (activeIndex + 1) % items.length
            : Math.min(activeIndex + 1, items.length - 1)
        }
        break

      case 'ArrowLeft':
        if (isHorizontal) {
          event.preventDefault()
          newIndex = loop
            ? activeIndex <= 0 ? items.length - 1 : activeIndex - 1
            : Math.max(activeIndex - 1, 0)
        }
        break

      case 'Home':
        event.preventDefault()
        newIndex = 0
        break

      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        if (activeIndex >= 0 && activeIndex < items.length) {
          onActivate(items[activeIndex], activeIndex)
        }
        break

      case 'Escape':
        setActiveIndex(-1)
        break
    }

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, items, loop, orientation, onActivate])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const setActiveItem = useCallback((index) => {
    if (index >= 0 && index < items.length) {
      setActiveIndex(index)
    }
  }, [items.length])

  const resetNavigation = useCallback(() => {
    setActiveIndex(-1)
  }, [])

  return {
    containerRef,
    activeIndex,
    setActiveItem,
    resetNavigation,
    isActive: (index) => index === activeIndex
  }
}

// ============================================================================
// ARIA Describedby Hook
// ============================================================================

export function useAriaDescribedBy() {
  const [descriptions, setDescriptions] = useState([])
  const elementRef = useRef(null)

  const addDescription = useCallback((id, text) => {
    setDescriptions(prev => {
      const exists = prev.find(desc => desc.id === id)
      if (exists) {
        return prev.map(desc => desc.id === id ? { id, text } : desc)
      }
      return [...prev, { id, text }]
    })
  }, [])

  const removeDescription = useCallback((id) => {
    setDescriptions(prev => prev.filter(desc => desc.id !== id))
  }, [])

  useEffect(() => {
    if (elementRef.current) {
      const ids = descriptions.map(desc => desc.id).join(' ')
      elementRef.current.setAttribute('aria-describedby', ids)
    }
  }, [descriptions])

  return {
    elementRef,
    addDescription,
    removeDescription,
    descriptions
  }
}

// ============================================================================
// Live Region Hook
// ============================================================================

export function useLiveRegion(priority = 'polite') {
  const regionRef = useRef(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!regionRef.current) {
      const region = document.createElement('div')
      region.setAttribute('aria-live', priority)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
      regionRef.current = region
    }

    return () => {
      if (regionRef.current) {
        document.body.removeChild(regionRef.current)
        regionRef.current = null
      }
    }
  }, [priority])

  const announce = useCallback((text) => {
    setMessage(text)
    if (regionRef.current) {
      // Clear and reset to ensure announcement
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = text
        }
      }, 100)
    }
  }, [])

  return { announce, message }
}

// ============================================================================
// Export all hooks
// ============================================================================

export default useAccessibility