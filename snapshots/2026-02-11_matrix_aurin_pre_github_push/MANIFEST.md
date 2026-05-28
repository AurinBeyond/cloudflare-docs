# Matrix Aurin — Snapshot 2026-02-11 (pre-GitHub-push)

This is a local backup taken immediately before the founder pushes
to GitHub via the platform's "Save to Github" feature.

## What is included
- backend/        — server.py, parents_lenses.py, body_lenses.py, payment_providers/
- frontend_src/   — all components/pages touched in the recent sprints
- frontend_audio/ — Charlotte (Grace) + Lily (Sara) new intro MP3s
- memory/         — all founder-locked documents (PRD, CHANGELOG,
                    BRAND_VOICE_LOCK, POLAR_SWITCHOVER_GUIDE,
                    BROKEN_CLOCKWORK_COURSE_DRAFT, CURATORS_*)
- scripts/        — polar_smoke_test.sh

## How to use
If anything goes wrong after the GitHub push or deploy, this folder
holds a verified-clean copy of all critical files at the moment
right before the push.

To restore one file: `cp snapshots/2026-02-11_matrix_aurin_pre_github_push/<path> /app/<destination>`

## State at snapshot time
- All 10 lint targets clean (3 Python + 7 React)
- Backend RUNNING, frontend RUNNING, mongo RUNNING
- Critical endpoints verified (see audit report in CHANGELOG.md)
