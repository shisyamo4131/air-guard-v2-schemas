# AirGuard V2 Schemas Specification

- Last updated: 2026-08-28
- Specification version: 0.4.0
- Status: Active
- Current phase: Shared-package readiness

## Purpose

Provide a public, environment-independent npm shared domain contract that AirGuard client and server consumers can use at the same version and content.

## Users

- Developers and maintainers of AirGuard consumer applications and services
- The Schemas primary coordinator responsible for the package contract and evidence
- Consumer project primary coordinators responsible for integration in their repositories

The confirmed current consumers are the AirGuardV2 Nuxt Web frontend and AirGuardV2 Firebase Cloud Functions.

## Scope

### In Scope

- Firestore-oriented domain models and field definitions
- Model validation, serialization, and common metadata processing
- Constants, enums, options, error definitions, and environment-independent catalogs
- Pure deterministic domain calculations without UI or Firebase connection dependencies
- Public exports, subpaths, compatibility, and version proposals
- Package-owned tests, validation, release, publish, and rollback procedures
- Compatibility evidence for confirmed consumers

### Out of Scope

- Vue or Nuxt UI
- Firebase SDK initialization, connection, and adapter implementation
- Runtime CRUD, query, transaction, Callable, trigger, and server orchestration
- Sign-in, sessions, tokens, custom claims, and runtime authorization decisions
- Firebase Rules authorization and tenant isolation
- Consumer application, Functions, and infrastructure deployment
- Development, production, or other remote-service operations
- Real-data creation, updates, deletion, or migration
- Secrets, credentials, and session-data management

Shared role, permission, and display catalogs are in scope. An authorization engine that decides allow or deny from runtime context is excluded.

## Environment and Ownership Boundaries

The package uses ECMAScript modules and currently publishes public exports from index.js plus ./constants, ./apis, and ./utils subpaths. Its peer dependencies are @holiday-jp/holiday_jp and @shisyamo4131/air-firebase-v2.

The publish workflow uses Node 24, making Node 24 the formal validation runtime candidate. This does not establish Node 24 as the only supported runtime. The supported Node range is open.

The Schemas primary coordinator owns this repository and package evidence. Each consumer project primary coordinator owns its dependency, code, test, documentation, deployment, and acceptance changes. Coordinators may inspect another repository read-only when approved but do not modify it.

## Shared Role Preset Contract

- Status: Accepted, implemented, and published in verified package version 2.4.2-dev.166 on 2026-08-26; consumer adoption remains pending.
- Current availability: The exports in this section are available from confirmed published package version 2.4.2-dev.166. This version changes documentation and version metadata only relative to 2.4.2-dev.165 and does not change the shared catalog API, data, or behavior.
- Related decision: [ADR 0004](decisions/0004-shared-role-permission-catalog.md)

The public location is `@shisyamo4131/air-guard-v2-schemas/constants`. The named exports are `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`. The implementation module is `src/constants/role-presets.js`, with internal `VALUES` and `IDS` exports mapped by `src/constants/index.js` to the public names. The package root does not re-export them.

`ROLE_PRESET_IDS` is the deeply frozen ordered array:

```text
["manager", "controller", "accountant", "human-resource", "labor", "legal"]
```

`ROLE_PRESETS` is a deeply frozen null-prototype readonly record keyed by canonical role identifier. Every entry contains exactly `{ label: string, description: string, icon: string, permissions: readonly string[] }`, with no redundant identifier field. The catalog, each entry, every permission array, and the identifier array are frozen. Permission strings are trimmed, non-empty, and unique within each preset.

| Role identifier | Label | Description | Icon | Permissions in order |
| --- | --- | --- | --- | --- |
| `manager` | 統括 | 統括管理 | `mdi-hammer-wrench` | `customers:write`, `sites:write`, `employees:write`, `users:provision`, `users:write`, `outsourcers:write`, `site-operation-schedules:write`, `operation-results:write`, `billings:write` |
| `controller` | 管制 | 現場・スケジュール管理 | `mdi-hammer-wrench` | `customers:read`, `sites:write`, `employees:read`, `outsourcers:read`, `site-operation-schedules:write`, `operation-results:write` |
| `accountant` | 経理 | 請求・集計管理 | `mdi-calculator` | `customers:read`, `sites:read`, `employees:read`, `outsourcers:read`, `operation-results:read`, `operation-billings:write`, `billings:write` |
| `human-resource` | 人事 | 人事管理 | `mdi-account-tie` | `customers:read`, `sites:read`, `employees:write`, `employees:terminate`, `users:provision`, `operation-results:read` |
| `labor` | 労務 | 労務管理 | `mdi-clipboard-account` | `customers:read`, `sites:read`, `employees:read`, `operation-results:read` |
| `legal` | 法務 | 契約管理 | `mdi-gavel` | `customers:write`, `sites:write`, `employees:read` |

