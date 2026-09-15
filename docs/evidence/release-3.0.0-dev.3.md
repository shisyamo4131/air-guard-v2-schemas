# Release Evidence: 3.0.0-dev.3

- Status: Candidate validated; publication pending
- Date: 2026-09-15
- Package: `@shisyamo4131/air-guard-v2-schemas@3.0.0-dev.3`
- Commit: pending release commit
- Annotated tag: `v3.0.0-dev.3` (planned; not yet created)
- Workflow: pending

## Candidate Scope

This compatible forward correction makes `SiteOperationSchedule.notify()` initialize `ArrangementNotification.actualIsStartNextDay` from each scheduled worker's `isStartNextDay` value. Its regression test exercises the complete notification-creation path without Firestore writes and verifies that a next-day schedule gives the created notification the same initial start occurrence as the schedule.

The candidate also includes the preceding project-governance update that added user-facing release proposals, early release preflight, exact test-inventory ownership, and missing PowerShell gate-script validation. Package fields, exports, dependencies, consumer code, deployment, and production data remain unchanged.

## Local Candidate Validation

- `node --test test-arrangement-notification.js` passed 9 tests under Node 22.23.2 and Node 24.19.0, each with exit status 0.
- The fail-closed eleven-file package suite passed under Node 22.23.2 with exit status 0.
- The Node 24.19.0 release guard for exact tag `v3.0.0-dev.3` passed with exit status 0 and included the complete package suite and public self-import.
- The release-guard dry run reported 83 package files, 109,234 bytes packed, 534,089 bytes unpacked, SHA-1 `cc52db3e8230760542cfe65d5a5054cea398a12e`, and integrity `sha512-WPiocq96n2F5bzdd9siQhJ7XZ/ceAZBbxnbNeRY/nmR5D/gDm/uiRo84KEGrLUleMVlTA1C+SY+BP4RTHhH4CA==`.
- Managed governance, all 15 verification-policy negative cases, and project-document validation passed independently under Windows PowerShell 5.1.26100.9444 and PowerShell 7.6.5 with exit status 0.
- `git diff --check` passed with exit status 0 before the release commit.

The first Node 24 release-guard attempt completed all package tests but failed with exit status 1 when Windows rejected a write to the default npm cache. The entire guard was rerun with a unique process-scoped temporary cache and then passed with exit status 0. The temporary cache was removed and its absence verified.

## Pending Publication Evidence

- release commit, annotated tag object, and actual remote commit verification;
- GitHub Actions Node 22, Node 24, and publish job results;
- npm registry metadata, downloaded tarball hashes, tagged-content comparison, and peer-inclusive fresh install.

Passing results, identifiers, hashes, sizes, timestamps, and success statements will be recorded only after each result exists with a successful exit status.

## Boundary and Recovery

This release does not authorize consumer dependency changes, deployment, production-data operations, history rewrite, tag movement or deletion, npm unpublish, or deprecation. Validation failure before tag creation stops the release without publication. A failure after publication preserves the immutable release and uses a later development version for forward correction. Existing verified consumer rollback remains exact `2.4.2-dev.167` with the previous consumer code.
