# 0002 Cross-project Ownership and Versioned Integration

- Date: 2026-08-26
- Status: Accepted
- Related specification: Users; Functional Requirements
- Supersedes: None

## Context

Schemas is an independent shared package project serving multiple current and future consumers. Durable ownership must survive coordinator task replacement and must not be tied to one AirGuardV2 checkpoint.

## Decision

The durable roles are Schemas primary coordinator and consumer project primary coordinator.

The Schemas coordinator owns this repository, contract evaluation, package evidence, version proposals, and callbacks. Each consumer coordinator owns consumer requirements, dependency integration, code, tests, documentation, deployment, and acceptance.

A consumer request is proposed until the Schemas side evaluates the current and proposed contract, need, all-consumer impact, compatibility, version, publish and adoption order, rollback, and tests. Material changes require explicit user approval.

The current confirmed consumers are AirGuardV2 Nuxt Web frontend and Firebase Cloud Functions. Integration requires both to verify the same package version and content.

Temporary task, thread, host, and callback identifiers remain in the current checkpoint or latest handoff, not durable specifications.

## Rationale

Repository-local ownership and versioned evidence prevent cross-project writes, hidden requirements, and consumer-specific drift.

## Alternatives

- Let consumer coordinators edit schemas directly: rejected because package ownership and review would become ambiguous.
- Store coordinator identifiers in durable specifications: rejected because tasks rotate.

## Impact

- Users: Consumer teams get an explicit contract and adoption boundary.
- Data: No consumer or production data transfers into this repository.
- Implementation: Cross-project work uses bounded checkpoints and coordinator-owned local integration.
- Tests: Package and consumer evidence remain distinct.
- Operations: Callbacks are event-driven and one-shot.

## Migration

Record durable roles in governance and operational documents; keep concrete routing identifiers only in active handoffs.

## Reconsider When

A shared monorepo or formally approved central integration process replaces separate repository ownership.
