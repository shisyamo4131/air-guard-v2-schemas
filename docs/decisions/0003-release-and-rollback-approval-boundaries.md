# 0003 Release, Publish, and Rollback Approval Boundaries

- Date: 2026-08-26
- Status: Accepted
- Related specification: Functional Requirements; Security and Sensitive Information
- Supersedes: None

## Context

The repository contains an automated development-package publish workflow, but preparing and validating a package is different from changing Git remotes, npm, consumer repositories, or production state.

## Decision

The Schemas project owns version, validation, release, publish, adoption, and rollback proposals. Local branch, stage, and commit actions require the applicable approved scope.

Tag creation, push, main merge, history rewrite, npm publish, deployment, remote-service operations, and real-data operations each require separate explicit user approval.

Every release proposal identifies contract changes, compatibility, version, package evidence, affected consumers, publish and adoption order, rollback trigger, and previous verified dependency version. Consumer changes are performed and accepted in their own repositories.

## Rationale

Separating local evidence from external effects makes release decisions reviewable and prevents documentation or a tag pattern from becoming implicit publish authorization.

## Alternatives

- Treat an approved version change as approval to publish: rejected because it combines local and external effects.
- Let each consumer publish the package: rejected because package release ownership belongs to Schemas.

## Impact

- Users: Release and adoption state is explicit.
- Data: No real-data rollback is implied by package rollback.
- Implementation: Version work must include compatibility and rollback analysis.
- Tests: Package and consumer evidence are reported separately.
- Operations: Remote actions stop at individual approval boundaries.

## Migration

Document the existing development-tag workflow and require future release proposals to name every external action.

## Reconsider When

The user approves a different automated release policy with equivalent audit, rollback, and consumer protections.
