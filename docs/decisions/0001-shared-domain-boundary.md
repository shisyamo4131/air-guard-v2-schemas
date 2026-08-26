# 0001 Shared Environment-independent Domain Boundary

- Date: 2026-08-26
- Status: Accepted
- Related specification: Scope; Environment and Ownership Boundaries
- Supersedes: None

## Context

AirGuard client and server consumers need the same domain definitions without transferring UI, Firebase initialization, orchestration, authorization, infrastructure, or production-data ownership into a shared package.

## Decision

The package owns environment-independent models, field definitions, validation, serialization, metadata catalogs, constants, errors, deterministic calculations, exports, compatibility, and package lifecycle procedures.

UI, Firebase adapters and runtime operations, authentication, runtime authorization, Rules, consumer deployment, remote services, real data, and secrets are excluded. Shared role and permission catalogs are allowed, but runtime allow or deny decisions are not.

Existing FireModel inherited methods, UI-oriented field metadata, and legacy ./apis helpers remain compatibility questions. This decision does not silently remove them.

## Rationale

One domain contract reduces client and server drift while explicit runtime boundaries prevent the package from becoming an application or infrastructure layer.

## Alternatives

- Put all client and server behavior in the package: rejected because it couples environment-specific runtime behavior.
- Duplicate schemas per consumer: rejected because contract and compatibility drift would be likely.

## Impact

- Users: Consumers share definitions at an explicit version.
- Data: The package defines shapes but does not own production records.
- Implementation: New work must preserve environment independence or obtain a material-change decision.
- Tests: Pure contract behavior needs package evidence; runtime integration remains consumer-owned.
- Operations: External and real-data actions remain separately approved.

## Migration

Inventory current exports and classify existing runtime or UI-coupled surfaces before changing them.

## Reconsider When

A confirmed consumer requires an environment-specific capability that cannot be isolated behind a consumer-owned adapter.
