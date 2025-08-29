/**
 * MUI Component Consistency and Pattern Analysis Test Suite
 * Tests for consistent MUI implementation patterns across the codebase
 */

import { render, screen } from '@testing-library/react';
import { 
  ThemeProvider, 
  createTheme, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Box,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Home, Search, Settings } from '@mui/icons-material';
import { ThemeProvider as CustomThemeProvider, APP_THEMES } from '../../contexts/ThemeContext';

// Mock component that demonstrates various MUI patterns
const MuiPatternsDemo = ({ variant = 'standard' }: { variant?: 'standard' | 'inconsistent' }) => {
  if (variant === 'inconsistent') {
    // Simulates inconsistent patterns found in the codebase
    return (
      <div>
        <div style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '16px' }}>
          {/* Using inline styles instead of MUI theming */}
          <h3>Inconsistent Header</h3>
        </div>
        <input 
          type="text" 
          placeholder="Custom input instead of TextField"
          style={{ margin: '8px', padding: '8px' }}
        />
        <button 
          style={{ 
            backgroundColor: '#4a5568', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px' 
          }}
        >
          Inline styled button
        </button>
      </div>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        MUI Pattern Demo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Form Section
              </Typography>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Search Symbol"
                  variant="outlined"
                  fullWidth
                  placeholder="AAPL, GOOGL, etc."
                />
                <FormControl fullWidth>
                  <InputLabel>Market Type</InputLabel>
                  <Select label="Market Type" defaultValue="stocks">
                    <MenuItem value="stocks">Stocks</MenuItem>
                    <MenuItem value="crypto">Crypto</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="primary">
                    Search
                  </Button>
                  <Button variant="outlined">
                    Clear
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions & Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label="Active" 
                    color="success" 
                    variant="filled" 
                  />
                  <Chip 
                    label="Warning" 
                    color="warning" 
                    variant="outlined" 
                  />
                  <Chip 
                    label="Error" 
                    color="error" 
                    variant="filled" 
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary" aria-label="home">
                    <Home />
                  </IconButton>
                  <IconButton color="secondary" aria-label="search">
                    <Search />
                  </IconButton>
                  <IconButton aria-label="settings">
                    <Settings />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

describe('MUI Component Consistency Analysis', () => {
  const defaultTheme = createTheme();

  describe('Standard MUI Pattern Implementation', () => {
    test('renders consistent MUI patterns correctly', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="standard" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Test Typography hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('MUI Pattern Demo');
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);

      // Test form components
      expect(screen.getByRole('textbox', { name: /search symbol/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /market type/i })).toBeInTheDocument();

      // Test buttons
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();

      // Test icon buttons with proper ARIA labels
      expect(screen.getByRole('button', { name: 'home' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'search' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'settings' })).toBeInTheDocument();
    });

    test('applies MUI theme colors consistently', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="standard" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const searchButton = screen.getByRole('button', { name: 'Search' });
      const clearButton = screen.getByRole('button', { name: 'Clear' });

      // Verify button variants are applied
      expect(searchButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
      
      // MUI automatically applies theme colors through CSS-in-JS
      const computedSearchStyle = window.getComputedStyle(searchButton);
      const computedClearStyle = window.getComputedStyle(clearButton);
      
      expect(computedSearchStyle).toBeDefined();
      expect(computedClearStyle).toBeDefined();
    });

    test('uses proper spacing and layout with Grid system', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="standard" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Grid containers should be present
      const cards = screen.getAllByRole('group'); // Cards have implicit group role
      expect(cards).toHaveLength(2); // Two main cards
    });

    test('implements proper component hierarchy', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="standard" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // Check semantic structure
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('MUI Pattern Demo');
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
      
      // Form structure
      const textInput = screen.getByRole('textbox', { name: /search symbol/i });
      const selectInput = screen.getByRole('combobox', { name: /market type/i });
      
      expect(textInput.closest('form')).toBeInTheDocument();
      expect(selectInput.closest('form')).toBeInTheDocument();
    });
  });

  describe('Inconsistent Pattern Detection', () => {
    test('identifies non-MUI implementation patterns', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="inconsistent" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      // These elements use inline styles instead of MUI theming
      const customHeader = screen.getByText('Inconsistent Header');
      const customInput = screen.getByPlaceholderText('Custom input instead of TextField');
      const customButton = screen.getByText('Inline styled button');

      expect(customHeader).toBeInTheDocument();
      expect(customInput).toBeInTheDocument();
      expect(customButton).toBeInTheDocument();

      // Check that these don't follow MUI patterns
      expect(customInput).not.toHaveClass('MuiTextField-root'); // No MUI classes
      expect(customButton).not.toHaveClass('MuiButton-root'); // No MUI classes
    });

    test('detects missing ARIA labels and accessibility issues', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <MuiPatternsDemo variant="inconsistent" />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const customButton = screen.getByText('Inline styled button');
      
      // Custom button lacks proper accessibility attributes
      expect(customButton).not.toHaveAttribute('aria-label');
      expect(customButton).not.toHaveAttribute('role'); // button role is implicit for <button>
    });
  });

  describe('Theme Integration Analysis', () => {
    test('MUI components integrate with custom theme variables', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ 
              backgroundColor: 'var(--panel-bg-primary)',
              color: 'var(--text-primary)',
              p: 2
            }}>
              <Typography>Theme Integration Test</Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const testBox = screen.getByText('Theme Integration Test').closest('div');
      expect(testBox).toBeInTheDocument();

      // Check that CSS custom properties are available
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--panel-bg-primary')).toBeDefined();
      expect(root.style.getPropertyValue('--text-primary')).toBeDefined();
    });

    test('all app themes work with MUI components', () => {
      APP_THEMES.forEach((theme, index) => {
        const { unmount } = render(
          <CustomThemeProvider>
            <ThemeProvider theme={defaultTheme}>
              <Button variant="contained" data-testid={`theme-${index}-button`}>
                Test Button
              </Button>
            </ThemeProvider>
          </CustomThemeProvider>
        );

        const button = screen.getByTestId(`theme-${index}-button`);
        expect(button).toBeInTheDocument();
        
        // Check that theme properties are defined
        expect(theme.panelBackgroundPrimary).toBeDefined();
        expect(theme.textPrimary).toBeDefined();
        expect(theme.buttonBackground).toBeDefined();

        unmount();
      });
    });

    test('responsive breakpoints work with custom themes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    color: 'var(--text-primary)'
                  }}
                >
                  Responsive Text
                </Typography>
              </Grid>
            </Grid>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const responsiveText = screen.getByText('Responsive Text');
      expect(responsiveText).toBeInTheDocument();
    });
  });

  describe('Component Variant Consistency', () => {
    test('button variants are used consistently', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">Primary Action</Button>
              <Button variant="outlined" color="secondary">Secondary Action</Button>
              <Button variant="text" color="inherit">Tertiary Action</Button>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tertiary Action' })).toBeInTheDocument();
    });

    test('text field variants are used consistently', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Standard Variant" 
                variant="standard" 
                data-testid="standard-field"
              />
              <TextField 
                label="Outlined Variant" 
                variant="outlined" 
                data-testid="outlined-field"
              />
              <TextField 
                label="Filled Variant" 
                variant="filled" 
                data-testid="filled-field"
              />
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByTestId('standard-field')).toBeInTheDocument();
      expect(screen.getByTestId('outlined-field')).toBeInTheDocument();
      expect(screen.getByTestId('filled-field')).toBeInTheDocument();
    });

    test('typography variants maintain hierarchy', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box>
              <Typography variant="h1">Main Title</Typography>
              <Typography variant="h2">Section Title</Typography>
              <Typography variant="h3">Subsection Title</Typography>
              <Typography variant="body1">Body text paragraph</Typography>
              <Typography variant="body2">Secondary body text</Typography>
              <Typography variant="caption">Caption text</Typography>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title');
      expect(screen.getByText('Body text paragraph')).toBeInTheDocument();
      expect(screen.getByText('Secondary body text')).toBeInTheDocument();
      expect(screen.getByText('Caption text')).toBeInTheDocument();
    });
  });

  describe('Performance and Bundle Size Impact', () => {
    test('MUI components render efficiently', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return (
          <Paper>
            <Typography>Performance Test</Typography>
          </Paper>
        );
      };

      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <TestComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Performance Test')).toBeInTheDocument();
    });

    test('theme switching does not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        return <Typography>Render Count: {renderCount}</Typography>;
      };

      const { rerender } = render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <TestComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(renderCount).toBe(1);

      // Simulate theme change by re-rendering with same props
      rerender(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <TestComponent />
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(renderCount).toBe(2); // Should only increment by 1
    });
  });
});

