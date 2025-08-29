# NovaSignal v0.2 - Comprehensive Development Roadmap

**Project**: NovaSignal Trading Platform  
**Version**: 0.2 → 1.0  
**Last Updated**: 2025-01-26  
**Prepared by**: Project Supervisor (AI Agent)  

## Executive Summary

This roadmap outlines the comprehensive development plan to evolve NovaSignal from v0.2 (current experimental state) to v1.0 (production-ready trading platform). Based on extensive codebase audit involving 11 specialized agents, this plan addresses critical infrastructure gaps, implements enterprise-grade features, and establishes scalable architecture patterns.

**Current State**: Functional prototype with advanced features but critical production gaps  
**Target State**: Enterprise-ready trading platform with robust infrastructure  
**Timeline**: 16-20 weeks across 4 phases  
**Risk Level**: Medium (well-scoped work with clear dependencies)  

---

## Phase Breakdown

### **P0 – Stabilize (Critical) - Weeks 1-4**
*Unblock core functionality, fix broken tests, resolve security vulnerabilities*

### **P1 – Productize (High) - Weeks 5-10** 
*MUI design system, installer improvements, API hardening, error handling architecture*

### **P2 – Scale & Observe (Medium) - Weeks 11-16**
*Performance optimization, observability, comprehensive testing, advanced features*

### **P3 – Polish & DX (Low) - Weeks 17-20**
*Documentation, tooling improvements, advanced charting, developer experience*

---

# P0 – STABILIZE (Critical Priority)

**Duration**: 4 weeks  
**Goal**: Fix blocking issues, establish stable foundation  
**Dependencies**: None - highest priority work  

## Epic 1.1: Fix Critical Infrastructure Issues
*Owner: backend-api + test-specialist*  
*Scope: `backend/`, `frontend/`, `.github/workflows/`*  
*Timebox: 2 weeks*

### Work Package 1.1.1: Resolve TypeScript Compilation Errors
- **Owner**: frontend-dev
- **Scope**: `frontend/src/contexts/`, `frontend/src/components/experimental/`
- **Acceptance Criteria**:
  - `npx tsc --noEmit` returns exit code 0
  - All 50+ type errors in ThemeContext resolved
  - React Router type issues fixed in ExperimentalApp
- **Definition of Done**:
  - Clean TypeScript compilation
  - CI/CD pipeline passes type checking
  - No type assertion workarounds
- **Test Plan**: Unit tests for context providers, type coverage validation
- **Risk**: High complexity in ThemeContext refactoring
- **Telemetry**: TypeScript error count, build success rate

### Work Package 1.1.2: Fix Testing Infrastructure
- **Owner**: test-specialist  
- **Scope**: `frontend/vitest.config.ts`, `frontend/package.json`, `backend/pyproject.toml`
- **Acceptance Criteria**:
  - `npm run test` executes successfully with coverage
  - `pytest -q` runs without I/O errors
  - CI/CD test gates function properly
- **Definition of Done**:
  - 100% test execution success rate
  - Coverage reporting functional
  - CI test results properly displayed
- **Test Plan**: Test infrastructure validation, coverage threshold enforcement
- **Risk**: jsdom/pytest environment complexity
- **Telemetry**: Test execution time, coverage percentage, flaky test rate

### Work Package 1.1.3: Backend Dependency Resolution
- **Owner**: backend-api
- **Scope**: `backend/requirements.txt`, `backend/pyproject.toml`
- **Acceptance Criteria**:
  - websockets compatibility resolved
  - All packages install without conflicts
  - pytest executes successfully
- **Definition of Done**:
  - `pip check` returns no conflicts
  - All backend tests pass
  - Dependencies locked with precise versions
- **Test Plan**: Integration tests with all providers, dependency security scanning
- **Risk**: Breaking changes in upgraded packages
- **Telemetry**: Dependency security scan results, API provider success rates

## Epic 2: Backend Testing Infrastructure
**Owner:** test-specialist, backend-api | **Timebox:** 1 week | **Risk:** Medium

