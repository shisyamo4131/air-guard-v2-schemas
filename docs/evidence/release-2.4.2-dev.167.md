# Release Evidence: 2.4.2-dev.167

- Status: Published and content-verified
- Date: 2026-08-28
- Package: `@shisyamo4131/air-guard-v2-schemas@2.4.2-dev.167`
- Commit: `bb2390997153b2e57470d0c04012d93ddde2f971`
- Annotated tag: `v2.4.2-dev.167`
- Tag object: `577f358e3f7a4f7c32d216c11b9305047bbab4d7`
- Workflow: [run 33150835365](https://github.com/shisyamo4131/air-guard-v2-schemas/actions/runs/33150835365)

## Workflow Evidence

| Job | Job ID | Conclusion |
| --- | --- | --- |
| Node 22 formal package tests | `98782173867` | success |
| Node 24 formal package tests | `98782174101` | success |
| Node 24 release guard and Trusted Publishing | `98782214750` | success |

The workflow reused the exact commit and tag. No rerun, tag move, tag deletion, version redesign, force push, unpublish, or deprecation was used.

## Registry and Content Evidence

- npm `dev` dist-tag: `2.4.2-dev.167`
- registry `gitHead`: `bb2390997153b2e57470d0c04012d93ddde2f971`
- shasum: `b4cbc285438179f75b69bd754141b0a4492c722d`
- integrity: `sha512-EsMVhMXo9Rrc6AdLT98sdiN5iGniVZq6mEDN+XMgxuB1e8TYbNPPQCHRCdf+HcnvbTseruo23A+4PQnFpw/p0g==`
- package files: 84
- unpacked size: 529,097 bytes

The downloaded registry tarball bytes matched the registry SHA-1 and SHA-512 metadata. Extraction verified the required CCB modules and excluded tests, docs, scripts, `.github`, and nested package archives. A `git archive` LF-clean tree from the exact commit, packed with the CI-aligned Node 24/npm context and scripts disabled, matched the published tarball digest and package content. The earlier Windows-checkout dry-run container hash difference was therefore a checkout line-ending/toolchain-context difference, not a source, runtime, API, or published-artifact mismatch.

## Fresh-install Evidence

A fresh exact registry install in a verified temporary project succeeded with peers. Verification confirmed:

- package version `2.4.2-dev.167`;
- public `@shisyamo4131/air-guard-v2-schemas/company-configuration` import;
- expected 27-name public CCB API surface and representative parser behavior;
- no CCB export leak from the package root;
- peer-inclusive import success.

Temporary tarball, extraction, cache, archive, pack, and install roots were removed and their absence was checked. The source repository remained clean and its commit, remote main, and tag were unchanged after verification.

## Boundary

Publication does not authorize or imply AirGuardV2/Admin SDK dependency changes, consumer code/test changes, deployment, Firebase/Dev/Prod operation, data migration, unpublish, deprecation, tag mutation, force push, or history rewrite. Consumer adoption requires a separate consumer-owned checkpoint using exact version and content evidence.
