"""§Stage 2.8c — ChatPanel undefined-prop regression.

The 2026-02-10 P0 outage was caused by `toneTag` and `audioPlaying` being
referenced inside the `ChatPanel` sub-component of ClarityRelease.jsx
without being declared as props or in scope. Result: a `ReferenceError:
toneTag is not defined` crash on every authenticated visitor entering
the CHAT phase. This test guards against the same shape of bug returning.

We do not run the bundler here. Instead we statically inspect the JSX:
1. The `<ChatPanel ... />` render site MUST pass both `toneTag` and
   `audioPlaying`.
2. The `function ChatPanel({ ... })` destructured-props block MUST list
   both `toneTag` and `audioPlaying`.
"""
import re
from pathlib import Path

CLARITY_RELEASE = Path("/app/frontend/src/pages/ClarityRelease.jsx")


def _read():
    return CLARITY_RELEASE.read_text(encoding="utf-8")


def test_chat_panel_render_passes_tonetag_and_audioplaying():
    src = _read()
    # The render site must include both props on a <ChatPanel ... /> tag.
    # We grab the ChatPanel render block (open tag through self-close).
    m = re.search(r"<ChatPanel\b[^>]*?/>", src, re.DOTALL)
    assert m, "ChatPanel render block not found in ClarityRelease.jsx"
    block = m.group(0)
    assert "toneTag" in block, (
        "ChatPanel render must pass `toneTag` — Stage 2.8 bug regressed."
    )
    assert "audioPlaying" in block, (
        "ChatPanel render must pass `audioPlaying` — Stage 2.8 bug regressed."
    )


def test_chat_panel_signature_destructures_tonetag_and_audioplaying():
    src = _read()
    # Locate the `function ChatPanel({ ... })` signature.
    m = re.search(r"function\s+ChatPanel\s*\(\s*\{([^}]*)\}\s*\)", src, re.DOTALL)
    assert m, "ChatPanel function signature not found"
    sig = m.group(1)
    assert re.search(r"\btoneTag\b", sig), (
        "ChatPanel must destructure `toneTag` from props"
    )
    assert re.search(r"\baudioPlaying\b", sig), (
        "ChatPanel must destructure `audioPlaying` from props"
    )