### Work Package 2.1: Fix pytest Configuration
- **Scope:** backend/requirements.txt, backend/tests/
- **Issues:** langsmith dependency conflicts, pytest failing to run
- **Acceptance Criteria:**
  - [ ] pytest runs without dependency errors
  - [ ] Basic API endpoint tests passing
  - [ ] Test coverage reporting functional
- **Test Plan:** Full backend test suite execution, API integration testing

**Definition of Done:** Backend tests run successfully, CI/CD pipeline validates backend functionality

## Epic 3: Security Vulnerability Remediation
**Owner:** security, installer-win | **Timebox:** 1 week | **Risk:** High

### Work Package 3.1: Fix Hardcoded Security Issues
- **Scope:** installer/src/main.js, start-simple.bat
- **Issues:** 
  - Hardcoded encryption key: `'novasignal-secure-key-2025'`
  - Deprecated crypto methods (createCipher vs createCipherGCM)
  - Path injection risks in batch files
- **Acceptance Criteria:**
  - [ ] Environment-based encryption keys
  - [ ] Modern crypto methods (AES-256-GCM)
  - [ ] Parameterized paths in scripts
- **Test Plan:** Security scanning, penetration testing of installer

**Definition of Done:** Security scan passes, no hardcoded secrets, modern crypto implementation

## Epic 4: Core Error Boundaries
**Owner:** frontend-dev, backend-api | **Timebox:** 2 weeks | **Risk:** Medium

### Work Package 4.1: Frontend Global Error Boundary
- **Scope:** frontend/src/App.tsx, frontend/src/components/ErrorBoundary.tsx
- **Acceptance Criteria:**
  - [ ] Global ErrorBoundary catches all React errors
  - [ ] Route-level boundaries for feature isolation
  - [ ] User-friendly error UI with retry options
  - [ ] Error reporting to logging system
- **Test Plan:** Error simulation testing, boundary isolation validation

### Work Package 4.2: Backend Exception Handlers
- **Scope:** backend/app/handlers/errors.py, backend/main.py
- **Acceptance Criteria:**
  - [ ] Global FastAPI exception handlers
  - [ ] Structured error schema with correlation IDs
  - [ ] HTTP error status consistency
  - [ ] Error logging with context
- **Test Plan:** Error scenario testing, API error response validation

**Definition of Done:** Robust error handling prevents app crashes, structured error reporting implemented

---

# P1 - Productize (High Priority)

> **Goal:** Professional UI/UX, cross-platform support, production-grade error handling

## Epic 5: MUI Design System Implementation
**Owner:** frontend-dev, design-system | **Timebox:** 3 weeks | **Risk:** Medium

### Work Package 5.1: Core App MUI Migration
- **Scope:** frontend/src/App.tsx, frontend/src/components/
- **Issues:** Core app uses minimal MUI, inconsistent patterns
- **Acceptance Criteria:**
  - [ ] App.tsx migrated to MUI component patterns
  - [ ] Consistent MUI usage across core components
  - [ ] Theme system consolidated (single source)
  - [ ] Responsive design standardized
- **Test Plan:** Visual regression testing, responsive design validation
- **Risks:** Large refactoring scope, potential breaking changes

### Work Package 5.2: Design Token Standardization
- **Scope:** frontend/src/contexts/ThemeContext.tsx, Theme/
- **Issues:** Duplicate theme systems, inconsistent styling
- **Acceptance Criteria:**
  - [ ] Single ThemeProvider implementation
  - [ ] Standardized color, typography, spacing tokens
  - [ ] Dark/light mode consistency
  - [ ] Component variant standardization
- **Test Plan:** Theme switching tests, visual consistency validation

**Definition of Done:** Consistent MUI patterns throughout app, professional design system, single theme implementation

## Epic 6: Cross-Platform Installer Support
**Owner:** bootstrap-scripts, installer-win | **Timebox:** 2 weeks | **Risk:** Medium

