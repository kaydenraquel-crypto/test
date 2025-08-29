# Design System & Shared Components


**Description:** Reusable components, tokens, icons, docs


**Scope Include:**

```yaml

- frontend/src/components/**
      - frontend/src/shared/**
      - Theme/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Design System & Shared Components.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:design-system (or closest component), create branch feat/design-system/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: design-system
    name: Design System & Shared Components
    description: Reusable components, tokens, icons, docs
    scope_include:
      - frontend/src/components/**
      - frontend/src/shared/**
      - Theme/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Design System & Shared Components.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:design-system (or closest component), create branch feat/design-system/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
