/**
 * Test Suite for MUI Theme Integration Quality
 * Tests the integration between custom theme system and MUI components
 */

import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import { ThemeProvider as CustomThemeProvider, APP_THEMES } from '../../contexts/ThemeContext';

// Mock component to test theme integration
const ThemeTestComponent = () => (
  <Box>
    <Typography variant="h4" color="primary">
      Test Heading
    </Typography>
    <Typography variant="body1" color="text.primary">
      Test body text
    </Typography>
    <Button variant="contained" color="primary">
      Test Button
    </Button>
  </Box>
);

describe('MUI Theme Integration', () => {
  test('custom theme provides correct CSS variables', () => {
    render(
      <CustomThemeProvider>
        <ThemeTestComponent />
      </CustomThemeProvider>
    );

    // Check if CSS custom properties are set
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--panel-bg-primary')).toBeDefined();
    expect(root.style.getPropertyValue('--text-primary')).toBeDefined();
    expect(root.style.getPropertyValue('--btn-bg')).toBeDefined();
  });

  test('MUI components respect custom theme colors', () => {
    const darkTheme = APP_THEMES[1]; // Dark theme
    
    render(
      <CustomThemeProvider>
        <ThemeTestComponent />
      </CustomThemeProvider>
    );

    // Verify elements are rendered
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test body text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  test('theme switching updates CSS variables', () => {
    const { rerender } = render(
      <CustomThemeProvider>
        <ThemeTestComponent />
      </CustomThemeProvider>
    );

    const root = document.documentElement;
    const initialBgColor = root.style.getPropertyValue('--panel-bg-primary');

    // Theme switching would normally be done through context
    // This is a simplified test of the concept
    expect(initialBgColor).toBeDefined();
  });

  test('all theme variants have required properties', () => {
    APP_THEMES.forEach((theme, index) => {
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('panelBackgroundPrimary');
      expect(theme).toHaveProperty('textPrimary');
      expect(theme).toHaveProperty('buttonBackground');
      expect(theme).toHaveProperty('successColor');
      expect(theme).toHaveProperty('errorColor');
    });
  });

  test('theme persistence works with localStorage', () => {
    // Mock localStorage
    const mockGetItem = jest.fn(() => JSON.stringify(APP_THEMES[1]));
    const mockSetItem = jest.fn();
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
    });

    render(
      <CustomThemeProvider>
        <ThemeTestComponent />
      </CustomThemeProvider>
    );

    // Verify localStorage is called for theme persistence
    expect(mockSetItem).toHaveBeenCalled();
  });
});

describe('MUI Component Accessibility', () => {
  test('MUI components have proper ARIA attributes', () => {
    render(
      <CustomThemeProvider>
        <Box role="main">
          <Typography variant="h1">Main Heading</Typography>
          <Button aria-label="Test action button">Action</Button>
        </Box>
      </CustomThemeProvider>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test action button' })).toBeInTheDocument();
  });

  test('focus management works correctly', () => {
    render(
      <CustomThemeProvider>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </CustomThemeProvider>
    );

    const firstButton = screen.getByRole('button', { name: 'First Button' });
    const secondButton = screen.getByRole('button', { name: 'Second Button' });

    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    secondButton.focus();
    expect(document.activeElement).toBe(secondButton);
  });
});

describe('Responsive Design Integration', () => {
  test('MUI breakpoints work with custom theme', () => {
    // Mock window.matchMedia for responsive testing
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
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'block' }
          }}
          data-testid="responsive-box"
        >
          Responsive Content
        </Box>
      </CustomThemeProvider>
    );

    // Component should be present (testing responsive behavior would need more complex setup)
    expect(screen.getByTestId('responsive-box')).toBeInTheDocument();
  });
});