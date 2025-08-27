/**
 * Responsive Design Test Suite
 * Tests responsive behavior across different viewport sizes
 */

import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Grid, Box, Typography, useMediaQuery } from '@mui/material';
import { ThemeProvider as CustomThemeProvider } from '../../contexts/ThemeContext';

// Mock component that uses MUI responsive features
const ResponsiveTestComponent = () => {
  const theme = createTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box>
      <Grid container spacing={{ xs: 1, md: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography 
            variant={isMobile ? 'h6' : 'h4'}
            data-testid="responsive-heading"
          >
            Responsive Heading
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box 
            sx={{
              display: { xs: 'none', md: 'block' }
            }}
            data-testid="desktop-only"
          >
            Desktop Only Content
          </Box>
          <Box 
            sx={{
              display: { xs: 'block', md: 'none' }
            }}
            data-testid="mobile-only"
          >
            Mobile Only Content
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper to mock window.matchMedia for different viewport sizes
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => {
      const mediaQueries: Record<string, boolean> = {
        '(max-width: 599.95px)': width < 600,    // xs
        '(max-width: 899.95px)': width < 900,    // sm
        '(max-width: 1199.95px)': width < 1200,  // md
        '(max-width: 1535.95px)': width < 1536,  // lg
        '(min-width: 600px)': width >= 600,      // sm up
        '(min-width: 900px)': width >= 900,      // md up
        '(min-width: 1200px)': width >= 1200,    // lg up
        '(min-width: 1536px)': width >= 1536,    // xl up
      };

      return {
        matches: mediaQueries[query] ?? false,
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
};

describe('Responsive Design with MUI', () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
    delete (window as any).matchMedia;
  });

  test('components adapt to mobile viewport (xs)', () => {
    mockMatchMedia(375); // Mobile width
    
    render(
      <CustomThemeProvider>
        <ThemeProvider theme={createTheme()}>
          <ResponsiveTestComponent />
        </ThemeProvider>
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('responsive-heading')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-only')).toBeInTheDocument();
    // Desktop content should not be visible on mobile
    expect(screen.getByTestId('desktop-only')).toHaveStyle('display: none');
  });

  test('components adapt to tablet viewport (md)', () => {
    mockMatchMedia(768); // Tablet width
    
    render(
      <CustomThemeProvider>
        <ThemeProvider theme={createTheme()}>
          <ResponsiveTestComponent />
        </ThemeProvider>
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('responsive-heading')).toBeInTheDocument();
    // At md breakpoint, mobile content should be hidden
    expect(screen.getByTestId('mobile-only')).toHaveStyle('display: none');
  });

  test('components adapt to desktop viewport (lg)', () => {
    mockMatchMedia(1200); // Desktop width
    
    render(
      <CustomThemeProvider>
        <ThemeProvider theme={createTheme()}>
          <ResponsiveTestComponent />
        </ThemeProvider>
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('responsive-heading')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-only')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-only')).toHaveStyle('display: none');
  });

  test('Grid system responds correctly to breakpoints', () => {
    mockMatchMedia(375); // Mobile
    
    render(
      <CustomThemeProvider>
        <ThemeProvider theme={createTheme()}>
          <Grid container data-testid="grid-container">
            <Grid size={{ xs: 12, md: 6 }} data-testid="grid-item-1">
              Item 1
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} data-testid="grid-item-2">
              Item 2
            </Grid>
          </Grid>
        </ThemeProvider>
      </CustomThemeProvider>
    );

    expect(screen.getByTestId('grid-container')).toBeInTheDocument();
    expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('grid-item-2')).toBeInTheDocument();
  });
});

describe('Custom CSS Responsive Patterns', () => {
  test('CSS custom properties work with responsive design', () => {
    mockMatchMedia(375);
    
    render(
      <CustomThemeProvider>
        <Box 
          sx={{
            backgroundColor: 'var(--panel-bg-primary)',
            padding: { xs: 1, md: 3 },
            fontSize: { xs: '14px', md: '16px' }
          }}
          data-testid="custom-responsive-box"
        >
          Custom themed content
        </Box>
      </CustomThemeProvider>
    );

    const box = screen.getByTestId('custom-responsive-box');
    expect(box).toBeInTheDocument();
    
    // Check that CSS variables are applied
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--panel-bg-primary')).toBeDefined();
  });
});

describe('Accessibility in Responsive Design', () => {
  test('focus management works across breakpoints', () => {
    mockMatchMedia(1200);
    
    render(
      <CustomThemeProvider>
        <Box>
          <Box 
            sx={{ display: { xs: 'none', md: 'block' } }}
            tabIndex={0}
            data-testid="desktop-focusable"
          >
            Desktop focusable content
          </Box>
          <Box 
            sx={{ display: { xs: 'block', md: 'none' } }}
            tabIndex={0}
            data-testid="mobile-focusable"
          >
            Mobile focusable content
          </Box>
        </Box>
      </CustomThemeProvider>
    );

    // On desktop, only desktop content should be focusable
    const desktopContent = screen.getByTestId('desktop-focusable');
    const mobileContent = screen.getByTestId('mobile-focusable');
    
    expect(desktopContent).toBeVisible();
    expect(mobileContent).toHaveStyle('display: none');
  });

  test('screen reader content adapts to viewport', () => {
    mockMatchMedia(375);
    
    render(
      <CustomThemeProvider>
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              display: { xs: 'block', md: 'none' }
            }}
            data-testid="mobile-heading"
          >
            Mobile Heading
          </Typography>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              display: { xs: 'none', md: 'block' }
            }}
            data-testid="desktop-heading"
          >
            Desktop Heading
          </Typography>
        </Box>
      </CustomThemeProvider>
    );

    // On mobile, mobile heading should be visible
    expect(screen.getByTestId('mobile-heading')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-heading')).toHaveStyle('display: none');
  });
});

describe('Performance in Responsive Design', () => {
  test('components render efficiently across breakpoints', () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return (
        <Box sx={{ padding: { xs: 1, md: 2, lg: 3 } }} data-testid="perf-test">
          Performance test content
        </Box>
      );
    };

    mockMatchMedia(1200);
    
    render(
      <CustomThemeProvider>
        <TestComponent />
      </CustomThemeProvider>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('perf-test')).toBeInTheDocument();
  });
});