### Work Package 6.1: Unix Installer Scripts
- **Scope:** Root directory (install.sh, install-macos.sh)
- **Issues:** No Linux/macOS equivalent to install.ps1
- **Acceptance Criteria:**
  - [ ] install.sh for Linux with package manager detection
  - [ ] install-macos.sh with Homebrew integration
  - [ ] Feature parity with Windows installer
  - [ ] Error handling and validation equivalent
- **Test Plan:** Multi-platform installation testing, dependency validation

### Work Package 6.2: Platform Detection & Automation
- **Scope:** validate-setup.js, installation scripts
- **Acceptance Criteria:**
  - [ ] Automatic platform detection
  - [ ] Appropriate installer recommendation
  - [ ] Cross-platform validation scripts
- **Test Plan:** Platform detection testing across OS variants

**Definition of Done:** Full cross-platform installation support, automated platform detection

## Epic 7: Production Error Handling Architecture
**Owner:** frontend-dev, backend-api | **Timebox:** 3 weeks | **Risk:** Medium

### Work Package 7.1: Frontend Error Handling Enhancement
- **Scope:** frontend/src/lib/errorHandling.ts, frontend/src/services/
- **Acceptance Criteria:**
  - [ ] Centralized API error handling with retry logic
  - [ ] Network offline detection and recovery
  - [ ] User notification system (toast/snackbar)
  - [ ] Error categorization and routing
  - [ ] Sentry integration for production monitoring
- **Test Plan:** Error scenario simulation, network failure testing

### Work Package 7.2: Backend Error Middleware
- **Scope:** backend/app/middleware/, backend/app/handlers/
- **Acceptance Criteria:**
  - [ ] Request logging middleware with correlation IDs
  - [ ] Structured exception handling
  - [ ] Rate limiting with proper error responses
  - [ ] Health/readiness endpoint implementation
- **Test Plan:** API error testing, middleware performance testing

**Definition of Done:** Comprehensive error handling prevents user-facing crashes, structured error reporting

## Epic 8: Backend Observability Foundation
**Owner:** backend-api, observability | **Timebox:** 2 weeks | **Risk:** Medium

### Work Package 8.1: Structured Logging Implementation
- **Scope:** backend/main.py, backend/app/, backend/connectors/
- **Issues:** Basic Python logging, no structure or correlation
- **Acceptance Criteria:**
  - [ ] Structured logging with JSON format
  - [ ] Correlation IDs for request tracing
  - [ ] Log levels and filtering
  - [ ] Performance logging for API calls
- **Test Plan:** Log format validation, correlation ID testing

**Definition of Done:** Structured backend logging with correlation, performance monitoring

---

# P2 - Scale & Observe (Medium Priority)

> **Goal:** Performance optimization, advanced observability, scalability features

## Epic 9: Distributed Tracing System
**Owner:** observability | **Timebox:** 2 weeks | **Risk:** Medium

### Work Package 9.1: OpenTelemetry Integration
- **Scope:** System-wide (frontend/backend)
- **Acceptance Criteria:**
  - [ ] OpenTelemetry SDK integration
  - [ ] Span instrumentation for API calls
  - [ ] Cross-service trace correlation
  - [ ] Jaeger/Zipkin backend configuration
- **Test Plan:** End-to-end trace validation, performance impact testing

**Definition of Done:** Full request tracing from frontend through backend services

## Epic 10: Performance Optimization
**Owner:** frontend-dev, backend-api | **Timebox:** 3 weeks | **Risk:** Low

### Work Package 10.1: Frontend Bundle Optimization
- **Scope:** frontend/vite.config.js, frontend/src/
- **Acceptance Criteria:**
  - [ ] Bundle analysis and size optimization
  - [ ] Code splitting for large features
  - [ ] Lazy loading optimization
  - [ ] Asset optimization and caching
- **Test Plan:** Performance benchmarking, loading time measurement

### Work Package 10.2: Backend Performance Tuning
- **Scope:** backend/main.py, backend/connectors/
- **Acceptance Criteria:**
  - [ ] API response time optimization
  - [ ] Database query optimization
  - [ ] Caching strategy implementation
  - [ ] Rate limiting and throttling
