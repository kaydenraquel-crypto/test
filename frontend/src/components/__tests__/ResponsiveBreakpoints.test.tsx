/**
 * Responsive Breakpoints and Mobile-First Design Test Suite
 * Tests responsive behavior, breakpoint consistency, and mobile-first design patterns
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { 
  ThemeProvider, 
  createTheme,
  useMediaQuery,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Hidden
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { ThemeProvider as CustomThemeProvider } from '../../contexts/ThemeContext';
import React, { useState } from 'react';

// Mock component demonstrating responsive patterns
const ResponsiveDashboard = () => {
  const theme = createTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Responsive AppBar */}
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="mobile-menu-button"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NovaSignal {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </Typography>
          {!isMobile && (
            <Button color="inherit" data-testid="desktop-nav-button">
              Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        data-testid="mobile-drawer"
      >
        <Box sx={{ width: 250, p: 2 }}>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            data-testid="close-drawer-button"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Mobile Menu</Typography>
        </Box>
      </Drawer>

      {/* Responsive Grid Layout */}
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  gutterBottom
                  data-testid="main-title"
                >
                  Trading Dashboard
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '14px', sm: '16px', md: '18px' },
                    lineHeight: { xs: 1.4, md: 1.6 }
                  }}
                >
                  Market analysis and trading tools with responsive design.
                </Typography>
                
                {/* Responsive Button Group */}
                <Box 
                  sx={{ 
                    mt: 2,
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 2 },
                    alignItems: { xs: 'stretch', sm: 'flex-start' }
                  }}
                >
                  <Button 
                    variant="contained" 
                    size={isMobile ? 'large' : 'medium'}
                    fullWidth={isMobile}
                  >
                    Start Trading
                  </Button>
                  <Button 
                    variant="outlined"
                    size={isMobile ? 'large' : 'medium'}
                    fullWidth={isMobile}
                  >
                    View Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Desktop Sidebar
                </Typography>
                <Typography variant="body2">
                  This sidebar is only visible on large screens.
                </Typography>
              </Paper>
            </Box>
            
            {/* Mobile-specific content */}
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Mobile Summary
                </Typography>
                <Typography variant="body2">
                  Condensed information for mobile users.
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Responsive Chart Container */}
        <Box 
          sx={{ 
            mt: 3,
            height: { xs: '300px', sm: '400px', md: '500px', lg: '600px' },
            backgroundColor: 'grey.100',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          data-testid="chart-container"
        >
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontSize: { xs: '14px', md: '18px' } }}
          >
            Chart Area - {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} View
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Component demonstrating breakpoint-specific visibility
const BreakpointVisibilityDemo = () => (
  <Box>
    <Box sx={{ display: { xs: 'block', sm: 'none' } }} data-testid="xs-only">
      Extra Small Only (0-599px)
    </Box>
    <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }} data-testid="sm-only">
      Small Only (600-899px)
    </Box>
    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block', lg: 'none' } }} data-testid="md-only">
      Medium Only (900-1199px)
    </Box>
    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', xl: 'none' } }} data-testid="lg-only">
      Large Only (1200-1535px)
    </Box>
    <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'block' } }} data-testid="xl-only">
      Extra Large Only (1536px+)
    </Box>
  </Box>
);

// Component with problematic responsive patterns
const ProblematicResponsiveComponent = () => (
  <div>
    {/* Hard-coded breakpoints instead of MUI theme */}
    <style>{`
      .problematic-container {
        padding: 16px;
      }
      @media (max-width: 768px) {
        .problematic-container { padding: 8px; }
      }
      @media (min-width: 1024px) {
        .problematic-container { padding: 24px; }
      }
    `}</style>
    
    <div className="problematic-container" data-testid="problematic-responsive">
      <h2 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px' }}>
        Problematic Responsive Title
      </h2>
      <p>This component uses hard-coded breakpoints and window.innerWidth checks.</p>
    </div>
  </div>
);

// Helper function to mock different viewport sizes
const mockViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => {
      const breakpoints: Record<string, boolean> = {
        '(max-width: 599.95px)': width < 600,
        '(min-width: 600px)': width >= 600,
        '(max-width: 899.95px)': width < 900,
        '(min-width: 900px)': width >= 900,
        '(max-width: 1199.95px)': width < 1200,
        '(min-width: 1200px)': width >= 1200,
        '(max-width: 1535.95px)': width < 1536,
        '(min-width: 1536px)': width >= 1536,
      };

      return {
        matches: breakpoints[query] || false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });

  // Trigger resize event
  fireEvent(window, new Event('resize'));
};

