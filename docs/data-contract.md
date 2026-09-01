# Public Data Contract Inventory

- Status: Partially confirmed
- Last verified: 2026-09-01
- Authority: Inventory of the existing public package surface and verified published additions; unresolved compatibility items remain open in the specification.
- Related roadmap: [Shared-package readiness](roadmaps/shared-package-readiness.md)
- Related decisions: [ADR index](decisions/README.md)

## Package Identity

- npm name: @shisyamo4131/air-guard-v2-schemas
- current published version: 2.4.2-dev.167; verified at commit `bb2390997153b2e57470d0c04012d93ddde2f971`, annotated tag object `577f358e3f7a4f7c32d216c11b9305047bbab4d7`, successful workflow run `33150835365`, npm registry and `dev` dist-tag, canonical shasum `b4cbc285438179f75b69bd754141b0a4492c722d`, integrity `sha512-EsMVhMXo9Rrc6AdLT98sdiN5iGniVZq6mEDN+XMgxuB1e8TYbNPPQCHRCdf+HcnvbTseruo23A+4PQnFpw/p0g==`, LF-clean exact-commit content comparison, and peer-inclusive fresh public import
- current local candidate: 3.0.0-dev.1; package and lock parity, targeted checks, Node 22/24 formal suites, and the Node 24 release guard are locally verified; the candidate is unpublished and corrected-version adoption remains pending
- release relationship: 2.4.2-dev.166 changes documentation and version metadata only relative to immutable 2.4.2-dev.165; the public API, catalog data, and behavior are unchanged
- 2.4.2-dev.167 relationship: immutable published baseline that adds the accepted original CCB v1 public subpath, formal fail-closed ten-file suite, and release guard while retaining the role-preset API/data unchanged
- 3.0.0-dev.1 candidate relationship: breaking forward correction that removes the public `Company` Stripe/subscription fields, the entitlement/private-entitlement parser exports, the legacy mapper export, and the packed legacy mapper file while preserving the remaining CCB and role-preset surfaces
- module type: ECMAScript module
- root entry: index.js
- peer dependencies: @holiday-jp/holiday_jp and @shisyamo4131/air-firebase-v2

## Public Subpaths

| Subpath | Source | Current classification |
| --- | --- | --- |
| package root | index.js | Existing public contract |
| ./constants | src/constants/index.js | Existing public contract |
| ./company-configuration | src/company-configuration/index.js | Original contract published in immutable 2.4.2-dev.167; approved breaking correction prepared as unpublished 3.0.0-dev.1 candidate |
| ./utils | src/utils/index.js | Existing public contract |
| ./apis | src/apis/index.js | Existing but marked for future removal in source; compatibility decision open |

## Company Configuration Boundary v1 and 3.0.0-dev.1 Correction

The original additive `./company-configuration` subpath is published and content-verified in exact version 2.4.2-dev.167. The AirGuardV2 root and Functions consumers pin that exact package with the same tarball/integrity and use retained subpath APIs; they do not import the three removed exports. Candidate 3.0.0-dev.1 retains the root `Company` export and the dedicated subpath, but intentionally narrows both contracts by removing obsolete Stripe-derived scaffold. It is not re-exported from the package root. The candidate is local and unpublished; corrected-version adoption remains pending because current consumer code still relies indirectly on the legacy root `Company` Stripe scaffold.

Candidate public names comprise the frozen schema/enumeration constants, `COMPANY_CONFIGURATION_ERROR_CODES`, `CompanyConfigurationValidationError`, `isTimestampLike`, the strict root/profile/billing/operations/arrangement/maintenance/private-maintenance/audit and update-input parsers, and `assertCompanyMaintenancePairV1`. `parseCompanyEntitlementV1`, `parseCompanyPrivateEntitlementV1`, and `mapLegacyCompanyToConfigurationV1` are forbidden exports. Error output contains stable `code` and `path` only and never echoes an input value.

All canonical parsers reject unknown and missing fields. A structural timestamp is a plain record with safe-integer `seconds` and integer `nanoseconds` from 0 through 999,999,999; accepted adapter values are retained without a Firebase import or SDK identity test.

