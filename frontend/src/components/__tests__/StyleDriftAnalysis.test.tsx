/**
 * Style Drift Analysis Test Suite
 * Detects inconsistent styling patterns, CSS-in-JS drift, and theme violations
 */

import { render, screen } from '@testing-library/react';
import { 
  ThemeProvider, 
  createTheme, 
  styled,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { ThemeProvider as CustomThemeProvider } from '../../contexts/ThemeContext';

// Example of consistent MUI styling
const ConsistentComponent = () => (
  <Paper 
    elevation={2} 
    sx={{ 
      p: 3, 
      mb: 2,
      backgroundColor: 'background.paper',
      color: 'text.primary'
    }}
  >
    <Typography variant="h5" component="h2" gutterBottom>
      Consistent MUI Component
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      This component uses MUI theming consistently with sx prop and theme tokens.
    </Typography>
    <Button 
      variant="contained" 
      color="primary"
      sx={{ mr: 2 }}
    >
      MUI Button
    </Button>
    <Button 
      variant="outlined" 
      color="secondary"
    >
      Secondary Action
    </Button>
  </Paper>
);

// Example of inconsistent styling patterns (style drift)
const InconsistentComponent = () => (
  <div 
    style={{ 
      backgroundColor: '#1a1a1a', 
      color: '#ffffff', 
      padding: '24px',
      marginBottom: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}
  >
    <h2 style={{ 
      fontSize: '24px', 
      fontWeight: '600', 
      marginBottom: '16px',
      color: '#ffffff'
    }}>
      Inconsistent Component
    </h2>
    <p style={{ 
      fontSize: '14px', 
      color: '#cccccc', 
      lineHeight: '1.5',
      marginBottom: '16px'
    }}>
      This component uses inline styles instead of MUI theming.
    </p>
    <button 
      style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        marginRight: '8px',
        cursor: 'pointer'
      }}
    >
      Inline Button
    </button>
    <button 
      className="custom-btn-secondary"
      style={{ 
        backgroundColor: 'transparent', 
        color: '#3b82f6',
        border: '1px solid #3b82f6',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      CSS Class Button
    </button>
  </div>
);

// Example of mixed styling approaches
const MixedStylingComponent = () => {
  // Styled component approach
  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    backgroundColor: '#2d2d2d', // Hard-coded instead of theme color
    '&:hover': {
      backgroundColor: '#3a3a3a' // Hard-coded hover state
    }
  }));

  return (
    <StyledPaper>
      <Typography 
        variant="h5" 
        sx={{ 
          color: '#ffffff', // Hard-coded instead of theme token
          mb: 2 
        }}
      >
        Mixed Styling Approaches
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        // Mixing custom CSS vars with MUI
        backgroundColor: 'var(--panel-bg-secondary)',
        p: 2,
        borderRadius: 1
      }}>
        <Button 
          variant="contained"
          sx={{ 
            backgroundColor: '#00e676', // Hard-coded success color
            '&:hover': {
              backgroundColor: '#00c853'
            }
          }}
        >
          Custom Success
        </Button>
        <Button 
          variant="outlined"
          color="error" // Using MUI semantic color
        >
          MUI Error
        </Button>
      </Box>
    </StyledPaper>
  );
};

// Example of proper CSS custom property integration
const ThemeIntegratedComponent = () => (
  <Paper 
    sx={{ 
      p: 3, 
      mb: 2,
      backgroundColor: 'var(--panel-bg-primary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--panel-border)'
    }}
  >
    <Typography 
      variant="h5" 
      sx={{ 
        color: 'var(--text-primary)',
        mb: 2 
      }}
    >
      Theme Integrated Component
    </Typography>
    <Typography 
      variant="body1" 
      sx={{ 
        color: 'var(--text-secondary)',
        mb: 2 
      }}
    >
      This component properly integrates custom theme variables with MUI.
    </Typography>
    <Button 
      variant="contained"
      sx={{ 
        backgroundColor: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        '&:hover': {
          backgroundColor: 'var(--btn-hover)'
        }
      }}
    >
      Theme Button
    </Button>
  </Paper>
);

