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
- 2025-01-26 / backend-api / backend-api / `backend/routers/symbols.py`, `backend/schemas/symbol.py`, `backend/test_symbols.py`, `backend/main.py` / Implemented GET /api/symbols?q= endpoint with comprehensive search, rate limiting (10 req/min), validation, OpenAPI docs, and full test coverage (19 passing tests). Supports stocks, crypto, ETFs, forex with type filtering and query validation. Ready for PR review. / Open PR and address any CODEOWNERS feedback
