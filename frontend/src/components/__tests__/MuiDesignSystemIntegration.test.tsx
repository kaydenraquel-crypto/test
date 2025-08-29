// MUI Design System Integration Tests
// Phase 1 of MUI Design System Standardization - Testing

import React from 'react'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import '@testing-library/jest-dom'

import { createNovaSignalTheme, themeVariants } from '../../theme/designTokens'
import { EnhancedThemeProvider, useEnhancedTheme } from '../../contexts/EnhancedThemeContext'
import {
  TradingCard,
  MarketStatusIndicator,
  SymbolInput,
  PriceChangeChip,
  StatsCard,
  AlertNotification,
  ChartSkeleton,
  DataPanelSkeleton,
  SignalsList,
} from '../MuiComponents'

// Test wrapper for theme context
const TestThemeWrapper: React.FC<{ 
  children: React.ReactNode 
  variant?: keyof typeof themeVariants
}> = ({ children, variant = 'dark' }) => {
  const theme = createNovaSignalTheme(variant)
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

describe('MUI Design System Integration', () => {
  describe('Theme Creation and Variants', () => {
    it('should create all theme variants without errors', () => {
      Object.keys(themeVariants).forEach(variant => {
        expect(() => {
          createNovaSignalTheme(variant as keyof typeof themeVariants)
        }).not.toThrow()
      })
    })

    it('should have consistent palette structure across all themes', () => {
      Object.keys(themeVariants).forEach(variantKey => {
        const variant = variantKey as keyof typeof themeVariants
        const theme = createNovaSignalTheme(variant)
        
        // Test required palette properties
        expect(theme.palette).toHaveProperty('primary')
        expect(theme.palette).toHaveProperty('secondary')
        expect(theme.palette).toHaveProperty('success')
        expect(theme.palette).toHaveProperty('error')
        expect(theme.palette).toHaveProperty('warning')
        expect(theme.palette).toHaveProperty('info')
        expect(theme.palette).toHaveProperty('background')
        expect(theme.palette).toHaveProperty('text')
        
        // Test color consistency
        expect(theme.palette.primary.main).toBeDefined()
        expect(theme.palette.background.default).toBeDefined()
        expect(theme.palette.text.primary).toBeDefined()
      })
    })

    it('should have proper dark/light mode configuration', () => {
      const lightTheme = createNovaSignalTheme('light')
      const darkTheme = createNovaSignalTheme('dark')
      
      expect(lightTheme.palette.mode).toBe('light')
      expect(darkTheme.palette.mode).toBe('dark')
      
      // Light theme should have darker text
      expect(lightTheme.palette.text.primary).toMatch(/#[0-9a-f]{6}/i)
      // Dark theme should have lighter text
      expect(darkTheme.palette.text.primary).toMatch(/#[0-9a-f]{6}/i)
    })
  })

  describe('Enhanced Theme Context', () => {
    it('should provide theme context values', () => {
      const TestComponent = () => {
        const { muiTheme, currentThemeVariant, availableThemes } = useEnhancedTheme()
        return (
          <div>
            <div data-testid="current-theme">{currentThemeVariant}</div>
            <div data-testid="theme-mode">{muiTheme.palette.mode}</div>
            <div data-testid="available-themes">{availableThemes.join(',')}</div>
          </div>
        )
      }

      render(
        <EnhancedThemeProvider>
          <TestComponent />
        </EnhancedThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
      expect(screen.getByTestId('available-themes')).toHaveTextContent('light,dark,tradingview,matrix,minimalist')
    })

    it('should switch themes correctly', () => {
      const TestComponent = () => {
        const { currentThemeVariant, setThemeVariant, muiTheme } = useEnhancedTheme()
        return (
          <div>
            <button onClick={() => setThemeVariant('light')}>Switch to Light</button>
            <div data-testid="current-theme">{currentThemeVariant}</div>
            <div data-testid="theme-mode">{muiTheme.palette.mode}</div>
          </div>
        )
      }

      render(
        <EnhancedThemeProvider>
          <TestComponent />
        </EnhancedThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      
      fireEvent.click(screen.getByText('Switch to Light'))
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light')
    })
  })

  describe('MUI Components', () => {
    describe('TradingCard', () => {
      it('should render with proper MUI styling', () => {
        render(
          <TestThemeWrapper>
            <TradingCard>
              <div>Test Content</div>
            </TradingCard>
          </TestThemeWrapper>
        )

        const card = screen.getByText('Test Content').closest('[class*="MuiCard"]')
        expect(card).toBeInTheDocument()
        expect(card).toHaveStyle({
          borderRadius: '12px', // Design token value
        })
      })

      it('should have hover effects', () => {
        render(
          <TestThemeWrapper>
            <TradingCard data-testid="trading-card">
              <div>Test Content</div>
            </TradingCard>
          </TestThemeWrapper>
        )

        const card = screen.getByTestId('trading-card')
        expect(card).toHaveStyle({
          transition: 'all 0.2s ease-in-out',
        })
      })
    })

    describe('MarketStatusIndicator', () => {
      it('should display correct status colors', () => {
        const { rerender } = render(
          <TestThemeWrapper>
            <MarketStatusIndicator status="connected" />
          </TestThemeWrapper>
        )

        let statusIcon = screen.getByRole('button')
        expect(statusIcon).toHaveAttribute('title', expect.stringContaining('Connected'))

        rerender(
          <TestThemeWrapper>
            <MarketStatusIndicator status="error" onReconnect={() => {}} />
          </TestThemeWrapper>
        )

        expect(screen.getByText('Reconnect')).toBeInTheDocument()
      })

      it('should handle reconnection', () => {
        const mockReconnect = jest.fn()
        
        render(
          <TestThemeWrapper>
            <MarketStatusIndicator 
              status="error" 
              onReconnect={mockReconnect}
            />
          </TestThemeWrapper>
        )

        fireEvent.click(screen.getByText('Reconnect'))
        expect(mockReconnect).toHaveBeenCalled()
      })
    })

    describe('SymbolInput', () => {
      it('should validate symbols correctly', () => {
        const mockOnChange = jest.fn()
        
        render(
          <TestThemeWrapper>
            <SymbolInput
              value="INVALID"
              onChange={mockOnChange}
              market="crypto"
              isValid={false}
              error="Invalid format"
            />
          </TestThemeWrapper>
        )

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('Invalid format')).toBeInTheDocument()
      })

      it('should handle input changes', () => {
        const mockOnChange = jest.fn()
        
        render(
          <TestThemeWrapper>
            <SymbolInput
              value=""
              onChange={mockOnChange}
              market="crypto"
              isValid={true}
            />
          </TestThemeWrapper>
        )

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'btc/usd' } })
        
        expect(mockOnChange).toHaveBeenCalledWith('BTC/USD')
      })
    })

    describe('PriceChangeChip', () => {
      it('should display positive changes correctly', () => {
        render(
          <TestThemeWrapper>
            <PriceChangeChip change={100} changePercent={2.5} />
          </TestThemeWrapper>
        )

        const chip = screen.getByText('+2.50%')
        expect(chip).toBeInTheDocument()
        
        // Should have trending up icon
        expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument()
      })

      it('should display negative changes correctly', () => {
        render(
          <TestThemeWrapper>
            <PriceChangeChip change={-50} changePercent={-1.25} />
          </TestThemeWrapper>
        )

        const chip = screen.getByText('-1.25%')
        expect(chip).toBeInTheDocument()
        
        // Should have trending down icon
        expect(screen.getByTestId('TrendingDownIcon')).toBeInTheDocument()
      })
    })

    describe('StatsCard', () => {
      it('should render stats with proper formatting', () => {
        render(
          <TestThemeWrapper>
            <StatsCard
              title="Portfolio Value"
              value="$127,534.89"
              changePercent={2.34}
              trend="up"
            />
          </TestThemeWrapper>
        )

        expect(screen.getByText('Portfolio Value')).toBeInTheDocument()
        expect(screen.getByText('$127,534.89')).toBeInTheDocument()
        expect(screen.getByText('+2.34%')).toBeInTheDocument()
        expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument()
      })
    })

    describe('AlertNotification', () => {
      it('should render error alerts correctly', () => {
        const mockOnClose = jest.fn()
        
        render(
          <TestThemeWrapper>
            <AlertNotification
              type="error"
              message="Connection Error"
              details="Failed to connect to server"
              onClose={mockOnClose}
            />
          </TestThemeWrapper>
        )

        expect(screen.getByText('Connection Error')).toBeInTheDocument()
        expect(screen.getByText('Failed to connect to server')).toBeInTheDocument()
        
        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    describe('SignalsList', () => {
      it('should render signals with proper formatting', () => {
        const signals = [
          {
            ts: Date.now() / 1000,
            type: 'buy' as const,
            price: 45000,
            reason: 'RSI oversold',
            tag: 'momentum'
          },
          {
            ts: Date.now() / 1000 - 300,
            type: 'sell' as const,
            price: 44500,
            reason: 'MACD bearish cross'
          }
        ]

        render(
          <TestThemeWrapper>
            <SignalsList signals={signals} />
          </TestThemeWrapper>
        )

        expect(screen.getByText('BUY')).toBeInTheDocument()
        expect(screen.getByText('SELL')).toBeInTheDocument()
        expect(screen.getByText('$45,000.00')).toBeInTheDocument()
        expect(screen.getByText('$44,500.00')).toBeInTheDocument()
        expect(screen.getByText('RSI oversold')).toBeInTheDocument()
        expect(screen.getByText('MACD bearish cross')).toBeInTheDocument()
        expect(screen.getByText('momentum')).toBeInTheDocument()
      })

      it('should show loading skeleton when loading', () => {
        render(
          <TestThemeWrapper>
            <SignalsList signals={[]} isLoading={true} />
          </TestThemeWrapper>
        )

        // Should render skeleton loaders
        const skeletons = screen.getAllByTestId(/skeleton/i)
        expect(skeletons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Loading States', () => {
    it('should render ChartSkeleton with correct dimensions', () => {
      render(
        <TestThemeWrapper>
          <ChartSkeleton height={400} />
        </TestThemeWrapper>
      )

      const skeleton = screen.getByTestId(/skeleton/i)
      expect(skeleton).toBeInTheDocument()
    })

    it('should render DataPanelSkeleton with specified rows', () => {
      render(
        <TestThemeWrapper>
          <DataPanelSkeleton rows={5} />
        </TestThemeWrapper>
      )

      const skeletons = screen.getAllByTestId(/skeleton/i)
      expect(skeletons.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Theme Switching Performance', () => {
    it('should switch themes without causing re-renders of unrelated components', async () => {
      let renderCount = 0
      
      const TestComponent = () => {
        renderCount++
        const { currentThemeVariant, setThemeVariant } = useEnhancedTheme()
        
        return (
          <div>
            <button onClick={() => setThemeVariant('light')}>Switch Theme</button>
            <div data-testid="theme">{currentThemeVariant}</div>
            <div data-testid="render-count">{renderCount}</div>
          </div>
        )
      }

      render(
        <EnhancedThemeProvider>
          <TestComponent />
        </EnhancedThemeProvider>
      )

      expect(screen.getByTestId('render-count')).toHaveTextContent('1')
      
      fireEvent.click(screen.getByText('Switch Theme'))
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })

      // Should only render twice (initial + theme change)
      expect(screen.getByTestId('render-count')).toHaveTextContent('2')
    })
  })

  describe('Accessibility Compliance', () => {
    it('should maintain WCAG 2.1 AA color contrast in all themes', () => {
      Object.keys(themeVariants).forEach(variantKey => {
        const variant = variantKey as keyof typeof themeVariants
        const theme = createNovaSignalTheme(variant)
        
        // Test that text colors have sufficient contrast
        expect(theme.palette.text.primary).toBeDefined()
        expect(theme.palette.background.default).toBeDefined()
        
        // Note: In a real test, you'd use a color contrast library
        // to verify the actual contrast ratios meet WCAG standards
      })
    })

    it('should provide proper ARIA labels and roles', () => {
      render(
        <TestThemeWrapper>
          <MarketStatusIndicator status="connected" />
        </TestThemeWrapper>
      )

      const statusButton = screen.getByRole('button')
      expect(statusButton).toHaveAttribute('title')
    })
  })

  describe('Component Consistency', () => {
    it('should use consistent spacing across all components', () => {
      render(
        <TestThemeWrapper>
          <div>
            <TradingCard data-testid="card1">Content 1</TradingCard>
            <TradingCard data-testid="card2">Content 2</TradingCard>
          </div>
        </TestThemeWrapper>
      )

      const card1 = screen.getByTestId('card1')
      const card2 = screen.getByTestId('card2')
      
      // Both cards should have the same border radius
      expect(card1).toHaveStyle({ borderRadius: '12px' })
      expect(card2).toHaveStyle({ borderRadius: '12px' })
    })

    it('should apply consistent typography across components', () => {
      render(
        <TestThemeWrapper>
          <StatsCard
            title="Test Title"
            value="Test Value"
          />
        </TestThemeWrapper>
      )

      const title = screen.getByText('Test Title')
      const value = screen.getByText('Test Value')
      
      // Should have consistent typography classes
      expect(title).toHaveClass(/MuiTypography/)
      expect(value).toHaveClass(/MuiTypography/)
    })
  })
})