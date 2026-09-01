# 0007 Legacy Stripe Schema Scaffold Removal

- Date: 2026-09-01
- Status: Accepted
- Implementation status: Implemented and locally validated as 3.0.0-dev.1 candidate; publication and consumer adoption pending
- Related specification: Company Configuration Boundary v1
- Related decisions: [0003](0003-release-and-rollback-approval-boundaries.md), [0005](0005-company-configuration-v1.md)
- Supersedes: The entitlement, private-entitlement, and legacy-mapper portions of ADR 0005; other CCB v1 decisions remain accepted

## Context

Published 2.4.2-dev.167 contains legacy Stripe-derived schema scaffold that is not backed by a synchronized Stripe resource inventory, migration plan, remote-operation contract, or consumer adoption. The root `Company` class publicly defines `stripeCustomerId` and `subscription`, while `./company-configuration` exposes disabled entitlement projections, a null-only private entitlement projection, and a broad legacy mapper. Keeping those surfaces would imply a durable package contract for Stripe state that the Schemas project neither owns nor verifies.

## Decision

Prepare a breaking forward correction as unpublished candidate `3.0.0-dev.1`.

Keep the package-root `Company` export, but remove `stripeCustomerId` and `subscription`, including the nested `employeeLimit` default, from its public field definition and serialized shape. Legacy-shaped constructor input may be read only so those known fields can be discarded; it must not restore or serialize them.

Keep `./company-configuration` and its root, profile, billing, operations, arrangement, maintenance, private-maintenance, audit, update-input, enumeration, timestamp, error, and maintenance-pair surfaces. Remove `parseCompanyEntitlementV1`, `parseCompanyPrivateEntitlementV1`, and `mapLegacyCompanyToConfigurationV1`. Remove `src/company-configuration/legacy.js` from source and packed content.

Change the release guard so the removed exports and legacy file are forbidden rather than required. Preserve fail-closed checks for the remaining required exports, root non-leak, formal tests, public self-import, package inventory, tag/version/lock parity, and repository archive exclusion.

Do not create, inspect, update, delete, or migrate Stripe resources or production data. Those operations remain unavailable without a separately confirmed owner, source of truth, migration design, rollback, tests, and explicit approval.

## Rationale

A major-version candidate makes the public narrowing explicit. Removing inert or null-only Stripe schema is safer than preserving a misleading entitlement contract. Discard-only legacy input handling prevents accidental reserialization while allowing local callers to encounter older shapes without silently reinstating them.

## Alternatives

- Keep the legacy fields and mapper until consumer adoption: rejected because no consumer has adopted 2.4.2-dev.167 and the package would continue advertising an unowned Stripe contract.
- Deprecate without removal in another 2.4 development build: rejected because the public schema and exports would remain available and the correction is incompatible.
- Implement Stripe synchronization or migration in Schemas: rejected because remote service operations, runtime orchestration, authorization, and production data are outside this repository.
- Unpublish or mutate 2.4.2-dev.167: rejected because published package versions and tags are immutable rollback evidence.

## Impact

- Users and consumers: Imports or serialized shapes that depend on the removed fields, parsers, mapper, or file must migrate before adopting 3.0.0-dev.1 or a later published correction.
- Compatibility: This is an intentional breaking public-contract change. The root `Company` class itself, the `./company-configuration` subpath, preserved parsers/constants, and shared role preset exports remain.
- Data: No production document or Stripe resource is read or changed. Legacy data conversion is not provided by this package.
- Implementation: Runtime, package metadata, release guard, tests, specification, data-contract inventory, roadmap, operations, README, changelog, and ADR index change together.
- Tests: Targeted tests must prove field omission and non-reserialization, forbidden removed exports/file, preservation of the remaining public API, unchanged role catalog reachability, and release-guard negative paths. The formal ten-file suite must pass independently on local Node 22 and Node 24 runtimes before local integration is complete.
- Release: Candidate 3.0.0-dev.1 remains unpublished. Tag, push, publication, registry verification, and consumer adoption remain separate approval gates.
- Progress: No predefined roadmap gate is completed by the local correction; Shared-package readiness remains 25 percent.

## Migration and Rollback

Before candidate adoption, consumers remain on their current verified package and implementation. A consumer that needs the removed mapper or Stripe-derived fields must not adopt the candidate until it owns and verifies an explicit replacement outside this package.

Rollback preserves exact published 2.4.2-dev.167 and its tag, registry bytes, and evidence. No npm unpublish, tag deletion or movement, history rewrite, deployment, Stripe operation, or real-data action is part of rollback. A failed correction is fixed forward in a later version; a failed consumer adoption restores that consumer's previously verified exact dependency and implementation under consumer ownership.

## Reconsider When

- A confirmed consumer provides an approved, environment-independent entitlement contract with complete data ownership, compatibility, migration, and rollback evidence.
- A separately owned Stripe adapter or resource inventory requires shared pure-data types that do not transfer remote operations into this package.
- Complete public API inventory establishes another compatible replacement surface.
