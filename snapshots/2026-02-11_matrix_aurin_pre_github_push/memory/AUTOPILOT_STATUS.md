# AUTOPILOT STATUS — STOPPED

**Stopped:** 2026-05-11 (after Emergent support response received)

**Reason:** Support clarified that Sora 2 is NOT accessible via the Universal LLM Key. The `insufficient_balance` error was never a sync issue — it was the API correctly reporting that Sora 2 video credits sit in a separate pool that is empty.

**Why one video succeeded earlier:** Grace v1 (`grace_vision_pilot.mp4`) was generated successfully via the same `OpenAIVideoGeneration` integration. This means at the time the call was made, Sora 2 credits were available in the separate video-generation pool. After that one generation, the pool went to zero. Subsequent calls fail because the Universal Key balance and the Sora 2 video balance are different ledgers.

**Resulting state of avatar work:**
- ✅ Grace v1 (12s, sora-2-pro, candlelit prompt) — already generated, available at `/avatars/grace_vision_pilot.mp4`
- ⛔ Grace v2 (8s, lillepoti-uplight prompt) — NOT generated, blocked by zero video balance
- ⛔ Clarity pilot — NOT generated, blocked by zero video balance
- ⛔ Faas 1 production loops (4× 15s) — NOT generated, blocked

**Path forward** (founder to choose):
- Use existing Grace v1 video as the production avatar (compromise: it leaned slightly sad)
- Get direct OpenAI Sora 2 API access (founder's own OpenAI key) and re-run autopilot
- Switch to a different video generation provider (fal.ai, Runway, Luma, Kling — playbook needed)
- Skip Sora 2 entirely; commission a Fiverr Lottie designer (~$200 one-time, $0 ongoing) for Faas 3 reactive silhouette
- Use Grace v1 as the only video for now, focus Faas 2 (OpenAI Realtime API) which DOES work via Universal Key

— end —
