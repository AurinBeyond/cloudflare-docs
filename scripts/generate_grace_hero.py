"""
One-shot Nano Banana image generation for Grace Room hero background.
Saves output to /app/frontend/public/assets/rooms/grace-hearth.png.
"""
import asyncio
import base64
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

PROMPT = """THE HEARTH — GRACE ROOM

Cinematic premium digital house.
Late evening atmosphere.
A large old window with rain running down the glass.
Warm fireplace glowing softly.
Deep navy blue shadows.
Warm amber and fireplace gold lighting.
One comfortable armchair facing the fireplace.
Bookshelves in the background.
Soft candlelight.
Quiet luxury aesthetic.
European library and salon inspiration.

No people. No user interface. No buttons. No text. No words. No labels. No logos. No watermarks. No screens. No chat windows.

The image must feel peaceful, intimate, safe, reflective and timeless.

Color palette:
Deep Navy
Warm Amber
Fireplace Gold
Soft Copper

Ultra realistic. Premium web application hero background. 16:9 composition. High detail."""


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    assert api_key, "EMERGENT_LLM_KEY missing in /app/backend/.env"

    chat = LlmChat(
        api_key=api_key,
        session_id="grace-hearth-hero-2026-02",
        system_message="You are a cinematic image generation assistant.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)

    print(f"Text reply (truncated): {(text or '')[:120]}")
    print(f"Image count: {len(images) if images else 0}")

    if not images:
        raise RuntimeError("No image returned from Nano Banana.")

    out_dir = Path("/app/frontend/public/assets/rooms")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "grace-hearth.png"

    image_bytes = base64.b64decode(images[0]["data"])
    out_path.write_bytes(image_bytes)
    print(f"Saved: {out_path} ({len(image_bytes)} bytes, mime={images[0].get('mime_type')})")


if __name__ == "__main__":
    asyncio.run(main())
