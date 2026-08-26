# Operations

## Current Availability

Implemented:

- npm package metadata and public export map
- development-tag publish workflow using Node 24, npm ci, and npm publish --tag dev
- governance renderer and validators after bootstrap
- root diagnostic scripts
- local 2.4.2-dev.165 shared role preset catalog and public `./constants` exports
- targeted `test:role-presets` check through the public package self-reference
- Node 24 direct-test, public-import, and local package dry-run evidence for the role preset catalog

Planned or not yet verified:

- tag, push, npm publication, and remote-registry confirmation for 2.4.2-dev.165
- AirGuardV2 root and Functions adoption, same-version/content confirmation, and local catalog deletion
- supported Node range
- formal package test runner
- stable release policy
- complete public compatibility evidence
- verified two-consumer adoption and rollback exercise

Unavailable in this project without separate approval:

- tag, push, main merge, npm publish, deployment, remote-service operation, real-data operation, and history rewrite

## Preparation

Use the primary repository at C:\Users\seven\projects\AirGuard\air-guard-v2-schemas. Confirm that cwd and Git top-level both resolve to this path, the intended branch is active, and unrelated changes are identified before any write.

Do not use a linked worktree, task-specific worktree, or alternate repository copy unless the user explicitly approves its reason, path, branch, owner, integration method, lifetime, and cleanup plan.

Do not add secrets or production data. Network access remains disabled unless separately approved.

## Required Governance Verification

Run every command independently and record its exit status:

1. Shared skill validation:
   & C:\Users\seven\.agents\skills\scaffold-project-governance\scripts\validate-skill.ps1 -SkillPath C:\Users\seven\.agents\skills\scaffold-project-governance
2. Managed governance validation:
   & .\scripts\check-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas
3. Generated entry-point drift:
   & .\scripts\render-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas -Check
4. Project documentation, links, indexes, TOML, roadmaps, ADRs, and evidence:
   & .\scripts\check-project-docs.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas
5. Git whitespace:
   git diff --check

The managed sync command is state-changing and is used only after approval:

& C:\Users\seven\.agents\skills\scaffold-project-governance\scripts\sync-project-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas -Apply

Do not combine required evidence through a status-masking chain. A verified aggregate runner must report all results and exit nonzero if any item fails.

## Package Diagnostics

Node 24 is the formal validation runtime candidate because CI uses it, but the supported Node range is open. The existing root scripts remain diagnostics:

- node test-class-imports.js
- node test-field-definitions.js
- node test-error-definitions.js
- node test-format-jst-date.js
- node test-refactored-date-formatting.js
- node test-employee-insurance.js
- node test-validator-debug.js

Do not use them as a formal completion gate. test-error-definitions.js has a known pre-existing exit-1 failure at line 19 because detailedInvalidReasons is undefined. Fixing it and selecting a formal runner require a separate approved checkpoint.

## Git Integration

Delegated tasks edit and validate only explicitly owned files, then report exact files, diff, tests, unverified items, approval boundaries, and worktree state. They do not stage or commit by default.

The Schemas primary coordinator reviews accepted files, stages only those files, creates the local commit, and performs integration. Reuse a reviewed delegated commit rather than duplicating it. Never use unintegrated work as a confirmed dependency.

Branch creation, stage, and local commit require the applicable approval. Tag, push, main merge, history rewrite, and publish each require a separate approval.

## Cross-project Checkpoint Loop

The durable parties are the Schemas primary coordinator and a consumer project primary coordinator. Temporary task, thread, host, and callback identifiers belong only in the current checkpoint or latest handoff.

Before issuing work:

1. Confirm the current phase, specification, roadmap, baseline, unresolved decisions, and existing behavior.
2. Confirm cwd, Git top-level, branch, HEAD, worktree, owned and forbidden files, validation, rollback, approval boundaries, ending condition, and callback destination.
3. After task creation, replacement, or application restart, verify a no-change callback.
4. Issue one reviewable checkpoint.
5. Wait for one completion, failure, specification-question, or approval-boundary callback.
6. Review the report and owned diff before integration.
7. Continue only while safe independent work remains. Stop when it is exhausted or the user instructs a stop.

A callback is sent once. If delivery fails, preserve the complete report in the task and stop for recovery; do not retry repeatedly. Report approvals, failures, conflicts, progress decreases, state or callback failures, and capacity thresholds immediately.

## Parallel Work

Parallel work requires independent scopes, a common baseline, checkpoint IDs, disjoint file ownership, bounded integration order, and explicit promotion criteria. The coordinator integrates completed work before starting another write cycle when integration is waiting.

## Shared Role Preset Contract Delivery

The shared role preset contract in [ADR 0004](decisions/0004-shared-role-permission-catalog.md) is implemented and validated in the current local branch at version 2.4.2-dev.165. It has not been tagged, pushed, published to npm, or confirmed in a remote registry, so published consumer availability is false.

The local public imports are `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId` from `@shisyamo4131/air-guard-v2-schemas/constants`. Package implementation is limited to catalog data and prototype-safe membership validation. Consumer authorization evaluators, write-to-read implication, and strict or general policy semantics remain consumer-owned.