The label, description, and icon are approved environment-independent display metadata. An icon is an opaque `mdi-*` token and does not transfer Vue, Vuetify, rendering, or UI behavior into this package.

`isRolePresetId` performs only prototype-safe own-catalog membership validation. The package does not export `hasPresetPermission`, `resolveRolePermissions`, an actor/target/tenant/request evaluator, or any allow/deny authorization engine. Consumer-owned logic retains write-to-read implication and its strict or general authorization semantics. Strict consumer paths must fail closed for ordinary unknown roles and prototype-key values such as `toString`, `constructor`, and `__proto__`. The existing AirGuardV2 general permission expansion that treats unknown strings as direct permissions is a separate consumer behavior and is not changed by this contract.

Adding or removing a permission on an existing preset is an authorization-sensitive material contract change, regardless of whether the JavaScript shape remains additive. It requires all-consumer impact review and explicit user approval.

The targeted package check is `test-role-presets.js`, executed through `node --test test-role-presets.js` and exposed only as the `test:role-presets` package script. It imports through the public `./constants` self-reference and verifies exact identifiers, order, records, metadata, permissions, uniqueness, public reachability, deep freezing, failed mutation, unknown and prototype-key roles, membership validation, and absence of runtime dependencies. Node 24 targeted-test, canonical package, registry-integrity, and peer-inclusive fresh public-import evidence exists. This targeted check does not establish a whole-package formal runner. Node 24 remains the formal package evidence candidate; the sole supported range remains open, Firebase Functions compatibility under Node 22 remains separate consumer evidence, and the known legacy diagnostic failure remains unresolved.

Version 2.4.2-dev.166 is verified at commit `1a6024ceedd03684020ef82af55fda2b73579eb1` and its annotated tag, successful workflow run `32932703563` and publish job `98067873113`, matching npm registry version and `dev` dist-tag, canonical shasum `a284c1b4c961733f167a4195f46d4cc35378ec11`, integrity `sha512-z1lPb3Q/DhXffFXxxih69b7fqUJlrnC8jZ1LotwGqflCA+tL1iO/gjH92Pky0YxIaxSbHGkNX4Cby6PZymeb/g==`, and peer-inclusive fresh public import. Published consumer availability is true. AirGuardV2 root and Functions adoption, same-version and same-content confirmation, and local catalog deletion remain pending and consumer-owned; the recommended exact target is 2.4.2-dev.166. Published 2.4.2-dev.165 and 2.4.2-dev.166 are immutable, and correction or rollback does not depend on npm unpublish, tag movement, or history rewrite.

## Company Configuration Boundary v1

- Status: Accepted and implemented locally; not published or consumer-adopted
- Public location after release: `@shisyamo4131/air-guard-v2-schemas/company-configuration`
- Related decision: [ADR 0005](decisions/0005-company-configuration-v1.md)

CCB v1 is an additive pure-data contract. It leaves the legacy `Company` class and package-root exports intact and is not re-exported from the package root. It has no Firebase SDK class-identity requirement, AirFirebase adapter, FireModel, Vue, Vuetify, CRUD, Callable execution, Rules, deployment, remote-service, or data-operation dependency.

The contract provides frozen enumerations, strict parsers for the root projection, profile, billing, operations, arrangement, entitlement, maintenance, private documents, audit records, and update-Callable inputs, plus structural `TimestampLike` validation and `mapLegacyCompanyToConfigurationV1`. Canonical document parsers reject unknown and missing fields and return fresh plain objects. `CompanyConfigurationValidationError` exposes stable `code` and `path`; messages and legacy conflicts never echo input values. Public entitlement is exactly disabled/null/empty in v1; private Stripe fields are all null. Maintenance uses correlated public and private projections. Audits use exact from/to revisions with `toRevision = fromRevision + 1`. Arrangement update input changes exactly one order field.

The canonical root owns exactly `schemaVersion`, `configurationState`, `status`, `createdAt`, `createdBy`, `updatedAt`, and `updatedBy`. During activation, root projection accepts the documented legacy Company fields, including persisted `docId`, `uid`, `fullAddress`, `prefecture`, `hasBankInfo`, and `isCompleteRequiredFields`, but returns only the seven reserved fields and rejects true unknown fields. The exact root parser continues to reject every extra field. Settings and private documents use schema version 1, revision at least 1, structural timestamps, and 1-to-128-character actor identifiers. Revisions start at 1; consumer transactions own later increments.

Profile, billing, operations, arrangement, entitlement, maintenance, private, audit, and Callable-input shapes and constraints are specified in the [data-contract inventory](data-contract.md). Strings use Unicode extended-grapheme-cluster length, are not normalized, and reject control characters. Unknown fields fail closed. The operations minute interval is one of 5, 10, 15, 20, 25, or 30. Arrangement pairs are exact, unique, and bounded to 2,000 entries per list. Audit bank values are `null` or masked as `***`.

