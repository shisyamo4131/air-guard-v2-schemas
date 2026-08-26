# AirGuard V2 Schemas Specification

- Last updated: 2026-08-26
- Specification version: 0.1.0
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
