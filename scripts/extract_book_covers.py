#!/usr/bin/env python3
"""Extract first-page covers from each book PDF.

Output: /app/backend/storage/covers/{slug}.jpg
These are served via the existing FastAPI static mount at
/api/static/covers/{slug}.jpg (see server.py mount).

For each PDF we also write a small companion file to detect
changes so we only re-export when the PDF's mtime changes.
"""
import os, sys
import fitz  # PyMuPDF

SRC_DIR = "/app/backend/storage/books"
OUT_DIR = "/app/backend/storage/covers"
os.makedirs(OUT_DIR, exist_ok=True)

# Render at 2x scale for a crisp thumbnail on retina screens.
DPI = 180

done = []
for fname in sorted(os.listdir(SRC_DIR)):
    if not fname.lower().endswith(".pdf"):
        continue
    slug = fname[:-4]
    pdf_path = os.path.join(SRC_DIR, fname)
    out_path = os.path.join(OUT_DIR, f"{slug}.jpg")
    stamp_path = out_path + ".stamp"
    pdf_mtime = os.path.getmtime(pdf_path)
    if os.path.exists(out_path) and os.path.exists(stamp_path):
        try:
            if abs(float(open(stamp_path).read().strip()) - pdf_mtime) < 1:
                print(f"  = {slug} (unchanged)")
                continue
        except Exception:
            pass
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=DPI, alpha=False)
        pix.save(out_path, jpg_quality=85)
        doc.close()
        with open(stamp_path, "w") as f:
            f.write(str(pdf_mtime))
        size_kb = os.path.getsize(out_path) // 1024
        print(f"  ✓ {slug}  ({pix.width}x{pix.height}, {size_kb} KB)")
        done.append(slug)
    except Exception as e:
        print(f"  ✗ {slug}: {e}")

print(f"\nDone. {len(done)} covers generated into {OUT_DIR}")
