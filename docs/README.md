# Documentation Map

- Status: Active
- Last verified: 2026-09-01
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
| Test or validation | [Specification](specification.md), [operations](operations.md), [roadmap](roadmaps/shared-package-readiness.md) | Root diagnostics and repository-local validators |
| Release, publish, adoption, or rollback | [Operations](operations.md), [ADR 0003](decisions/0003-release-and-rollback-approval-boundaries.md), [roadmap](roadmaps/shared-package-readiness.md) | package.json, package-lock.json, publish workflow, consumer evidence |
| Governance or task lifecycle | ../AGENTS.md, ../governance/project-rules.md, [operations](operations.md), [coordination runbook](runbooks/project-coordination.md), [bootstrap evidence](evidence/governance-bootstrap.md) | governance lock, renderer, validators, [current handoff](handoffs/README.md) |
| `容量チェック`, `タスク容量確認`, `セッション容量確認`, or `session size / handoff threshold確認` | [Coordination runbook](runbooks/project-coordination.md) | scripts/check-codex-session-size.ps1 with the actual current task ID |

## Document Authority

| Document | Authoritative content |
| --- | --- |
| [Common governance](../governance/common-governance.md) | Managed cross-project governance; do not edit directly |
| [Project rules](../governance/project-rules.md) | Project ownership, routing, safety, and approval boundaries |
| [Specification](specification.md) | Current confirmed requirements and separate open decisions |
| [Data contract](data-contract.md) | Current public export and compatibility inventory |
| [Roadmaps](roadmaps/README.md) | Remaining work, completion criteria, and evidence-backed progress |
| [Decisions](decisions/README.md) | Material decision status and rationale |
| [Operations](operations.md) | Implemented, planned, and unavailable operating procedures |
| [Coordination runbook](runbooks/project-coordination.md) | Exact task/session capacity routing, report fields, thresholds, and stop conditions |
| [Handoffs](handoffs/README.md) | Latest temporary task routing and restart checkpoint |
| [Bootstrap evidence](evidence/governance-bootstrap.md) | Migration baseline, rule mapping, checks, and known conflicts |
| [2.4.2-dev.167 release evidence](evidence/release-2.4.2-dev.167.md) | Exact commit/tag, workflow, registry content, and fresh-install verification |
| [3.0.0-dev.1 release evidence](evidence/release-3.0.0-dev.1.md) | Breaking correction commit/tag, workflow, registry content, and fresh-install verification |
| [Changelog](../CHANGELOG.md) | Concise visible changes |

## Documentation Completion Criteria

- Every important document is linked from this map or its roadmap or ADR index.
- Roadmap weights total 100 and earned credit is backed by linked evidence.
- ADR index status matches each ADR.
- Confirmed, proposed, evidence, and historical material are distinguishable.
- Relative links, index coverage, TOML, roadmap arithmetic, ADR status, and migration evidence pass scripts/check-project-docs.ps1.
- Managed hashes and generated AGENTS.md pass scripts/check-governance.ps1.
- Every required command is executed independently or through a verified aggregate runner that exits nonzero when any required check fails.
- Diagnostic batches and status-masking command chains are not completion evidence.