- **Test Plan:** Load testing, performance profiling

**Definition of Done:** Measurable performance improvements, optimized resource usage

## Epic 11: Advanced Alerting System
**Owner:** observability | **Timebox:** 2 weeks | **Risk:** Low

### Work Package 11.1: Prometheus & AlertManager Setup
- **Scope:** Infrastructure, backend observability
- **Acceptance Criteria:**
  - [ ] Prometheus metrics collection
  - [ ] AlertManager configuration
  - [ ] Error rate and performance alerts
  - [ ] Notification channels (Slack, email)
- **Test Plan:** Alert condition testing, notification delivery validation

**Definition of Done:** Automated alerting for errors, performance, and availability

---

# P3 - Polish & DX (Low Priority)

> **Goal:** Developer experience, documentation, advanced tooling

## Epic 12: Developer Experience Enhancement
**Owner:** docs-writer, ci-cd | **Timebox:** 2 weeks | **Risk:** Low

### Work Package 12.1: Documentation Overhaul
- **Scope:** docs/, README files, code comments
- **Acceptance Criteria:**
  - [ ] Comprehensive setup guides with screenshots
  - [ ] API documentation generation
  - [ ] Troubleshooting guides
  - [ ] Architecture documentation
- **Test Plan:** Documentation validation, setup following

**Definition of Done:** Professional documentation supporting easy onboarding

## Epic 13: Advanced Development Tools
**Owner:** ci-cd, frontend-dev | **Timebox:** 1 week | **Risk:** Low

### Work Package 13.1: Storybook Implementation
- **Scope:** frontend/src/components/
- **Acceptance Criteria:**
  - [ ] Storybook setup for component library
  - [ ] Component stories for design system
  - [ ] Visual regression testing
- **Test Plan:** Storybook functionality validation

**Definition of Done:** Component library with visual documentation

---

# Error Handling Architecture (Detailed Implementation)

Based on comprehensive audit findings, the NovaSignal platform requires a robust error handling architecture to prevent user-facing crashes and provide excellent debugging capabilities in production.

## Frontend Error Handling Implementation

### Global ErrorBoundary Component
```typescript
// frontend/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { RefreshIcon, BugReportIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Log error with context
    console.error(`[ErrorBoundary ${errorId}]`, error, errorInfo);

    // Send to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: errorInfo },
        tags: { errorBoundary: true, errorId },
      });
    }

    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_id: errorId,
      });
    }

    // Custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReportError = () => {
    const { error, errorId } = this.state;
    const reportUrl = `mailto:support@novasignal.io?subject=Error Report ${errorId}&body=${encodeURIComponent(
      `Error ID: ${errorId}\nError: ${error?.message}\nStack: ${error?.stack}`
    )}`;
    window.open(reportUrl);
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error, errorId, retryCount } = this.state;

      if (fallback) {
        return fallback;
      }

      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary">
                An unexpected error occurred. Our team has been notified.
              </Typography>
            </Alert>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Error ID: {errorId}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                disabled={retryCount >= 3}
              >
                {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<BugReportIcon />}
                onClick={this.handleReportError}
              >
                Report Error
              </Button>
              <Button
                variant="text"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {error?.stack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### API Error Interceptor
```typescript
// frontend/src/services/http.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public correlationId: string
  ) {}
}

// Centralized fetch wrapper with:
// - Exponential backoff retry
// - Network offline detection
// - Error categorization
// - Correlation ID propagation
```

### User Notification System
```typescript
// Integration with MUI Snackbar
// Error severity levels
// Retry action buttons
// Dismissible notifications
```

## Backend Error Handling Implementation

### Global Exception Handlers
```python
# backend/app/handlers/errors.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import uuid
import structlog

