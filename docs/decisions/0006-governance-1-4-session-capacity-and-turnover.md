# 0006 Governance 1.4 Session Capacity Routing and Task Turnover

- Date: 2026-08-28
- Status: Accepted
- Implementation status: Implemented in the owner-approved governance 1.4.0 migration; task turnover follows the migration commit
- Related specification: Coordination and governance requirements
- Related decisions: [0002](0002-cross-project-ownership-and-versioned-integration.md), [0003](0003-release-and-rollback-approval-boundaries.md)
- Supersedes: The former optional newest-session selection and 2 GiB Codex-wide warning in the project-local capacity script

## Context

The project already used a 300 MiB coordinator handoff threshold, but its local measurement script allowed omission of the task ID and then selected the most recently modified session. Parallel tasks make that inference unsafe. The old 2 GiB Codex-wide warning also conflated a storage reference with the per-session handoff decision.

## Decision

Adopt managed common governance 1.4.0 and route `容量チェック`, `タスク容量確認`, `セッション容量確認`, and `session size / handoff threshold確認` through the documentation map to `docs/runbooks/project-coordination.md` and `scripts/check-codex-session-size.ps1`.

The measurement requires the actual current task ID from trusted task metadata and exactly one matching persisted session file. It never infers the newest session. The standard report includes task/session identity, size, the 300 MiB threshold, usage percentage, handoff state, the separate 10 GiB Codex-wide reference warning, scan completeness/errors, measurement times/source, command result, and independently observed exit status without reading or exposing session contents.

Unknown task identity, zero or multiple matches, a command failure, or incomplete Codex-wide scanning stops the affected conclusion. Only the per-session 300 MiB threshold can trigger a handoff proposal; the Codex-wide reference warning cannot.

Because managed common governance and root `AGENTS.md` change, every affected active project task is replaced at a safe clean checkpoint by a completely new non-forked task. The replacement verifies repository-based restart, active instructions, permissions, primary directory, clean sole worktree, and callback routing before ownership moves. Former tasks remain unarchived and undeleted for user-controlled deletion.

## Rationale

Exact task selection prevents a parallel task's session from driving the wrong handoff decision. Separate thresholds distinguish task lifecycle from installation-wide storage awareness. Repository-based non-forked turnover ensures every active task starts under the new instruction chain.

## Impact

- Package API/runtime: no change.
- Tests and workflow: no package-test or release-workflow change.
- Operations: capacity aliases have a single documented route and fail-closed command.
- Task lifecycle: the governance migration requires one all-active-task turnover after the local migration commit.
- Security: session contents, secrets, prompts, SQLite, and WAL data are not read, displayed, or modified.

## Rollback

Rollback would require a separately approved governance change and a new all-active-task turnover. Do not manually edit generated `AGENTS.md`, select a newest session, reduce safety checks, archive/delete former tasks, rewrite Git history, or use a separate worktree as rollback.

## Reconsider When

- Codex provides an authoritative project-local capacity API that preserves the same exact-task and no-content-exposure guarantees.
- The owner explicitly approves a different per-session threshold.
- The installed common governance changes the required lifecycle or standard report.
