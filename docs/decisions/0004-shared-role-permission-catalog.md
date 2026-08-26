# 0004 Shared Role Preset and Permission Catalog

- Date: 2026-08-26
- Status: Accepted
- Implementation status: Implemented and validated locally at 2.4.2-dev.165; tag, push, npm publication, remote-registry confirmation, and consumer adoption pending
- Related specification: Shared Role Preset Contract
- Related decisions: [0001](0001-shared-domain-boundary.md), [0002](0002-cross-project-ownership-and-versioned-integration.md), [0003](0003-release-and-rollback-approval-boundaries.md)
- Supersedes: None

## Context

The confirmed AirGuardV2 Nuxt Web and Firebase Cloud Functions consumers currently duplicate the same role preset and permission catalog. The two inspected source files were byte-identical, but separate copies can drift and do not provide a package-versioned contract for future consumers.

Schemas already owns environment-independent role, permission, constant, and display catalogs. It does not own runtime authorization decisions, consumer application behavior, Firebase orchestration, or tenant and request evaluation.

## Decision

Add the accepted shared role preset contract to the existing public `@shisyamo4131/air-guard-v2-schemas/constants` subpath. The contract is implemented in the current local branch at 2.4.2-dev.165 but is not tagged, pushed, published, remote-registry confirmed, or consumer-adopted.

The internal module is `src/constants/role-presets.js`. It exposes internal `VALUES` and `IDS`, which `src/constants/index.js` maps to `ROLE_PRESETS` and `ROLE_PRESET_IDS`. It also exports `isRolePresetId`. The package root does not re-export these names.

`ROLE_PRESET_IDS` is the deeply frozen ordered array `manager`, `controller`, `accountant`, `human-resource`, `labor`, and `legal`.

`ROLE_PRESETS` is a deeply frozen null-prototype readonly record keyed by canonical role identifier. Each entry contains exactly `{ label: string, description: string, icon: string, permissions: readonly string[] }`, with no redundant identifier field. The catalog, every entry, every permission array, and the identifier array are frozen. Permission strings are trimmed, non-empty, and unique within each preset.

| Role identifier | Label | Description | Icon | Permissions in order |
| --- | --- | --- | --- | --- |
| `manager` | 統括 | 統括管理 | `mdi-hammer-wrench` | `customers:write`, `sites:write`, `employees:write`, `users:provision`, `users:write`, `outsourcers:write`, `site-operation-schedules:write`, `operation-results:write`, `billings:write` |
| `controller` | 管制 | 現場・スケジュール管理 | `mdi-hammer-wrench` | `customers:read`, `sites:write`, `employees:read`, `outsourcers:read`, `site-operation-schedules:write`, `operation-results:write` |
| `accountant` | 経理 | 請求・集計管理 | `mdi-calculator` | `customers:read`, `sites:read`, `employees:read`, `outsourcers:read`, `operation-results:read`, `operation-billings:write`, `billings:write` |
| `human-resource` | 人事 | 人事管理 | `mdi-account-tie` | `customers:read`, `sites:read`, `employees:write`, `employees:terminate`, `users:provision`, `operation-results:read` |
| `labor` | 労務 | 労務管理 | `mdi-clipboard-account` | `customers:read`, `sites:read`, `employees:read`, `operation-results:read` |
| `legal` | 法務 | 契約管理 | `mdi-gavel` | `customers:write`, `sites:write`, `employees:read` |

The label, description, and opaque `mdi-*` icon token are environment-independent display metadata. They do not add a Vue or Vuetify runtime dependency or transfer UI behavior to the package.

`isRolePresetId` checks only prototype-safe own membership in the catalog. The package does not export `hasPresetPermission`, `resolveRolePermissions`, an actor/target/tenant/request evaluator, or an allow/deny engine. Consumers retain write-to-read implication and their strict or general authorization semantics. Strict consumer paths fail closed for ordinary unknown roles and prototype-key values. The existing AirGuardV2 general permission expansion that treats unknown strings as direct permissions remains a separate consumer behavior.

Adding or removing a permission on an existing preset is an authorization-sensitive material contract change and requires all-consumer impact review and explicit user approval.

## Rationale

A single immutable package catalog prevents client/server drift while preserving repository ownership and runtime authorization boundaries. Reusing the established `./constants` subpath is additive and avoids a new public subpath. Including the approved display metadata allows the current client copies to be removed completely rather than retaining a separate UI mapping.

## Alternatives

- Share only role identifiers and permission arrays: rejected because the client would retain duplicated label, description, and icon metadata.
- Export authorization evaluators from Schemas: rejected because actor, target, tenant, request, write-to-read, and strict/general semantics are consumer policy.
- Re-export the catalog from the package root: rejected because the existing `./constants` boundary is sufficient and narrower.
- Keep duplicate consumer files with parity tests: rejected because parity tests detect drift after duplication instead of establishing one versioned source of truth.
- Depend on npm unpublish for rollback: rejected because rollback must remain available without destructive remote mutation.

## Impact

- Users: Client and server consumers can use the same catalog version and content after separate publication and adoption.
- Data: No production data, migration, role assignment, claim, or authorization state changes are authorized by this decision.
- Implementation: The current branch adds the constants module, index exports, targeted test, and local 2.4.2-dev.165 version files. Consumer coordinators separately update dependency and application files only after publication confirmation.
- Compatibility: Adding named exports to the existing `./constants` subpath is structurally additive. Consumer import migration requires the published package version and must not precede publication confirmation.
- Tests: A targeted `node:test` check verifies the public self-reference, exact catalog, immutable shape, mutation rejection, unknown and prototype-key handling, and runtime independence. Node 24 direct-test, import, and local package dry-run evidence exists. It is not a whole-package formal runner, and the known legacy diagnostic failure remains separate and unresolved.
- Runtime: Node 24 is the formal package evidence candidate, not the sole supported runtime. Firebase Functions Node 22 compatibility is consumer evidence.
- Progress: Acceptance of this contract does not complete a predefined roadmap milestone; official readiness remains 25 percent.
- Operations: Tag, push, npm publication, consumer adoption, main merge, deployment, remote operations, and data operations remain separate approval boundaries.

## Version, Publication, and Adoption

The local development version is 2.4.2-dev.165. No tag, push, npm publication, or remote-registry confirmation has been performed, and published consumer availability is false.

The approved order is aligned contract documentation and bounded package implementation/test/version work in a local commit, release evidence, separate tag and push approvals, npm publication confirmation, and then consumer-owned adoption. Confirmed consumers must use and verify the same exact version and content. AirGuardV2 root and Functions adoption, exact version pins, same-content confirmation, and local catalog deletion have not been performed.

## Migration and Rollback

After publication confirmation, each consumer coordinator updates dependencies and locks before replacing local catalog imports and deleting duplicate files. Package and consumer tests must preserve exact records, strict unknown-role behavior, existing consumer authorization semantics, and same-version/content evidence.

Rollback does not depend on npm unpublish, tag deletion, history rewrite, deployment, or data action. Before publication, correct local package work through an approved non-history-rewriting change. After publication, an unadopted candidate may remain published and be superseded by a corrected version. If adoption fails, consumer repositories restore their previously verified exact package version and local catalog/import implementation, rerun compatibility evidence, and accept the rollback locally.

## Reconsider When

- A confirmed consumer cannot use the `./constants` subpath or the immutable record shape.
- Display metadata requires a runtime-specific dependency instead of an opaque token.
- The project approves a central authorization-policy package with equivalent consumer, compatibility, and rollback boundaries.
- Stable release policy replaces the current development-version sequence.
