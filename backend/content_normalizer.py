"""
content_normalizer.py — Matrix Aurin content reliability layer.

Philosophy: GitHub is a flexible, evolving source of truth — not a perfect
one. This module interprets and stabilises markdown before it reaches the
user interface. The UI never sees raw or broken markdown.

Guarantees:
- Never raises on bad input. Always returns safe html + sections.
- Preserves hierarchy when present; applies a safe default when absent.
- Reports validation warnings for internal review (no end-user exposure).
"""
from __future__ import annotations

import re
import logging
from typing import List, Tuple

import bleach
import markdown as md_lib
import frontmatter

logger = logging.getLogger(__name__)

# Allowed HTML surface after rendering — kept narrow on purpose.
ALLOWED_TAGS = {
    "a", "abbr", "acronym", "b", "blockquote", "code", "em", "i", "li", "ol",
    "strong", "ul", "p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
    "br", "img", "table", "thead", "tbody", "tr", "td", "th", "span", "div",
    "input",
}
ALLOWED_ATTRS = {
    "a": ["href", "title", "rel"],
    "img": ["src", "alt", "title"],
    "span": ["class"], "div": ["class"], "code": ["class"],
    "input": ["type", "checked", "disabled"],
    "h1": ["id"], "h2": ["id"], "h3": ["id"], "h4": ["id"],
}

# Characters that often sneak in from copy-paste or exported tools.
ZERO_WIDTH_RE = re.compile(r"[\u200B-\u200D\uFEFF]")
EXCESSIVE_BLANKS_RE = re.compile(r"\n{3,}")
TRAILING_WS_RE = re.compile(r"[ \t]+(\n)")
HEADER_RE = re.compile(r"^(#{1,6})\s*(.*?)\s*#*\s*$", re.MULTILINE)
EMPTY_HEADER_RE = re.compile(r"^(#{1,6})\s*$", re.MULTILINE)


def _slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[\s_-]+", "-", s) or "section"


def normalize_markdown(md_text: str) -> Tuple[str, List[str]]:
    """Clean and stabilise raw markdown. Returns (normalised, warnings)."""
    warnings: List[str] = []

    if md_text is None:
        return "", ["input_was_none"]

    text = str(md_text)

    # 1. Strip invisible / BOM characters.
    cleaned = ZERO_WIDTH_RE.sub("", text)
    if cleaned != text:
        warnings.append("removed_zero_width_characters")
    text = cleaned

    # 2. Normalise line endings.
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # 3. Strip trailing whitespace on lines.
    text = TRAILING_WS_RE.sub(r"\1", text)

    # 4. Drop empty headers (lines like "##" or "### ").
    if EMPTY_HEADER_RE.search(text):
        text = EMPTY_HEADER_RE.sub("", text)
        warnings.append("dropped_empty_headers")

    # 5. Collapse excessive blank lines.
    collapsed = EXCESSIVE_BLANKS_RE.sub("\n\n", text)
    if collapsed != text:
        warnings.append("collapsed_excessive_blank_lines")
    text = collapsed.strip()

    # 6. Heading-level hygiene.
    headers = HEADER_RE.findall(text)
    if headers:
        levels = [len(h[0]) for h in headers]
        # If the document starts with H1, treat H1 as the title (we render the
        # title separately) and promote subsequent H1s to H2 for consistency.
        if any(lv == 1 for lv in levels):
            # Convert *every* H1 to H2 after the first.
            first_h1_seen = False

            def _demote(match: re.Match) -> str:
                nonlocal first_h1_seen
                hashes, title = match.group(1), match.group(2)
                if len(hashes) == 1:
                    if not first_h1_seen:
                        first_h1_seen = True
                        return ""  # remove first H1 — the entry already has a title
                    return f"## {title}"
                return match.group(0)

            new_text = HEADER_RE.sub(_demote, text)
            if new_text != text:
                warnings.append("demoted_h1_to_h2")
                text = new_text

        # Re-scan after possible mutation.
        headers = HEADER_RE.findall(text)
        levels = [len(h[0]) for h in headers]

        # If the shallowest heading is H4+ (nothing at H2 or H3), promote.
        if levels:
            shallowest = min(levels)
            if shallowest > 2:
                shift = shallowest - 2

                def _promote(match: re.Match) -> str:
                    hashes, title = match.group(1), match.group(2)
                    new_level = max(1, len(hashes) - shift)
                    return f"{'#' * new_level} {title}"

                text = HEADER_RE.sub(_promote, text)
                warnings.append("promoted_orphan_subheadings")

        # Detect and warn about heading-level jumps (e.g. H2 → H4).
        prev = None
        for lv in levels:
            if prev is not None and lv - prev > 1:
                warnings.append("heading_level_jumps_detected")
                break
            prev = lv
    else:
        if text.strip():
            warnings.append("no_headings_found_applied_default")

    return text.strip(), warnings