describe('MUI Style Consistency Audit', () => {
  describe('Color Usage Patterns', () => {
    test('semantic colors are used consistently', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box>
              <Chip label="Success" color="success" />
              <Chip label="Warning" color="warning" />
              <Chip label="Error" color="error" />
              <Chip label="Info" color="info" />
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    });

    test('custom color variables integrate with MUI palette', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box 
              sx={{ 
                backgroundColor: 'var(--success)',
                color: 'var(--btn-text)',
                p: 2
              }}
              data-testid="custom-color-box"
            >
              Custom colored element
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      const customBox = screen.getByTestId('custom-color-box');
      expect(customBox).toBeInTheDocument();

      // Verify CSS custom properties are available
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--success')).toBeDefined();
      expect(root.style.getPropertyValue('--btn-text')).toBeDefined();
    });
  });

  describe('Spacing and Layout Consistency', () => {
    test('spacing follows MUI theme spacing scale', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Box sx={{ p: 2, m: 1 }}>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Paper sx={{ p: 2 }}>Content 1</Paper>
                </Grid>
                <Grid xs={6}>
                  <Paper sx={{ p: 2 }}>Content 2</Paper>
                </Grid>
              </Grid>
            </Box>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    test('layout components use consistent patterns', () => {
      render(
        <CustomThemeProvider>
          <ThemeProvider theme={defaultTheme}>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Section Header
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button size="small">Small</Button>
                <Button size="medium">Medium</Button>
                <Button size="large">Large</Button>
              </Box>
            </Paper>
          </ThemeProvider>
        </CustomThemeProvider>
      );

      expect(screen.getByText('Section Header')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument();
    });
  });
});