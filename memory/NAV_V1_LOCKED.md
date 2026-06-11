# §NAV-V1-LOCKED 2026-02-10

Alistair laboratory navigation graph is FROZEN at version 1.

Frozen state:
- 11 laboratories live on /course-room
- 295 painted hotspots across 11 labs
- 291 unique /course-room/lab/{slug}/topic/{topicId} routes
- 295 / 295 hotspots verified via live E2E sweep (3 batches, 0 failures,
  0 console errors, 0 page errors)
- TopicDetail.jsx renders title + back-link + lab-label for every route

What this means:
- The shape of the navigation graph (which painted area → which topicId
  → which placeholder page) is NOT to be restructured.
- Only acceptable changes during this freeze:
  1. Hotspot coordinate nudges (driven by founder calibration sweep
     in ?debug=1 mode).
  2. Authoring real content into TopicDetail (replacing placeholder
     copy with founder-approved inquiry text per topic).
  3. Bug fixes that do not change the route shape.

What is NOT allowed during this freeze:
- Renaming topic IDs (would break the audited route set).
- Adding or removing topic hotspots (would change the 295 count).
- Restructuring the LabDashboard ↔ TopicDetail contract.

After founder visual calibration completes and content authoring is
substantially underway, this freeze will be replaced by NAV_V2.