def parse_markdown_safe(md_text: str) -> dict:
    """Safe, resilient markdown parser. Never raises.

    Returns: {html, sections, frontmatter, warnings}
    - html: sanitised HTML. Empty string if nothing rendered.
    - sections: list of {id, title, level} for H2/H3.
    - frontmatter: dict (possibly empty).
    - warnings: list of short internal codes (never surfaced to end users).
    """
    try:
        if not md_text or not str(md_text).strip():
            return {
                "html": '<div class="aurin-empty-state"><p>This entry has no content yet.</p></div>',
                "sections": [],
                "frontmatter": {},
                "warnings": ["empty_input"],
            }

        # Separate frontmatter first; tolerate invalid frontmatter.
        try:
            post = frontmatter.loads(md_text)
            fm = dict(post.metadata or {})
            body = post.content or ""
        except Exception:
            fm = {}
            body = md_text
            logger.warning("frontmatter_parse_failed, falling back to raw body")

        normalised, warnings = normalize_markdown(body)

        # If after normalisation there is still no content, return a safe default.
        if not normalised.strip():
            return {
                "html": '<div class="aurin-empty-state"><p>This entry has no content yet.</p></div>',
                "sections": [],
                "frontmatter": fm,
                "warnings": warnings + ["no_body_after_normalisation"],
            }

        # If no H2/H3 structure exists at all, wrap the body in a default
        # "Overview" section so the UI still has something to anchor.
        if not re.search(r"^#{2,3}\s+", normalised, re.MULTILINE):
            normalised = "## Overview\n\n" + normalised
            warnings.append("wrapped_in_default_overview_section")

        md = md_lib.Markdown(
            extensions=["fenced_code", "tables", "toc", "sane_lists", "nl2br"],
            extension_configs={"toc": {"permalink": False}},
        )
        try:
            html = md.convert(normalised)
        except Exception as e:
            logger.exception("markdown.convert failed: %s", e)
            warnings.append("markdown_parser_failed_using_plain_text")
            # Last-resort: render as an escaped preformatted block.
            html = f"<pre>{bleach.clean(normalised)}</pre>"

        html_safe = bleach.clean(
            html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True
        )

        # Extract sections from TOC if available; otherwise fall back to regex.
        sections: List[dict] = []
        try:
            for tok in getattr(md, "toc_tokens", []):
                if tok.get("level") == 2:
                    sections.append({
                        "id": tok.get("id") or _slugify(tok.get("name", "")),
                        "title": (tok.get("name") or "Section").strip(),
                        "level": 2,
                    })
                    for child in tok.get("children", []):
                        if child.get("level") == 3:
                            sections.append({
                                "id": child.get("id") or _slugify(child.get("name", "")),
                                "title": (child.get("name") or "Section").strip(),
                                "level": 3,
                            })
        except Exception:
            sections = []
            warnings.append("toc_extraction_failed")

        # Guarantee at least one section if body exists — keeps layout stable.
        if not sections:
            sections = [{"id": "overview", "title": "Overview", "level": 2}]
            warnings.append("applied_default_section")

        return {
            "html": html_safe,
            "sections": sections,
            "frontmatter": fm,
            "warnings": warnings,
        }

    except Exception as e:
        # Absolute last line of defence — never let a bad file break the UI.
        logger.exception("parse_markdown_safe crashed: %s", e)
        return {
            "html": '<div class="aurin-empty-state"><p>This entry could not be rendered cleanly. The team has been notified.</p></div>',
            "sections": [{"id": "overview", "title": "Overview", "level": 2}],
            "frontmatter": {},
            "warnings": ["parser_hard_failure"],
        }
