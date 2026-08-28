# AirGuard V2 Schemas Project Rules

- Status: Active
- Owner: Schemas project
- Common governance: governance/common-governance.md
- Managed common-governance version: 1.3.0
- Rule: This file may add stricter project-specific requirements but must not weaken the common governance contract.

## Project and Current Scope

This repository owns the public npm package @shisyamo4131/air-guard-v2-schemas. It provides an environment-independent shared domain contract for AirGuard consumers.

The current phase is Shared-package readiness. Confirmed work includes Firestore-oriented domain models and field definitions, validation, serialization, common metadata, constants, enums, options, error definitions, pure deterministic domain calculations, public exports, compatibility, package versioning, package tests, and release, publish, and rollback procedures.

Confirmed exclusions are UI implementation, Firebase SDK initialization and adapters, runtime CRUD, queries and transactions, Callable and trigger orchestration, authentication and session operations, runtime authorization decisions, Firebase Rules, consumer or infrastructure deployment, remote service operation, production data changes, migrations, secrets, credentials, and session-data management.

Role and permission catalogs and environment-independent display metadata may be shared by this package. An authorization engine that decides allow or deny from actor, target, tenant, or request context is excluded.

## Required Reading and Sources of Truth

Before changing state, read:

1. AGENTS.md
2. this file
3. docs/README.md
4. the smallest task-routed set identified there

docs/specification.md is the single current confirmed specification. docs/data-contract.md inventories the public package contract. docs/roadmaps/ contains evidence-backed progress. docs/decisions/ records rationale. docs/operations.md owns repeatable operating and recovery procedures. CHANGELOG.md records concise visible changes.

Do not promote a consumer request, discussion, assumption, or existing implementation detail into confirmed specification without explicit user approval.

## Product and Cross-project Boundaries

The durable roles are Schemas primary coordinator and consumer project primary coordinator. AirGuardV2 is one currently confirmed consumer, not the only possible consumer.

The Schemas primary coordinator owns this repository, its specification, ADRs, roadmap, operations, changelog, package API, models, constants, validation, serialization, pure calculations, package tests, compatibility evidence, version proposals, local Git integration, and release or rollback proposals.

A consumer project primary coordinator owns consumer requirements, acceptance criteria, dependency integration, consumer code and tests, consumer documentation, and final consumer integration acceptance. Neither coordinator edits the other project repository.

Confirmed current consumers are:

- AirGuardV2 Nuxt Web frontend
- AirGuardV2 Firebase Cloud Functions

Integration is complete only when both confirmed consumers use and verify the same public package version and content. Any future consumer requires separate confirmation of runtime, public subpaths, API, version, compatibility, consumer verification, publish and adoption order, and rollback.

Durable documents must not fix a numbered PM name, task ID, thread ID, host ID, or callback destination. Put those identifiers only in the current checkpoint or latest handoff.

## Project-specific Roles and Routing

The user-facing primary task is the Schemas primary coordinator. Do not create a coordinator subagent.

- developer: workspace-write, only for explicitly approved bounded package-code work
- tester: workspace-write, may edit tests only when explicitly delegated
- code explorer: read-only
- documentation researcher: read-only
- reviewer: read-only
- release operator: read-only

Security and UI specialists are not part of the initial roster. Add them only after a concrete risk justifies them.

A cross-project request is routed through current-contract inspection, duplicate and existing-behavior checks, all-consumer impact, compatibility, version, publish and integration order, rollback, and test analysis. A material change then requires explicit user approval before implementation.

## Approval and Safety Boundaries

Package-code and test writes require an explicitly approved file and behavior scope. Tag creation, push, main merge, history rewrite, npm publish, deployment, remote-service operations, and real-data operations each require separate explicit user approval.

Network access and external writes are disabled unless separately approved. Never store secrets, credentials, session data, production records, or unredacted confidential samples in this repository.

All tasks use the primary repository at C:\Users\seven\projects\AirGuard\air-guard-v2-schemas. A linked worktree, task-specific worktree, or alternate repository copy is prohibited without prior explicit user approval of its reason, path, branch, owner, integration method, lifetime, and cleanup plan. Preserve and report any unapproved worktree; do not mutate or delete it.

## Implementation and Verification

Keep application-code changes with the developer and test-file changes with the tester. Delegated tasks normally edit and validate only their owned scope, then report exact files, diff, tests, unverified items, approval boundaries, and worktree state without staging or committing.

The coordinator reviews accepted work, stages only reviewed owned files, creates local commits, and performs integration. Do not use unintegrated work as a confirmed dependency.

The publish workflow requires the formal package suite on Node 22 and Node 24, then uses Node 24 for the publish job after the release guard succeeds. Node 24 remains the formal validation runtime candidate; this matrix does not establish the complete supported Node range, which remains open.

`npm test` runs the exact maintained ten-file root `test*.js` inventory and fails closed if a test is added, omitted, or exits nonzero. `test-error-definitions.js` uses maintained `node:test` assertions for `invalidReasons`, `isInvalid`, and `validate()`; the former obsolete diagnostic failure is resolved. Targeted tests and ad hoc diagnostics remain supporting evidence and do not replace the formal aggregate or other required completion gates.

Every mandatory command must have an independently observable result and exit status. Grouped checks are allowed only through a verified fail-fast or aggregate runner that exits nonzero when any required check fails. Status-masking chains and diagnostic batches are not completion evidence.

## Progress and Reporting

docs/roadmaps/shared-package-readiness.md uses weighted milestones totaling 100. Credit requires linked repository, validation, review, release, or consumer evidence. Partial credit is allowed only for predefined sub-gates and must state remaining acceptance criteria.

Issue one reviewable checkpoint at a time. Continue after callback and coordinator review only while safe independent work remains. A work session ends when safe independent work is exhausted or the user instructs a stop.

Report approval boundaries, failures, conflicts, progress decreases, callback or state failures, and capacity thresholds immediately. Otherwise consolidate routine task traffic at completion or stop.

## Task Lifecycle

Use event-driven one-shot task callbacks. Each checkpoint carries its temporary task, thread, host, baseline, owned and forbidden scope, validation, completion contract, ending condition, and callback destination. After task creation, replacement, or application restart, verify the route with a no-change callback before real work.

The coordinator handoff proposal threshold is 300 MiB per session. Coordinator replacement always requires explicit user approval. Delegated-task rotation is allowed only at a safe checkpoint under previously approved conditions.

Replace tasks with completely new tasks, never forks. Use the same durable base role plus the next sequence number. Verify governance version, repository restart, permissions, callback routing, and assignment identifiers before retiring old ownership. Leave former tasks in place for user-only manual deletion; Codex must not archive or delete them.

An instruction-chain change requires the turnover process in docs/operations.md. Do not begin a new implementation checkpoint after committing such a change.
