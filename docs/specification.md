# AirGuard V2 Schemas Specification

- Last updated: 2026-08-26
- Specification version: 0.3.0
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

- Status: Accepted, implemented, and published beginning with 2.4.2-dev.165 on 2026-08-26; consumer adoption remains pending.
- Current availability: The exports in this section are available from confirmed published package version 2.4.2-dev.165. Local version 2.4.2-dev.166 is a documentation-only corrective candidate and does not change this contract.
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

The targeted package check is `test-role-presets.js`, executed through `node --test test-role-presets.js` and exposed only as the `test:role-presets` package script. It imports through the public `./constants` self-reference and verifies exact identifiers, order, records, metadata, permissions, uniqueness, public reachability, deep freezing, failed mutation, unknown and prototype-key roles, membership validation, and absence of runtime dependencies. Node 24 direct-test, public-import, and local package dry-run evidence exists. This targeted check does not establish a whole-package formal runner. Node 24 remains the formal package evidence candidate; the sole supported range remains open, Firebase Functions compatibility under Node 22 remains separate consumer evidence, and the known legacy diagnostic failure remains unresolved.

Version 2.4.2-dev.165 is verified on main and its annotated tag, successful workflow run 32930098774, npm registry version and `dev` dist-tag, canonical shasum `0b828c4b8c585bbc276043c8321d53f889aaabd3`, integrity `sha512-mXZQgF90t8pwGzbglwfh4X8xkZ1Hoi58NsOOlkYxR6By0vnk+KYakKxToPCN0lAkf146J9A8eS3y4vgrKW8Rhg==`, and peer-inclusive fresh public import. Local version 2.4.2-dev.166 corrects packaged README and repository release-status wording only; it is not tagged, pushed, published, or remote-registry confirmed. AirGuardV2 root and Functions adoption, same-version and same-content confirmation, and local catalog deletion remain pending and should use 2.4.2-dev.166 only after its publication is separately verified. Published 2.4.2-dev.165 remains immutable; correction and rollback do not depend on npm unpublish, tag deletion, or history rewrite.

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