| Document | Exact CCB v1 fields and constraints |
| --- | --- |
| Root | `schemaVersion: 1`; `configurationState: CCB_V1_ACTIVE`; `status: ACTIVE \| SUSPENDED \| CLOSED`; `createdAt`, `createdBy`, `updatedAt`, `updatedBy`. The strict parser accepts exactly these seven fields. The activation-period projection parser also accepts documented legacy Company fields, including legacy `stripeCustomerId` and `subscription` plus persisted `docId`, `uid`, `fullAddress`, `prefecture`, `hasBankInfo`, and `isCompleteRequiredFields`, and returns only the seven reserved fields. This is discard-only compatibility; true unknown fields are rejected. |
| Common settings metadata | `schemaVersion: 1`; `revision` integer at least 1; created/updated structural timestamps and actor identifiers of 1-128 Unicode grapheme clusters. |
| Profile | Metadata plus `companyName` 1-100; `companyNameKana` 1-200 using Katakana U+30A0-30FF, U+3000, fullwidth digits, non-control space, and combining dakuten/handakuten only with a Katakana base in the same grapheme; nullable `zipcode` exactly 7 ASCII digits; nullable `prefCode` 01-47; nullable `city` max 100; `address`/`building` max 200; `tel`/`fax` max 32 using ASCII digits, `+`, `-`, `(`, `)`, `.`, and whitespace. |
| Billing | Metadata plus nullable 13-digit canonical `invoiceNumber`; `bankName`/`branchName` max 100, `accountType` `普通 \| 当座`, `accountNumber` 1-7 ASCII digits, and `accountHolder` max 200. The five bank fields are all null or all valid. |
| Operations | Metadata plus `minuteInterval: 5 \| 10 \| 15 \| 20 \| 25 \| 30`, `roundSetting: FLOOR \| ROUND \| CEIL`, `firstDayOfWeek` integer 0-6, and `attendanceSummaryMode: LABOR_STANDARD \| OPERATION_COUNT`. |
| Arrangement | Metadata plus `siteOrder` and `scheduleOrder`, each no more than 2,000 exact `{ siteId, shiftType }` entries. `siteId` is 1-128 without slash/control characters; shift is `DAY \| NIGHT`; duplicate `(siteId, shiftType)` pairs are rejected. |
| Maintenance | Public business fields are `maintenanceMode`, nullable `maintenanceReason` max 200, and nullable structural `maintenanceStartAt`; off requires both nullable fields null and on requires both. Private business fields are `maintenanceMode`, `internalReason` max 500, `scope` max 50 strings of 1-100, `maintenanceStartAt`, `maintenanceStartedBy` max 128, optional `operationId` max 128, and correlated `lastErrorCode` max 100/`lastErrorAt`. Off clears all private operation fields; on requires reason, non-empty scope, time, and actor. Public/private modes must match. |
| Audit | Exact `{ schemaVersion, settingType, fromRevision, toRevision, actorUid, createdAt, changes }`; type is `PROFILE \| BILLING \| OPERATIONS`, `toRevision` is `fromRevision + 1`, and changes are 1-9 field-sorted unique exact records. Non-null bank-field before/after values must be `***`. |
| Update Callable input | Profile, billing, and operations accept exactly `{ expectedRevision, value: <complete business payload> }` without metadata. Arrangement accepts exactly `{ expectedRevision, field: 'siteOrder' \| 'scheduleOrder', order: [...] }`. This package validates input data; it does not execute a Callable or authorize a request. |

String limits count Unicode extended grapheme clusters after outer trimming. Inputs are not Unicode-normalized, and CR, LF, line/paragraph separators, and other control characters are rejected. Candidate 3.0.0-dev.1 has no general legacy mapper. Consumers must not rely on this package to convert invoice, bank, attendance, arrangement, maintenance, entitlement, subscription, or Stripe data. Any migration or data interpretation remains consumer-owned and separately approved.

### Breaking Correction Boundary

- The root `Company` export remains, but `stripeCustomerId` and `subscription` are absent from its public field definitions, defaults, and serialized output. A legacy-shaped constructor input does not reintroduce them.
- The `./company-configuration` subpath preserves root, profile, billing, operations, arrangement, maintenance, private-maintenance, audit, update-input, validation, and enumeration surfaces.
- Entitlement/private-entitlement parser exports and `mapLegacyCompanyToConfigurationV1` are absent, and `src/company-configuration/legacy.js` is forbidden from packed content.
- Role preset marker/catalog exports remain unchanged under `./constants`.
- No Stripe resource inventory, API call, migration, remote write, or production-data operation is implemented or authorized.
- Current AirGuardV2 root and Functions consumption is exact 2.4.2-dev.167 with matching package content. Corrected adoption must update both consumers together; rollback restores both to exact 2.4.2-dev.167 and their previous code.

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

This additive API remains available in published 2.4.2-dev.167 and is preserved in candidate 3.0.0-dev.1. Exact 2.4.2-dev.167 also includes the formal fail-closed ten-file runner and successful Node 22/24 workflow suite evidence; the supported Node range remains open and Firebase Functions Node 22 remains consumer evidence. AirGuardV2 root and Functions already pin the same exact 2.4.2-dev.167 package content, while role-catalog import adoption and local catalog deletion remain unverified consumer work. Consumers must wait for exact published corrected-version/content evidence before combining those changes with the approved Company/CCB correction. A later addition or removal of a permission on an existing preset is nevertheless authorization-sensitive and requires material contract review and explicit approval.

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

In candidate 3.0.0-dev.1, the `Company` class remains a root named export but no longer publicly defines or serializes `stripeCustomerId` or `subscription`.

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

Do not remove, narrow, or reclassify other existing surfaces without a material-change proposal covering consumers, versioning, adoption order, rollback, and tests. The Stripe-derived correction above is the explicitly approved exception recorded in ADR 0007.

The current package validation baseline uses an exact fail-closed ten-file `npm test` inventory. It includes the corrected `test-error-definitions.js` assertions and runs in the Node 22/24 workflow matrix before the Node 24 publish job. Node 24 remains the formal package evidence candidate, while the complete supported Node range remains open.

## Consumer Compatibility Evidence

| Consumer | Required evidence | Current status |
| --- | --- | --- |
| AirGuardV2 Nuxt Web frontend | exact package version/content, imports, build/test evidence | Consumer coordinator confirms package/lock pin exact 2.4.2-dev.167 with the shared tarball/integrity and retained CCB API use; removed exports are unused; corrected-version adoption/build acceptance pending |
| AirGuardV2 Firebase Cloud Functions | exact package version/content, imports, build/test evidence | Consumer coordinator confirms package/lock pin exact 2.4.2-dev.167 with the shared tarball/integrity and retained CCB API use; removed exports are unused; corrected-version adoption/build acceptance pending |

Both rows currently refer to the same exact 2.4.2-dev.167 package content. Corrected-contract integration remains incomplete until both consumers adopt aligned code and the same separately approved, published corrected version/content and the consumer coordinator accepts the resulting build/test evidence.
