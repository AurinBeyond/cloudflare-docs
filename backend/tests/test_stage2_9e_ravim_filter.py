"""Tests for the Estonian 'ravim' family ban — founder directive
2026-02-12. The word 'ravim' and its declensions/conjugations are
forbidden in AI replies; they must be silently rewritten by
`clarity_safety.sanitize_reply` into wellness-only vocabulary."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from clarity_safety import sanitize_reply, audit_clinical_drift  # noqa: E402


FORBIDDEN_ESTONIAN_FORMS = [
    "ravim", "ravimi", "ravimid", "ravimile", "ravimist",
    "ravimine", "ravimisega",
    "ravi", "ravib", "ravinud", "ravida",
    "raviefekt", "raviefekti",
    "ravimtaim", "ravimtaimed",
    "ravitseb", "ravitsema", "ravitsetud", "ravitsen",
]


def test_sanitize_strips_every_estonian_ravi_form():
    """After sanitize_reply, the literal stems 'ravim', 'ravits' and
    'raviefekt' must NOT remain. Bare 'ravi' is also blocked because
    the founder explicitly directed it. We allow only the wellness
    vocabulary replacements."""
    for form in FORBIDDEN_ESTONIAN_FORMS:
        sentence = f"See on hea {form} sinu hingele."
        out = sanitize_reply(sentence).lower()
        for stem in ("ravim", "ravits", "raviefekt"):
            assert stem not in out, (
                f"sanitize_reply still contains '{stem}' for input "
                f"'{form}' → output {out!r}"
            )
        # Bare 'ravi' as a standalone word must also be gone.
        words = [w.strip(".,!?") for w in out.split()]
        assert "ravi" not in words, (
            f"bare 'ravi' survived sanitization for input {form!r}: {out!r}"
        )


def test_audit_flags_ravim_drift_in_raw_text():
    """`audit_clinical_drift` is the monitoring helper that runs against
    the RAW (pre-sanitization) AI text. It must catch the Estonian
    family so we can log drift incidents."""
    raw_samples = [
        "See ravim toetab keha.",
        "Soovitan ravimist proovida.",
        "Raviefekt oli tugev.",
        "Need on head ravimid.",
        "Ravimtaim aitab.",
        "Ma ravitsen sind hellalt.",
    ]
    for s in raw_samples:
        flags = audit_clinical_drift(s)
        assert flags, f"audit_clinical_drift missed {s!r}"


def test_replacement_uses_wellness_vocabulary():
    """The replacement vocabulary must come from the founder's
    approved list: toetus, vabastamine, tasakaalustamine."""
    approved = {"toetus", "toetused", "toetav", "toetab", "toetama",
                "tasakaalustamine", "tasakaalustamisest", "tasakaalustamisega",
                "tugitaim"}
    test_cases = [
        ("Vaja on ravimit.", "toetus"),
        ("Need on ravimid.", "toetused"),
        ("Raviefekt on tugev.", "toetav"),
        ("See ravimine on oluline.", "tasakaalustamine"),
        ("Ravimtaim aitab.", "tugitaim"),
    ]
    for sentence, must_contain in test_cases:
        out = sanitize_reply(sentence).lower()
        assert must_contain in out, (
            f"expected one of approved vocab in {out!r} for {sentence!r}"
        )


def test_idempotent_double_pass():
    """sanitize_reply must be safe to call twice — the second pass
    sees no clinical words and changes nothing."""
    samples = [
        "See ravim toetab.",
        "Ravimid aitavad.",
        "Raviefekt on selge.",
    ]
    for s in samples:
        once = sanitize_reply(s)
        twice = sanitize_reply(once)
        assert once == twice, f"not idempotent: {once!r} → {twice!r}"
