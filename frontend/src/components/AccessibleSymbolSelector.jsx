/**
 * Accessible Symbol Selector Component
 * Enhanced symbol selector with comprehensive accessibility features
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import useAccessibility, { useKeyboardNavigation, useFocusTrap } from '../hooks/useAccessibility'

const AccessibleSymbolSelector = ({
  symbols = [],
  selectedSymbol = '',
  onSymbolChange = () => {},
  placeholder = 'Search symbols...',
  maxResults = 50,
  className = '',
  disabled = false,
  required = false,
  label = 'Select Trading Symbol',
  helpText = '',
  error = ''
}) => {
  // ============================================================================
  // State Management
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSymbols, setFilteredSymbols] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [hasInteracted, setHasInteracted] = useState(false)

  // ============================================================================
  // Refs
  // ============================================================================

  const inputRef = useRef(null)
  const listboxRef = useRef(null)
  const optionRefs = useRef({})

  // ============================================================================
  // Accessibility Hooks
  // ============================================================================

  const {
    announce,
    announceError,
    saveFocus,
    restoreFocus,
    generateId,
    isHighContrast
  } = useAccessibility()

  const focusTrapRef = useFocusTrap(isOpen)

  const {
    containerRef: navigationRef,
    activeIndex,
    setActiveItem,
    resetNavigation,
    isActive
  } = useKeyboardNavigation(filteredSymbols, {
    orientation: 'vertical',
    loop: true,
    onActivate: (symbol) => {
      handleSymbolSelect(symbol)
    }
  })

  // ============================================================================
  // IDs for ARIA relationships
  // ============================================================================

  const comboboxId = generateId('combobox')
  const listboxId = generateId('listbox')
  const labelId = generateId('label')
  const descriptionId = generateId('description')
  const errorId = generateId('error')

  // ============================================================================
  // Symbol Filtering
  // ============================================================================

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSymbols(symbols.slice(0, maxResults))
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = symbols
      .filter(symbol => 
        symbol.value.toLowerCase().includes(query) ||
        symbol.label.toLowerCase().includes(query) ||
        symbol.description?.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.value.toLowerCase() === query ? 1 : 0
        const bExact = b.value.toLowerCase() === query ? 1 : 0
        if (aExact !== bExact) return bExact - aExact

        // Then prioritize starts with
        const aStarts = a.value.toLowerCase().startsWith(query) ? 1 : 0
        const bStarts = b.value.toLowerCase().startsWith(query) ? 1 : 0
        if (aStarts !== bStarts) return bStarts - aStarts

        // Finally alphabetical
        return a.value.localeCompare(b.value)
      })
      .slice(0, maxResults)

    setFilteredSymbols(filtered)
    setHighlightedIndex(filtered.length > 0 ? 0 : -1)

    // Announce results to screen readers
    if (hasInteracted) {
      const resultCount = filtered.length
      if (resultCount === 0) {
        announce('No symbols found', 'polite')
      } else if (resultCount === 1) {
        announce('1 symbol found', 'polite')
      } else {
        announce(`${resultCount} symbols found`, 'polite')
      }
    }
  }, [searchQuery, symbols, maxResults, announce, hasInteracted])

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleInputChange = useCallback((event) => {
    const value = event.target.value
    setSearchQuery(value)
    setHasInteracted(true)
    
    if (!isOpen && value) {
      setIsOpen(true)
      saveFocus()
    }
  }, [isOpen, saveFocus])

  const handleSymbolSelect = useCallback((symbol) => {
    if (!symbol) return

    setSearchQuery(symbol.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    resetNavigation()
    onSymbolChange(symbol.value)
    
    // Announce selection
    announce(`Selected ${symbol.label}`, 'polite')
    
    // Return focus to input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [onSymbolChange, announce, resetNavigation])

  const handleInputKeyDown = useCallback((event) => {
    const { key } = event

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          saveFocus()
        }
        if (filteredSymbols.length > 0) {
          const newIndex = highlightedIndex < 0 ? 0 : Math.min(highlightedIndex + 1, filteredSymbols.length - 1)
          setHighlightedIndex(newIndex)
          setActiveItem(newIndex)
          
          // Scroll into view
          const option = optionRefs.current[newIndex]
          if (option) {
            option.scrollIntoView({ block: 'nearest' })
          }
        }
        break

      case 'ArrowUp':
        event.preventDefault()
        if (isOpen && filteredSymbols.length > 0) {
          const newIndex = highlightedIndex <= 0 ? filteredSymbols.length - 1 : highlightedIndex - 1
          setHighlightedIndex(newIndex)
          setActiveItem(newIndex)
          
          // Scroll into view
          const option = optionRefs.current[newIndex]
          if (option) {
            option.scrollIntoView({ block: 'nearest' })
          }
        }
        break

      case 'Enter':
        event.preventDefault()
        if (isOpen && highlightedIndex >= 0 && filteredSymbols[highlightedIndex]) {
          handleSymbolSelect(filteredSymbols[highlightedIndex])
        } else if (!isOpen) {
          setIsOpen(true)
          saveFocus()
        }
        break

      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
          setHighlightedIndex(-1)
          resetNavigation()
          restoreFocus()
        }
        break

      case 'Tab':
        if (isOpen) {
          setIsOpen(false)
          setHighlightedIndex(-1)
          resetNavigation()
        }
        break

      case 'Home':
        if (isOpen) {
          event.preventDefault()
          setHighlightedIndex(0)
          setActiveItem(0)
        }
        break

      case 'End':
        if (isOpen) {
          event.preventDefault()
          const lastIndex = filteredSymbols.length - 1
          setHighlightedIndex(lastIndex)
          setActiveItem(lastIndex)
        }
        break
    }
  }, [isOpen, highlightedIndex, filteredSymbols, handleSymbolSelect, saveFocus, restoreFocus, setActiveItem, resetNavigation])

  const handleInputFocus = useCallback(() => {
    if (filteredSymbols.length > 0) {
      setIsOpen(true)
      saveFocus()
    }
  }, [filteredSymbols.length, saveFocus])

  const handleInputBlur = useCallback((event) => {
    // Only close if focus is moving outside the component
    if (!event.relatedTarget || !focusTrapRef.current?.contains(event.relatedTarget)) {
      setTimeout(() => {
        setIsOpen(false)
        setHighlightedIndex(-1)
        resetNavigation()
      }, 100)
    }
  }, [resetNavigation, focusTrapRef])

  const handleOptionClick = useCallback((symbol, index) => {
    handleSymbolSelect(symbol)
  }, [handleSymbolSelect])

  const handleOptionMouseEnter = useCallback((index) => {
    setHighlightedIndex(index)
    setActiveItem(index)
  }, [setActiveItem])

  // ============================================================================
  // Error Handling
  // ============================================================================

  useEffect(() => {
    if (error) {
      announceError(error)
    }
  }, [error, announceError])

  // ============================================================================
  // Outside Click Handler
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (focusTrapRef.current && !focusTrapRef.current.contains(event.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
        resetNavigation()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, resetNavigation, focusTrapRef])

  // ============================================================================
  // Get Selected Symbol Display
  // ============================================================================

  const selectedSymbolObj = symbols.find(s => s.value === selectedSymbol)
  const displayValue = selectedSymbolObj ? selectedSymbolObj.label : searchQuery

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div 
      className={`accessible-symbol-selector ${className}`}
      ref={focusTrapRef}
    >
      {/* Label */}
      <label 
        id={labelId}
        htmlFor={comboboxId}
        className="symbol-selector-label"
      >
        {label}
        {required && <span aria-label="required" className="required-indicator"> *</span>}
      </label>

      {/* Help Text */}
      {helpText && (
        <div 
          id={descriptionId}
          className="symbol-selector-help"
        >
          {helpText}
        </div>
      )}

      {/* Combobox Container */}
      <div className="symbol-selector-container">
        <input
          ref={inputRef}
          id={comboboxId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-labelledby={labelId}
          aria-describedby={[
            helpText ? descriptionId : '',
            error ? errorId : ''
          ].filter(Boolean).join(' ') || undefined}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`symbol-selector-input ${error ? 'error' : ''} ${isHighContrast ? 'high-contrast' : ''}`}
        />

        {/* Dropdown Indicator */}
        <div 
          className="dropdown-indicator"
          aria-hidden="true"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
            className={isOpen ? 'rotated' : ''}
          >
            <path 
              d="M4 6l4 4 4-4" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
        </div>

        {/* Listbox */}
        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className={`symbol-selector-listbox ${isHighContrast ? 'high-contrast' : ''}`}
            tabIndex={-1}
          >
            {filteredSymbols.length === 0 ? (
              <li 
                role="option"
                aria-selected="false"
                className="no-results"
              >
                No symbols found
              </li>
            ) : (
              filteredSymbols.map((symbol, index) => (
                <li
                  key={symbol.value}
                  ref={el => optionRefs.current[index] = el}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={`symbol-option ${highlightedIndex === index ? 'highlighted' : ''} ${selectedSymbol === symbol.value ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(symbol, index)}
                  onMouseEnter={() => handleOptionMouseEnter(index)}
                >
                  <div className="symbol-main">
                    <span className="symbol-value">{symbol.value}</span>
                    <span className="symbol-label">{symbol.label}</span>
                  </div>
                  {symbol.description && (
                    <div className="symbol-description">
                      {symbol.description}
                    </div>
                  )}
                  <div className="symbol-category">
                    {symbol.category}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div 
          id={errorId}
          role="alert"
          className="symbol-selector-error"
          aria-live="polite"
        >
          <span className="error-icon" aria-hidden="true">⚠️</span>
          {error}
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <div>Use arrow keys to navigate options. Press Enter to select. Press Escape to close.</div>
        <div>Type to filter symbols. {filteredSymbols.length} symbols available.</div>
      </div>
    </div>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = `
.accessible-symbol-selector {
  position: relative;
  width: 100%;
}

.symbol-selector-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 14px;
}

.required-indicator {
  color: #dc2626;
}

.symbol-selector-help {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.symbol-selector-container {
  position: relative;
  display: flex;
  align-items: center;
}

.symbol-selector-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.symbol-selector-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.symbol-selector-input.error {
  border-color: #dc2626;
}

.symbol-selector-input.error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.symbol-selector-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.dropdown-indicator {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  color: #6b7280;
  transition: transform 0.2s;
}

.dropdown-indicator.rotated {
  transform: rotate(180deg);
}

.symbol-selector-listbox {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  padding: 4px;
}

.symbol-option {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.symbol-option:hover,
.symbol-option.highlighted {
  background: #f3f4f6;
}

.symbol-option.selected {
  background: #eff6ff;
  color: #1d4ed8;
}

.symbol-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.symbol-value {
  font-weight: 600;
  font-size: 14px;
}

.symbol-label {
  color: #6b7280;
  font-size: 13px;
}

.symbol-description {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.symbol-category {
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 4px;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #6b7280;
  font-style: italic;
}

.symbol-selector-error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

.error-icon {
  font-size: 14px;
}

/* High Contrast Mode */
.high-contrast-mode .symbol-selector-input,
.symbol-selector-input.high-contrast {
  border: 2px solid #000000;
  background: #ffffff;
  color: #000000;
}

.high-contrast-mode .symbol-selector-input:focus,
.symbol-selector-input.high-contrast:focus {
  border-color: #000000;
  box-shadow: 0 0 0 3px #000000;
}

.high-contrast-mode .symbol-selector-listbox,
.symbol-selector-listbox.high-contrast {
  border: 2px solid #000000;
  background: #ffffff;
}

.high-contrast-mode .symbol-option:hover,
.high-contrast-mode .symbol-option.highlighted {
  background: #000000;
  color: #ffffff;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .symbol-selector-input,
  .dropdown-indicator {
    transition: none;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`

export default AccessibleSymbolSelector