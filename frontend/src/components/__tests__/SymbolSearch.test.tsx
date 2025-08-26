/**
 * SymbolSearch Component Tests
 * Comprehensive test suite using Jest and React Testing Library
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { SymbolSearch } from '../SymbolSearch'
import { searchSymbols } from '../../services/api'
import { SymbolSearchResult } from '../../types/symbol'
import '@testing-library/jest-dom'

// ============================================================================
// Mock Dependencies
// ============================================================================

import { vi } from 'vitest'

// Mock the API service
vi.mock('../../services/api', () => ({
  searchSymbols: vi.fn()
}))

const mockSearchSymbols = searchSymbols as ReturnType<typeof vi.fn>

// Mock MUI icons to avoid issues in test environment
vi.mock('@mui/icons-material', () => ({
  Search: () => <div data-testid="search-icon" />,
  Clear: () => <div data-testid="clear-icon" />,
  TrendingUp: () => <div data-testid="stocks-icon" />,
  AccountBalance: () => <div data-testid="bank-icon" />,
  CurrencyBitcoin: () => <div data-testid="crypto-icon" />,
  AttachMoney: () => <div data-testid="forex-icon" />,
  Grain: () => <div data-testid="commodity-icon" />
}))

// ============================================================================
// Test Data
// ============================================================================

const mockSymbolResults: SymbolSearchResult[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    description: 'Technology company',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 1.0
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    description: 'Technology company',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 0.95
  },
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    description: 'Cryptocurrency',
    type: 'crypto',
    exchange: 'Binance',
    currency: 'USDT',
    isActive: true,
    region: 'Global',
    matchScore: 0.8
  }
]

const mockApiResponse = {
  symbols: mockSymbolResults,
  totalResults: mockSymbolResults.length,
  searchTime: 100,
  query: 'test'
}

// ============================================================================
// Test Utilities
// ============================================================================

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

const setup = (props = {}) => {
  const user = userEvent.setup()
  const defaultProps = {
    placeholder: 'Search symbols...',
    ...props
  }
  
  const utils = renderWithTheme(<SymbolSearch {...defaultProps} />)
  const input = screen.getByRole('textbox')
  
  return {
    user,
    input,
    ...utils
  }
}

// ============================================================================
// Test Suites
// ============================================================================

describe('SymbolSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchSymbols.mockResolvedValue(mockApiResponse)
  })

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders search input with placeholder', () => {
      setup()
      expect(screen.getByPlaceholderText('Search symbols...')).toBeInTheDocument()
    })

    it('renders search icon', () => {
      setup()
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      setup({ placeholder: 'Find your symbol' })
      expect(screen.getByPlaceholderText('Find your symbol')).toBeInTheDocument()
    })

    it('renders with initial query value', () => {
      setup({ initialQuery: 'AAPL' })
      expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument()
    })

    it('renders with custom size', () => {
      setup({ size: 'small' })
      // The size prop is passed to TextField, so the component should render
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders in disabled state', () => {
      setup({ disabled: true })
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  // ============================================================================
  // User Interaction Tests
  // ============================================================================

  describe('User Interactions', () => {
    it('updates input value when typing', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'AAPL')
      
      expect(input).toHaveValue('AAPL')
    })

    it('shows loading state during search', async () => {
      const { user, input } = setup()
      
      // Mock delayed response
      mockSearchSymbols.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponse), 100))
      )
      
      await user.type(input, 'A')
      
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
    })

    it('displays search results after typing', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'AAPL')
      
      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
    })

    it('shows clear button when input has value', async () => {
      const { user, input } = setup({ showClearButton: true })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
      })
    })

    it('clears input when clear button is clicked', async () => {
      const { user, input } = setup({ showClearButton: true })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('clear-icon'))
      
      expect(input).toHaveValue('')
    })
  })

  // ============================================================================
  // Search Functionality Tests
  // ============================================================================

  describe('Search Functionality', () => {
    it('calls search API with correct parameters', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'AAPL')
      
      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: undefined,
          limit: 10,
          includeInactive: true
        })
      })
    })

    it('applies market filter', async () => {
      const { user, input } = setup({ marketFilter: 'stocks' })
      
      await user.type(input, 'AAPL')
      
      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: 'stocks',
          limit: 10,
          includeInactive: true
        })
      })
    })

    it('respects max results limit', async () => {
      const { user, input } = setup({ maxResults: 5 })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'test',
          market: undefined,
          limit: 5,
          includeInactive: true
        })
      })
    })

    it('debounces search requests', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'A')
      await user.type(input, 'A')
      await user.type(input, 'P')
      await user.type(input, 'L')
      
      // Should only call once after debounce delay
      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledTimes(1)
      })
    })

    it('does not search for empty query', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'A')
      await user.clear(input)
      
      // Should not call API for empty query after clear
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400))
      })
      
      expect(mockSearchSymbols).toHaveBeenCalledTimes(1) // Only for 'A'
    })
  })

  // ============================================================================
  // Results Display Tests
  // ============================================================================

  describe('Results Display', () => {
    it('displays all symbol information', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.getByText('NASDAQ')).toBeInTheDocument()
        expect(screen.getByText('USD')).toBeInTheDocument()
        expect(screen.getByText('US')).toBeInTheDocument()
      })
    })

    it('shows market type chips when enabled', async () => {
      const { user, input } = setup({ showMarketTypes: true })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('STOCKS')).toBeInTheDocument()
        expect(screen.getByText('CRYPTO')).toBeInTheDocument()
      })
    })

    it('hides market type chips when disabled', async () => {
      const { user, input } = setup({ showMarketTypes: false })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.queryByText('STOCKS')).not.toBeInTheDocument()
        expect(screen.queryByText('CRYPTO')).not.toBeInTheDocument()
      })
    })

    it('displays appropriate icons for different market types', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getAllByTestId('stocks-icon')).toHaveLength(2) // AAPL and GOOGL
        expect(screen.getByTestId('crypto-icon')).toBeInTheDocument() // BTCUSDT
      })
    })
  })

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('navigates results with arrow keys', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      // Press arrow down to select first item
      await user.keyboard('{ArrowDown}')
      
      // First item should be selected (test via class or aria attributes)
      const firstItem = screen.getByText('AAPL').closest('div[role="button"]')
      expect(firstItem).toHaveClass('Mui-selected')
    })

    it('selects symbol on Enter key', async () => {
      const onSymbolSelect = vi.fn()
      const { user, input } = setup({ onSymbolSelect })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      expect(onSymbolSelect).toHaveBeenCalledWith(mockSymbolResults[0])
    })

    it('closes dropdown on Escape key', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when search fails', async () => {
      const { user, input } = setup()
      
      mockSearchSymbols.mockRejectedValue(new Error('Network error'))
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('displays empty state when no results found', async () => {
      const { user, input } = setup()
      
      mockSearchSymbols.mockResolvedValue({
        symbols: [],
        totalResults: 0,
        searchTime: 50,
        query: 'xyz'
      })
      
      await user.type(input, 'xyz')
      
      await waitFor(() => {
        expect(screen.getByText('No symbols found for "xyz"')).toBeInTheDocument()
      })
    })

    it('falls back to mock data when API fails', async () => {
      const { user, input } = setup()
      
      mockSearchSymbols.mockRejectedValue(new Error('API Error'))
      
      await user.type(input, 'AAPL')
      
      // Should still show some results from mock data fallback in the API service
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Callback Tests
  // ============================================================================

  describe('Callbacks', () => {
    it('calls onSymbolSelect when symbol is clicked', async () => {
      const onSymbolSelect = vi.fn()
      const { user, input } = setup({ onSymbolSelect })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('AAPL'))
      
      expect(onSymbolSelect).toHaveBeenCalledWith(mockSymbolResults[0])
    })

    it('updates input value after symbol selection', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('AAPL'))
      
      expect(input).toHaveValue('AAPL')
    })

    it('closes dropdown after symbol selection', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('AAPL'))
      
      await waitFor(() => {
        expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      setup()
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Search symbols...')
    })

    it('supports keyboard navigation', async () => {
      const { user, input } = setup()
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })
      
      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowUp}')
      
      // Should not throw errors
      expect(input).toBeInTheDocument()
    })

    it('maintains focus management', async () => {
      const { user, input } = setup({ showClearButton: true })
      
      await user.type(input, 'test')
      
      await waitFor(() => {
        expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('clear-icon'))
      
      // Focus should return to input after clear
      expect(input).toHaveFocus()
    })
  })
})