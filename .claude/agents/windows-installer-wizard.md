# Windows Installer Wizard


**Description:** "Electron wizard UI, .env capture/validation, first-run checks"


**Scope Include:**

```yaml

- installer/**
      - install.ps1

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Windows Installer Wizard.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:installer-win (or closest component), create branch feat/installer-win/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: installer-win
    name: Windows Installer Wizard
    description: "Electron wizard UI, .env capture/validation, first-run checks"
    scope_include:
      - installer/**
      - install.ps1
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Windows Installer Wizard.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:installer-win (or closest component), create branch feat/installer-win/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
