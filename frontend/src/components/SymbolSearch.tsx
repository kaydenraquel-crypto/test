/**
 * Symbol Search Component for NovaSignal
 * Real-time symbol search with responsive design and accessibility
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  CircularProgress,
  Chip,
  Alert,
  InputAdornment,
  Fade,
  Skeleton
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BankIcon,
  CurrencyBitcoin as CryptoIcon,
  AttachMoney as ForexIcon,
  Grain as CommodityIcon
} from '@mui/icons-material'
import { useSymbolSearch } from '../hooks/useSymbolSearch'
import { SymbolSearchResult, MarketType } from '../types/symbol'

// ============================================================================
// Component Props
// ============================================================================

export interface SymbolSearchProps {
  /** Callback when a symbol is selected */
  onSymbolSelect?: (symbol: SymbolSearchResult) => void
  /** Placeholder text for search input */
  placeholder?: string
  /** Initial query value */
  initialQuery?: string
  /** Market filter */
  marketFilter?: MarketType
  /** Maximum number of results to show */
  maxResults?: number
  /** Whether to show market type chips */
  showMarketTypes?: boolean
  /** Custom styling */
  sx?: object
  /** Component size */
  size?: 'small' | 'medium' | 'large'
  /** Whether component is disabled */
  disabled?: boolean
  /** Show clear button */
  showClearButton?: boolean
  /** Custom width */
  width?: string | number
}

// ============================================================================
// Market Type Icons
// ============================================================================

const getMarketIcon = (type: MarketType) => {
  const iconProps = { fontSize: 'small' as const }
  
  switch (type) {
    case 'stocks':
      return <TrendingUpIcon {...iconProps} />
    case 'crypto':
      return <CryptoIcon {...iconProps} />
    case 'forex':
      return <ForexIcon {...iconProps} />
    case 'commodities':
      return <CommodityIcon {...iconProps} />
    default:
      return <BankIcon {...iconProps} />
  }
}

const getMarketColor = (type: MarketType) => {
  switch (type) {
    case 'stocks':
      return 'primary'
    case 'crypto':
      return 'warning'
    case 'forex':
      return 'success'
    case 'commodities':
      return 'info'
    default:
      return 'default'
  }
}

// ============================================================================
// Main Component
// ============================================================================

export const SymbolSearch: React.FC<SymbolSearchProps> = ({
  onSymbolSelect,
  placeholder = 'Search symbols...',
  initialQuery = '',
  marketFilter,
  maxResults = 10,
  showMarketTypes = true,
  sx,
  size = 'medium',
  disabled = false,
  showClearButton = true,
  width = '100%'
}) => {
  // ============================================================================
  // State and Refs
  // ============================================================================

  const [inputValue, setInputValue] = useState(initialQuery)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // Symbol Search Hook
  // ============================================================================

  const {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    clearResults,
    clearError
  } = useSymbolSearch({
    defaultMarket: marketFilter,
    defaultLimit: maxResults,
    enableCache: true,
    debounceDelay: 300
  })

  // ============================================================================
  // Effects
  // ============================================================================

  // Trigger search when input value changes
  useEffect(() => {
    if (inputValue.trim()) {
      search(inputValue, { market: marketFilter, limit: maxResults })
      setIsDropdownOpen(true)
    } else {
      clearResults()
      setIsDropdownOpen(false)
    }
    setSelectedIndex(-1)
  }, [inputValue, marketFilter, maxResults, search, clearResults])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    
    if (error) {
      clearError()
    }
  }

  const handleSymbolSelect = (symbol: SymbolSearchResult) => {
    setInputValue(symbol.symbol)
    setIsDropdownOpen(false)
    onSymbolSelect?.(symbol)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isDropdownOpen || results.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
        
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
        
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSymbolSelect(results[selectedIndex])
        }
        break
        
      case 'Escape':
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleClear = () => {
    setInputValue('')
    clearResults()
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderSearchInput = () => (
    <TextField
      ref={inputRef}
      fullWidth
      size={size}
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color={disabled ? 'disabled' : 'action'} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {isLoading && (
              <CircularProgress size={20} color="primary" />
            )}
            {showClearButton && inputValue && !isLoading && (
              <ClearIcon
                sx={{
                  cursor: disabled ? 'default' : 'pointer',
                  color: disabled ? 'disabled' : 'action.active',
                  '&:hover': !disabled && {
                    color: 'primary.main'
                  }
                }}
                onClick={disabled ? undefined : handleClear}
              />
            )}
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper'
        }
      }}
    />
  )

  const renderLoadingState = () => (
    <List sx={{ py: 1 }}>
      {Array.from({ length: 3 }, (_, index) => (
        <ListItem key={index} sx={{ py: 1 }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rectangular" width={24} height={24} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
            </Box>
            <Skeleton variant="rectangular" width={60} height={20} />
          </Box>
        </ListItem>
      ))}
    </List>
  )

  const renderEmptyState = () => {
    if (!hasSearched) return null
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {inputValue.trim() ? `No symbols found for "${inputValue}"` : 'Start typing to search symbols'}
        </Typography>
      </Box>
    )
  }

  const renderResultItem = (symbol: SymbolSearchResult, index: number) => (
    <ListItemButton
      key={`${symbol.symbol}-${symbol.exchange}`}
      selected={index === selectedIndex}
      onClick={() => handleSymbolSelect(symbol)}
      sx={{
        py: 1.5,
        px: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        },
        '&.Mui-selected': {
          backgroundColor: 'primary.selected'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        {getMarketIcon(symbol.type)}
      </Box>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {symbol.symbol}
            </Typography>
            {showMarketTypes && (
              <Chip
                size="small"
                label={symbol.type.toUpperCase()}
                color={getMarketColor(symbol.type)}
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.primary">
              {symbol.name}
            </Typography>
            {symbol.exchange && (
              <Typography variant="caption" color="text.secondary">
                {symbol.exchange}
                {symbol.currency && ` • ${symbol.currency}`}
                {symbol.region && ` • ${symbol.region}`}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItemButton>
  )

  const renderDropdown = () => {
    if (!isDropdownOpen) return null

    return (
      <Fade in={isDropdownOpen}>
        <Paper
          ref={dropdownRef}
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ m: 1 }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          {isLoading && renderLoadingState()}

          {!isLoading && !error && results.length === 0 && renderEmptyState()}

          {!isLoading && !error && results.length > 0 && (
            <List sx={{ py: 0.5 }}>
              {results.map((symbol, index) => renderResultItem(symbol, index))}
            </List>
          )}
        </Paper>
      </Fade>
    )
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        ...sx
      }}
    >
      {renderSearchInput()}
      {renderDropdown()}
    </Box>
  )
}

export default SymbolSearch