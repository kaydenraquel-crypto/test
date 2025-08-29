# Observability


**Description:** Structured logs, metrics, tracing, dashboards, error reporting


**Scope Include:**

```yaml

- backend/app/observability/**
      - docs/observability/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Observability.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:observability (or closest component), create branch feat/observability/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: observability
    name: Observability
    description: Structured logs, metrics, tracing, dashboards, error reporting
    scope_include:
      - backend/app/observability/**
      - docs/observability/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Observability.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:observability (or closest component), create branch feat/observability/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
