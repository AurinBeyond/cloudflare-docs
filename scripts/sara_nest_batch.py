#!/usr/bin/env python3
"""Sara — full 21-nest batch generation. Runs all remaining nests in parallel."""
import asyncio, os, base64, urllib.request
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")
OUT = Path("/app/sara_nest_test"); OUT.mkdir(exist_ok=True)
PUB = Path("/app/frontend/public/test_nest_images"); PUB.mkdir(exist_ok=True)

ANCHORS = {
    "w1": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/mghwh6or_image.png",
    "w2": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/js2g8gnk_image.png",
    "w3": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/f7l2y33z_image.png",
    "w4": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/agtsx58u_image.png",
}

def anchor_b64(world):
    p = OUT / f"_anchor_{world}.png"
    if not p.exists():
        urllib.request.urlretrieve(ANCHORS[world], p)
    return base64.b64encode(p.read_bytes()).decode()

def build(world_name, title, completion, truth, next_name, c1, c2, scene):
    return f"""Create a new hand-painted watercolour illustration in the EXACT same style as the reference painting (preserve palette, paper grain, lantern lighting, brushwork, children's storybook quality).

1:1 square watercolour with FOUR painted navigation waypoints baked into the scene — never digital UI.

CENTRAL SCENE (~55%): {scene}

WAYPOINT 1 — TOP LEFT — BACK SIGN (~13%): small weathered wooden sign hanging from frayed rope, hand-lettered serif on two lines: "Back to" / "{world_name}". Tiny painted heart below.

WAYPOINT 2 — RIGHT-CENTRE — THREE-LAYER PARCHMENT (~22%): aged half-curled parchment scroll, hand-lettered dark brown ink centred:
  line 1 (large serif): {title}
  line 2 (script): what I am using:  {completion}
  line 3 (script): what returns:  {truth}
Torn warm-stained edges. PAINTED hand-lettering, never printed type.

WAYPOINT 3 — BOTTOM-RIGHT — NEXT-NEST SIGN (~12%): small wooden sign hanging at angle, hand-lettered "Next:  {next_name}  →" with tiny painted leaf below. Less prominent than Back sign.

WAYPOINT 4 — BOTTOM-CENTRE — THEME-SPECIFIC CLOSING PLAQUE (~32%): dark-blue weathered wooden plaque, pale ivory hand-lettering on two lines: "{c1}" / "{c2}". Never generic.

RULES: NO faces. Hands ONLY if central to symbol. NO digital UI/buttons/icons/modern fonts. All lettering quill-painted. Waypoints natural parts of scene, not stickers. One coherent hand-made artwork."""