logger = structlog.get_logger()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    correlation_id = str(uuid.uuid4())
    
    logger.error(
        "unhandled_exception",
        correlation_id=correlation_id,
        path=request.url.path,
        method=request.method,
        exception=str(exc),
        exc_info=exc
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
            "correlation_id": correlation_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### Structured Error Schema
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    correlation_id: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None
```

### Request Logging Middleware
```python
# backend/app/middleware/observability.py
import time
import structlog
from fastapi import Request

logger = structlog.get_logger()

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    correlation_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Add correlation ID to request state
    request.state.correlation_id = correlation_id
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        "api_request",
        correlation_id=correlation_id,
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        process_time=process_time,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None
    )
    
    return response
```

---

# MUI Overhaul Plan

## Theme Consolidation Strategy

### Single Source of Truth Theme
```typescript
// frontend/src/theme/index.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#00c853', // NovaSignal green
    },
    secondary: {
      main: '#ff6d00', // Accent orange
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    // ... consistent typography scale
  },
  spacing: 8, // 8px base unit
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'trading' },
          style: {
            backgroundColor: '#00c853',
            color: 'white',
            '&:hover': {
              backgroundColor: '#00a846',
            },
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    // ... standardized component variants
  },
};

export const lightTheme = createTheme(baseThemeOptions);
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'light',
    // ... light mode overrides
  },
});
```

### Component Migration Priority

#### High Priority (Core User Interface)
1. **App.tsx** - Main application shell
2. **Chart controls** - Trading interface components
3. **Symbol search** - Already well implemented
4. **Navigation components**

#### Medium Priority (Feature Panels)
1. **NewsFeed.tsx** - Currently vanilla CSS
2. **AnalyticsDashboard.tsx** - Inconsistent styling
3. **WatchlistPanel.tsx** - Mixed implementation
4. **Portfolio.tsx** - Basic styling

#### Low Priority (Secondary Features)
1. **Settings panels**
2. **Debug components**
3. **Test components**

### Design Token Implementation
```typescript
// frontend/src/theme/tokens.ts
export const tokens = {
  colors: {
    trading: {
      buy: '#00c853',
      sell: '#f44336',
      neutral: '#757575',
    },
    chart: {
      bullish: '#4caf50',
      bearish: '#f44336',
      grid: 'rgba(255, 255, 255, 0.1)',
    },
    status: {
      connected: '#00c853',
      connecting: '#ff9800',
      error: '#f44336',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
} as const;
```

---

# Installer/Wizard/Updater Enhancement Plan

## Unix Installer Implementation

### install.sh (Linux)
```bash
#!/bin/bash
set -e

# NovaSignal Linux Installer
# Auto-detects package manager and installs dependencies

detect_package_manager() {
    if command -v apt-get &> /dev/null; then
        echo "apt"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    else
        echo "unknown"
    fi
}

install_python_nodejs() {
    local pm=$(detect_package_manager)
    
    case $pm in
        "apt")
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip python3-venv nodejs npm
            ;;
        "yum"|"dnf")
            sudo $pm install -y python3 python3-pip nodejs npm
            ;;
        "pacman")
            sudo pacman -S --noconfirm python python-pip nodejs npm
            ;;
        *)
            echo "Unsupported package manager. Please install Python 3.8+ and Node.js 18+ manually."
            exit 1
            ;;
    esac
}

# Main installation logic
install_python_nodejs
# Mirror Windows installer functionality
# Create virtual environment
# Install dependencies
# Create launch scripts
```

### install-macos.sh (macOS)
```bash
#!/bin/bash
set -e

# NovaSignal macOS Installer
# Uses Homebrew for dependency management

if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install dependencies via Homebrew
brew install python@3.11 node@18

# Mirror Windows installer functionality
```

## First-Run Wizard Enhancement

### Enhanced API Key Management
```javascript
// installer/src/wizard.js - Enhanced security
const crypto = require('crypto');
const keytar = require('keytar'); // OS keychain integration

class SecureStorage {
    static async storeApiKey(service, key) {
        // Use OS keychain instead of encrypted file
        await keytar.setPassword('novasignal', service, key);
    }
    
