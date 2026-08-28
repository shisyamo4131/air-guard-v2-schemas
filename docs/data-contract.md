# Public Data Contract Inventory

- Status: Partially confirmed
- Last verified: 2026-08-28
- Authority: Inventory of the existing public package surface and verified published additions; unresolved compatibility items remain open in the specification.
- Related roadmap: [Shared-package readiness](roadmaps/shared-package-readiness.md)
- Related decisions: [ADR index](decisions/README.md)

## Package Identity

- npm name: @shisyamo4131/air-guard-v2-schemas
- current published version: 2.4.2-dev.166; verified on main and its annotated tag, successful publish workflow and job, npm registry and `dev` dist-tag, canonical integrity, and peer-inclusive fresh public import
- release relationship: 2.4.2-dev.166 changes documentation and version metadata only relative to immutable 2.4.2-dev.165; the public API, catalog data, and behavior are unchanged
- module type: ECMAScript module
- root entry: index.js
- peer dependencies: @holiday-jp/holiday_jp and @shisyamo4131/air-firebase-v2

## Public Subpaths

| Subpath | Source | Current classification |
| --- | --- | --- |
| package root | index.js | Existing public contract |
| ./constants | src/constants/index.js | Existing public contract |
| ./company-configuration | src/company-configuration/index.js | Accepted and implemented locally; unavailable from published 2.4.2-dev.166 |
| ./utils | src/utils/index.js | Existing public contract |
| ./apis | src/apis/index.js | Existing but marked for future removal in source; compatibility decision open |

## Local Company Configuration Boundary v1

The additive `./company-configuration` subpath is locally implemented but is not contained in published 2.4.2-dev.166. It does not alter or remove the legacy root `Company` export and is not re-exported from the package root. Release version, release guard, publication, and consumer adoption are pending.

Public names comprise the frozen schema/enumeration constants, `COMPANY_CONFIGURATION_ERROR_CODES`, `CompanyConfigurationValidationError`, `isTimestampLike`, strict `parseCompany*V1` document and update-input functions, `assertCompanyMaintenancePairV1`, and `mapLegacyCompanyToConfigurationV1`. Error output contains stable `code` and `path` only and never echoes an input value.

All canonical parsers reject unknown and missing fields. A structural timestamp is a plain record with safe-integer `seconds` and integer `nanoseconds` from 0 through 999,999,999; accepted adapter values are retained without a Firebase import or SDK identity test.

| Document | Exact CCB v1 fields and constraints |
| --- | --- |
| Root | `schemaVersion: 1`; `configurationState: CCB_V1_ACTIVE`; `status: ACTIVE \| SUSPENDED \| CLOSED`; `createdAt`, `createdBy`, `updatedAt`, `updatedBy`. The strict parser accepts exactly these seven fields; the activation-period projection parser accepts only these plus the documented legacy Company extras and returns the seven reserved fields. |
| Common settings metadata | `schemaVersion: 1`; `revision` integer at least 1; created/updated structural timestamps and actor identifiers of 1-128 Unicode grapheme clusters. |
| Profile | Metadata plus `companyName` 1-100; `companyNameKana` 1-200 using Katakana U+30A0-30FF, U+3000, fullwidth digits, non-control space, and combining dakuten/handakuten only with a Katakana base in the same grapheme; nullable `zipcode` exactly 7 ASCII digits; nullable `prefCode` 01-47; nullable `city` max 100; `address`/`building` max 200; `tel`/`fax` max 32 using ASCII digits, `+`, `-`, `(`, `)`, `.`, and whitespace. |
| Billing | Metadata plus nullable 13-digit canonical `invoiceNumber`; `bankName`/`branchName` max 100, `accountType` `普通 \| 当座`, `accountNumber` 1-7 ASCII digits, and `accountHolder` max 200. The five bank fields are all null or all valid. |
| Operations | Metadata plus `minuteInterval: 5 \| 10 \| 15 \| 20 \| 25 \| 30`, `roundSetting: FLOOR \| ROUND \| CEIL`, `firstDayOfWeek` integer 0-6, and `attendanceSummaryMode: LABOR_STANDARD \| OPERATION_COUNT`. Defaults used only by the legacy mapper are 15, ROUND, 0, and LABOR_STANDARD. |
| Arrangement | Metadata plus `siteOrder` and `scheduleOrder`, each no more than 2,000 exact `{ siteId, shiftType }` entries. `siteId` is 1-128 without slash/control characters; shift is `DAY \| NIGHT`; duplicate `(siteId, shiftType)` pairs are rejected. |
| Entitlement/private entitlement | Public v1 is exactly `entitlementState: DISABLED`, `planCode: null`, `featureCodes: []`, `employeeLimit: null`. Private v1 is exactly nullable `stripeCustomerId`, `stripeSubscriptionId`, `stripeSubscriptionStatus`, and `currentPeriodEnd`, all null. Legacy entitlement/Stripe data is not promoted. |
| Maintenance | Public business fields are `maintenanceMode`, nullable `maintenanceReason` max 200, and nullable structural `maintenanceStartAt`; off requires both nullable fields null and on requires both. Private business fields are `maintenanceMode`, `internalReason` max 500, `scope` max 50 strings of 1-100, `maintenanceStartAt`, `maintenanceStartedBy` max 128, optional `operationId` max 128, and correlated `lastErrorCode` max 100/`lastErrorAt`. Off clears all private operation fields; on requires reason, non-empty scope, time, and actor. Public/private modes must match. |
| Audit | Exact `{ schemaVersion, settingType, fromRevision, toRevision, actorUid, createdAt, changes }`; type is `PROFILE \| BILLING \| OPERATIONS`, `toRevision` is `fromRevision + 1`, and changes are 1-9 field-sorted unique exact records. Non-null bank-field before/after values must be `***`. |
| Update Callable input | Profile, billing, and operations accept exactly `{ expectedRevision, value: <complete business payload> }` without metadata. Arrangement accepts exactly `{ expectedRevision, field: 'siteOrder' \| 'scheduleOrder', order: [...] }`. This package validates input data; it does not execute a Callable or authorize a request. |