Targeted evidence uses Node 24 as the formal package evidence candidate and includes the direct `node:test` command, the package script with the same Node runtime, a public self-reference import smoke check, and a local package dry run confirming that `src/constants/role-presets.js` is included while the root test file is excluded. This evidence does not establish a whole-package formal test runner or the sole supported Node range. The known `test-error-definitions.js` failure remains separate and unresolved, and Firebase Functions Node 22 compatibility remains consumer evidence.

Deliver and verify the contract in this order:

1. Keep the accepted contract, local implementation, targeted test, package version, and current authoritative documents aligned in one reviewed local integration.
2. Record Node 24, targeted public-import, immutability, catalog-shape, package-file, governance, and Git evidence independently. The targeted test is not a whole-package formal runner. Firebase Functions Node 22 compatibility remains consumer evidence.
3. Review and locally commit only the approved files. Produce release evidence before any remote action.
4. Obtain separate explicit approvals for tag creation, push, and the push-triggered npm publication. A local version or tag is not publication evidence.
5. Confirm the published version and content before asking consumer coordinators to adopt it.
6. Each confirmed consumer updates its dependency, code, tests, and documentation in its own repository. The AirGuardV2 root and Functions adoption proposal uses the same exact 2.4.2-dev.165 version and verifies matching resolved content and integrity; local catalog deletion occurs only in that consumer-owned adoption.

Rollback does not depend on npm unpublish, tag deletion, history rewrite, deployment, or data action. Before publication, correct or revert local work through an approved non-history-rewriting Git change. If a published candidate is not adopted, leave it published and issue a later corrected version if necessary. If consumer adoption fails, the consumer coordinator restores the previously verified exact package version and local catalog/import implementation in all affected consumers, reruns compatibility evidence, and accepts that rollback in the consumer repository.

## Release, Publish, Adoption, and Rollback

The current workflow publishes a development package when a matching v*-dev.* tag is pushed. Merely documenting or locally preparing a version does not authorize tag creation, push, or npm publish.

Before any approved release proposal, record:

- current and proposed contract
- affected exports and consumers
- compatibility and version classification
- Node and package validation evidence
- publish order
- consumer adoption order
- rollback trigger and dependency version
- remote actions requiring approval

The preferred consumer rollback is to restore a previously verified package version in each consumer repository under that consumer coordinator. npm unpublish or remote package mutation is not an automatic rollback and requires separate destructive-action approval.

## Governance Updates and Task Turnover

Managed common-governance version 1.3.0, root AGENTS.md, project-wide permissions or approval policy, coordinator responsibilities, delegation and Git integration, callback and handoff rules, and safety boundaries are instruction-chain sources.

After an approved instruction-chain change:

1. Stop new assignments at a safe checkpoint.
2. Validate and commit owned work.
3. Confirm a clean worktree or document every exception with files, purpose, verification, reason, owner, and restart procedure.
4. Ask the user to approve coordinator replacement.
5. Create a completely new task, never a fork, using the same base role plus the next sequence number.
6. Send baseline, checkpoint, progress, results, tests, unintegrated work, approvals, owned and forbidden scope, next instructions, governance version, and callback destination.
7. Verify repository restart, active instruction sources, permissions, a no-change callback, and retargeted identifiers.
8. Retire ownership from the former task only after successful verification.
9. Leave the former task in place for user-only manual deletion. Codex must not archive or delete it.

## Coordinator Session Lifecycle

Use scripts/check-codex-session-size.ps1 with the exact session ID. The handoff proposal threshold is 300 MiB. Measure at work-session start, after callback-driven material changes, and at stop or completion, no more than hourly when nothing changes.

Coordinator replacement always requires explicit user approval. Delegated-task rotation is allowed only under approved conditions at a safe checkpoint.

The retiring coordinator commits its completed owned work. A retiring delegated task reports exact files, diff, tests, unverified items, and worktree state; the coordinator reviews, commits, and integrates accepted work. Do not give the same dirty files to old and new tasks.

Do not make direct maintenance of Codex-owned SQLite or WAL files a normal operation.

## Errors and Recovery

- Missing or stale governance: restore through the approved sync workflow, not direct managed-file edits.
- Validator failure: stop completion, preserve output and exit status, correct only approved files, and rerun the failed check independently.
- Missing shared PyYAML environment: stop and obtain explicit approval before running the setup script or writing under the Codex user directory.
- Unapproved worktree: preserve it, perform no state-changing work there, and request direction.
- Callback failure: leave the complete task report and stop without repeated notification.
- Dirty handoff: commit reviewed work or document the exact exception and prevent duplicate ownership.

## Backup, Retention, and Sensitive Information

Git history is the document and specification history. ADRs retain rationale and CHANGELOG.md retains concise visible changes. Do not copy Codex sessions, databases, credentials, logs, or caches into this repository.

Never store secrets, credentials, session data, private production records, or unredacted confidential samples. Real-data backup, retention, migration, and deletion are outside this package.