Legacy mapping removes a leading `T` or `t` from a valid invoice registration input, maps `ACTUAL_DATE` to `LABOR_STANDARD` and `OPERATION_DATE` to `OPERATION_COUNT`, applies documented defaults when absent, strips arrangement-only `key`, and does not promote Stripe or subscription fields. The historical empty-bank representation with all other bank fields empty/whitespace and only the default `accountType: 普通` maps to five null fields. `当座` alone and every other partial bank, unknown legacy fields, unknown attendance modes, and active maintenance/private ambiguity return an explicit conflict instead of being guessed.

Package version remains 2.4.2-dev.166 in this checkpoint. Published 2.4.2-dev.166 does not contain CCB v1. Release version, S3 tag/version/package-content/test guard, tag, push, npm publication, registry verification, and consumer adoption remain separately approved work. A targeted Node 24 test exists, but the supported Node range and whole-package formal runner remain open; the known legacy diagnostic failure remains separate.

## Functional Requirements

1. Public consumers can import the documented root and subpath exports.
2. Models, embedded value objects, field definitions, validation results, constants, and deterministic calculations preserve their documented data shape and behavior within the applicable compatibility policy.
3. Material contract changes are evaluated for all confirmed consumers before implementation.
4. Cross-project requests remain proposed until the user explicitly approves the material contract change.
5. Integration completion requires both confirmed consumers to verify the same package version and content.
6. A future consumer is added only after runtime, public API, version, compatibility, verification, adoption order, and rollback are confirmed.
7. Release, publish, and rollback procedures distinguish local evidence from external actions requiring separate approval.

## Non-functional Requirements

- Environment-independent package behavior must not require UI rendering or Firebase initialization.
- Pure calculations must be deterministic for the same explicit input.
- Compatibility claims require package and consumer evidence; absence of evidence is reported as unverified.
- Required validation commands expose independent results and exit statuses.
- Managed governance drift, broken documentation links, stale indexes, invalid TOML, roadmap arithmetic, ADR mismatch, or unmapped migration rules block governance completion.
- Network and external writes remain disabled unless separately approved.

## Data and State

The package defines data shapes and may construct or serialize model values. It does not own production records, tenant data, migrations, retention, runtime queries, or transactions.

Existing model classes inherit from external BaseClass or FireModel types. Inherited runtime capabilities are existing implementation behavior and must be inventoried before any compatibility or removal decision. This governance does not authorize their runtime use or removal.

Existing field definitions include component metadata associated with AirVuetify-style inputs. Whether that metadata is an accepted compatibility exception or should be separated from the environment-independent contract remains open.

## Error Handling

Validation may return booleans or structured error objects depending on the existing field or model contract. The complete error behavior is not yet formally inventoried.

The diagnostic test-error-definitions.js currently fails because detailedInvalidReasons is undefined at line 19. The failure predates governance bootstrap and is not fixed or reclassified here.

Required checks may not be masked by later command success. A grouped runner must exit nonzero when any required item fails.

## Security and Sensitive Information

Do not store secrets, credentials, session data, production records, or unredacted confidential samples in repository documents, tests, logs, or artifacts. Domain field definitions may describe sensitive business information, but runtime authorization, Rules, access enforcement, and production data remain outside this package.

## Current Phase Completion Criteria

Shared-package readiness reaches 100 percent only when:

- Governance and authoritative documents are validated and committed.
- The public API and data-contract inventory is complete and compatibility classifications are confirmed.
- A repeatable formal package validation and test baseline exists in the approved runtime matrix.
- Release, publish, consumer adoption, and rollback procedures are verified without conflating local and remote actions.
- Both confirmed consumers provide evidence for the same package version and content.

## Open Decisions

- Supported Node version range beyond the Node 24 formal validation candidate
- Formal package test runner and treatment of the seven diagnostic scripts
- Product impact and correction for the test-error-definitions.js failure
- Compatibility treatment of inherited FireModel runtime methods
- Compatibility treatment of AirVuetify-specific component metadata in field definitions
- Retirement, replacement, or compatibility status of the published ./apis helpers
- Stable release and SemVer policy beyond the existing 2.4.2-dev.N pattern

## Specification Change Rules

After explicit user approval, update this specification, affected roadmap, relevant ADRs and index, CHANGELOG.md, implementation, tests, operations, and affected consumer documentation surfaces in the same task. If the full change cannot be completed, list every unreflected surface.

This file always represents the current confirmed specification. Git history retains previous text. If roadmap scope or earned credit changes, report the previous percentage, new percentage, and evidence-backed reason.
