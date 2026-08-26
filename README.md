# AirGuard V2 Schemas

AirGuard V2 Schemas is the public npm package @shisyamo4131/air-guard-v2-schemas. It provides a shared, environment-independent domain contract for client and server consumers, including models, field definitions, validation, serialization, constants, errors, and deterministic domain calculations.

## Status

The package is an existing development release at 2.4.2-dev.164. Project governance is active and the Shared-package readiness roadmap tracks contract, verification, release, and consumer-integration maturity separately from existing implementation volume.

An additive shared role preset contract has been approved for a future development release, but it is not implemented or published. Version 2.4.2-dev.164 does not provide `ROLE_PRESETS`, `ROLE_PRESET_IDS`, or `isRolePresetId`.

The confirmed consumers are the AirGuardV2 Nuxt Web frontend and AirGuardV2 Firebase Cloud Functions. Both must adopt and verify the same package version and content before cross-project integration is complete.

## Public Entry Points

- Package root: index.js
- Constants: src/constants/index.js through the ./constants export
- Utilities: src/utils/index.js through the ./utils export
- Legacy API helpers: src/apis/index.js through the ./apis export

The approved planned role preset exports will use the existing `./constants` subpath and will not be re-exported from the package root. Their contract is recorded in [ADR 0004](docs/decisions/0004-shared-role-permission-catalog.md) and [the data-contract inventory](docs/data-contract.md); they are not currently available.

The current public-contract inventory and known compatibility questions are in docs/data-contract.md.

## Documentation

- AGENTS.md: generated common-governance entry point; do not edit directly
- governance/project-rules.md: project-specific instructions and approval boundaries
- governance/common-governance.md: managed common contract snapshot
- governance/governance.lock.toml: managed version and integrity hashes
- docs/README.md: task-oriented documentation navigation
- docs/specification.md: single current confirmed specification
- docs/data-contract.md: public package and compatibility inventory
- docs/roadmaps/: planned work and evidence-backed progress
- docs/decisions/: accepted decisions and rationale
- docs/operations.md: validation, release, recovery, and task-lifecycle procedures
- CHANGELOG.md: visible changes
- INITIAL_PROMPT.md: startup prompt for a future Schemas coordinator

Start with AGENTS.md, then use docs/README.md to choose the smallest sufficient document set.

## Development and Verification

The publish workflow uses Node 24, which is the formal validation runtime candidate. The only supported Node version range is not yet confirmed.

The root test-*.js files are diagnostics and are not a formal test runner. Run governance checks according to docs/operations.md. Do not treat the known test-error-definitions.js failure as resolved.

The approved implementation plan adds only a targeted `node:test` check for the planned role preset contract. That future check will not establish a whole-package formal test runner or the sole supported Node range.

## Security

Do not place secrets, credentials, session data, production records, or unredacted confidential samples in this repository. This package may define domain fields that describe sensitive business data, but it does not own production data, runtime authorization, Firebase Rules, or remote operations.
