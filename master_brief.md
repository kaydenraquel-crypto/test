# NovaSignal — Master Brief
Read this first. Agents must:
- Work within their component scope (see `component_map.yaml`)
- Write tests and update §6 Work Log
- Open PRs; CODEOWNERS review is required

## Phases
1) Stabilize (providers, error boundaries) 
2) Grow (charts v2, signals/backtests, AI flows)
3) Harden (perf, E2E, packaging)

## §6 Work Log (append)
- Date / Agent / Component / Files touched / Decisions / Next

**2025-08-26 / frontend-dev / Symbol Search MVP**
- **Files Created:**
  - `/frontend/src/types/symbol.ts` - Symbol search types and mock data
  - `/frontend/src/services/api.ts` - API client with symbol search endpoint and mock fallback
  - `/frontend/src/hooks/useSymbolSearch.ts` - Custom hook with debounced search, caching, and error handling
  - `/frontend/src/components/SymbolSearch.tsx` - Main component with real-time search and responsive design
  - `/frontend/src/components/__tests__/SymbolSearch.test.tsx` - Comprehensive component tests (32 tests)
  - `/frontend/src/hooks/__tests__/useSymbolSearch.test.ts` - Hook tests with race condition handling (19 tests)
- **Key Decisions:**
  - Implemented debounced search with 300ms delay for optimal UX
  - Added intelligent caching system with 5-minute TTL
  - Used MUI components for consistent design language
  - Mock API integration with graceful fallback on network errors
  - Comprehensive keyboard navigation and accessibility support
  - Race condition protection using request IDs
- **Test Results:** 51/51 new tests passing, comprehensive coverage including edge cases, error handling, and accessibility
- **Next:** Ready for PR submission and integration into main app

- 2025-01-26 / backend-api / backend-api / `backend/routers/symbols.py`, `backend/schemas/symbol.py`, `backend/test_symbols.py`, `backend/main.py` / Implemented GET /api/symbols?q= endpoint with comprehensive search, rate limiting (10 req/min), validation, OpenAPI docs, and full test coverage (19 passing tests). Supports stocks, crypto, ETFs, forex with type filtering and query validation. Ready for PR review. / Open PR and address any CODEOWNERS feedback