NESTS = [
  # W1 remaining (3) — anchor w1
  ("w1", "w1.4-presence", "What Cannot Be Replaced", "PRESENCE", "performance", "honesty", "Trust",
    "Honesty lives here.", "Be tired. Be unsure. Be here.",
    "A worn armchair stands beside a small side-table holding a lit oil-lantern and a half-finished cup of tea. A heavy knit blanket lies slightly crumpled across the chair's arm. The wooden floor shows a faint warm shadow where someone has just stood. No mask, no mirror, no human figure. Warm honey-wood and muted blue palette, soft amber light from the right, paper grain visible."),
  ("w1", "w1.5-trust", "What Cannot Be Replaced", "TRUST", "control", "patience", "Connection",
    "Patience lives here.", "Let what grows, grow.",
    "The base of a thick old tree fills the right side of the frame, bark textured and ancient. From the dark soil at the tree's foot, a single fresh green sprout has pushed through — two tiny new leaves catching morning light. No tools, no hands, no rope, no cage. The earth around the sprout is undisturbed. Soft early sunlight from upper left, deep forest green and warm earth-brown palette, paper grain."),
  ("w1", "w1.6-connection", "What Cannot Be Replaced", "CONNECTION", "providing", "being", "Listening",
    "Being lives here.", "Stay in the room.",
    "A woven grass-and-rope nest sits on a wooden plank at centre. Inside the nest rests a single small oil-lantern, lit. Its golden light pools warmly across the inside curve of the nest. No chains, no ribbons, no hands. The nest is warm because the lantern is in it. Warm amber and deep nest-brown palette, paper grain, slight glow blur around the flame."),
  # W2 (6) — anchor w2
  ("w2", "w2.1-time", "When One Heart Holds the House", "TIME", "speed", "stillness", "Listening",
    "Stillness lives here.", "Stop moving long enough to feel the house.",
    "The corner of a wooden boat's rigging fills the upper third — ropes taut, wind in motion. Where two ropes cross, someone has woven a small still nest. Inside the nest, a single folded cloth. The boat tilts slightly. The nest remains perfectly level. Soft sunset light, muted blue and warm rope-brown palette, paper grain."),
  ("w2", "w2.2-listening", "When One Heart Holds the House", "LISTENING", "advice", "receiving", "Attention",
    "Receiving lives here.", "Let them arrive without becoming.",
    "A wooden kitchen table at centre, scarred from use. On it: a single woven nest, open, lined with old linen. A pendant lamp glows above casting a warm circle of light. No food, no plates, no advice-giver. The nest waits with its mouth turned upward, ready to receive whoever sits down. Soft evening kitchen palette, paper grain."),
  ("w2", "w2.3-attention", "When One Heart Holds the House", "ATTENTION", "checking", "ease", "Presence",
    "Ease lives here.", "Trust that you have done enough.",
    "A two-storey wooden house seen from outside at evening. Most windows are dark. ONE window — middle floor — is lit warm gold from a single lantern inside. The dark windows are not failures; they are rest. The house breathes quietly. Deep blue night palette, soft moonlight on the roof, paper grain, no human figures."),
  ("w2", "w2.4-presence", "When One Heart Holds the House", "PRESENCE", "being nearby", "arriving", "Trust",
    "Arriving lives here.", "Cross the threshold slowly.",
    "A wooden chair beside a low fireplace with glowing embers. A heavy coat is hung over the chair's back, slightly crumpled. Another chair sits close, pulled in toward the fire. The arriving person has not yet sat down, but the chair is ready. Warm hearth-orange and rust palette, soft firelight, paper grain, no human figure."),
  ("w2", "w2.5-trust", "When One Heart Holds the House", "TRUST", "control", "release", "Connection",
    "Release lives here.", "Believe the others can carry.",
    "A tree branch extends from the left into the frame. At its tip, an open palm-shape is painted INTO the wood-grain itself — as if the branch were a hand. Above the open branch-hand, a small bird has just lifted off, wings mid-beat. The branch does NOT curl after the bird. It rests. Soft sky-blue and warm bark palette, daylight, paper grain, no human figures."),
  ("w2", "w2.6-connection", "When One Heart Holds the House", "CONNECTION", "fixing", "witnessing", "Time",
    "Witnessing lives here.", "Be lit. Do not chase the dark.",
    "A small oil-lantern sits on a wooden floor at the edge of the frame. Its light falls forward illuminating only the immediate planks. The rest of the floor stretches into soft indigo shadow. The lantern does not flood the room — it is simply lit, present. The shadow is allowed to exist. Warm amber and deep indigo palette, paper grain, no human figures."),
  # W3 (6) — anchor w3
  ("w3", "w3.1-seeing", "Every Child Is Our Child", "SEEING", "judgement", "curiosity", "Speaking",
    "Curiosity lives here.", "Begin with 'I wonder', not 'they should'.",
    "An old hand-drawn shoreline map fills the frame on aged parchment. A brass compass sits open at the centre. Its needle points clearly and gently toward a small painted figure of a child standing on the drawn shore. Around the compass: salt rings on parchment, corner of a sailor's notebook. Deep parchment and warm brass palette, soft daylight, paper grain, no human hands."),
  ("w3", "w3.2-speaking", "Every Child Is Our Child", "SPEAKING", "criticism", "encouragement", "Belonging",
    "Encouragement lives here.", "Name what is becoming.",
    "A tall stone lighthouse on the left, its lamp lit warm gold. A soft wide beam of golden light reaches across a dark sea. At the far right of the beam, a small wooden sailboat catches the light on its sail. No storm. No drama. Just one steady light reaching one small boat. Deep night-blue and warm beam-gold palette, paper grain, no human figures."),
  ("w3", "w3.3-belonging", "Every Child Is Our Child", "BELONGING", "comparison", "acceptance", "Including",
    "Acceptance lives here.", "You belong before you change anything.",
    "A short stretch of pebbled shore at evening. Three small wooden boats are pulled up at the water's edge: one sturdy and wide, one slim and pointed, one painted blue and weathered. A single rope runs between them, tied to the same wooden post. The water laps quietly. Golden-hour and warm wood palette, paper grain, no human figures."),
  ("w3", "w3.4-including", "Every Child Is Our Child", "INCLUDING", "exclusion", "welcome", "Trusting",
    "Welcome lives here.", "Half a step sideways. A look that says: come closer.",
    "A wooden harbour gate stands half-open at centre. A single oil-lantern hangs above it, glowing warm. The dock beyond is dotted with footprints of many different sizes — adults and children — all heading inward, none turned away. Dusk-blue and warm gate-lantern palette, soft evening light, paper grain, no human figures."),
  ("w3", "w3.5-trusting", "Every Child Is Our Child", "TRUSTING", "suspicion", "belief", "Guiding",
    "Belief lives here.", "Assume they meant well, then ask.",
    "A small child-sized notebook lies on a worn wooden desk. Its cover is blank — unmarked. A brass compass sits on top of it, its needle pointing directly down into the centre of the blank cover, as if to say 'I trust what is here'. Beside the notebook: a stubbed pencil, half a slice of bread. Warm parchment and brass palette, soft window-light from the left, paper grain, no human figures."),
  ("w3", "w3.6-guiding", "Every Child Is Our Child", "GUIDING", "control", "partnership", "Seeing",
    "Partnership lives here.", "Stay in the boat. Do not steer alone.",
    "A polished wooden ship's wheel at centre. Two hands rest on it — an adult's broader hand and a child-sized hand — both relaxed, neither gripping. The wheel does not turn aggressively. Salt on the wood, faint sea-spray in the background. Warm wood and deep sea-blue palette, soft afternoon light, paper grain, no faces visible."),
  # W4 (6) — anchor w4
  ("w4", "w4.1-pressure", "Voices Around the Child", "PRESSURE", "pushes hard", "permission to breathe", "Fear",
    "Permission to breathe lives here.", "Slowness is not becoming smaller.",
    "A small wooden sailboat tilted hard by wind, its sail bowed under pressure. A child's small hand at the base of the mast has just opened — the rope it was clutching now slack. The boat is mid-recovery, easing back upright. Sky brightens slightly at the top. Stormy grey-blue and warm sail-cream palette, paper grain, no faces."),
  ("w4", "w4.2-fear", "Voices Around the Child", "FEAR", "wants to protect", "courage to step", "Belonging",
    "Courage to step lives here.", "Fear may ride along. It cannot take the wheel.",
    "A harbour gate stands open, a thick rope tied back so it cannot swing shut. Just outside the gate, a small wooden boat moves into open water, its sail catching early light. The water is calm but not glassy. A single lantern still glows on the harbour wall, watching. Dawn-blue and warm wood palette, paper grain, no human figures."),
  ("w4", "w4.3-belonging", "Voices Around the Child", "BELONGING", "lights the way home", "trustworthy compass", "Comparison",
    "A trustworthy compass lives here.", "Become the same person tomorrow.",
    "A modest stone lighthouse on the right, glowing warmly. From it, a wide soft beam reaches across the water toward a small child-sized sailboat in the middle distance, returning to harbour. The boat is lit. The water carries the reflection. Deep sea-blue and warm lighthouse-gold palette, soft dusk, paper grain, no human figures."),
  ("w4", "w4.4-comparison", "Voices Around the Child", "COMPARISON", "looks outward", "your own path", "Good Voices",
    "Your own path lives here.", "Someone else's wind is not yours to chase.",
    "An old hand-drawn sea map fills the frame on aged parchment. Several inked routes cross it, made by other navigators. One route — drawn in pencil, softer and more recent — is a child's own line. A small brass compass sits beside that pencilled line. Warm parchment and dusty brass palette, soft daylight, paper grain, no human figures."),
  ("w4", "w4.5-good-voices", "Voices Around the Child", "GOOD VOICES", "what steady voices look like", "recognition", "Ask Yourself",
    "Recognition lives here.", "Carry these four in your pocket.",
    "A small worn leather pocket-notebook lies half-open on a thick coil of rope. On its visible page, four short hand-lettered lines are just legible: 'stays when it is hard' / 'tells truth with hope' / 'makes room for mistakes' / 'believes in becoming'. A stub of pencil rests in the crease. Warm leather-brown and parchment palette, soft daylight, paper grain, no human figures."),
  ("w4", "w4.6-ask-yourself", "Voices Around the Child", "ASK YOURSELF", "daily questions", "inner crew", "Pressure",
    "The inner crew lives here.", "Ask the four questions in evening light.",
    "A leather-bound sailor's logbook lies open on a wooden cabin desk. The right page carries four hand-lettered questions in dark ink. A brass pen rests across the binding. A small lantern at the edge casts golden light pooling across the lines. Warm lantern-light over deep evening blue palette, paper grain, no human figures."),
]

