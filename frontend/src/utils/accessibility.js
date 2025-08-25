/**
 * Accessibility Utilities for NovaSignal
 * Comprehensive accessibility helpers and utilities
 */

// ============================================================================
// ARIA Management
// ============================================================================

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateAriaId(prefix = 'aria') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Create live region for dynamic content announcements
 */
export function createLiveRegion(id, priority = 'polite') {
  let liveRegion = document.getElementById(id)
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = id
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('class', 'sr-only')
    document.body.appendChild(liveRegion)
  }
  
  return liveRegion
}

/**
 * Update live region content
 */
export function updateLiveRegion(id, message) {
  const liveRegion = document.getElementById(id)
  if (liveRegion) {
    liveRegion.textContent = message
  }
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Trap focus within a container (for modals, dropdowns)
 */
export function trapFocus(container) {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  
  // Focus first element
  if (firstElement) {
    firstElement.focus()
  }
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container) {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')
  
  const elements = container.querySelectorAll(focusableSelectors)
  
  return Array.from(elements).filter(element => {
    return !element.disabled && 
           !element.hidden && 
           !element.getAttribute('aria-hidden') &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0
  })
}

/**
 * Manage focus restoration
 */
export class FocusManager {
  constructor() {
    this.focusStack = []
  }
  
  saveFocus() {
    this.focusStack.push(document.activeElement)
  }
  
  restoreFocus() {
    const previousFocus = this.focusStack.pop()
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus()
    }
  }
  
  clearFocusStack() {
    this.focusStack = []
  }
}

// Global focus manager instance
export const globalFocusManager = new FocusManager()

// ============================================================================
// Skip Links
// ============================================================================

/**
 * Create skip link for keyboard navigation
 */
export function createSkipLink(targetId, text = 'Skip to main content') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'skip-link'
  skipLink.setAttribute('role', 'button')
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  })
  
  return skipLink
}

// ============================================================================
// Color Contrast & Visual Accessibility
// ============================================================================

/**
 * Check color contrast ratio
 */
export function getContrastRatio(foreground, background) {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number)
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color combination meets WCAG standards
 */
export function meetsContrastRequirement(foreground, background, level = 'AA', size = 'normal') {
  const ratio = getContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5
  }
}

// ============================================================================
// Motion & Animation Accessibility
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Respect motion preferences in animations
 */
export function respectMotionPreference(animation) {
  if (prefersReducedMotion()) {
    return {
      ...animation,
      duration: 0,
      delay: 0
    }
  }
  return animation
}

// ============================================================================
// Screen Reader Utilities
// ============================================================================

/**
 * Hide content from screen readers
 */
export function hideFromScreenReaders(element) {
  element.setAttribute('aria-hidden', 'true')
}

/**
 * Show content to screen readers only
 */
export function showToScreenReadersOnly(element) {
  element.className = (element.className + ' sr-only').trim()
}

/**
 * Format numbers for screen readers
 */
export function formatNumberForScreenReader(value) {
  if (typeof value !== 'number') return value
  
  // Format large numbers with word descriptions
  if (Math.abs(value) >= 1000000) {
    const millions = (value / 1000000).toFixed(1)
    return `${millions} million`
  } else if (Math.abs(value) >= 1000) {
    const thousands = (value / 1000).toFixed(1)
    return `${thousands} thousand`
  }
  
  return value.toString()
}

/**
 * Format percentage for screen readers
 */
export function formatPercentageForScreenReader(value) {
  const sign = value >= 0 ? 'positive' : 'negative'
  const absValue = Math.abs(value)
  return `${sign} ${absValue.toFixed(2)} percent`
}

/**
 * Format price change for screen readers
 */
export function formatPriceChangeForScreenReader(current, previous) {
  const change = current - previous
  const percentChange = ((change / previous) * 100)
  const direction = change >= 0 ? 'increased' : 'decreased'
  
  return `Price ${direction} by ${Math.abs(change).toFixed(2)} dollars, ${formatPercentageForScreenReader(percentChange)}`
}

// ============================================================================
// Form Accessibility
// ============================================================================

/**
 * Associate label with form control
 */
export function associateLabel(labelElement, controlElement, labelText) {
  const controlId = controlElement.id || generateAriaId('control')
  controlElement.id = controlId
  labelElement.setAttribute('for', controlId)
  labelElement.textContent = labelText
}

/**
 * Add error message to form control
 */
export function addErrorToControl(controlElement, errorMessage) {
  const errorId = generateAriaId('error')
  const errorElement = document.createElement('div')
  errorElement.id = errorId
  errorElement.textContent = errorMessage
  errorElement.className = 'error-message'
  errorElement.setAttribute('role', 'alert')
  
  controlElement.setAttribute('aria-describedby', errorId)
  controlElement.setAttribute('aria-invalid', 'true')
  controlElement.parentNode.appendChild(errorElement)
  
  return errorElement
}

/**
 * Remove error from form control
 */
