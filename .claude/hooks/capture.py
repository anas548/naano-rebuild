#!/usr/bin/env python3
"""Claude Code hook: captures prompt/response pairs to .agent-logs/.

Invoked twice per turn:
  capture.py prompt   <- on UserPromptSubmit, stdin has {"prompt": ..., "session_id": ..., "transcript_path": ...}
  capture.py stop     <- on Stop, stdin has {"session_id": ..., "transcript_path": ..., "stop_hook_active": ...}

Only the prompt text and the final response text are recorded, per the assignment
spec -- no thinking, tool calls, or intermediate steps.
"""
import sys
import os
import json
from datetime import datetime, timezone

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_DIR = os.path.join(REPO_ROOT, ".agent-logs")
STATE_DIR = os.path.join(REPO_ROOT, ".claude", "hooks", "session_state")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def load_state(session_id):
    path = os.path.join(STATE_DIR, f"{session_id}.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return None


def save_state(session_id, state):
    os.makedirs(STATE_DIR, exist_ok=True)
    path = os.path.join(STATE_DIR, f"{session_id}.json")
    with open(path, "w") as f:
        json.dump(state, f, indent=2)


def get_author():
    try:
        import subprocess
        name = subprocess.run(["git", "config", "user.name"], cwd=REPO_ROOT,
                               capture_output=True, text=True, timeout=5).stdout.strip()
        if name:
            return name
    except Exception:
        pass
    return os.environ.get("USER", "unknown")


def new_state(session_id, prompt_data):
    ts = now_iso()
    dt = datetime.now(timezone.utc)
    fname = f"{dt.strftime('%Y-%m-%d_%H-%M-%S')}_{session_id}.md"
    return {
        "session_id": session_id,
        "log_file": fname,
        "date": dt.strftime("%Y-%m-%d"),
        "author": get_author(),
        "project": os.path.basename(REPO_ROOT),
        "tool": "claude-code",
        "first_prompt_time": ts,
        "last_prompt_time": ts,
        "exchange_count": 0,
        "entries": [],
    }


def find_last_model(transcript_path):
    model = "unknown"
    try:
        with open(transcript_path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                msg = obj.get("message", {})
                if obj.get("type") == "assistant" and msg.get("model"):
                    model = msg["model"]
    except Exception:
        pass
    return model


def find_last_response_text(transcript_path):
    """Return the text of the last assistant message in the transcript."""
    last_text = None
    last_model = "unknown"
    try:
        with open(transcript_path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                if obj.get("type") != "assistant":
                    continue
                msg = obj.get("message", {})
                if msg.get("role") != "assistant":
                    continue
                content = msg.get("content", [])
                texts = [c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text"]
                if texts:
                    last_text = "\n".join(texts)
                if msg.get("model"):
                    last_model = msg["model"]
    except Exception:
        pass
    return last_text, last_model


def render_file(state):
    fm = (
        "---\n"
        f"session_id: {state['session_id']}\n"
        f"date: {state['date']}\n"
        f"author: {state['author']}\n"
        f"model: {state['entries'][-1]['model'] if state['entries'] else 'unknown'}\n"
        f"tool: {state['tool']}\n"
        f"project: {state['project']}\n"
        f"total_exchanges: {state['exchange_count']}\n"
        f"first_prompt_time: {state['first_prompt_time']}\n"
        f"last_prompt_time: {state['last_prompt_time']}\n"
        "---\n\n"
        f"# Session Log - {state['date']}\n\n"
        f"Session: `{state['session_id']}` | Project: `{state['project']}` | Author: `{state['author']}`\n\n"
        "---\n\n"
    )
    blocks = []
    for e in state["entries"]:
        blocks.append(
            f"[LOG_ENTRY type={e['type']} num={e['num']} session={state['session_id']}]\n"
            f"timestamp: {e['timestamp']}\n"
            f"model: {e['model']}\n\n"
            f"{e['text']}\n"
        )
    return fm + "\n\n".join(blocks) + "\n"


def write_log(state):
    os.makedirs(LOG_DIR, exist_ok=True)
    path = os.path.join(LOG_DIR, state["log_file"])
    with open(path, "w") as f:
        f.write(render_file(state))


def handle_prompt(data):
    session_id = data.get("session_id", "unknown-session")
    prompt_text = data.get("prompt", "")
    if not prompt_text.strip():
        return
    state = load_state(session_id)
    if state is None:
        state = new_state(session_id, data)
    ts = now_iso()
    state["last_prompt_time"] = ts
    state["exchange_count"] += 1
    model = find_last_model(data.get("transcript_path", ""))
    state["entries"].append({
        "type": "PROMPT",
        "num": state["exchange_count"],
        "timestamp": ts,
        "model": model,
        "text": prompt_text,
    })
    save_state(session_id, state)
    write_log(state)


def handle_stop(data):
    session_id = data.get("session_id", "unknown-session")
    if data.get("stop_hook_active"):
        return
    state = load_state(session_id)
    if state is None:
        return
    transcript_path = data.get("transcript_path", "")
    text, model = find_last_response_text(transcript_path)
    if not text:
        return
    ts = now_iso()
    num = state["exchange_count"] if state["exchange_count"] else 1
    if state["entries"] and state["entries"][-1]["type"] == "RESPONSE" and state["entries"][-1]["num"] == num:
        state["entries"][-1]["text"] = text
        state["entries"][-1]["timestamp"] = ts
        state["entries"][-1]["model"] = model
    else:
        state["entries"].append({
            "type": "RESPONSE",
            "num": num,
            "timestamp": ts,
            "model": model,
            "text": text,
        })
    save_state(session_id, state)
    write_log(state)


def main():
    if len(sys.argv) < 2:
        sys.exit(0)
    mode = sys.argv[1]
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if mode == "prompt":
        handle_prompt(data)
    elif mode == "stop":
        handle_stop(data)
    sys.exit(0)


if __name__ == "__main__":
    main()
