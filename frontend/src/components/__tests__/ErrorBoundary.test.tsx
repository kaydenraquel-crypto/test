import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorBoundary, ErrorFallback } from '../ErrorBoundary';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock MUI theme for tests
const mockTheme = createTheme();

// Mock Sentry
const mockSentry = {
  captureException: vi.fn(),
};
(window as any).Sentry = mockSentry;

// Mock gtag
const mockGtag = vi.fn();
(window as any).gtag = mockGtag;

// Test component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Helper to wrap components with theme provider
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Normal operation', () => {
    it('renders children when there is no error', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <div>Test content</div>
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders custom fallback when provided and no error occurs', () => {
      const CustomFallback = () => <div>Custom fallback</div>;
      
      render(
        <ThemeWrapper>
          <ErrorBoundary fallback={<CustomFallback />}>
            <div>Test content</div>
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByText('Custom fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('catches errors and displays error UI', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
    });

    it('displays custom error message based on isolation level', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="component">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.getByText(/This component failed to load/)).toBeInTheDocument();
    });

    it('displays route-level error message', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="route">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Page Error')).toBeInTheDocument();
      expect(screen.getByText(/This page encountered an error/)).toBeInTheDocument();
    });

    it('renders custom fallback when error occurs', () => {
      const CustomFallback = () => <div>Custom error fallback</div>;
      
      render(
        <ThemeWrapper>
          <ErrorBoundary fallback={<CustomFallback />}>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    });

    it('calls onError callback when error occurs', () => {
      const onErrorMock = vi.fn();
      
      render(
        <ThemeWrapper>
          <ErrorBoundary onError={onErrorMock}>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('generates unique error ID for each error', () => {
      const { rerender } = render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      const firstErrorId = screen.getByText(/Error ID:/).textContent;

      // Reset and trigger a new error
      rerender(
        <ThemeWrapper>
          <ErrorBoundary>
            <div>No error</div>
          </ErrorBoundary>
        </ThemeWrapper>
      );

      rerender(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      const secondErrorId = screen.getByText(/Error ID:/).textContent;
      expect(firstErrorId).not.toBe(secondErrorId);
    });
  });

  describe('Integration with error tracking services', () => {
    it('sends error to Sentry when available', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="component">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: expect.objectContaining({
            react: expect.any(Object),
            errorBoundary: expect.objectContaining({
              isolationLevel: 'component',
              errorId: expect.any(String),
            }),
          }),
          tags: expect.objectContaining({
            errorBoundary: true,
            isolationLevel: 'component',
            errorId: expect.any(String),
          }),
        })
      );
    });

    it('sends error to Google Analytics when available', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="global">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error message',
        fatal: true,
        error_id: expect.any(String),
        isolation_level: 'global',
      });
    });

    it('marks non-global errors as non-fatal', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="component">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error message',
        fatal: false,
        error_id: expect.any(String),
        isolation_level: 'component',
      });
    });
  });

  describe('Retry functionality', () => {
    it('allows retry up to max attempts', () => {
      let attemptCount = 0;
      const ConditionalError = () => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error(`Attempt ${attemptCount} error`);
        }
        return <div>Success after retries</div>;
      };

      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ConditionalError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      // First error
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      // First retry
      fireEvent.click(screen.getByText('Try Again'));
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      // Second retry
      fireEvent.click(screen.getByText('Try Again'));
      expect(screen.getByText('Success after retries')).toBeInTheDocument();
    });

    it('disables retry button after max attempts', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      const retryButton = screen.getByText('Try Again');

      // First retry
      fireEvent.click(retryButton);
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      // Second retry
      fireEvent.click(screen.getByText('Try Again'));
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      // Third retry
      fireEvent.click(screen.getByText('Try Again'));
      expect(screen.getByText(/Max retries reached \(3\)/)).toBeInTheDocument();
      expect(screen.getByText(/Max retries reached \(3\)/)).toBeDisabled();
    });

    it('tracks retry attempts in analytics', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Try Again'));

      expect(mockGtag).toHaveBeenCalledWith('event', 'error_boundary_retry', {
        retry_count: 1,
        isolation_level: 'global',
      });
    });
  });

  describe('Error details', () => {
    it('can toggle error details visibility', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      const toggleButton = screen.getByText('Show Error Details');
      fireEvent.click(toggleButton);

      expect(screen.getByText('Hide Error Details')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      const toggleButton = screen.getByText('Show Error Details');
      fireEvent.click(toggleButton);

      expect(screen.getByText('Stack Trace (Development):')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error reporting', () => {
    // Mock window.open
    const mockOpen = vi.fn();
    const originalOpen = window.open;

    beforeEach(() => {
      window.open = mockOpen;
    });

    afterEach(() => {
      window.open = originalOpen;
      mockOpen.mockClear();
    });

    it('opens email client for error reporting', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Report Error'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('mailto:support@novasignal.io')
      );
    });

    it('tracks error report in analytics', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Report Error'));

      expect(mockGtag).toHaveBeenCalledWith('event', 'error_report_sent', {
        error_id: expect.any(String),
        isolation_level: 'global',
      });
    });
  });

  describe('Navigation options', () => {
    it('shows Go Home button for non-global errors', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="route">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('does not show Go Home button for global errors', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary isolationLevel="global">
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.queryByText('Go Home')).not.toBeInTheDocument();
    });

    it('always shows Reload Page button', () => {
      render(
        <ThemeWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ThemeWrapper>
      );

      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
  });
});

describe('ErrorFallback', () => {
  const mockError = new Error('Test fallback error');

  it('renders error message', () => {
    render(
      <ThemeWrapper>
        <ErrorFallback error={mockError} />
      </ThemeWrapper>
    );

    expect(screen.getByText('Error in this section')).toBeInTheDocument();
    expect(screen.getByText('Test fallback error')).toBeInTheDocument();
  });

  it('renders retry button when resetError is provided', () => {
    const mockReset = vi.fn();

    render(
      <ThemeWrapper>
        <ErrorFallback error={mockError} resetError={mockReset} />
      </ThemeWrapper>
    );

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when resetError is not provided', () => {
    render(
      <ThemeWrapper>
        <ErrorFallback error={mockError} />
      </ThemeWrapper>
    );

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});