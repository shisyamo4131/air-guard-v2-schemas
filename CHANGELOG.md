# Changelog

## Unreleased

### Added

- Migrated managed common governance to 1.4.0 and added exact-task session-capacity routing, the project coordination runbook, the fail-closed local measurement script, governance ADR, handoff index, and capacity-routing validation.

### Changed

- Prepared and locally validated the breaking correction as unpublished package candidate `3.0.0-dev.1`; published `2.4.2-dev.167` remains immutable and is the rollback baseline.
- Changed the release-package guard so the retired legacy mapper/export/file and Stripe-derived entitlement parser exports are forbidden package content instead of required content.
- Legacy-shaped `Company` input may be read only to discard `stripeCustomerId` and `subscription`; those fields are no longer restored, defaulted, or serialized.
- Recorded that AirGuardV2 root and Functions currently pin the same exact `2.4.2-dev.167` package content, use retained Company Configuration Boundary APIs, and do not import the three removed exports; shared role-catalog import adoption and corrected-contract adoption/build acceptance remain pending.

### Removed

- Removed `stripeCustomerId` and `subscription` (including the nested `employeeLimit`) from the public `Company` schema.
- Removed `parseCompanyEntitlementV1`, `parseCompanyPrivateEntitlementV1`, and `mapLegacyCompanyToConfigurationV1` from `./company-configuration`, and removed `src/company-configuration/legacy.js` from the package.

## 2.4.2-dev.167 - 2026-08-28

### Added

- Locally implemented the accepted Company Configuration Boundary v1 pure-data contract through the additive `./company-configuration` public subpath, including exact document and Callable-input parsers, structural `TimestampLike` semantics, stable code/path validation errors, and explicit-conflict legacy `Company` mapping.
- Added the targeted `test-company-configuration.js` public-self-reference test and `test:company-configuration` package script.
- Added the fail-closed formal `npm test` inventory, release guard, positive and negative guard tests, and Node 22/24 workflow test matrix required before the Node 24 publish job.

### Compatibility and release status

- The legacy `Company` class and package-root exports remain unchanged; Firebase SDK identity, AirFirebase adapters, UI runtimes, CRUD, Rules, deployment, and data operations are excluded.
- Exact 2.4.2-dev.167 is published and verified at commit/tag, successful Node 22/24 and Node 24 release/publish workflow jobs, registry byte/content digests, LF-clean exact-commit comparison, and fresh peer-inclusive public import. AirGuardV2 root and Functions currently pin the same exact package content, use retained Company Configuration Boundary APIs, and do not import the three exports removed by the later correction. Shared role-catalog import adoption and corrected-contract adoption/build acceptance remain pending and consumer-owned.

### Fixed

- Reconciled stale active validation instructions and current contract/ADR wording with the formal ten-file suite and the corrected error-definition test before publication.
- Replaced the obsolete console-only `test-error-definitions.js` diagnostic with maintained assertions for `invalidReasons`, `isInvalid`, and `validate()` without echoing raw input values.
- The legacy mapper now treats whitespace-only bank fields plus the old default `accountType: 普通` as an empty bank and maps all five bank fields to null. Partial bank input and `当座`-only input continue to fail with an explicit conflict.
- The activation-period root projection now accepts and removes the six known persisted framework/computed extras `docId`, `uid`, `fullAddress`, `prefecture`, `hasBankInfo`, and `isCompleteRequiredFields`; the exact root parser and true unknown fields remain strict.

## 2.4.2-dev.166 - 2026-08-26

### Changed

- Published the documentation/version-metadata-only correction relative to 2.4.2-dev.165. Package code, tests, exports, scripts, dependencies, role preset data, and authorization boundaries are unchanged.
- Verified commit `1a6024ceedd03684020ef82af55fda2b73579eb1`, annotated tag object `fb36b67b1cd79b50e9d5dcf8a542196801b0c642`, workflow run `32932703563`, publish job `98067873113`, npm version and `dev` dist-tag 2.4.2-dev.166, shasum `a284c1b4c961733f167a4195f46d4cc35378ec11`, and integrity `sha512-z1lPb3Q/DhXffFXxxih69b7fqUJlrnC8jZ1LotwGqflCA+tL1iO/gjH92Pky0YxIaxSbHGkNX4Cby6PZymeb/g==`.
- Verified a peer-inclusive fresh install with schemas 2.4.2-dev.166, `@holiday-jp/holiday_jp` 2.5.1, and `@shisyamo4131/air-firebase-v2` 2.3.1-dev.6, followed by the public `./constants` import and immutability checks. AirGuardV2 adoption is not implied and remains consumer-owned.

## 2.4.2-dev.165 - 2026-08-26

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
