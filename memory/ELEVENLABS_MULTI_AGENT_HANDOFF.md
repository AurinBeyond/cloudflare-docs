# ElevenLabs ConvAI — Multi-Agent Handoff Capabilities
### Confirmed by ElevenLabs support · 2026-06-29
### Not a constitution. A technical reference card.

## Use case (when this becomes relevant for Aurin)

If Aurin ever needs to escalate a conversation mid-session — e.g., Grace
(non-clinical keeper) detects a crisis signal and must hand off to a
dedicated safety/anchor agent — ElevenLabs supports this natively with
their multi-agent transfer feature.

This document captures **what the platform guarantees** so Aurin can
build on top without re-discovering it later.

---

## What is preserved automatically across an agent-to-agent transfer

The new production API key (with `convai_read` + `convai_write` scope)
is authorised to drive the full lifecycle of an escalated call. When
the primary agent triggers `transfer_to_agent`:

### 1. Client events inherit
The child agent inherits the exact client event configuration of the
parent — `audio`, `user_transcript`, `agent_response`. The frontend
stream stays connected, no UI re-mount required.

### 2. Audio formats preserve
Both input (ASR) and output (TTS) audio formats carry over from parent
to child agent exactly as configured. No format renegotiation, no
clicks/dropouts at the seam.

### 3. Language carries
The active conversation language of the parent agent transfers to the
child. The visitor never hears a language switch on handoff.

### 4. Transcript history preserves
The child agent's LLM receives the full preceding transcript as context.
It "knows why the visitor is now talking to it" without Aurin having
to pass any manual state.

### 5. Webhook + evaluation are unified
The post-call webhook fires once for the entire conversation. Aurin's
backend receives a single, unified transcript with both agents' turns
separated by the transfer tool-call marker. Evaluation criteria apply
across both legs.

---

## What this means for Aurin's architecture

- **No new state machine needed.** ElevenLabs holds the session.
- **No new audio plumbing needed.** Formats inherit.
- **No new transcript-stitching needed.** Webhook delivers it joined.
- **Aurin's existing get-signed-url endpoint is enough** for the primary
  agent. The transfer is configured server-side in the ElevenLabs
  dashboard via the `transfer_to_agent` tool on the primary agent.

---

## Story Library — architectural decision (2026-06-29)

Because ElevenLabs preserves the full transcript across handoffs and
fires exactly **one** post-call webhook, Aurin's Story Library treats
a transferred conversation as **one single story record**, not many.

### What this means in the data model

| Field | Behaviour |
|---|---|
| `conversation_id` | One per session, even across handoffs |
| `transcript` | One joined timeline (transfer marker is metadata, not a split) |
| `audio_recording` | One file per session |
| `participants` | An array — e.g. `["grace", "anchor"]` if a handoff occurred |
| `transfer_events` | Metadata array with timestamps; never a story boundary |

### What the visitor experiences

The visitor reads one continuous story in their library. They see *who
spoke when* (an inline divider, perhaps a quiet line: *"You were
held by Grace, then by Anchor"*), but never two separate cards.

### Why this matters

A handoff is part of the **journey**, not a break in it. If Story
Library showed two cards, it would suggest the visitor "left" Grace
and "started over". That contradicts the entire House metaphor and the
emotional truth of an escalation: *you stayed in the same conversation,
the same house simply sent a more specialised keeper to sit with you.*

---

## When to build the escalation flow

NOT now. NOT before launch. NOT before the first 10 visitors.

The right trigger is:
- ConvAI is live and stable
- First 10–20 real visitors have completed full journeys
- At least one real escalation-relevant moment has occurred (or the
  team has identified the specific scenarios that need it)

Then design the safety agent, configure the `transfer_to_agent` tool
on Grace (and possibly Sara, Kaelan), and use this capability sheet
as the technical baseline.

---

## Source
ElevenLabs support confirmation message dated 2026-06-29 (after Anna
requested clarification that the new production key would cover the
full escalation lifecycle). Paste-archived above this line.

## Status
HELD until the escalation flow is actually needed.
