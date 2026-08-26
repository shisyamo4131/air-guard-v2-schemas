# Shared-package Readiness Roadmap

- Goal: Establish a verified, versioned shared package contract that both confirmed consumers can adopt at the same version and content.
- Current progress: 25%
- Last reviewed: 2026-08-26
- Approval boundary: Package code or tests, material specification changes, tag, push, main merge, npm publish, deployment, remote operations, and real-data operations require their applicable explicit approval.
- Partial credit: Allowed only for the predefined sub-gates below.

## Milestones

| Milestone | Weight | Earned | Status | Completion evidence and remaining work |
| --- | ---: | ---: | --- | --- |
| Governance and source-of-truth baseline | 25 | 25 | Complete | Sub-gates completed: managed/project governance 10; zero-unmapped inventory 5; all governance checks 5; local commit and clean worktree 5 |
| Public API and data-contract inventory | 25 | 0 | Not started | Inventory every exported model, field, method, serialization rule, constant, error, calculation, inherited surface, and compatibility class |
| Repeatable package validation and test baseline | 25 | 0 | Not started | Confirm Node support, formal runner, existing diagnostic treatment, failure correction, and repeatable package evidence |
| Release, publish, rollback, and consumer integration runbook | 15 | 0 | Not started | Verify versioning, local preparation, approval gates, publish order, adoption order, and rollback |
| Two-consumer compatibility and adoption evidence | 10 | 0 | Not started | Both confirmed consumers verify the same package version and content |
| **Total** | **100** | **25** |  |  |

## Next Work

1. Complete mandatory coordinator task turnover before issuing implementation work.
2. After turnover and a new approved checkpoint, inventory the public API and data contract.

## Deliverables and Verification Evidence

| Milestone | Design or decision | Implementation | Tests, review, release, or acceptance evidence |
| --- | --- | --- | --- |
| Governance baseline | [Specification](../specification.md), [ADRs](../decisions/README.md) | [Project rules](../../governance/project-rules.md), generated AGENTS.md | [Bootstrap evidence](../evidence/governance-bootstrap.md) |
| Public data contract | [Data contract](../data-contract.md) | index.js and src/ | Complete inventory not yet available |
| Package validation | [Operations](../operations.md) | Root diagnostics only; formal runner not implemented | Known diagnostic failure remains open |
| Release and integration | [ADR 0003](../decisions/0003-release-and-rollback-approval-boundaries.md) | Existing publish workflow | Verified end-to-end evidence not yet available |
| Consumer evidence | [ADR 0002](../decisions/0002-cross-project-ownership-and-versioned-integration.md) | Consumer-owned repositories | Not yet recorded |

## Unresolved Problems and Decisions

- Supported Node range
- Formal test runner
- Existing test-error-definitions.js failure
- FireModel inherited runtime surface
- AirVuetify-specific field metadata
- Legacy ./apis compatibility
- Stable release policy
- Missing two-consumer evidence

## Definition of Done

- The current package contract and compatibility classifications are complete.
- Formal package validation passes in the approved runtime matrix.
- Release, adoption, and rollback procedures are verified.
- Both confirmed consumers accept the same package version and content.
- Every milestone has linked evidence and earned points total 100.

## Progress History

| Date | Progress | Change | Reason and evidence |
| --- | ---: | ---: | --- |
| 2026-08-26 | 0% | Baseline | Initial approved weighted roadmap before governance bootstrap completion |
| 2026-08-26 | 25% | +25 | All four predefined governance sub-gates completed; see bootstrap evidence and the local governance commit |