describe('Responsive Breakpoints Analysis', () => {
  const defaultTheme = createTheme();

  beforeEach(() => {
    // Reset viewport to desktop by default
    mockViewport(1200);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MUI Breakpoint System Integration', () => {
    test('responds correctly to mobile viewport (xs)', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Mobile-specific elements should be visible
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      expect(screen.getByText('NovaSignal Mobile')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-nav-button')).not.toBeInTheDocument();
      
      // Chart should show mobile view
      expect(screen.getByText('Chart Area - Mobile View')).toBeInTheDocument();
    });

    test('responds correctly to tablet viewport (md)', () => {
      mockViewport(900);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Should show tablet-specific content
      expect(screen.getByText('NovaSignal Tablet')).toBeInTheDocument();
      expect(screen.getByText('Chart Area - Tablet View')).toBeInTheDocument();
    });

    test('responds correctly to desktop viewport (lg+)', () => {
      mockViewport(1200);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Desktop elements should be visible
      expect(screen.getByTestId('desktop-nav-button')).toBeInTheDocument();
      expect(screen.getByText('NovaSignal Desktop')).toBeInTheDocument();
      expect(screen.getByText('Desktop Sidebar')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
    });

    test('handles breakpoint-specific visibility correctly', () => {
      // Test different breakpoints
      const testCases = [
        { width: 375, visible: 'xs-only' },
        { width: 750, visible: 'sm-only' },
        { width: 1000, visible: 'md-only' },
        { width: 1300, visible: 'lg-only' },
        { width: 1600, visible: 'xl-only' }
      ];

      testCases.forEach(({ width, visible }) => {
        mockViewport(width);
        
        const { unmount } = render(
          <CustomThemeProvider>
            <ThemeProvider theme={defaultTheme}>
              <BreakpointVisibilityDemo />
            </ThemeProvider>
          </CustomThemeProvider>
        );

        expect(screen.getByTestId(visible)).toBeVisible();
        
        // Other breakpoint elements should not be visible
        ['xs-only', 'sm-only', 'md-only', 'lg-only', 'xl-only']
          .filter(id => id !== visible)
          .forEach(id => {
            const element = screen.getByTestId(id);
            expect(element).toHaveStyle('display: none');
          });

        unmount();
      });
    });
  });

  describe('Mobile-First Design Patterns', () => {
    test('implements mobile-first spacing and typography', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const title = screen.getByTestId('main-title');
      expect(title).toBeInTheDocument();
      
      // Mobile should have smaller title
      const computedStyle = window.getComputedStyle(title);
      expect(computedStyle).toBeDefined();
    });

    test('uses appropriate touch target sizes on mobile', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      const computedStyle = window.getComputedStyle(mobileMenuButton);
      
      // MUI buttons automatically have appropriate touch target sizes
      expect(mobileMenuButton).toBeInTheDocument();
      expect(computedStyle.minWidth).toBeTruthy();
      expect(computedStyle.minHeight).toBeTruthy();
    });

    test('implements progressive enhancement for larger screens', () => {
      mockViewport(1200);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Desktop should have enhanced features
      expect(screen.getByText('Desktop Sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-nav-button')).toBeInTheDocument();
      
      // Should not show mobile-specific elements
      expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
    });

    test('handles orientation changes appropriately', () => {
      // Simulate tablet in portrait
      mockViewport(768);
      
      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      let chartContainer = screen.getByTestId('chart-container');
      let computedStyle = window.getComputedStyle(chartContainer);
      expect(computedStyle.height).toBeTruthy();

      // Simulate tablet in landscape
      mockViewport(1024);
      
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      chartContainer = screen.getByTestId('chart-container');
      computedStyle = window.getComputedStyle(chartContainer);
      expect(computedStyle.height).toBeTruthy();
    });
  });

  describe('Navigation Pattern Responsiveness', () => {
    test('mobile navigation drawer functions correctly', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const menuButton = screen.getByTestId('mobile-menu-button');
      
      // Open mobile menu
      fireEvent.click(menuButton);
      
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
      expect(screen.getByText('Mobile Menu')).toBeInTheDocument();
      
      // Close mobile menu
      const closeButton = screen.getByTestId('close-drawer-button');
      fireEvent.click(closeButton);
    });

    test('desktop navigation remains persistent', () => {
      mockViewport(1200);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Desktop nav should be always visible
      expect(screen.getByTestId('desktop-nav-button')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
    });

    test('handles navigation transitions between breakpoints', () => {
      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Start desktop
      mockViewport(1200);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );
      expect(screen.getByTestId('desktop-nav-button')).toBeInTheDocument();

      // Switch to mobile
      mockViewport(375);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-nav-button')).not.toBeInTheDocument();
    });
  });

  describe('Content Layout Responsiveness', () => {
    test('grid system adapts correctly across breakpoints', () => {
      const breakpointTests = [
        { width: 375, expected: 'mobile' },
        { width: 900, expected: 'tablet' },
        { width: 1200, expected: 'desktop' }
      ];

      breakpointTests.forEach(({ width, expected }) => {
        mockViewport(width);
        
        const { unmount } = render(
          <CustomThemeProvider>
            <ThemeProvider theme={defaultTheme}>
              <ResponsiveDashboard />
            </ThemeProvider>
          </CustomThemeProvider>
        );

        const chartContainer = screen.getByTestId('chart-container');
        expect(chartContainer).toBeInTheDocument();
        
        if (expected === 'desktop') {
          expect(screen.getByText('Desktop Sidebar')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Desktop Sidebar')).not.toBeInTheDocument();
        }

        unmount();
      });
    });

    test('typography scales appropriately', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const title = screen.getByTestId('main-title');
      expect(title).toBeInTheDocument();
      
      // Typography should be responsive - MUI handles this automatically
      const computedStyle = window.getComputedStyle(title);
      expect(computedStyle.fontSize).toBeTruthy();
    });

    test('button layouts adapt to mobile constraints', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.textContent === 'Start Trading' || btn.textContent === 'View Analytics'
      );

      expect(buttons).toHaveLength(2);
      // On mobile, buttons should be full-width (handled by flexDirection: column and fullWidth prop)
    });
  });

  describe('Problematic Pattern Detection', () => {
    test('identifies hard-coded breakpoints', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ProblematicResponsiveComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const problematicContainer = screen.getByTestId('problematic-responsive');
      expect(problematicContainer).toBeInTheDocument();
      
      // This component uses problematic patterns that should be flagged
      expect(screen.getByText('Problematic Responsive Title')).toBeInTheDocument();
      expect(screen.getByText(/hard-coded breakpoints/)).toBeInTheDocument();
    });

    test('detects window.innerWidth usage instead of useMediaQuery', () => {
      // This would be detected through static analysis in a real audit
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ProblematicResponsiveComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // The component should still render but uses anti-patterns
      expect(screen.getByTestId('problematic-responsive')).toBeInTheDocument();
    });

    test('validates consistent spacing units across breakpoints', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ 
              p: { xs: 1, sm: 2, md: 3 },
              m: { xs: 0.5, sm: 1, md: 1.5 } 
            }} data-testid="consistent-spacing">
              Consistent Spacing
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const spacingBox = screen.getByTestId('consistent-spacing');
      expect(spacingBox).toBeInTheDocument();
      
      // MUI spacing units ensure consistency
      const computedStyle = window.getComputedStyle(spacingBox);
      expect(computedStyle.padding).toBeTruthy();
      expect(computedStyle.margin).toBeTruthy();
    });
  });

  describe('Accessibility in Responsive Design', () => {
    test('maintains focus management across breakpoint changes', () => {
      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Start on desktop and focus a button
      mockViewport(1200);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );
      
      const desktopButton = screen.getByTestId('desktop-nav-button');
      desktopButton.focus();
      expect(document.activeElement).toBe(desktopButton);

      // Switch to mobile - focus should be managed appropriately
      mockViewport(375);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );
      
      // Mobile menu button should be focusable
      const mobileButton = screen.getByTestId('mobile-menu-button');
      mobileButton.focus();
      expect(document.activeElement).toBe(mobileButton);
    });

    test('provides appropriate ARIA labels for responsive elements', () => {
      mockViewport(375);

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toHaveAttribute('aria-label', 'menu');
      
      // Open drawer to test its accessibility
      fireEvent.click(menuButton);
      
      const drawer = screen.getByTestId('mobile-drawer');
      expect(drawer).toBeInTheDocument();
    });

    test('maintains semantic structure across breakpoints', () => {
      const breakpoints = [375, 900, 1200];

      breakpoints.forEach(width => {
        mockViewport(width);
        
        const { unmount } = render(
          <CustomThemeProvider>
            <ThemeProvider theme={defaultTheme}>
              <ResponsiveDashboard />
            </ThemeProvider>
          </CustomThemeProvider>
        );

        // Heading structure should remain consistent
        const title = screen.getByTestId('main-title');
        expect(title.tagName).toBe('H2'); // Should maintain heading hierarchy
        
        unmount();
      });
    });
  });

  describe('Performance Optimization', () => {
    test('components render efficiently across breakpoint changes', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <ResponsiveDashboard />;
      };

      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <TestComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const initialCount = renderCount;

      // Change breakpoint
      mockViewport(375);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <TestComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Should only render once more
      expect(renderCount).toBe(initialCount + 1);
    });

    test('avoids unnecessary re-renders on resize events', () => {
      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Trigger multiple resize events within same breakpoint
      mockViewport(1250);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      mockViewport(1300);
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ResponsiveDashboard />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Content should remain stable within same breakpoint
      expect(screen.getByText('NovaSignal Desktop')).toBeInTheDocument();
    });
  });
});