# Changelog

## Unreleased

### Planned

- Add an approved, deeply immutable shared role preset catalog to the existing `./constants` subpath in a future development release. The planned exports are `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`; they are not implemented or published in 2.4.2-dev.164.
- Validate the planned catalog with a targeted `node:test` check without classifying the existing root diagnostics as a whole-package formal test suite.

### Added

- Project governance based on managed common-governance version 1.3.0.
- A current specification, public data-contract inventory, operations guide, ADR index, and evidence-backed Shared-package readiness roadmap.
- Project-scoped developer, tester, explorer, researcher, reviewer, and release-review roles.
- Repeatable governance, documentation, link, index, TOML, roadmap, ADR, and migration-evidence validation.

### Changed

- Authoritative project Markdown is explicitly tracked while the existing general Markdown ignore rule remains in place.

### Fixed

### Removed

### Security

- Documented the prohibition on secrets, credentials, session data, production records, and unauthorized remote or real-data operations.