    static async getApiKey(service) {
        return await keytar.getPassword('novasignal', service);
    }
}

// Environment-based encryption for additional data
const getEncryptionKey = () => {
    return process.env.NOVASIGNAL_ENCRYPT_KEY || crypto.randomBytes(32).toString('hex');
};
```

### Setup Validation Enhancement
```javascript
// Enhanced pre-flight checks
class SystemValidator {
    static async validateSystem() {
        const checks = [
            this.checkPythonVersion(),
            this.checkNodeVersion(),
            this.checkDiskSpace(),
            this.checkNetworkConnectivity(),
            this.checkPortAvailability([8000, 5173]),
        ];
        
        return Promise.all(checks);
    }
}
```

---

# Dependency Graph

## Critical Path Dependencies
```
P0 Epic 1 (Build Fix) → P1 Epic 5 (MUI Migration)
P0 Epic 3 (Security) → P2 Epic 11 (Alerting)
P0 Epic 4 (Error Handling) → P1 Epic 7 (Error Architecture)
P1 Epic 8 (Backend Observability) → P2 Epic 9 (Tracing)
```

## Parallel Work Streams
- **Stream A:** Frontend (Epics 1, 5, 7.1, 10.1)
- **Stream B:** Backend (Epics 2, 4.2, 7.2, 8, 9, 10.2)  
- **Stream C:** Infrastructure (Epics 3, 6, 11)
- **Stream D:** Documentation (Epic 12, 13)

---

# Merge Sequence

## Phase 0 (Critical Fixes)
1. **build-fixes** branch (Epic 1) → develop → master
2. **security-hardening** branch (Epic 3) → develop → master
3. **test-infrastructure** branch (Epic 2) → develop → master
4. **error-boundaries** branch (Epic 4) → develop → master

## Phase 1 (Production Features)
1. **mui-design-system** branch (Epic 5) → develop → master
2. **cross-platform-installers** branch (Epic 6) → develop → master  
3. **error-architecture** branch (Epic 7) → develop → master
4. **backend-observability** branch (Epic 8) → develop → master

## Phase 2 (Scale & Observe)
1. **distributed-tracing** branch (Epic 9) → develop → master
2. **performance-optimization** branch (Epic 10) → develop → master
3. **alerting-system** branch (Epic 11) → develop → master

## Phase 3 (Polish)
1. **documentation** branch (Epic 12) → develop → master
2. **dev-tools** branch (Epic 13) → develop → master

---

# Risk Assessment

## High Risk Items
- **Epic 1 (Build Fix):** Complex TypeScript errors may require architecture changes
- **Epic 3 (Security):** Crypto changes could affect existing encrypted data
- **Epic 5 (MUI Migration):** Large refactoring scope with potential breaking changes

## Mitigation Strategies
- **Build Issues:** Start with minimal fixes, gradual migration approach
- **Security Changes:** Implement migration scripts for existing encrypted data
- **MUI Migration:** Feature flags for gradual rollout, extensive testing

## Dependencies Outside Control
- **DXCharts Library:** Availability and compatibility
- **Third-party Services:** Sentry, external APIs
- **Platform Support:** OS-specific installer requirements

---

# Success Metrics

## P0 Success Criteria
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend tests pass (`pytest`)
- [ ] Security scan shows no critical vulnerabilities
- [ ] Application starts and basic functionality works

## P1 Success Criteria
- [ ] Professional UI with consistent MUI patterns
- [ ] Cross-platform installation support
- [ ] Comprehensive error handling prevents crashes
- [ ] Structured backend logging operational

## P2 Success Criteria  
- [ ] Full request tracing from frontend to backend
- [ ] Performance benchmarks show measurable improvements
- [ ] Automated alerts for errors and performance issues

## P3 Success Criteria
- [ ] New developer can set up environment in <30 minutes
- [ ] Component library documented in Storybook
- [ ] Architecture documentation complete

This roadmap provides a clear path from the current state to a production-ready, enterprise-grade financial trading platform with proper observability, security, and user experience.