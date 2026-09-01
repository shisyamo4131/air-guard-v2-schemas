# 0007 Legacy Stripe Schema Scaffold Removal

- Date: 2026-09-01
- Status: Accepted
- Implementation status: Published and content-verified as 3.0.0-dev.1; corrected-version adoption pending
- Related specification: Company Configuration Boundary v1
- Related decisions: [0003](0003-release-and-rollback-approval-boundaries.md), [0005](0005-company-configuration-v1.md)
- Supersedes: The entitlement, private-entitlement, and legacy-mapper portions of ADR 0005; other CCB v1 decisions remain accepted

## Context

Published 2.4.2-dev.167 contains legacy Stripe-derived schema scaffold that is not backed by a synchronized Stripe resource inventory, migration plan, or remote-operation contract. AirGuardV2 root and Functions currently pin exact 2.4.2-dev.167 with the same tarball/integrity and use retained `./company-configuration` APIs. They do not import the three exports removed by this correction, but current consumer code still relies indirectly on the legacy root `Company` Stripe scaffold. The root `Company` class publicly defines `stripeCustomerId` and `subscription`, while `./company-configuration` exposes disabled entitlement projections, a null-only private entitlement projection, and a broad legacy mapper. Keeping those surfaces would imply a durable package contract for Stripe state that the Schemas project neither owns nor verifies.

## Decision

Prepare and release a breaking forward correction as `3.0.0-dev.1`.

Keep the package-root `Company` export, but remove `stripeCustomerId` and `subscription`, including the nested `employeeLimit` default, from its public field definition and serialized shape. Legacy-shaped constructor input may be read only so those known fields can be discarded; it must not restore or serialize them.

Keep `./company-configuration` and its root, profile, billing, operations, arrangement, maintenance, private-maintenance, audit, update-input, enumeration, timestamp, error, and maintenance-pair surfaces. Remove `parseCompanyEntitlementV1`, `parseCompanyPrivateEntitlementV1`, and `mapLegacyCompanyToConfigurationV1`. Remove `src/company-configuration/legacy.js` from source and packed content.

Change the release guard so the removed exports and legacy file are forbidden rather than required. Preserve fail-closed checks for the remaining required exports, root non-leak, formal tests, public self-import, package inventory, tag/version/lock parity, and repository archive exclusion.

Do not create, inspect, update, delete, or migrate Stripe resources or production data. Those operations remain unavailable without a separately confirmed owner, source of truth, migration design, rollback, tests, and explicit approval.

## Rationale

A major-version candidate makes the public narrowing explicit. Removing inert or null-only Stripe schema is safer than preserving a misleading entitlement contract. Discard-only legacy input handling prevents accidental reserialization while allowing local callers to encounter older shapes without silently reinstating them.

## Alternatives

- Keep the legacy fields and mapper indefinitely because consumers already use 2.4.2-dev.167: rejected because the removed exports are unused, the root scaffold is unowned, and an explicit simultaneous consumer correction is safer than preserving a misleading contract.
- Deprecate without removal in another 2.4 development build: rejected because the public schema and exports would remain available and the correction is incompatible.
- Implement Stripe synchronization or migration in Schemas: rejected because remote service operations, runtime orchestration, authorization, and production data are outside this repository.
- Unpublish or mutate 2.4.2-dev.167: rejected because published package versions and tags are immutable rollback evidence.

## Impact

- Users and consumers: The current AirGuardV2 consumers do not import the removed parsers/mapper, but their indirect dependency on the legacy root `Company` Stripe scaffold must be removed before root and Functions adopt 3.0.0-dev.1 or a later published correction together.
- Compatibility: This is an intentional breaking public-contract change. The root `Company` class itself, the `./company-configuration` subpath, preserved parsers/constants, and shared role preset exports remain.
- Data: No production document or Stripe resource is read or changed. Legacy data conversion is not provided by this package.
- Implementation: Runtime, package metadata, release guard, tests, specification, data-contract inventory, roadmap, operations, README, changelog, and ADR index change together.
- Tests: Targeted tests must prove field omission and non-reserialization, forbidden removed exports/file, preservation of the remaining public API, unchanged role catalog reachability, and release-guard negative paths. The formal ten-file suite must pass independently on local Node 22 and Node 24 runtimes before local integration is complete.
- Release: Exact 3.0.0-dev.1 is published and content-verified from commit `c84bee2f3c934618489b691dadecbd23a534372a`, annotated tag object `b317eab74d5c635bb0765ba2c2354e93e1529d9e`, successful workflow run `33467705041`, registry digests, tagged-commit content comparison, and fresh public imports. Consumer adoption remains a separate approval gate.
- Progress: No predefined roadmap gate is completed by the local correction; Shared-package readiness remains 25 percent.

## Migration and Rollback

Before corrected-version adoption, the AirGuardV2 root and Functions consumers remain together on exact 2.4.2-dev.167 and their current verified implementation. Their adoption checkpoint must remove the indirect legacy root `Company` Stripe dependency and move both consumers to one exact separately approved, published, content-verified corrected version. A consumer that needs a removed mapper or Stripe-derived field must not adopt the correction until it owns and verifies an explicit replacement outside this package.

Rollback preserves exact published 2.4.2-dev.167 and its tag, registry bytes, and evidence. No npm unpublish, tag deletion or movement, history rewrite, deployment, Stripe operation, or real-data action is part of rollback. A failed correction is fixed forward in a later version; a failed consumer adoption restores both AirGuardV2 root and Functions to exact 2.4.2-dev.167 and their previous consumer code, then reruns and accepts consumer compatibility evidence under consumer ownership.

## Reconsider When

- A confirmed consumer provides an approved, environment-independent entitlement contract with complete data ownership, compatibility, migration, and rollback evidence.
- A separately owned Stripe adapter or resource inventory requires shared pure-data types that do not transfer remote operations into this package.
- Complete public API inventory establishes another compatible replacement surface.
