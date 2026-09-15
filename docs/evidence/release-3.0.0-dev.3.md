# Release Evidence: 3.0.0-dev.3

- Status: Published and content-verified
- Date: 2026-09-15
- Package: `@shisyamo4131/air-guard-v2-schemas@3.0.0-dev.3`
- Commit: `817b3199b1964a5cd8ba1851114b085eed8dc322`
- Annotated tag: `v3.0.0-dev.3`
- Tag object: `929041296aa65515f2a1ea15fb68caaa4532f8e8`
- Workflow: [run 34932583471](https://github.com/shisyamo4131/air-guard-v2-schemas/actions/runs/34932583471)

## Scope

This compatible forward correction makes `SiteOperationSchedule.notify()` initialize `ArrangementNotification.actualIsStartNextDay` from each scheduled worker's `isStartNextDay` value. Its regression test exercises the complete notification-creation path without Firestore writes and verifies that a next-day schedule gives the created notification the same initial start occurrence as the schedule.

The release also includes the preceding project-governance update that added user-facing release proposals, early release preflight, exact test-inventory ownership, and missing PowerShell gate-script validation. Package fields, exports, dependencies, consumer code, deployment, and production data remain unchanged.

## Workflow Evidence

| Job | Job ID | Conclusion |
| --- | --- | --- |
| Node 24 formal package tests | `104263720304` | success |
| Node 22 formal package tests | `104263720450` | success |
| Node 24 release guard and Trusted Publishing | `104263758942` | success |

The workflow used exact tag `v3.0.0-dev.3` at the recorded commit. The publish job completed `npm run check:release` before `npm publish --tag dev`. At publication, remote `main` and the annotated tag both resolved to the recorded commit. No rerun, tag move, tag deletion, force push, unpublish, or deprecation was used.

## Registry and Content Evidence

- npm `dev` dist-tag: `3.0.0-dev.3`
- registry `gitHead`: `817b3199b1964a5cd8ba1851114b085eed8dc322`
- published at: `2026-09-15T05:24:34.496Z`
- shasum: `8745cad6e486d49c42cf3261db5a450e1f3535b9`
- integrity: `sha512-d102QT5cFwAAKJ6GKwReluVFmM67ZNbfPnDdxSTrPq0FnyZaekF6XwOk4u9q1w9c5LJGDznThlKQ9RtOBG6BsA==`
- tarball size: 108,678 bytes
- package files: 83
- unpacked size: 522,105 bytes

The downloaded registry tarball bytes matched the registry SHA-1 and SHA-512 metadata. All 83 extracted files matched exact tagged commit `817b3199b1964a5cd8ba1851114b085eed8dc322` after LF normalization, including `src/SiteOperationSchedule.js`.

## Fresh-install Evidence

A fresh credentials-free registry install under Node 24.19.0 succeeded with `@holiday-jp/holiday_jp@2.5.1` and `@shisyamo4131/air-firebase-v2@2.3.1-dev.6`. Verification confirmed:

- package version `3.0.0-dev.3`;
- successful imports from the package root, `./constants`, `./company-configuration`, `./apis`, and `./utils`;
- `SiteOperationSchedule.notify()` creates one notification with `actualIsStartNextDay=true` for a next-day worker; and
- the created notification's `actualStartAt` equals its scheduled `startAt` occurrence.

The first verification invocation had a PowerShell here-string syntax error and exited before installation began. The corrected complete install and behavior command passed with exit status 0. Temporary tarball, extraction, npm cache, and fresh-install roots were removed and their absence was checked.

## Local and Governance Validation

- The targeted nine-case `test-arrangement-notification.js` suite passed under local Node 22.23.2 and Node 24.19.0.
- The fail-closed eleven-file package suite passed under local Node 22.23.2.
- The Node 24.19.0 release guard passed with exact `RELEASE_TAG=v3.0.0-dev.3`; it included the full package suite, public self-import, package inventory, and version/tag alignment.
- Managed governance, all 15 verification-policy negative cases, and project-document validation each passed independently under Windows PowerShell 5.1.26100.9444 and PowerShell 7.6.5.
- `git diff --check` passed before the release commit.

Windows PowerShell's effective persistent execution policy remained `Restricted`. Direct post-publication invocations of the three validators were rejected before their script bodies started and each exited 1. The validators were then run with the previously user-approved process-scoped `-ExecutionPolicy Bypass`; all three passed with exit status 0. No persistent execution policy was changed.

The first Node 24 release-guard attempt completed all package tests but failed with exit status 1 when Windows rejected a write to the default npm cache. The complete guard was rerun with a unique process-scoped temporary cache and passed with exit status 0. That cache was removed and its absence verified.

## Boundary

Publication does not authorize or imply AirGuardV2 dependency or code changes, Firebase or Stripe operations, deployment, data creation or migration, unpublish, deprecation, tag mutation, force push, or history rewrite. Corrected-version adoption remains a separate consumer-owned checkpoint. AirGuardV2 root and Functions must adopt one exact verified version and content together, and exact 2.4.2-dev.167 plus the previous consumer code remains their rollback baseline.
