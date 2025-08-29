# Watchlist & Alerts


**Description:** Watchlist CRUD, alert rules/UX, notifications and persistence


**Scope Include:**

```yaml

- frontend/src/features/watchlist/**
      - frontend/src/features/alerts/**
      - backend/app/routers/alerts.py

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Watchlist & Alerts.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:alerts-watchlist (or closest component), create branch feat/alerts-watchlist/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: alerts-watchlist
    name: Watchlist & Alerts
    description: Watchlist CRUD, alert rules/UX, notifications and persistence
    scope_include:
      - frontend/src/features/watchlist/**
      - frontend/src/features/alerts/**
      - backend/app/routers/alerts.py
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Watchlist & Alerts.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:alerts-watchlist (or closest component), create branch feat/alerts-watchlist/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
