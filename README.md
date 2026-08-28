# AirGuard V2 Schemas

AirGuard V2 Schemas is the public npm package @shisyamo4131/air-guard-v2-schemas. It provides a shared, environment-independent domain contract for client and server consumers, including models, field definitions, validation, serialization, constants, errors, and deterministic domain calculations.

## Status

The shared role preset exports are available beginning with published package version 2.4.2-dev.165. Project governance is active and the Shared-package readiness roadmap tracks contract, verification, release, and consumer-integration maturity separately from existing implementation volume.

The Company Configuration Boundary v1 contract is implemented locally on the current branch through the additive `./company-configuration` subpath. It is not included in published 2.4.2-dev.166 and is not yet tagged, pushed, published, registry-confirmed, or adopted by a consumer. Its release version and release guard remain separate approval boundaries.

The approved shared role preset contract is exposed through the `./constants` subpath as `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`. Consumer dependency changes, same-version and same-content confirmation, and replacement of local catalogs remain consumer-owned work.

The confirmed consumers are the AirGuardV2 Nuxt Web frontend and AirGuardV2 Firebase Cloud Functions. Both must adopt and verify the same package version and content before cross-project integration is complete.

## Public Entry Points

- Package root: index.js
- Constants: src/constants/index.js through the ./constants export
- Company Configuration Boundary v1: src/company-configuration/index.js through the ./company-configuration export (local implementation; not available in published 2.4.2-dev.166)
- Utilities: src/utils/index.js through the ./utils export
- Legacy API helpers: src/apis/index.js through the ./apis export

The role preset exports use the existing `./constants` subpath and are not re-exported from the package root. Their contract is recorded in [ADR 0004](docs/decisions/0004-shared-role-permission-catalog.md) and [the data-contract inventory](docs/data-contract.md). They are available beginning with published package version 2.4.2-dev.165.

The current public-contract inventory and known compatibility questions are in docs/data-contract.md.

The Company Configuration Boundary exports strict pure-data parsers, structural `TimestampLike` validation, stable code/path validation errors, and an explicit-conflict legacy mapper. It does not change the legacy `Company` class or package-root exports and does not add Firebase SDK, AirFirebase adapter, Vue, Vuetify, CRUD, Callable, Rules, deployment, or data-operation behavior. See [ADR 0005](docs/decisions/0005-company-configuration-v1.md).

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

The role preset contract has a targeted `node:test` check through the public package self-reference. Node 24 direct-test, public-import, package, and fresh-install evidence exists. This check does not establish a whole-package formal test runner or the sole supported Node range, and the known `test-error-definitions.js` failure remains separate and unresolved.

The locally implemented Company Configuration Boundary has a separate targeted `test-company-configuration.js` public-self-reference check. It does not establish release readiness: the tag/version/package-content/test release guard is planned for a separately approved S3 checkpoint.

## Security

Do not place secrets, credentials, session data, production records, or unredacted confidential samples in this repository. This package may define domain fields that describe sensitive business data, but it does not own production data, runtime authorization, Firebase Rules, or remote operations.