async def gen(world, nest_id, *args):
    print(f"[{nest_id}] start")
    chat = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"), session_id=f"sara-{nest_id}",
        system_message="You are a hand-painted watercolour illustrator. You preserve the exact artistic style, palette, paper grain, lighting, and brushwork of the reference painting. You only change the scene content as instructed.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image","text"])
    prompt = build(*args)
    msg = UserMessage(text=prompt, file_contents=[ImageContent(anchor_b64(world))])
    try:
        _, images = await chat.send_message_multimodal_response(msg)
        if not images: print(f"[{nest_id}] NO IMAGES"); return
        out = OUT / f"{nest_id}_0.png"
        out.write_bytes(base64.b64decode(images[0]["data"]))
        slug = nest_id.replace(".","_").replace("-","_")
        (PUB / f"{slug}.png").write_bytes(out.read_bytes())
        print(f"[{nest_id}] DONE ({out.stat().st_size:,} bytes)")
    except Exception as e:
        print(f"[{nest_id}] FAIL: {e}")

async def main():
    # batch in chunks of 5 to avoid rate limits
    for i in range(0, len(NESTS), 5):
        chunk = NESTS[i:i+5]
        print(f"--- chunk {i//5+1} ({len(chunk)} nests) ---")
        await asyncio.gather(*(gen(*n) for n in chunk))

if __name__ == "__main__":
    asyncio.run(main())