export function removeErrorFromControl(controlElement) {
  const errorId = controlElement.getAttribute('aria-describedby')
  if (errorId) {
    const errorElement = document.getElementById(errorId)
    if (errorElement) {
      errorElement.remove()
    }
  }
  
  controlElement.removeAttribute('aria-describedby')
  controlElement.removeAttribute('aria-invalid')
}

// ============================================================================
// Chart Accessibility
// ============================================================================

/**
 * Generate chart description for screen readers
 */
export function generateChartDescription(data, type = 'candlestick') {
  if (!data || data.length === 0) {
    return 'Chart data is not available'
  }
  
  const first = data[0]
  const last = data[data.length - 1]
  const highest = Math.max(...data.map(d => d.high || d.value || d.y))
  const lowest = Math.min(...data.map(d => d.low || d.value || d.y))
  
  if (type === 'candlestick') {
    const trend = last.close > first.open ? 'upward' : 'downward'
    return `Candlestick chart showing ${trend} trend. ` +
           `Opening price: ${first.open}, closing price: ${last.close}. ` +
           `Highest point: ${highest}, lowest point: ${lowest}. ` +
           `Data spans ${data.length} time periods.`
  }
  
  return `Chart with ${data.length} data points. ` +
         `Range from ${lowest} to ${highest}.`
}

/**
 * Create data table alternative for charts
 */
export function createChartDataTable(data, containerId) {
  const container = document.getElementById(containerId)
  if (!container || !data.length) return
  
  const table = document.createElement('table')
  table.className = 'chart-data-table sr-only'
  table.setAttribute('role', 'table')
  table.setAttribute('aria-label', 'Chart data in tabular format')
  
  // Create header
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  const headers = Object.keys(data[0])
  
  headers.forEach(header => {
    const th = document.createElement('th')
    th.textContent = header.charAt(0).toUpperCase() + header.slice(1)
    th.setAttribute('scope', 'col')
    headerRow.appendChild(th)
  })
  
  thead.appendChild(headerRow)
  table.appendChild(thead)
  
  // Create body
  const tbody = document.createElement('tbody')
  data.forEach((row, index) => {
    const tr = document.createElement('tr')
    headers.forEach(header => {
      const td = document.createElement('td')
      td.textContent = row[header]
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  
  table.appendChild(tbody)
  container.appendChild(table)
  
  return table
}

// ============================================================================
// High Contrast Mode
// ============================================================================

/**
 * Detect high contrast mode
 */
export function detectHighContrastMode() {
  // Create test element
  const testElement = document.createElement('div')
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.background = 'rgb(31, 31, 31)'
  testElement.style.color = 'rgb(255, 255, 255)'
  document.body.appendChild(testElement)
  
  const computedStyle = window.getComputedStyle(testElement)
  const isHighContrast = computedStyle.backgroundColor !== 'rgb(31, 31, 31)' ||
                        computedStyle.color !== 'rgb(255, 255, 255)'
  
  document.body.removeChild(testElement)
  return isHighContrast
}

/**
 * Apply high contrast styles
 */
export function applyHighContrastMode() {
  document.body.classList.add('high-contrast-mode')
}

/**
 * Remove high contrast styles
 */
export function removeHighContrastMode() {
  document.body.classList.remove('high-contrast-mode')
}

// ============================================================================
// Tooltip Accessibility
// ============================================================================

/**
 * Make tooltip accessible
 */
export function makeTooltipAccessible(triggerElement, tooltipElement, tooltipText) {
  const tooltipId = generateAriaId('tooltip')
  
  tooltipElement.id = tooltipId
  tooltipElement.setAttribute('role', 'tooltip')
  tooltipElement.textContent = tooltipText
  
  triggerElement.setAttribute('aria-describedby', tooltipId)
  
  // Handle keyboard activation
  triggerElement.addEventListener('focus', () => {
    tooltipElement.style.display = 'block'
  })
  
  triggerElement.addEventListener('blur', () => {
    tooltipElement.style.display = 'none'
  })
  
  triggerElement.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      tooltipElement.style.display = 'none'
      triggerElement.focus()
    }
  })
}

// ============================================================================
// Export all utilities
// ============================================================================

export default {
  generateAriaId,
  announceToScreenReader,
  createLiveRegion,
  updateLiveRegion,
  trapFocus,
  getFocusableElements,
  globalFocusManager,
  createSkipLink,
  getContrastRatio,
  meetsContrastRequirement,
  prefersReducedMotion,
  respectMotionPreference,
  hideFromScreenReaders,
  showToScreenReadersOnly,
  formatNumberForScreenReader,
  formatPercentageForScreenReader,
  formatPriceChangeForScreenReader,
  associateLabel,
  addErrorToControl,
  removeErrorFromControl,
  generateChartDescription,
  createChartDataTable,
  detectHighContrastMode,
  applyHighContrastMode,
  removeHighContrastMode,
  makeTooltipAccessible
}