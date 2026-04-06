"""
Hermes Dashboard Bridge Plugin
================================

Sends agent session events to the Hermes Dashboard server
over a Unix domain socket at /tmp/hermes-dashboard.sock.

Install: copy this folder to ~/.hermes/plugins/hermes_dashboard/
"""

import json
import logging
import os
import socket
import uuid
from collections import defaultdict

logger = logging.getLogger(__name__)

SOCKET_PATH = "/tmp/hermes-dashboard.sock"
AGENT_NAME = os.environ.get("HERMES_AGENT_NAME", "agent")
_TOOL_CALL_IDS = defaultdict(list)
_CURRENT_SESSION_ID = None
_TASK_SESSION_IDS = {}


def _cwd():
    try:
        return os.getcwd()
    except Exception:
        return ""


def _tty():
    try:
        return os.ttyname(0)
    except Exception:
        try:
            return os.ttyname(1)
        except Exception:
            return None


def _base_payload(event_name, session_id, status, **extra):
    payload = {
        "event": event_name,
        "session_id": session_id,
        "cwd": _cwd(),
        "status": status,
        "pid": os.getpid(),
        "tty": _tty(),
    }
    payload.update(extra)
    return payload


def _send(payload):
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        sock.connect(SOCKET_PATH)
        data = json.dumps(payload).encode("utf-8")
        sock.sendall(data + b"\n")
        sock.close()
    except (ConnectionRefusedError, FileNotFoundError, OSError):
        pass
    except Exception as exc:
        logger.debug("hermes-dashboard: send failed: %s", exc)


def _on_session_start(session_id="", platform="", **kwargs):
    global _CURRENT_SESSION_ID
    if session_id:
        _CURRENT_SESSION_ID = session_id
    _send(_base_payload(
        "SessionStart", session_id, "waiting_for_input",
        agent=AGENT_NAME, platform=platform or "cli",
    ))


def _on_pre_tool_call(tool_name="", args=None, task_id="", **kwargs):
    session_id = kwargs.get("session_id") or _TASK_SESSION_IDS.get(task_id) or _CURRENT_SESSION_ID or task_id
    if task_id and session_id:
        _TASK_SESSION_IDS[task_id] = session_id
    tool_use_id = uuid.uuid4().hex
    cache_key = f"{task_id}:{tool_name}"
    _TOOL_CALL_IDS[cache_key].append(tool_use_id)
    _send(_base_payload(
        "PreToolUse", session_id, "running_tool",
        tool=tool_name, tool_input=args or {}, tool_use_id=tool_use_id, agent=AGENT_NAME,
    ))


def _on_post_tool_call(tool_name="", args=None, result="", task_id="", **kwargs):
    session_id = kwargs.get("session_id") or _TASK_SESSION_IDS.get(task_id) or _CURRENT_SESSION_ID or task_id
    if task_id and session_id:
        _TASK_SESSION_IDS[task_id] = session_id
    result_str = str(result)[:100] if result else ""
    cache_key = f"{task_id}:{tool_name}"
    tool_use_id = _TOOL_CALL_IDS[cache_key].pop(0) if _TOOL_CALL_IDS.get(cache_key) else None
    if cache_key in _TOOL_CALL_IDS and not _TOOL_CALL_IDS[cache_key]:
        _TOOL_CALL_IDS.pop(cache_key, None)
    _send(_base_payload(
        "PostToolUse", session_id, "processing",
        tool=tool_name, tool_input=args or {}, tool_use_id=tool_use_id,
        agent=AGENT_NAME, message=result_str,
    ))


def _on_pre_llm_call(session_id="", user_message="", platform="", **kwargs):
    global _CURRENT_SESSION_ID
    if session_id:
        _CURRENT_SESSION_ID = session_id
    _send(_base_payload(
        "UserPromptSubmit", session_id, "processing",
        agent=AGENT_NAME, platform=platform or "cli",
        message=(user_message or "")[:120],
    ))


def _on_post_llm_call(session_id="", assistant_response="", **kwargs):
    global _CURRENT_SESSION_ID
    if session_id:
        _CURRENT_SESSION_ID = session_id
    summary = (assistant_response or "")[:80].replace("\n", " ")
    _send(_base_payload(
        "Notification", session_id, "processing",
        notification_type="assistant_response", agent=AGENT_NAME, message=summary,
    ))


def _on_session_end(session_id="", completed=False, interrupted=False, **kwargs):
    global _CURRENT_SESSION_ID
    if session_id:
        _CURRENT_SESSION_ID = session_id
    _send(_base_payload(
        "Notification", session_id, "waiting_for_input",
        notification_type="turn_complete", message="ready",
        agent=AGENT_NAME, completed=completed, interrupted=interrupted,
    ))


def register(ctx):
    ctx.register_hook("on_session_start", _on_session_start)
    ctx.register_hook("pre_llm_call", _on_pre_llm_call)
    ctx.register_hook("pre_tool_call", _on_pre_tool_call)
    ctx.register_hook("post_tool_call", _on_post_tool_call)
    ctx.register_hook("post_llm_call", _on_post_llm_call)
    ctx.register_hook("on_session_end", _on_session_end)
    logger.info("hermes-dashboard bridge plugin registered")
