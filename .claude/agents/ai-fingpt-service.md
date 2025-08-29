# AI/FinGPT Service


**Description:** FinGPT server, prompt flows, safety guards, eval harness


**Scope Include:**

```yaml

- fingpt_server/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the AI/FinGPT Service.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:ai-engine (or closest component), create branch feat/ai-engine/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: ai-engine
    name: AI/FinGPT Service
    description: FinGPT server, prompt flows, safety guards, eval harness
    scope_include:
      - fingpt_server/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the AI/FinGPT Service.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:ai-engine (or closest component), create branch feat/ai-engine/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
