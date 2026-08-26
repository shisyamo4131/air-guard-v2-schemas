# Public Data Contract Inventory

- Status: Partially confirmed
- Last verified: 2026-08-26
- Authority: Inventory of the existing public package surface and separately labeled approved planned additions; unresolved compatibility items remain open in the specification.
- Related roadmap: [Shared-package readiness](roadmaps/shared-package-readiness.md)
- Related decisions: [ADR index](decisions/README.md)

## Package Identity

- npm name: @shisyamo4131/air-guard-v2-schemas
- existing version: 2.4.2-dev.164
- module type: ECMAScript module
- root entry: index.js
- peer dependencies: @holiday-jp/holiday_jp and @shisyamo4131/air-firebase-v2

## Public Subpaths

| Subpath | Source | Current classification |
| --- | --- | --- |
| package root | index.js | Existing public contract |
| ./constants | src/constants/index.js | Existing public contract |
| ./utils | src/utils/index.js | Existing public contract |
| ./apis | src/apis/index.js | Existing but marked for future removal in source; compatibility decision open |

## Approved Planned `./constants` Additions

- Status: Approved contract; not implemented, versioned, published, or available in 2.4.2-dev.164.
- Planned development version: 2.4.2-dev.165 candidate; local tag and remote registry availability unverified.
- Related decision: [ADR 0004](decisions/0004-shared-role-permission-catalog.md)

The existing `./constants` subpath will add the named exports `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`. They will be implemented in `src/constants/role-presets.js` as internal `VALUES`, `IDS`, and the membership helper, then mapped by `src/constants/index.js`. They will not be re-exported from the package root.

`ROLE_PRESET_IDS` will be a deeply frozen ordered array containing `manager`, `controller`, `accountant`, `human-resource`, `labor`, and `legal` in that order.

`ROLE_PRESETS` will be a deeply frozen null-prototype readonly record. Its own keys are the canonical identifiers. Each value has exactly `label`, `description`, `icon`, and `permissions`; there is no redundant identifier field. Every entry and permission array is frozen, and every permission is a unique, trimmed, non-empty string within its preset.

| Identifier | Exact entry |
| --- | --- |
| `manager` | label `統括`; description `統括管理`; icon `mdi-hammer-wrench`; permissions `customers:write`, `sites:write`, `employees:write`, `users:provision`, `users:write`, `outsourcers:write`, `site-operation-schedules:write`, `operation-results:write`, `billings:write` |
| `controller` | label `管制`; description `現場・スケジュール管理`; icon `mdi-hammer-wrench`; permissions `customers:read`, `sites:write`, `employees:read`, `outsourcers:read`, `site-operation-schedules:write`, `operation-results:write` |
| `accountant` | label `経理`; description `請求・集計管理`; icon `mdi-calculator`; permissions `customers:read`, `sites:read`, `employees:read`, `outsourcers:read`, `operation-results:read`, `operation-billings:write`, `billings:write` |
| `human-resource` | label `人事`; description `人事管理`; icon `mdi-account-tie`; permissions `customers:read`, `sites:read`, `employees:write`, `employees:terminate`, `users:provision`, `operation-results:read` |
| `labor` | label `労務`; description `労務管理`; icon `mdi-clipboard-account`; permissions `customers:read`, `sites:read`, `employees:read`, `operation-results:read` |
| `legal` | label `法務`; description `契約管理`; icon `mdi-gavel`; permissions `customers:write`, `sites:write`, `employees:read` |

The label, description, and opaque `mdi-*` icon token are environment-independent display metadata. They do not include UI behavior or a Vue or Vuetify runtime dependency.

`isRolePresetId` checks only prototype-safe own membership in the catalog. This public addition does not include consumer permission expansion, write-to-read implication, `hasPresetPermission`, `resolveRolePermissions`, or an authorization evaluator. Strict consumers must fail closed for ordinary unknown and prototype-key roles. Consumer-specific general handling of unknown strings remains outside this package contract.

This is an additive planned public API. A later addition or removal of a permission on an existing preset is nevertheless authorization-sensitive and requires material contract review and explicit approval.

## Root Named Exports

The root exports defField, VALIDATION_ERRORS, GeocodableMixin, utilities re-exported by src/utils/index.js, and the following model or value-object classes:

- Agreement
- AgreementV2
- RateSet
- DayTypeRates
- Article
- ArticleDetail
- ArrangementNotification
- Billing
- Certification
- Company
- Customer
- CustomerMinimal
- CutoffDate
- DailyAttendance
- DailyOperationByEmployee
- Employee
- FcmToken
- Insurance
- Notification
- NotificationRecipient
- Operation
- OperationBilling
- OperationDetail
- OperationResult
- OperationResultDetail
- Outsourcer
- RoundSetting
- SecurityReportIndex
- Site
- SiteEmployeeHistory
- SiteOperationSchedule
- SiteOperationScheduleDetail
- SiteOrder
- System
- User

This list is an export inventory, not a claim that every constructor, field, method, validation rule, serialization shape, or inherited method has complete compatibility evidence.

## Data-shape Conventions

- Firestore-oriented document models generally extend FireModel.
- Embedded values generally extend BaseClass.
- classProps and defField describe fields, defaults, validation, and presentation metadata.
- collectionPath values identify existing Firestore collection conventions for document models.
- Date utilities and several domain classes use JST-oriented date conversion.
- Validation errors may include code, English message, and localized messages such as Japanese text.

## Confirmed Boundary

This package owns environment-independent definitions and calculations. It does not own Firebase initialization, runtime data access, orchestration, authorization decisions, Rules, deployments, or real data.

## Known Compatibility Questions

1. FireModel inheritance can expose runtime methods even though runtime CRUD and queries are outside the intended package responsibility.
2. Field definitions include AirVuetify-oriented component names and attributes, creating a possible UI-coupling exception.
3. The ./apis subpath calls model fetch methods and is marked in source as planned for removal.
4. The supported Node range is not established.
5. The seven root scripts do not constitute a formal test runner.

Do not remove, narrow, or reclassify these existing surfaces without a material-change proposal covering consumers, versioning, adoption order, rollback, and tests.

## Consumer Compatibility Evidence

| Consumer | Required evidence | Current status |
| --- | --- | --- |
| AirGuardV2 Nuxt Web frontend | exact package version/content, imports, build/test evidence | Not yet recorded |
| AirGuardV2 Firebase Cloud Functions | exact package version/content, imports, build/test evidence | Not yet recorded |

Integration is incomplete until both rows refer to the same package version and content and the consumer coordinators accept their repository evidence.
