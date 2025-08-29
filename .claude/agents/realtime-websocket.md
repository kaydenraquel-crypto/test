# Realtime/WebSocket


**Description:** Streaming endpoints, topic fanout, backpressure, reconnection


**Scope Include:**

```yaml

- backend/app/websocket/**
      - backend/app/routers/ws/**

```


**Startup Prompt:**

```markdown

Read master_brief.md and component_map.yaml. You are the Realtime/WebSocket.
- Only modify files that match your allowed scope (scope_include minus scope_exclude).
- Before coding: pick/claim an issue labeled comp:realtime-stream (or closest component), create branch feat/realtime-stream/<issue>-<slug>.
- Update master_brief.md §8 (daily entry) and CHANGELOG.md.
- Open a PR using the template and request CODEOWNERS.
- If you need cross-component changes, open a separate PR and tag the owning agent.

```


---
**Raw YAML Block:**

```yaml

- id: realtime-stream
    name: Realtime/WebSocket
    description: Streaming endpoints, topic fanout, backpressure, reconnection
    scope_include:
      - backend/app/websocket/**
      - backend/app/routers/ws/**
    startup_prompt: |
      Read master_brief.md and component_map.yaml. You are the Realtime/WebSocket.
      - Only modify files that match your allowed scope (scope_include minus scope_exclude).
      - Before coding: pick/claim an issue labeled comp:realtime-stream (or closest component), create branch feat/realtime-stream/<issue>-<slug>.
      - Update master_brief.md §8 (daily entry) and CHANGELOG.md.
      - Open a PR using the template and request CODEOWNERS.
      - If you need cross-component changes, open a separate PR and tag the owning agent.

```
