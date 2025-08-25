/**
 * Symbol Selector Component
 * TypeScript implementation with comprehensive type safety
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { 
  Symbol, 
  MarketType, 
  SymbolSelectorProps,
  SearchFilters,
  SearchResult,
  UseSymbolDataReturn,
  BaseComponentProps
} from '../types'

// ============================================================================
// Component Props Interface
// ============================================================================

interface SymbolSelectorComponentProps extends BaseComponentProps {
  /** Currently selected symbol */
  selectedSymbol: string
  /** Available symbols */
  symbols: Symbol[]
  /** Symbol change callback */
  onSymbolChange: (symbol: string) => void
  /** Market filter */
  marketFilter?: MarketType
  /** Show search input */
  showSearch?: boolean
  /** Show favorites */
  showFavorites?: boolean
  /** Maximum results to display */
  maxResults?: number
  /** Placeholder text */
  placeholder?: string
  /** Auto-focus search input */
  autoFocus?: boolean
  /** Custom symbol renderer */
  renderSymbol?: (symbol: Symbol) => React.ReactNode
  /** Search delay in milliseconds */
  searchDelay?: number
}

// ============================================================================
// Internal State Types
// ============================================================================

interface SymbolSelectorState {
  /** Search query */
  searchQuery: string
  /** Search filters */
  filters: SearchFilters
  /** Show dropdown */
  isOpen: boolean
  /** Selected index for keyboard navigation */
  selectedIndex: number
  /** Favorites list */
  favorites: string[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
}

// ============================================================================
// Hook for Symbol Data Management
// ============================================================================

const useSymbolData = (
  symbols: Symbol[],
  searchQuery: string,
  filters: SearchFilters,
  maxResults: number = 50
): UseSymbolDataReturn => {
  // Filter and search symbols
  const filteredSymbols = useMemo((): Symbol[] => {
    let filtered = symbols

    // Apply market filter
    if (filters.market) {
      filtered = filtered.filter(symbol => symbol.category === filters.market)
    }

    // Apply active filter
    if (filters.activeOnly) {
      filtered = filtered.filter(symbol => symbol.isActive !== false)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(symbol => 
        symbol.value.toLowerCase().includes(query) ||
        symbol.label.toLowerCase().includes(query) ||
        symbol.description.toLowerCase().includes(query)
      )
    }

    // Apply favorites filter
    if (filters.favoritesOnly && filters.category) {
      // Assuming favorites are stored somewhere
      const favorites = JSON.parse(localStorage.getItem('symbol_favorites') || '[]')
      filtered = filtered.filter(symbol => favorites.includes(symbol.value))
    }

    // Limit results
    return filtered.slice(0, maxResults)
  }, [symbols, searchQuery, filters, maxResults])

  // Search function with scoring
  const searchSymbols = useCallback((query: string): Symbol[] => {
    if (!query.trim()) return filteredSymbols

    const queryLower = query.toLowerCase()
    
    return filteredSymbols
      .map(symbol => ({
        symbol,
        score: calculateRelevanceScore(symbol, queryLower)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ symbol }) => symbol)
  }, [filteredSymbols])

  // Calculate relevance score for search
  const calculateRelevanceScore = (symbol: Symbol, query: string): number => {
    let score = 0
    
    // Exact match gets highest score
    if (symbol.value.toLowerCase() === query) score += 100
    if (symbol.label.toLowerCase() === query) score += 90
    
    // Starts with match
    if (symbol.value.toLowerCase().startsWith(query)) score += 50
    if (symbol.label.toLowerCase().startsWith(query)) score += 40
    
    // Contains match
    if (symbol.value.toLowerCase().includes(query)) score += 20
    if (symbol.label.toLowerCase().includes(query)) score += 15
    if (symbol.description.toLowerCase().includes(query)) score += 10
    
    return score
  }

  // Filter by market
  const filterByMarket = useCallback((market: MarketType): Symbol[] => {
    return symbols.filter(symbol => symbol.category === market)
  }, [symbols])

  // Favorites management
  const addToFavorites = useCallback((symbolValue: string): void => {
    const favorites = JSON.parse(localStorage.getItem('symbol_favorites') || '[]')
    if (!favorites.includes(symbolValue)) {
      favorites.push(symbolValue)
      localStorage.setItem('symbol_favorites', JSON.stringify(favorites))
    }
  }, [])

  const removeFromFavorites = useCallback((symbolValue: string): void => {
    const favorites = JSON.parse(localStorage.getItem('symbol_favorites') || '[]')
    const updated = favorites.filter((fav: string) => fav !== symbolValue)
    localStorage.setItem('symbol_favorites', JSON.stringify(updated))
  }, [])

  const favorites = useMemo((): string[] => {
    return JSON.parse(localStorage.getItem('symbol_favorites') || '[]')
  }, [])

  return {
    symbols: filteredSymbols,
    selectedSymbol: '', // This would come from props
    setSelectedSymbol: () => {}, // This would be handled by parent
    searchSymbols,
    filterByMarket,
    addToFavorites,
    removeFromFavorites,
    favorites,
    loading: false,
    error: null
  }
}

// ============================================================================
// Main Component
// ============================================================================

const SymbolSelector: React.FC<SymbolSelectorComponentProps> = ({
  selectedSymbol,
  symbols,
  onSymbolChange,
  marketFilter,
  showSearch = true,
  showFavorites = true,
  maxResults = 50,
  placeholder = "Search symbols...",
  autoFocus = false,
  renderSymbol,
  searchDelay = 300,
  className = '',
  style,
  testId = 'symbol-selector',
  disabled = false,
  loading = false
}) => {
  // ============================================================================
  // State Management
  // ============================================================================

  const [state, setState] = useState<SymbolSelectorState>({
    searchQuery: '',
    filters: {
      market: marketFilter,
      activeOnly: true,
      favoritesOnly: false
    },
    isOpen: false,
    selectedIndex: -1,
    favorites: [],
    loading: false,
    error: null
  })

  // ============================================================================
  // Refs
  // ============================================================================

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<number>()

  // ============================================================================
  // Custom Hooks
  // ============================================================================

  const symbolData = useSymbolData(symbols, state.searchQuery, state.filters, maxResults)

  // ============================================================================
  // Effects
  // ============================================================================

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, isOpen: false, selectedIndex: -1 }))
      }
    }

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [state.isOpen])

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value

    setState(prev => ({
      ...prev,
      searchQuery: query,
      isOpen: true,
      selectedIndex: -1
    }))

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Trigger search after delay
      symbolData.searchSymbols(query)
    }, searchDelay)
  }, [symbolData, searchDelay])

  const handleSymbolSelect = useCallback((symbol: Symbol): void => {
    onSymbolChange(symbol.value)
    setState(prev => ({
      ...prev,
      searchQuery: symbol.label,
      isOpen: false,
      selectedIndex: -1
    }))
  }, [onSymbolChange])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    const { key } = event
    const filteredSymbols = symbolData.symbols

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        setState(prev => ({
          ...prev,
          isOpen: true,
          selectedIndex: Math.min(prev.selectedIndex + 1, filteredSymbols.length - 1)
        }))
        break

      case 'ArrowUp':
        event.preventDefault()
        setState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, -1)
        }))
        break

      case 'Enter':
        event.preventDefault()
        if (state.selectedIndex >= 0 && filteredSymbols[state.selectedIndex]) {
          const selectedSymbol = filteredSymbols[state.selectedIndex]
          if (selectedSymbol) {
            handleSymbolSelect(selectedSymbol)
          }
        }
        break

      case 'Escape':
        setState(prev => ({
          ...prev,
          isOpen: false,
          selectedIndex: -1
        }))
        inputRef.current?.blur()
        break

      case 'Tab':
        setState(prev => ({
          ...prev,
          isOpen: false,
          selectedIndex: -1
        }))
        break
    }
  }, [state.selectedIndex, symbolData.symbols, handleSymbolSelect])

  const handleFavoriteToggle = useCallback((symbolValue: string, event: React.MouseEvent): void => {
    event.stopPropagation()
    
    if (symbolData.favorites.includes(symbolValue)) {
      symbolData.removeFromFavorites(symbolValue)
    } else {
      symbolData.addToFavorites(symbolValue)
    }
  }, [symbolData])

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderSymbolItem = useCallback((symbol: Symbol, index: number): React.ReactNode => {
    const isSelected = index === state.selectedIndex
    const isFavorite = symbolData.favorites.includes(symbol.value)
    const isCurrentlySelected = symbol.value === selectedSymbol

    if (renderSymbol) {
      return renderSymbol(symbol)
    }

    return (
      <div
        key={symbol.value}
        className={`symbol-item ${isSelected ? 'selected' : ''} ${isCurrentlySelected ? 'current' : ''}`}
        onClick={() => handleSymbolSelect(symbol)}
        role="option"
        aria-selected={isSelected}
        data-testid={`symbol-option-${symbol.value}`}
      >
        <div className="symbol-info">
          <div className="symbol-label">{symbol.label}</div>
          <div className="symbol-description">{symbol.description}</div>
          <div className="symbol-category">{symbol.category}</div>
        </div>
        
        {showFavorites && (
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => handleFavoriteToggle(symbol.value, e)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            data-testid={`favorite-btn-${symbol.value}`}
          >
            ⭐
          </button>
        )}
      </div>
    )
  }, [
    state.selectedIndex,
    symbolData.favorites,
    selectedSymbol,
    renderSymbol,
    handleSymbolSelect,
    handleFavoriteToggle,
    showFavorites
  ])

  // ============================================================================
  // Component Render
  // ============================================================================

  return (
    <div
      className={`symbol-selector ${className}`}
      style={style}
      data-testid={testId}
      ref={dropdownRef}
    >
      {/* Search Input */}
      {showSearch && (
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            className={`search-input ${disabled ? 'disabled' : ''}`}
            placeholder={placeholder}
            value={state.searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setState(prev => ({ ...prev, isOpen: true }))}
            disabled={disabled || loading}
            aria-label="Search symbols"
            aria-expanded={state.isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            data-testid="symbol-search-input"
          />
          
          {(loading || state.loading) && (
            <div className="search-spinner" data-testid="search-spinner">
              ⏳
            </div>
          )}
        </div>
      )}

      {/* Dropdown List */}
      {state.isOpen && (
        <div
          className="symbol-dropdown"
          role="listbox"
          aria-label="Symbol options"
          data-testid="symbol-dropdown"
        >
          {symbolData.symbols.length === 0 ? (
            <div className="no-results" data-testid="no-results">
              No symbols found
            </div>
          ) : (
            symbolData.symbols.map((symbol, index) => renderSymbolItem(symbol, index))
          )}
        </div>
      )}

      {/* Error State */}
      {(state.error || symbolData.error) && (
        <div className="error-message" data-testid="error-message">
          {state.error || symbolData.error}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Export
// ============================================================================

export default SymbolSelector
export type { SymbolSelectorComponentProps }

// ============================================================================
// CSS Styles (would typically be in a separate file)
// ============================================================================

const styles = `
.symbol-selector {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #00d4aa;
  box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2);
}

.search-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-spinner {
  position: absolute;
  right: 8px;
  font-size: 12px;
}

.symbol-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.symbol-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #2a2a2a;
}

.symbol-item:hover,
.symbol-item.selected {
  background: #2a2a2a;
}

.symbol-item.current {
  background: #00d4aa;
  color: #000;
}

.symbol-info {
  flex: 1;
}

.symbol-label {
  font-weight: 600;
  margin-bottom: 2px;
}

.symbol-description {
  font-size: 12px;
  color: #888;
}

.symbol-category {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
}

.favorite-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
}

.favorite-btn:hover,
.favorite-btn.active {
  color: #ffd700;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 8px;
  background: #ff6b6b;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  margin-top: 4px;
}
`