# Settings & Preferences


**Description:** Theme, hotkeys, user prefs, local/remote storage


**Scope Include:**

```yaml

- frontend/src/features/settings/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Settings & Preferences.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:settings-ui (or closest component), create branch feat/settings-ui/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: settings-ui
    name: Settings & Preferences
    description: Theme, hotkeys, user prefs, local/remote storage
    scope_include:
      - frontend/src/features/settings/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Settings & Preferences.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:settings-ui (or closest component), create branch feat/settings-ui/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
