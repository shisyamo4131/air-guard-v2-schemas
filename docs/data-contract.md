# Public Data Contract Inventory

- Status: Partially confirmed
- Last verified: 2026-08-26
- Authority: Inventory of the existing public package surface; unresolved compatibility items remain open in the specification.
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
