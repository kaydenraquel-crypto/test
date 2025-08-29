# Helm/Kubernetes Packaging


**Description:** Helm chart, values, templates, env/secrets wiring


**Scope Include:**

```yaml

- helm/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Helm/Kubernetes Packaging.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:helm-k8s (or closest component), create branch feat/helm-k8s/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: helm-k8s
    name: Helm/Kubernetes Packaging
    description: Helm chart, values, templates, env/secrets wiring
    scope_include:
      - helm/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Helm/Kubernetes Packaging.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:helm-k8s (or closest component), create branch feat/helm-k8s/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