String limits count Unicode extended grapheme clusters after outer trimming. Inputs are not Unicode-normalized, and CR, LF, line/paragraph separators, and other control characters are rejected. The legacy mapper accepts only its documented field inventory, produces an `ACTIVE` canonical root plus all settings/private documents, removes invoice `T`/`t`, maps legacy attendance modes, strips arrangement `key`, and returns `{ ok: false, conflict: { code: "CONFLICT", path } }` for unknown or ambiguous state rather than guessing or echoing data.

## Published `./constants` Additions

- Status: Accepted contract implemented and available in verified published package version 2.4.2-dev.166; AirGuardV2 adoption remains pending and consumer-owned.
- Publication evidence: commit `1a6024ceedd03684020ef82af55fda2b73579eb1`, annotated tag object `fb36b67b1cd79b50e9d5dcf8a542196801b0c642`, workflow run `32932703563`, publish job `98067873113`, shasum `a284c1b4c961733f167a4195f46d4cc35378ec11`, and integrity `sha512-z1lPb3Q/DhXffFXxxih69b7fqUJlrnC8jZ1LotwGqflCA+tL1iO/gjH92Pky0YxIaxSbHGkNX4Cby6PZymeb/g==`.
- Related decision: [ADR 0004](decisions/0004-shared-role-permission-catalog.md)

The existing `./constants` subpath exports `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId`. They are implemented in `src/constants/role-presets.js` as internal `VALUES`, `IDS`, and the membership helper, then mapped by `src/constants/index.js`. They are not re-exported from the package root.

`ROLE_PRESET_IDS` is a deeply frozen ordered array containing `manager`, `controller`, `accountant`, `human-resource`, `labor`, and `legal` in that order.

`ROLE_PRESETS` is a deeply frozen null-prototype readonly record. Its own keys are the canonical identifiers. Each value has exactly `label`, `description`, `icon`, and `permissions`; there is no redundant identifier field. Every entry and permission array is frozen, and every permission is a unique, trimmed, non-empty string within its preset.

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

This is an additive published public API available in 2.4.2-dev.166. Registry integrity and a peer-inclusive fresh install using schemas 2.4.2-dev.166, `@holiday-jp/holiday_jp` 2.5.1, and `@shisyamo4131/air-firebase-v2` 2.3.1-dev.6 are verified, including the public `./constants` import, exact shape, deep freezing, and prototype-safe membership behavior. Node 24 package evidence exists, but a whole-package formal runner and the supported Node range remain open; Firebase Functions Node 22 remains consumer evidence. The known legacy diagnostic failure remains separate and unresolved. AirGuardV2 root and Functions adoption, exact same-version/content verification, and local catalog deletion have not been performed; the recommended exact consumer target is 2.4.2-dev.166. A later addition or removal of a permission on an existing preset is nevertheless authorization-sensitive and requires material contract review and explicit approval.

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
