# 0008 Evidence-bound Critical Identifiers

- Date: 2026-09-01
- Status: Accepted
- Implementation status: Implemented through the approved common-governance 1.4.1 migration; affected task turnover required after the migration commit
- Related specification: Evidence-bound coordination requirements
- Related decisions: [0002](0002-cross-project-ownership-and-versioned-integration.md), [0003](0003-release-and-rollback-approval-boundaries.md), [0006](0006-governance-1-4-session-capacity-and-turnover.md)

## Context

Package and release coordination depends on identifiers that can change scope, compatibility, or external effects. A package name, version, digest, repository, branch, commit, tag, environment, project, database, deploy target, or data target copied from chat or another task can be stale even when several agents repeat it. Using such a value without checking the actual target can direct a valid operation at the wrong artifact or system.

## Decision

Adopt managed common governance 1.4.1 and require every critical identifier to be obtained in the current turn from a task-routed authoritative source or the actual target. The coordinator records the exact source, location or command, and value before presenting the identifier as confirmed in a delegation or using it for state change.

Chat history, compaction summaries, memory, inference, parent or coordinator prompts, delegated-task reports, and agreement between multiple agents are leads only. A delegated task independently verifies every prompt identifier before any file write, Git mutation, validator or test, install, network call, or other state change. A missing, stale, ambiguous, or contradictory value stops the checkpoint and produces a callback without an application or package diff.

Published-artifact release or adoption verifies the applicable source or tag manifest, recorded release evidence or registry metadata, and consumer manifest or lock name, version, resolved location, and integrity. When network access is unapproved, remote freshness remains explicitly unverified and is not inferred from local records.

## Rationale

Current-turn evidence binds coordination to the intended artifact or target and makes each state-changing checkpoint independently reviewable. Requiring the delegated task to repeat the comparison prevents a prompt from becoming an unverified source of truth. Explicit remote gaps preserve least privilege without manufacturing completeness.

## Alternatives

- Trust the coordinator prompt: rejected because a prompt can be stale or copied from another target.
- Accept agreement between agents: rejected because repeated reports may share the same unverified source.
- Require network verification for every artifact: rejected because network access and remote reads remain separate approval boundaries.

## Impact

- Package API/runtime/version: no change.
- Coordination: checkpoints record source, location or command, and value for critical identifiers.
- Delegation: identifier conflicts fail closed before an application or package diff.
- Release/adoption: the source/tag, release evidence or registry, and consumer manifest/lock chain is explicit.
- Security and operations: network-disabled work leaves remote freshness unverified instead of inferring it.
- Validation: the project validator checks current governance version, routing, ADR/index, handoff source, and zero-unmapped inventory.
- Task lifecycle: common governance and generated AGENTS.md change, so all affected active project tasks require new non-forked replacements after the clean migration commit.

## Migration

Sync managed artifacts only through the installed standard skill. Align project rules, the documentation map, specification, operations, coordination runbook, bootstrap inventory, roadmap, changelog, initial prompt, validator, and current handoff in one reviewed local commit. Keep package code, tests, manifests, version, tags, release evidence, workflow, consumer repositories, and remote state unchanged.

## Rollback

Rollback requires a separately approved governance change and another affected-task turnover. Do not directly edit managed artifacts, weaken identifier verification, rewrite history, move tags, modify release evidence, or delete former tasks. Git history retains this decision and the prior governance state.

## Validation

Run the shared skill validator, managed-governance check, generated-entry check, project-document validator, and Git whitespace check independently. Confirm the owned paths, zero forbidden paths, unchanged package/release surfaces, roadmap 25 percent, zero-unmapped inventory, exact staged blobs, clean post-commit primary worktree, and no push.

## Reconsider When

- Codex exposes an authoritative typed identifier-binding mechanism with equivalent current-turn evidence and fail-closed behavior.
- The project adopts a stricter deterministic preflight for a specific artifact, environment, deploy target, or data target.
