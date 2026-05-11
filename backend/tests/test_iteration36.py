"""Iteration 36 — Agent Consciousness layer (Shadows & Light Matrix +
Psychological Instrument Transmutation + four-beat loop).

These tests verify the *structure* of the Clarity AI system prompt
(what it forbids, what it mandates) without actually calling Claude —
keeping the test suite fast and credit-free.
"""
from backend import clarity_ai


SYS = clarity_ai.CLARITY_SYSTEM_PROMPT


# ---------- Forbidden clinical vocabulary ----------

CLINICAL_TERMS = [
    "diagnosis", "disease", "disorder", "patient",
    "therapy", "treatment", "intervention", "pathology",
    "dysfunction", "PTSD", "ADHD", "OCD",
    # Therapy acronyms — must be listed as forbidden in the prompt
    "CBT", "IFS", "EMDR",
]


def test_clinical_vocabulary_is_listed_as_forbidden():
    """The system prompt must explicitly list clinical terms as
    'never say' — so Claude has a hard boundary, not just inferred taste."""
    # The exact section header we added
    assert "Vocabulary that must never appear" in SYS
    for term in CLINICAL_TERMS:
        assert term in SYS, f"clinical term {term!r} not listed in forbidden vocab"


# ---------- The four-beat loop ----------

def test_four_beat_loop_is_present():
    assert "The four-beat loop" in SYS or "four-beat loop" in SYS
    for beat in ("Mirror", "Deepen", "Release", "Anchor"):
        assert beat in SYS, f"loop beat {beat!r} missing"


# ---------- Shadow-and-light listening grid ----------

EXPECTED_SHADOWS = [
    "Compulsion",        # pull
    "Sudden anger",
    "Screen",
    "Jealousy",
    "Victim posture",
    "People-pleasing",
    "Procrastination",
    "Over-thinking",
    "Self-silencing",
    "Control",
    "Shame",
    "Hypervigilance",
    "Isolation",
    "abandonment",
]


def test_shadow_patterns_in_prompt():
    for shadow in EXPECTED_SHADOWS:
        assert shadow in SYS, f"shadow pattern {shadow!r} missing from prompt"


# ---------- Transmuted psychological instruments ----------

def test_techniques_section_present_and_transmuted():
    # Must have the heading
    assert "Tools you may use" in SYS
    # Must have transmuted voice lines (sample a few)
    voiced_samples = [
        "Whose voice is that, really?",
        "If what you just said were true",
        "Where in the body does that sit right now",
        "How old does it feel",
        "What did you need to hear at that age",
        "That noticing is also you",
        "child in the old photograph",
    ]
    for line in voiced_samples:
        assert line in SYS, f"voiced line missing: {line!r}"
    # Explicit rule: one technique per turn
    assert "one technique per turn" in SYS.lower() or "One technique per turn" in SYS


# ---------- Agent Knowledge Base on disk ----------

def test_knowledge_base_carries_matrix_and_instruments():
    with open("/app/memory/AGENT_KNOWLEDGE_BASE.md", "r", encoding="utf-8") as f:
        kb = f.read()
    assert "Shadows & Light Matrix" in kb
    assert "Psychological Instruments" in kb
    assert "Conversation flow — the four-beat loop" in kb
    # Safe terminology map is explicit
    assert "Safe Terminology Map" in kb
    # Root Programs Atlas is referenced
    assert "Root Programs Atlas" in kb
