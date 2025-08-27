# Data Model & Persistence


**Description:** DB schema/migrations, caching, symbol/timeframe mapping


**Scope Include:**

```yaml

- backend/app/models/**
      - backend/app/db/**
      - backend/migrations/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Data Model & Persistence.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:data-persistence (or closest component), create branch feat/data-persistence/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: data-persistence
    name: Data Model & Persistence
    description: DB schema/migrations, caching, symbol/timeframe mapping
    scope_include:
      - backend/app/models/**
      - backend/app/db/**
      - backend/migrations/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Data Model & Persistence.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:data-persistence (or closest component), create branch feat/data-persistence/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
