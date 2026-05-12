"""Generate the og-cover.png social-share image for prulesoul.site.

Produces a 1200x630 PNG with a sage-green gradient, "prulesoul" in
display type, and a small sparkle accent. Saved to
/app/frontend/public/og-cover.png so the static-build picks it up.
"""
from PIL import Image, ImageDraw, ImageFont
import os, math

W, H = 1200, 630
OUT = "/app/frontend/public/og-cover.png"

# Sage-green gradient. Top: deep forest, bottom: sage-mist.
TOP = (12, 17, 15)       # near-black forest (matches --aurin-bg)
MID = (28, 44, 38)
BOTTOM = (80, 96, 72)    # sage muted

img = Image.new("RGB", (W, H), TOP)
px = img.load()
for y in range(H):
    t = y / (H - 1)
    if t < 0.55:
        u = t / 0.55
        r = int(TOP[0] + (MID[0] - TOP[0]) * u)
        g = int(TOP[1] + (MID[1] - TOP[1]) * u)
        b = int(TOP[2] + (MID[2] - TOP[2]) * u)
    else:
        u = (t - 0.55) / 0.45
        r = int(MID[0] + (BOTTOM[0] - MID[0]) * u)
        g = int(MID[1] + (BOTTOM[1] - MID[1]) * u)
        b = int(MID[2] + (BOTTOM[2] - MID[2]) * u)
    for x in range(W):
        px[x, y] = (r, g, b)

# Soft sage radial glow on the right
glow_cx, glow_cy, glow_r = int(W * 0.78), int(H * 0.42), int(W * 0.32)
for y in range(H):
    for x in range(W):
        dx, dy = x - glow_cx, y - glow_cy
        d = math.sqrt(dx * dx + dy * dy)
        if d < glow_r:
            blend = (1 - d / glow_r) ** 3 * 0.32
            r, g, b = px[x, y]
            r = min(255, int(r + 60 * blend))
            g = min(255, int(g + 80 * blend))
            b = min(255, int(b + 50 * blend))
            px[x, y] = (r, g, b)

draw = ImageDraw.Draw(img)

# Try to find a serif font, fall back to default
font_paths = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
]
title_font = None
for p in font_paths:
    if os.path.exists(p):
        try:
            title_font = ImageFont.truetype(p, 96)
            break
        except Exception:
            continue
if title_font is None:
    title_font = ImageFont.load_default()

sub_paths = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]
sub_font = None
for p in sub_paths:
    if os.path.exists(p):
        try:
            sub_font = ImageFont.truetype(p, 24)
            break
        except Exception:
            continue
if sub_font is None:
    sub_font = ImageFont.load_default()

# Eyebrow text top-left
eyebrow = "PRULESOUL · MATRIX AURIN"
draw.text((80, 80), eyebrow, fill=(180, 195, 175), font=sub_font)

# Main display line
title = "the room that\nreads you"
draw.multiline_text((80, 200), title, fill=(232, 232, 224), font=title_font, spacing=4)

# Subline near bottom-left
subline = "Three wisdom schools · one quiet room"
draw.text((80, 500), subline, fill=(190, 200, 175), font=sub_font)

# "Free during launch" chip top-right
chip = "FREE DURING LAUNCH"
bbox = draw.textbbox((0, 0), chip, font=sub_font)
chip_w = bbox[2] - bbox[0]
chip_h = bbox[3] - bbox[1]
pad_x, pad_y = 22, 12
chip_x = W - 80 - chip_w - pad_x * 2
chip_y = 70
draw.rounded_rectangle(
    [chip_x, chip_y, chip_x + chip_w + pad_x * 2, chip_y + chip_h + pad_y * 2],
    radius=28,
    outline=(180, 195, 175),
    width=2,
)
draw.text((chip_x + pad_x, chip_y + pad_y - 3), chip, fill=(200, 215, 180), font=sub_font)

# Small sparkle (8-point star) near subline
sx, sy, sr = 80 + 350, 510, 8
points = []
for i in range(16):
    angle = math.pi / 8 * i - math.pi / 2
    r = sr if i % 2 == 0 else sr / 2.5
    points.append((sx + math.cos(angle) * r, sy + math.sin(angle) * r))
draw.polygon(points, fill=(200, 215, 180))

# Save
os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, "PNG", optimize=True)
print(f"Saved {OUT} · size {os.path.getsize(OUT)} bytes")