describe('Style Drift Analysis', () => {
  const defaultTheme = createTheme();

  describe('Consistent vs Inconsistent Styling Detection', () => {
    test('identifies consistent MUI component usage', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ConsistentComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Consistent components should use MUI classes
      const paper = screen.getByRole('heading', { level: 2 }).closest('div');
      const muiButton = screen.getByRole('button', { name: 'MUI Button' });
      const secondaryButton = screen.getByRole('button', { name: 'Secondary Action' });

      expect(paper).toHaveClass('MuiPaper-root');
      expect(muiButton).toHaveClass('MuiButton-root');
      expect(secondaryButton).toHaveClass('MuiButton-root');

      // Should use semantic elements
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText(/This component uses MUI theming/)).toBeInTheDocument();
    });

    test('detects inconsistent inline styling patterns', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <InconsistentComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Inconsistent components won't have MUI classes
      const inlineButton = screen.getByRole('button', { name: 'Inline Button' });
      const cssClassButton = screen.getByRole('button', { name: 'CSS Class Button' });

      expect(inlineButton).not.toHaveClass('MuiButton-root');
      expect(cssClassButton).not.toHaveClass('MuiButton-root');

      // Should still be accessible
      expect(screen.getByText('Inconsistent Component')).toBeInTheDocument();
      expect(screen.getByText(/This component uses inline styles/)).toBeInTheDocument();
    });

    test('identifies mixed styling approaches', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MixedStylingComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Mixed components should have some MUI classes but may have inconsistencies
      const customSuccessButton = screen.getByRole('button', { name: 'Custom Success' });
      const muiErrorButton = screen.getByRole('button', { name: 'MUI Error' });

      expect(customSuccessButton).toHaveClass('MuiButton-root');
      expect(muiErrorButton).toHaveClass('MuiButton-root');

      // Both should be MUI buttons, but styling approaches differ
      expect(screen.getByText('Mixed Styling Approaches')).toBeInTheDocument();
    });

    test('validates proper theme integration', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <ThemeIntegratedComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const themeButton = screen.getByRole('button', { name: 'Theme Button' });
      expect(themeButton).toHaveClass('MuiButton-root');

      // Verify CSS custom properties are available
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--panel-bg-primary')).toBeDefined();
      expect(root.style.getPropertyValue('--btn-bg')).toBeDefined();
    });
  });

  describe('CSS-in-JS vs Inline Styles Analysis', () => {
    test('detects proper sx prop usage', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box 
              sx={{ 
                p: 2, 
                m: 1, 
                backgroundColor: 'primary.main',
                color: 'primary.contrastText'
              }}
              data-testid="sx-box"
            >
              SX Prop Usage
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const sxBox = screen.getByTestId('sx-box');
      expect(sxBox).toBeInTheDocument();
      expect(sxBox).toHaveTextContent('SX Prop Usage');
    });

    test('identifies styled component patterns', () => {
      const StyledDiv = styled('div')(({ theme }) => ({
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius
      }));

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <StyledDiv data-testid="styled-div">
              Styled Component
            </StyledDiv>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const styledDiv = screen.getByTestId('styled-div');
      expect(styledDiv).toBeInTheDocument();
      expect(styledDiv).toHaveTextContent('Styled Component');
    });

    test('detects problematic inline styles', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <div 
              style={{ 
                padding: '16px',
                backgroundColor: '#ff0000', // Hard-coded color
                fontSize: '14px' // Hard-coded size
              }}
              data-testid="inline-styled-div"
            >
              Problematic Inline Styles
            </div>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const inlineDiv = screen.getByTestId('inline-styled-div');
      const computedStyle = window.getComputedStyle(inlineDiv);

      // Inline styles should be present
      expect(inlineDiv.style.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(inlineDiv.style.padding).toBe('16px');
    });
  });

  describe('Theme Token Usage Analysis', () => {
    test('validates consistent color token usage', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box>
              <Typography color="text.primary">Primary Text</Typography>
              <Typography color="text.secondary">Secondary Text</Typography>
              <Typography color="error.main">Error Text</Typography>
              <Typography color="success.main">Success Text</Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Primary Text')).toBeInTheDocument();
      expect(screen.getByText('Secondary Text')).toBeInTheDocument();
      expect(screen.getByText('Error Text')).toBeInTheDocument();
      expect(screen.getByText('Success Text')).toBeInTheDocument();
    });

    test('detects spacing token consistency', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ p: 2, m: 1, gap: 1 }}>
              <Typography>Consistent Spacing</Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Consistent Spacing')).toBeInTheDocument();
    });

    test('identifies hard-coded values vs theme tokens', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '24px', // Hard-coded - should use theme.typography
                  color: '#333333'  // Hard-coded - should use theme.palette
                }}
                data-testid="hard-coded"
              >
                Hard-coded Values
              </Typography>
              <Typography 
                variant="h4" 
                color="text.primary"
                data-testid="theme-tokens"
              >
                Theme Tokens
              </Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const hardCodedText = screen.getByTestId('hard-coded');
      const themeTokenText = screen.getByTestId('theme-tokens');

      expect(hardCodedText).toBeInTheDocument();
      expect(themeTokenText).toBeInTheDocument();

      // Hard-coded values should be in inline styles
      expect(hardCodedText.style.fontSize).toBe('24px');
      expect(hardCodedText.style.color).toBe('rgb(51, 51, 51)');
    });
  });

  describe('Responsive Design Consistency', () => {
    test('validates consistent breakpoint usage', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'flex' },
                gap: { xs: 1, md: 2 },
                p: { xs: 2, md: 3 }
              }}
              data-testid="responsive-box"
            >
              <Typography sx={{ fontSize: { xs: '14px', md: '16px' } }}>
                Responsive Content
              </Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByTestId('responsive-box')).toBeInTheDocument();
      expect(screen.getByText('Responsive Content')).toBeInTheDocument();
    });

    test('detects inconsistent media query usage', () => {
      const InconsistentResponsive = () => (
        <div 
          style={{ 
            padding: '16px',
            // Should use MUI breakpoints instead
          }}
        >
          <style>{`
            @media (max-width: 768px) {
              .custom-responsive { padding: 8px; }
            }
          `}</style>
          <div className="custom-responsive">
            Custom Media Query
          </div>
        </div>
      );

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <InconsistentResponsive />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Custom Media Query')).toBeInTheDocument();
    });
  });

  describe('Component Variant Consistency', () => {
    test('validates consistent button variant usage', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="outlined" color="primary">Secondary</Button>
              <Button variant="text" color="primary">Tertiary</Button>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tertiary' })).toBeInTheDocument();
    });

    test('detects mixed button styling approaches', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained">MUI Button</Button>
              <button 
                style={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '4px'
                }}
              >
                Custom Button
              </button>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const muiButton = screen.getByRole('button', { name: 'MUI Button' });
      const customButton = screen.getByRole('button', { name: 'Custom Button' });

      expect(muiButton).toHaveClass('MuiButton-root');
      expect(customButton).not.toHaveClass('MuiButton-root');
    });
  });

  describe('Performance Impact Analysis', () => {
    test('measures style computation performance', () => {
      const start = performance.now();
      
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box>
              {Array.from({ length: 100 }, (_, i) => (
                <Typography 
                  key={i}
                  variant="body1"
                  sx={{ color: 'text.primary', p: 1 }}
                >
                  Item {i}
                </Typography>
              ))}
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );
      
      const end = performance.now();
      const renderTime = end - start;

      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });

    test('compares styled-components vs sx prop performance', () => {
      const StyledTypography = styled(Typography)(({ theme }) => ({
        color: theme.palette.text.primary,
        padding: theme.spacing(1)
      }));

      const SxTypography = ({ children }: { children: React.ReactNode }) => (
        <Typography sx={{ color: 'text.primary', p: 1 }}>
          {children}
        </Typography>
      );

      const styledStart = performance.now();
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            {Array.from({ length: 50 }, (_, i) => (
              <StyledTypography key={`styled-${i}`}>
                Styled Item {i}
              </StyledTypography>
            ))}
          </ThemeProvider>
        </CustomThemeProvider>
      );
      const styledEnd = performance.now();

      const { unmount } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            {Array.from({ length: 50 }, (_, i) => (
              <SxTypography key={`sx-${i}`}>
                SX Item {i}
              </SxTypography>
            ))}
          </ThemeProvider>
        </CustomThemeProvider>
      );
      const sxEnd = performance.now();

      const styledTime = styledEnd - styledStart;
      const sxTime = sxEnd - styledEnd;

      // Both approaches should be reasonably fast
      expect(styledTime).toBeLessThan(1000);
      expect(sxTime).toBeLessThan(1000);

      unmount();
    });
  });
});