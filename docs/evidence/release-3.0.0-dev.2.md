# Release Evidence: 3.0.0-dev.2

- Status: Published and content-verified
- Date: 2026-09-15
- Package: `@shisyamo4131/air-guard-v2-schemas@3.0.0-dev.2`
- Commit: `3e69f4e95bd072c161ef64cf6346793619fd6642`
- Annotated tag: `v3.0.0-dev.2`
- Tag object: `89f1c0c94af4f54b60533c3942960f32aef972d2`
- Workflow: [run 34925604934](https://github.com/shisyamo4131/air-guard-v2-schemas/actions/runs/34925604934)

## Workflow Evidence

| Job | Job ID | Conclusion |
| --- | --- | --- |
| Node 22 formal package tests | `104242885705` | success |
| Node 24 formal package tests | `104242885499` | success |
| Node 24 release guard and Trusted Publishing | `104242915900` | success |

The workflow used exact tag `v3.0.0-dev.2` at the recorded commit. The publish job completed `npm run check:release` before `npm publish --tag dev`. Remote `main` and the annotated tag both resolve to the recorded commit. No rerun, tag move, tag deletion, force push, unpublish, or deprecation was used.

## Registry and Content Evidence

- npm `dev` dist-tag: `3.0.0-dev.2`
- registry `gitHead`: `3e69f4e95bd072c161ef64cf6346793619fd6642`
- published at: `2026-09-15T03:36:25.623Z`
- shasum: `12642f31ead39cfbaeb636cc91f5bf8de39a2105`
- integrity: `sha512-1THCaV7z1V8VLyGJwB5R1AOq1cPpppIIHZC37pPNEgKjP65gJVKFJtc1fls905azLETchBHYlNokUcSrrSS1Hg==`
- tarball size: 108,600 bytes
- package files: 83
- unpacked size: 521,900 bytes

The downloaded registry tarball bytes matched the registry SHA-1 and SHA-512 metadata. All 83 extracted files matched the exact tagged commit after LF normalization, including `src/ArrangementNotification.js`.

## Fresh-install Evidence

A fresh credentials-free registry install under Node 24.19.0 succeeded with `@holiday-jp/holiday_jp@2.5.1` and `@shisyamo4131/air-firebase-v2@2.3.1-dev.6`. Verification confirmed:

- package version `3.0.0-dev.2`;
- successful imports from the package root, `./constants`, `./company-configuration`, `./apis`, and `./utils`;
- `toArrived()` preserves an existing `confirmedAt` value; and
- actual start/end date calculation crosses midnight with deterministic JST boundaries while the process time zone is UTC.

The workstation used Node's `--use-system-ca` option for the temporary npm client to trust the local TLS chain; no authentication or reauthentication was requested. Temporary tarball, extraction, npm cache, and fresh-install roots were removed and their absence was checked. The source repository was clean after verification.

## Local and Governance Validation

- The targeted eight-case `test-arrangement-notification.js` suite passed under local Node 22 and Node 24.
- The fail-closed eleven-file package suite passed under local Node 22 and Node 24.
- The Node 24 release guard passed with `RELEASE_TAG=v3.0.0-dev.2`.
- Managed governance, verification-policy negative tests, and project-document validation each passed independently under Windows PowerShell 5.1 and PowerShell 7.
- `git diff --check` passed before the release commit.

Windows PowerShell 5.1 required the user-approved process-scoped `-ExecutionPolicy Bypass` because the workstation policy rejected script startup. Two verified compatibility fixes suppress nested startup-progress CLIXML in the negative-test runner and pass the TOML validation program to Python through standard input. These fixes preserve the existing negative-case and document validation contracts.

## Boundary

Publication does not authorize or imply AirGuardV2 dependency or code changes, Firebase or Stripe operations, deployment, data creation or migration, unpublish, deprecation, tag mutation, force push, or history rewrite. Corrected-version adoption remains a separate consumer-owned checkpoint. AirGuardV2 root and Functions must adopt one exact verified version and content together, and exact 2.4.2-dev.167 plus the previous consumer code remains their rollback baseline.
