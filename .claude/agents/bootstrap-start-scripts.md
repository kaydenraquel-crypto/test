# Bootstrap & Start Scripts


**Description:** "Maintain start-*.bat/ps1/sh and validate-setup.js"


**Scope Include:**

```yaml

- "start-*.bat"
      - "start-*.ps1"
      - "start-*.sh"
      - "validate-setup.js"

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Bootstrap & Start Scripts.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:bootstrap-scripts (or closest component), create branch feat/bootstrap-scripts/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: bootstrap-scripts
    name: Bootstrap & Start Scripts
    description: "Maintain start-*.bat/ps1/sh and validate-setup.js"
    scope_include:
      - "start-*.bat"
      - "start-*.ps1"
      - "start-*.sh"
      - "validate-setup.js"
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Bootstrap & Start Scripts.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:bootstrap-scripts (or closest component), create branch feat/bootstrap-scripts/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
