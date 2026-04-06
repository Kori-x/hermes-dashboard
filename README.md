# Hermes Dashboard

Real-time web dashboard for monitoring [Hermes](https://github.com/Kori-x/hermes) agent sessions. Watch multiple AI agents work in parallel -- see tool calls, session phases, token usage, and activity feeds update live.

Built for teams running concurrent Hermes agents across projects.

![hermes-dashboard](https://img.shields.io/badge/hermes-dashboard-000?style=flat&labelColor=000&color=d71921)

## What it does

- **Live session monitoring** -- agents appear as they start, with real-time phase tracking (processing, idle, awaiting input, needs approval)
- **Activity feed** -- chronological stream of tool calls, messages, and approvals across all sessions
- **Agent detail view** -- per-session metrics, context window visualization, tool execution history, subagent tracking
- **Session timeline** -- Gantt-style view of all running sessions
- **Tool breakdown** -- aggregated tool usage across agents (Read, Edit, Bash, Grep, etc.)
- **Approval handling** -- surfaces pending permission requests that need human input

## Architecture

```
Hermes Agent (Python)
  |
  v
hermes_dashboard plugin (/tmp/hermes-dashboard.sock)
  |
  v
Bridge Server (Node.js, Unix socket -> WebSocket)
  |
  v
React Dashboard (ws://localhost:3001)
```

The Hermes plugin hooks into agent lifecycle events (session start/end, tool use, LLM calls) and sends them over a Unix domain socket. The bridge server maintains session state and pushes updates to the browser via WebSocket. Falls back to mock data when the server isn't running.

## Setup

```bash
# install dependencies
npm install

# install the hermes plugin
npm run plugin:install

# start dashboard + bridge server
npm run dev
```

Opens at `http://localhost:5173`. The bridge server runs on `ws://localhost:3001`.

The header shows **LIVE** when connected to the bridge server, or **MOCK** when displaying sample data.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both Vite + bridge server |
| `npm run dev:ui` | Start only the Vite dev server |
| `npm run dev:server` | Start only the bridge server |
| `npm run build` | TypeScript check + production build |
| `npm run plugin:install` | Copy plugin to `~/.hermes/plugins/` |

## Plugin

The Hermes plugin at `plugin/__init__.py` registers hooks for:

- `on_session_start` / `on_session_end`
- `pre_tool_call` / `post_tool_call`
- `pre_llm_call` / `post_llm_call`

Events are sent as JSON over a Unix socket to `/tmp/hermes-dashboard.sock`. If the bridge server isn't running, events are silently dropped.

## Stack

- **Frontend**: React 19, TypeScript, Vite
- **Bridge**: Node.js, ws (WebSocket), Unix domain sockets
- **Plugin**: Python (Hermes hook system)
- **Styling**: Custom CSS, no framework. Dark theme with monospace typography.

## License

MIT
