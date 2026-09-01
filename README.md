# AirGuard V2 Schemas

AirGuard V2 Schemas is the public npm package @shisyamo4131/air-guard-v2-schemas. It provides a shared, environment-independent domain contract for client and server consumers, including models, field definitions, validation, serialization, constants, errors, and deterministic domain calculations.

## Status

The shared role preset exports are available beginning with published package version 2.4.2-dev.165. Project governance is active and the Shared-package readiness roadmap tracks contract, verification, release, and consumer-integration maturity separately from existing implementation volume.

The Company Configuration Boundary v1 contract is available through the additive `./company-configuration` subpath in verified published package version 2.4.2-dev.167. Its exact commit/tag, workflow, registry bytes/content, and fresh peer-inclusive public import are verified. The AirGuardV2 root and Functions consumers currently pin exact 2.4.2-dev.167 with the same tarball and integrity and use retained `./company-configuration` APIs. They do not import the three surfaces removed by the correction.

The approved breaking correction is locally implemented and validated as unpublished candidate `3.0.0-dev.1`. It removes the legacy Stripe fields from the public `Company` schema and removes the entitlement/private-entitlement parsers and legacy mapper from `./company-configuration`. Legacy-shaped `Company` input may still be read only to discard those fields; it does not restore or serialize them. Current AirGuardV2 code still relies indirectly on the legacy root `Company` Stripe scaffold, so corrected-version adoption remains pending and must update root and Functions together. Rollback restores both consumers to exact 2.4.2-dev.167 and their previous consumer code.

The approved shared role preset contract is exposed through the `./constants` subpath as `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`. Role-catalog import adoption and replacement of local catalogs remain consumer-owned work even though both current consumers already pin the same 2.4.2-dev.167 package content.

The confirmed consumers are the AirGuardV2 Nuxt Web frontend and AirGuardV2 Firebase Cloud Functions. Both currently share exact 2.4.2-dev.167. Corrected-contract integration completes only when both adopt and verify the same separately approved, published corrected version and content.

## Public Entry Points

- Package root: index.js
- Constants: src/constants/index.js through the ./constants export
- Company Configuration Boundary v1: src/company-configuration/index.js through the ./company-configuration export (available in verified published 2.4.2-dev.167)
- Utilities: src/utils/index.js through the ./utils export
- Legacy API helpers: src/apis/index.js through the ./apis export

The role preset exports use the existing `./constants` subpath and are not re-exported from the package root. Their contract is recorded in [ADR 0004](docs/decisions/0004-shared-role-permission-catalog.md) and [the data-contract inventory](docs/data-contract.md). They are available beginning with published package version 2.4.2-dev.165.

The current public-contract inventory and known compatibility questions are in docs/data-contract.md.

The Company Configuration Boundary exports strict pure-data parsers, structural `TimestampLike` validation, and stable code/path validation errors. Candidate `3.0.0-dev.1` preserves profile, billing, operations, arrangement, maintenance, private-maintenance, audit, and update-input parsing while forbidding the retired entitlement, private-entitlement, and legacy-mapper surfaces. It does not add Firebase SDK, AirFirebase adapter, Vue, Vuetify, CRUD, Callable, Rules, deployment, Stripe API, or data-operation behavior. See [ADR 0005](docs/decisions/0005-company-configuration-v1.md) and [ADR 0007](docs/decisions/0007-legacy-stripe-schema-scaffold-removal.md).

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

The publish workflow requires the formal package suite on Node 22 and Node 24 before its Node 24 publish job. Node 24 remains the formal package evidence candidate; the supported Node range is not yet confirmed.

`npm test` runs the exact maintained root `test*.js` inventory and fails closed if a test is added, omitted, or exits nonzero. The formerly obsolete `test-error-definitions.js` diagnostic now asserts the maintained `invalidReasons`, `isInvalid`, and `validate()` contract.

The role preset contract retains its targeted `node:test` check through the public package self-reference. It is also included in the formal package suite. Node 22 and Node 24 workflow suite evidence exists for published 2.4.2-dev.167, but this does not establish the sole supported Node range.

The Company Configuration Boundary retains its targeted `test-company-configuration.js` public-self-reference check and is included in the formal suite. `npm run check:release` fails closed on tag/version, lockfile, required or forbidden exports, root leaks, formal tests, public self-import, required or forbidden package content, or repository archive mismatches; `prepublishOnly` and the tag-only workflow make that guard part of the publish path.

## Security

Do not place secrets, credentials, session data, production records, or unredacted confidential samples in this repository. This package may define domain fields that describe sensitive business data, but it does not own production data, runtime authorization, Firebase Rules, or remote operations.
