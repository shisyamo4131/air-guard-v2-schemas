# Documentation Map

- Status: Active
- Last verified: 2026-09-03
- Authority: Navigation only. specification.md is authoritative for confirmed requirements and roadmaps/ for verified progress.

## How to Start Work

1. Read ../AGENTS.md.
2. Read ../governance/project-rules.md.
3. Select the work type below.
4. Read the relevant roadmap and ADRs.
5. Inspect linked implementation, tests, and evidence before changing anything.

## Work Routing

| Work type | Required documents | Additional implementation or evidence |
| --- | --- | --- |
| Scope or requirement | [Specification](specification.md), [roadmap](roadmaps/shared-package-readiness.md), relevant [ADR](decisions/README.md) | Existing exports, models, constants, and consumer evidence |
| Public model, constant, validation, serialization, or calculation | [Specification](specification.md), [data contract](data-contract.md), relevant ADR | index.js, src/, explicitly approved diagnostics |
| Cross-project consumer request | [Specification](specification.md), [data contract](data-contract.md), [ADR 0002](decisions/0002-cross-project-ownership-and-versioned-integration.md), [operations](operations.md) | Current consumer checkpoint and compatibility evidence |
| Critical package, repository, environment, project, database, deploy, or data identifier | [Operations](operations.md), [coordination runbook](runbooks/project-coordination.md), [ADR 0008](decisions/0008-evidence-bound-critical-identifiers.md) | Current turn actual manifest, Git/tag target, recorded release evidence or approved registry evidence, and applicable consumer manifest or lock; record source, location or command, and value |
| Test or validation | [Specification](specification.md), [operations](operations.md), [ADR 0009](decisions/0009-impact-based-verification-selection.md), [roadmap](roadmaps/shared-package-readiness.md) | `../governance/verification-policy.json`, selected stable gate IDs, root diagnostics, and repository-local validators |
| Release, publish, adoption, or rollback | [Operations](operations.md), [ADR 0003](decisions/0003-release-and-rollback-approval-boundaries.md), [ADR 0008](decisions/0008-evidence-bound-critical-identifiers.md), [roadmap](roadmaps/shared-package-readiness.md) | package.json, package-lock.json, source or tag manifest, recorded release evidence or registry metadata, publish workflow, and consumer manifest or lock evidence |
| Governance or task lifecycle | ../AGENTS.md, ../governance/project-rules.md, [operations](operations.md), [coordination runbook](runbooks/project-coordination.md), [bootstrap evidence](evidence/governance-bootstrap.md) | governance lock, renderer, validators, [historical handoffs](handoffs/README.md), [ADR 0010](decisions/0010-common-governance-3-and-document-authority.md) |
| `容量チェック`, `タスク容量確認`, `セッション容量確認`, or `session size / handoff threshold確認` | [Coordination runbook](runbooks/project-coordination.md) | scripts/check-codex-session-size.ps1 with the actual current task ID |

## Document Authority

| Document | Authoritative content |
| --- | --- |
| [Common governance](../governance/common-governance.md) | Managed cross-project governance; do not edit directly |
| [Project rules](../governance/project-rules.md) | Project ownership, routing, safety, and approval boundaries |
| [Verification policy](../governance/verification-policy.json) | Machine-readable impact classes, stages, gate IDs, inclusion, invalidation, fallback, and omission destinations |
| [Specification](specification.md) | Current confirmed requirements and separate open decisions |
| [Data contract](data-contract.md) | Current public export and compatibility inventory |
| [Roadmaps](roadmaps/README.md) | Remaining work, completion criteria, and evidence-backed progress |
| [Decisions](decisions/README.md) | Material decision status and rationale |
| [Operations](operations.md) | Implemented, planned, and unavailable operating procedures |
| [Coordination runbook](runbooks/project-coordination.md) | Exact task/session capacity routing, report fields, thresholds, and stop conditions |
| [Handoffs](handoffs/README.md) | Historical evidence only; never current routing |
| [Bootstrap evidence](evidence/governance-bootstrap.md) | Historical bootstrap/migrations and current migration evidence; not current task routing |
| [2.4.2-dev.167 release evidence](evidence/release-2.4.2-dev.167.md) | Exact commit/tag, workflow, registry content, and fresh-install verification |
| [3.0.0-dev.1 release evidence](evidence/release-3.0.0-dev.1.md) | Breaking correction commit/tag, workflow, registry content, and fresh-install verification |
| [Document migration contract](../references/document-migration-contract.md) | Versioned contract for content-free mapping and topology validation |
| [Task replacement contract](../references/task-turnover-contract.md) | Managed user-requested replacement and ordinary startup |
| [Governance 3 document plan](evidence/governance-3.0.0-document-plan.json) | Original-source hashes, mapped core units, authority and rollback |
| [Governance 3 rule inventory](evidence/governance-3.0.0-rule-inventory.json) | Supplemental original-source units and semantic dispositions; not a second specification |
| [Changelog](../CHANGELOG.md) | Concise visible changes |

## Documentation Completion Criteria

- Every important document is linked from this map or its roadmap or ADR index.
- Roadmap weights total 100 and earned credit is backed by linked evidence.
- ADR index status matches each ADR.
- Confirmed, proposed, evidence, and historical material are distinguishable.
- Relative links, index coverage, TOML, roadmap arithmetic, ADR status, and migration evidence pass scripts/check-project-docs.ps1.
- Managed hashes and generated AGENTS.md pass scripts/check-governance.ps1.
- Verification is selected by impact class and stage from `governance/verification-policy.json`; mixed changes use a union and unknown impact uses the comprehensive suite.
- Every selected command is executed independently or through a verified aggregate runner that preserves named results and exits nonzero when any included check fails.
- Diagnostic batches and status-masking command chains are not completion evidence.
- Critical identifiers are confirmed only from a current-turn task-routed source or actual target; prompts and agent reports are leads, identifier conflicts stop state change without an application/package diff, and unapproved remote freshness remains explicitly unverified.

<!-- BEGIN MANAGED DOCUMENT MIGRATION INDEX -->

<!-- END MANAGED DOCUMENT MIGRATION INDEX -->
