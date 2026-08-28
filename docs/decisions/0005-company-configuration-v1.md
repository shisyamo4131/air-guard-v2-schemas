# 0005 Company Configuration Boundary v1 Pure-data Contract

- Date: 2026-08-28
- Status: Accepted
- Implementation status: Implemented locally; release guard, version, publication, and consumer adoption pending
- Related specification: Company Configuration Boundary v1
- Related decisions: [0001](0001-shared-domain-boundary.md), [0002](0002-cross-project-ownership-and-versioned-integration.md), [0003](0003-release-and-rollback-approval-boundaries.md)
- Supersedes: None

## Context

AirGuardV2 confirmed an exact Company Configuration Boundary v1 for company root metadata, public and private settings, audit records, and update inputs. Keeping that shape only in a consumer would duplicate validation across the Nuxt client, Functions, and Admin SDK and would tie a shared data contract to consumer adapters.

The existing root `Company` model is a published compatibility surface built on FireModel and AirFirebase. It also contains legacy fields and framework-oriented behavior that do not satisfy the new pure-contract boundary. Replacing or narrowing that export would be breaking and is not required to share CCB v1.

## Decision

Add the public subpath `@shisyamo4131/air-guard-v2-schemas/company-configuration`. Do not re-export it from the package root and do not change or remove the legacy `Company` export.

The subpath provides frozen schema/enumeration constants, strict canonical document and update-input parsers, structural `TimestampLike` validation, stable code/path errors, public/private maintenance correlation, and `mapLegacyCompanyToConfigurationV1`. It is pure JavaScript data logic with no Firebase SDK identity, AirFirebase adapter, FireModel, Vue, Vuetify, CRUD, Callable execution, Rules, deployment, remote-service, or data-operation dependency.

Canonical parsers reject unknown and missing fields and return a fresh plain object. String length uses Unicode extended grapheme clusters without normalization. Control characters are rejected. Validation errors disclose only stable `code` and `path`, not input values.

The exact CCB v1 shapes are recorded in the specification and data-contract inventory. They cover the seven reserved root fields, settings metadata, profile string and kana limits, 13-digit invoice and correlated bank data, five-minute operations intervals and exact enums, bounded unique arrangement pairs, disabled/null/empty v1 entitlement projections, correlated maintenance public/private state, masked sorted audit changes with exact consecutive revisions, and exact update inputs. Arrangement updates select exactly one of `siteOrder` or `scheduleOrder` per call.

The legacy mapper is intentionally lossy and conflict-aware. It removes an invoice `T` or `t`, maps known attendance modes, strips arrangement `key`, applies documented defaults, and does not promote Stripe/subscription data. Unknown fields, an unknown attendance mode, partial bank data, and active maintenance/private ambiguity are explicit conflicts. The mapper never guesses missing sensitive/private values.

## Rationale

An additive subpath makes the exact contract reusable while preserving the published root model. Pure structural validation allows Firebase adapters to pass timestamp-like values without importing an SDK or depending on constructor identity. Strict keys and stable non-echoing errors let client, Functions, and Admin SDK share data semantics while retaining their own authorization, storage, and orchestration responsibilities.

## Alternatives

- Replace the root `Company` class: rejected because it would break a published FireModel-based compatibility surface.
- Re-export CCB v1 from the root: rejected because a dedicated subpath keeps the new boundary explicit and additive.
- Accept Firebase `Timestamp` by class identity: rejected because it introduces runtime/SDK coupling and adapter-version identity hazards.
- Put Firestore adapters, CRUD, Callable execution, or Rules policy in Schemas: rejected because those are consumer/runtime responsibilities.
- Guess active legacy maintenance or promote Stripe subscription fields: rejected because private/maintenance semantics are incomplete and authorization-sensitive.
- Ignore unknown fields: rejected because CCB v1 is an exact schema and silent acceptance would hide drift.

## Impact

- Compatibility: The new subpath and package script are additive. Root and legacy Company exports are unchanged.
- Data: No production document, migration, transaction, deployment, or remote operation is authorized.
- Consumers: AirGuardV2 and Admin SDK adoption, adapter integration, Node 22 Functions evidence, and deployment remain consumer-owned.
- Testing: A targeted Node 24 public-self-reference test covers shape, constraints, error stability, legacy conflicts, runtime independence, and root compatibility. It is not a whole-package formal runner.
- Release: Package version remains 2.4.2-dev.166 locally, and the published artifact with that version does not contain this work. S3 must guard tag/version/package content and targeted tests before a later release.
- Progress: No predefined roadmap milestone gate is completed; readiness remains 25 percent.

## Release and Adoption

Select a new version only after separate approval. Before publication, an approved S3 release guard must fail closed when tag, package version, package contents, or targeted tests do not match. Tag creation, main/tag push, workflow-triggered npm publication, registry verification, and consumer installation are separate gates.

Consumer adoption starts only after exact version, tag/commit, workflow, registry shasum/integrity, packed-file, and fresh public-import evidence is accepted. Consumers retain authorization, Firebase adapters, Callable execution, Rules, deployment, migration, and real-data ownership.

## Migration and Rollback

The package does not mutate legacy data. Consumers may call the pure legacy mapper while planning their own migration, but an explicit conflict requires consumer-owned resolution and must not be overwritten automatically.

Rollback keeps existing published packages and tags immutable. Before adoption, consumers retain their current local schema/adapter. After adoption, a consumer may restore its previously verified exact package and implementation under its own approval. Corrections publish forward under a later version; rollback does not use npm unpublish, tag deletion or movement, history rewrite, deployment, or data action.

## Reconsider When

- A confirmed consumer finds that an exact field or constraint differs from the accepted AirGuardV2 CCB v1 source of truth.
- A supported runtime cannot provide `Intl.Segmenter` or the structural timestamp semantics.
- A future CCB version needs authorization or storage behavior that should remain a separate consumer adapter.
- A complete package compatibility policy requires a different naming or versioning convention.
