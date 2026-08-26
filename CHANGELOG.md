# Changelog

## Unreleased

### 2.4.2-dev.166 corrective candidate

#### Changed

- Prepared local package metadata version 2.4.2-dev.166 as a documentation-only corrective candidate that removes stale publication-state wording from the packaged README and aligns repository release evidence. Package code, tests, exports, scripts, dependencies, role preset data, and authorization boundaries are unchanged.
- Version 2.4.2-dev.166 has not been tagged, pushed, published, or confirmed in a remote registry. Consumer adoption remains pending and must follow separate publication verification.

### Verified 2.4.2-dev.165 publication

### Added

- Published the approved, deeply immutable shared role preset catalog through the existing `./constants` subpath as `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId` in 2.4.2-dev.165.
- Added a targeted public-self-reference `node:test` check with Node 24 direct-test, import, and package dry-run evidence; this does not establish a whole-package formal test suite.
- Project governance based on managed common-governance version 1.3.0.
- A current specification, public data-contract inventory, operations guide, ADR index, and evidence-backed Shared-package readiness roadmap.
- Project-scoped developer, tester, explorer, researcher, reviewer, and release-review roles.
- Repeatable governance, documentation, link, index, TOML, roadmap, ADR, and migration-evidence validation.

### Changed

- Verified the 2.4.2-dev.165 annotated tag and main commit, successful publish workflow run 32930098774, npm registry version and `dev` dist-tag, canonical shasum `0b828c4b8c585bbc276043c8321d53f889aaabd3`, integrity `sha512-mXZQgF90t8pwGzbglwfh4X8xkZ1Hoi58NsOOlkYxR6By0vnk+KYakKxToPCN0lAkf146J9A8eS3y4vgrKW8Rhg==`, and peer-inclusive fresh public import. Consumer adoption is not implied by publication.
- Authoritative project Markdown is explicitly tracked while the existing general Markdown ignore rule remains in place.

### Fixed

### Removed

### Security

- Documented the prohibition on secrets, credentials, session data, production records, and unauthorized remote or real-data operations.
