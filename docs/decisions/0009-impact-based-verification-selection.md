# 0009 Impact-based Verification Selection

- Date: 2026-09-01
- Status: Accepted
- Implementation status: Implemented through the approved common-governance 1.5.0 migration; task turnover remains pending user approval after coordinator integration
- Related specification: Verification and coordination requirements
- Related decisions: [0003](0003-release-and-rollback-approval-boundaries.md), [0006](0006-governance-1-4-session-capacity-and-turnover.md), [0008](0008-evidence-bound-critical-identifiers.md)

## Context

The former operating procedure listed governance commands unconditionally and did not provide a machine-readable way to distinguish fast iteration checks, targeted regressions, completion gates, and separately authorized release gates. That made omissions hard to review and encouraged either over-testing small changes or under-specifying mixed and unknown-impact work.

## Decision

Adopt managed common governance 1.5.0 and make `governance/verification-policy.json` the project-owned source for six impact classes, stable gate IDs, stage selection, inclusion, invalidation, comprehensive fallback, and omission records. `docs/operations.md` explains the policy and contains an exact generated summary maintained by the canonical sync.

Mixed changes use the union of applicable classes. Unknown or unbounded impact uses the comprehensive suite. Scaffold creation, governance migration, managed sync, common-contract changes, permission or agent-policy changes, and build/release/deploy completion also use that suite. Release-only gates never imply release authorization.

## Impact

- Package API, schema, implementation, version, release state, and consumer state do not change.
- Daily iteration may use the smallest selected gates, but selected completion gates remain mandatory.
- Failures and later edits invalidate evidence according to explicit path, dependency, artifact, runtime, and environment triggers.
- Omissions require a matrix-based reason in the callback, completion report, or authorized release evidence.
- The project validator checks policy structure and documentation drift; project-local negative tests reject malformed selections.
- The instruction chain changes, so PM（Schemas）-06 prepares a non-forked PM（Schemas）-07 turnover but does not create or replace it without user approval.

## Alternatives

- Keep one unconditional command list: rejected because it cannot represent impact, stages, invalidation, or justified omissions.
- Leave selection only in prose: rejected because stable IDs and exact generated alignment would not be mechanically reviewable.
- Automatically run release and remote gates: rejected because verification selection cannot broaden approval boundaries.

## Migration and Rollback

Sync managed artifacts only from the confirmed canonical `ScaffoldProjectGovernance` repository, update only affected governance and documentation surfaces, run the project comprehensive suite without benchmarks, and return the unstaged diff to PM（SPG）-05 for review and integration. Rollback is a separately approved governance change using Git history and another required turnover; do not directly edit managed artifacts or delete former tasks.
