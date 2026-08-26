# Changelog

## Unreleased

### Added

- Locally implemented the approved, deeply immutable shared role preset catalog through the existing `./constants` subpath as `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId` for the unreleased 2.4.2-dev.165 package state.
- Added a targeted public-self-reference `node:test` check with Node 24 direct-test, import, and package dry-run evidence; this does not establish a whole-package formal test suite.
- Project governance based on managed common-governance version 1.3.0.
- A current specification, public data-contract inventory, operations guide, ADR index, and evidence-backed Shared-package readiness roadmap.
- Project-scoped developer, tester, explorer, researcher, reviewer, and release-review roles.
- Repeatable governance, documentation, link, index, TOML, roadmap, ADR, and migration-evidence validation.

### Changed

- Advanced local package metadata from 2.4.2-dev.164 to 2.4.2-dev.165 without creating a tag, pushing, publishing to npm, confirming a remote registry, or starting consumer adoption.
- Authoritative project Markdown is explicitly tracked while the existing general Markdown ignore rule remains in place.

### Fixed

### Removed

### Security

- Documented the prohibition on secrets, credentials, session data, production records, and unauthorized remote or real-data operations.
