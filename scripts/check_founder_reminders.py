#!/usr/bin/env python3
"""
Founder reminder scanner. Run at any time to check if any dormant
reminder in FOUNDER_REMINDERS.md has hit its trigger date.

Usage:
  python3 /app/scripts/check_founder_reminders.py

Exits 0 with a red banner if something is triggered. Exits 0 silently
if nothing is due yet.
"""
import re
import sys
from datetime import date, datetime
from pathlib import Path

REMINDERS_FILE = Path("/app/memory/FOUNDER_REMINDERS.md")
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def parse_reminders(text: str):
    """Find every reminder block and extract id + trigger_date + status."""
    # Capture blocks starting with "### R-..." up to the next "###" or "---"
    pattern = re.compile(r"### (R-\d+) · (.+?)\n(.*?)(?=\n### R-|\n##|\n---)", re.DOTALL)
    out = []
    for m in pattern.finditer(text):
        rid, title, body = m.group(1), m.group(2), m.group(3)
        # Trigger date line
        td = re.search(r"\*\*Trigger date:\*\*[^\d]*(\d{1,2})\s+(\w+)\s+(\d{4})", body)
        # Status
        st = re.search(r"\*\*Status:\*\*\s+([^\n]+)", body)
        if not td:
            continue
        try:
            day = int(td.group(1))
            month_name = td.group(2).lower()[:3]
            months = {
                "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
                "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
            }
            if month_name not in months:
                continue
            dt = date(int(td.group(3)), months[month_name], day)
        except Exception:
            continue
        out.append({
            "id": rid,
            "title": title.strip(),
            "trigger_date": dt,
            "status_line": st.group(1).strip() if st else "",
            "body": body.strip(),
        })
    return out


def main():
    if not REMINDERS_FILE.exists():
        sys.exit(0)
    text = REMINDERS_FILE.read_text()
    today = date.today()
    triggered = []
    for r in parse_reminders(text):
        if r["trigger_date"] <= today and "DORMANT" in r["status_line"]:
            triggered.append(r)
    if not triggered:
        # Silent success — reminders exist but none are due
        return
    print(f"\n{RED}{BOLD}{'='*70}")
    print(f"  🔴 FOUNDER REMINDER TRIGGERED — surface this to the founder")
    print(f"{'='*70}{RESET}\n")
    for r in triggered:
        print(f"{RED}{BOLD}{r['id']} · {r['title']}{RESET}")
        print(f"   Triggered on: {r['trigger_date'].isoformat()} (today: {today.isoformat()})")
        print(f"\n   Full entry: see {REMINDERS_FILE}\n")
    print(f"{RED}After the founder acknowledges, move the entry to COMPLETED "
          f"and delete this banner from future output.{RESET}\n")


if __name__ == "__main__":
    main()
