# Hermes Dashboard

Real-time monitoring dashboard and auto-generated wiki for [Hermes Agent](https://github.com/NousResearch/hermes-agent).

Plug it into any Hermes installation. It reads your skills, plugins, config, memory, and soul -- and displays everything as a searchable wiki. The live dashboard shows agent sessions, tool calls, and activity as they happen.

## Install

```bash
git clone https://github.com/Kori-x/hermes-dashboard.git
cd hermes-dashboard
./install.sh
```

This installs the Hermes plugin, npm dependencies, and builds the dashboard.

## Usage

Start the dashboard:

```bash
npm run dev
```

Open **http://localhost:5173**.

The plugin auto-registers with Hermes on next session start. Agent events stream to the dashboard in real-time.

## What you get

### Dashboard (live)
- Agent session monitoring with phase tracking (processing, idle, awaiting input, needs approval)
- Activity feed of tool calls, messages, and approvals across all sessions
- Per-session detail: context window visualization, tool execution history, subagent tracking
- Session timeline and tool usage breakdown

### Wiki (auto-generated)
- **Skills** -- all your installed skills parsed from `~/.hermes/skills/`, searchable by name/category
- **Plugins** -- installed plugins with manifest data from `~/.hermes/plugins/`
- **Tools** -- complete built-in tool reference (56 tools across 10 categories)
- **CLI** -- command reference with flags
- **Config** -- your `config.yaml` rendered live
- **Memory** -- agent memory (MEMORY.md) and user profile (USER.md)
- **Soul** -- agent persona (SOUL.md)
- **Architecture** -- core loop, provider resolution, memory system, safety, plugin hooks, gateway
- **Changelog** -- version history

When the server is running, the wiki reads live from your `~/.hermes/`. When offline, it falls back to built-in reference data.

## How it works

```
Hermes Agent
  |
  v
hermes_dashboard plugin (hooks into session lifecycle)
  |
  v
Unix socket (/tmp/hermes-dashboard.sock)
  |
  v
Bridge server (Node.js)
  ├── WebSocket :3001 --> React dashboard (live updates)
  └── HTTP :3002 ------> Wiki API (reads ~/.hermes/)
  |
  v
Browser at localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dashboard + server (dev mode) |
| `npm run dev:ui` | Start only Vite |
| `npm run dev:server` | Start only the bridge server |
| `npm run build` | Production build |
| `./install.sh` | Install plugin + dependencies |

## Configuration

| Env var | Default | Description |
|---|---|---|
| `HERMES_HOME` | `~/.hermes` | Hermes installation directory |
| `HERMES_DASHBOARD_DIR` | auto-detected | Path to this repo (for plugin auto-start) |
| `HERMES_AGENT_NAME` | `agent` | Agent name shown in dashboard |

## Stack

- **Frontend**: React 19, TypeScript, Vite, marked (markdown)
- **Server**: Node.js, ws (WebSocket), Unix domain sockets
- **Plugin**: Python (Hermes hook system)
- **Styling**: Custom CSS, dark theme, monospace typography

## License

MIT
