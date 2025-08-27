# AI Router & Tools


**Description:** LLM routing, tools/functions, context builders, embeddings


**Scope Include:**

```yaml

- backend/app/routers/ai.py
      - backend/app/services/ai/**
      - backend/app/ml/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the AI Router & Tools.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:ai-router (or closest component), create branch feat/ai-router/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: ai-router
    name: AI Router & Tools
    description: LLM routing, tools/functions, context builders, embeddings
    scope_include:
      - backend/app/routers/ai.py
      - backend/app/services/ai/**
      - backend/app/ml/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the AI Router & Tools.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:ai-router (or closest component), create branch feat/ai-router/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
