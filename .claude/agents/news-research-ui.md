# News & Research UI


**Description:** News feed components, relevance tags, summaries display


**Scope Include:**

```yaml

- frontend/src/features/news/**
      - backend/app/routers/news.py

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the News & Research UI.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:news-ui (or closest component), create branch feat/news-ui/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: news-ui
    name: News & Research UI
    description: News feed components, relevance tags, summaries display
    scope_include:
      - frontend/src/features/news/**
      - backend/app/routers/news.py
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the News & Research UI.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:news-ui (or closest component), create branch feat/news-ui/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
