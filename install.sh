#!/usr/bin/env bash
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
PLUGIN_DIR="$HERMES_HOME/plugins/hermes_dashboard"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing hermes-dashboard plugin..."

# 1. Install npm dependencies
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "  installing npm dependencies..."
    (cd "$SCRIPT_DIR" && npm install --silent)
fi

# 2. Copy plugin files
mkdir -p "$PLUGIN_DIR"
cp "$SCRIPT_DIR/plugin/__init__.py" "$PLUGIN_DIR/__init__.py"
cp "$SCRIPT_DIR/plugin/plugin.yaml" "$PLUGIN_DIR/plugin.yaml"
echo "  plugin -> $PLUGIN_DIR"

# 3. Build the dashboard
echo "  building dashboard..."
(cd "$SCRIPT_DIR" && npm run build --silent 2>/dev/null)

echo ""
echo "Done. Restart Hermes to activate."
echo ""
echo "Usage:"
echo "  npm run dev         Start dashboard + wiki server"
echo "  open http://localhost:5173"
echo ""
echo "The plugin auto-starts the server when Hermes sessions begin."
echo "Set HERMES_DASHBOARD_DIR=$SCRIPT_DIR for auto-start from any location."
