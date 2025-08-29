# API Gateway & Routers


**Description:** FastAPI routers, DTOs, auth middleware, error handling


**Scope Include:**

```yaml

- backend/app/routers/**
      - backend/app/schemas/**
      - backend/app/dependencies/**

```


**Scope Exclude:**

```yaml

- backend/app/routers/ai.py

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the API Gateway & Routers.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:backend-api (or closest component), create branch feat/backend-api/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: backend-api
    name: API Gateway & Routers
    description: FastAPI routers, DTOs, auth middleware, error handling
    scope_include:
      - backend/app/routers/**
      - backend/app/schemas/**
      - backend/app/dependencies/**
    scope_exclude:
      - backend/app/routers/ai.py
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the API Gateway & Routers.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:backend-api (or closest component), create branch feat/backend-api/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
