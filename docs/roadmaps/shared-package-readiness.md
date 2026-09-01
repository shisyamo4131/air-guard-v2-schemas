# Shared-package Readiness Roadmap

- Goal: Establish a verified, versioned shared package contract that both confirmed consumers can adopt at the same version and content.
- Current progress: 25%
- Last reviewed: 2026-09-01
- Approval boundary: Package code or tests, material specification changes, tag, push, main merge, npm publish, deployment, remote operations, and real-data operations require their applicable explicit approval.
- Partial credit: Allowed only for the predefined sub-gates below.

## Milestones

| Milestone | Weight | Earned | Status | Completion evidence and remaining work |
| --- | ---: | ---: | --- | --- |
| Governance and source-of-truth baseline | 25 | 25 | Complete | Sub-gates completed: managed/project governance 10; zero-unmapped inventory 5; all governance checks 5; local commit and clean worktree 5 |
| Public API and data-contract inventory | 25 | 0 | In progress | The ADR 0004 role preset contract is available in verified published 2.4.2-dev.166 and its API, data, and behavior are unchanged from 2.4.2-dev.165. ADR 0007 approves the breaking removal of the unowned Stripe-derived Company/CCB scaffold in local candidate 3.0.0-dev.1, but the complete public inventory remains unfinished; inventory every remaining exported model, field, method, serialization rule, constant, error, calculation, inherited surface, and compatibility class |
| Repeatable package validation and test baseline | 25 | 0 | In progress | Formal fail-closed ten-file runner, maintained error-definition assertions, successful Node 22/24 workflow matrix, and release guard are implemented and published in 2.4.2-dev.167. Candidate 3.0.0-dev.1 has independent local Node 22/24 formal-suite and corrected Node 24 release-guard evidence; supported Node range and complete compatibility baseline remain open, so no predefined full gate is complete |
| Release, publish, rollback, and consumer integration runbook | 15 | 0 | In progress | The 2.4.2-dev.167 tag/main, workflow jobs, registry bytes/content, LF-clean exact-commit comparison, peer-inclusive fresh import, and current exact same-version/content use by both consumers are verified. The whole milestone gate remains incomplete because corrected-version adoption/build acceptance and rollback exercise remain pending; no predefined partial sub-gate exists |
| Two-consumer compatibility and adoption evidence | 10 | 0 | In progress | AirGuardV2 root and Functions currently pin the same exact 2.4.2-dev.167 package content, use retained CCB APIs, and do not import the three removed exports. Shared role-catalog import adoption, corrected-version adoption/build acceptance, and rollback exercise remain pending; no predefined partial sub-gate is earned |
| **Total** | **100** | **25** |  |  |

## Next Work

1. Obtain separate release approval and published-content evidence before any consumer adopts the corrected contract.
2. Complete AirGuardV2 root and Functions adoption of the shared role catalog and the approved corrected Company/CCB surface at one exact published version/content.
3. Continue the complete public API inventory and compatibility policy across all remaining exports.

## Deliverables and Verification Evidence

| Milestone | Design or decision | Implementation | Tests, review, release, or acceptance evidence |
| --- | --- | --- | --- |
| Governance baseline | [Specification](../specification.md), [ADRs](../decisions/README.md) | [Project rules](../../governance/project-rules.md), generated AGENTS.md | [Bootstrap evidence](../evidence/governance-bootstrap.md) |
| Public data contract | [Data contract](../data-contract.md), [ADR 0004](../decisions/0004-shared-role-permission-catalog.md), [ADR 0005](../decisions/0005-company-configuration-v1.md), [ADR 0007](../decisions/0007-legacy-stripe-schema-scaffold-removal.md) | Role preset module and original CCB v1 are published in immutable 2.4.2-dev.167; breaking Stripe-scaffold correction is the local 3.0.0-dev.1 candidate | Candidate validation, complete inventory, publication, and consumer adoption evidence not yet complete |
| Package validation | [Operations](../operations.md) | Formal fail-closed ten-file runner, targeted CCB/role checks, maintained error assertions, and release guard | Node 22/24 workflow suite and Node 24 guard evidence exists for 2.4.2-dev.167; supported range and complete compatibility baseline remain open |
| Release and integration | [ADR 0003](../decisions/0003-release-and-rollback-approval-boundaries.md) | Existing publish workflow | [2.4.2-dev.167 evidence](../evidence/release-2.4.2-dev.167.md) verifies publication, registry byte/content integrity, LF-clean exact-commit match, and peer-inclusive fresh import; two-consumer adoption and rollback evidence remain incomplete |
| Consumer evidence | [ADR 0002](../decisions/0002-cross-project-ownership-and-versioned-integration.md) | Consumer-owned repositories | Consumer coordinator confirms AirGuardV2 root and Functions use the same exact 2.4.2-dev.167 package content and retained CCB APIs; the removed three exports are unused. Corrected-version adoption/build acceptance and rollback evidence remain incomplete |

## Unresolved Problems and Decisions

- Supported Node range
- FireModel inherited runtime surface
- AirVuetify-specific field metadata
- Legacy ./apis compatibility
- Stable release policy
- Missing corrected-version two-consumer build/acceptance and rollback evidence
- Publication and two-consumer adoption of the corrected Company/CCB contract remain pending; no consumer should adopt unpublished 3.0.0-dev.1
- Shared role-catalog import adoption and local catalog deletion remain pending; exact 2.4.2-dev.167 same-version/content use is confirmed

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
| 2026-08-26 | 25% | +0 | Shared role preset contract and delivery order approved and documented; no predefined implementation, validation, release, or consumer-evidence gate completed |
| 2026-08-26 | 25% | +0 | Local 2.4.2-dev.165 catalog implementation and targeted Node 24 evidence completed; no full inventory, formal package baseline, release, or consumer-evidence milestone completed |
| 2026-08-26 | 25% | +0 | Verified 2.4.2-dev.165 publication, registry integrity, and peer-inclusive fresh import, and prepared local 2.4.2-dev.166 corrective release documentation; the release milestone has no predefined partial sub-gate and consumer integration remains incomplete |
| 2026-08-26 | 25% | +0 | Verified 2.4.2-dev.166 commit/tag, workflow and publish job, registry integrity, and peer-inclusive fresh public import; the release milestone has no predefined partial gate and consumer adoption remains incomplete |
| 2026-08-28 | 25% | +0 | Accepted and locally implemented the additive CCB v1 pure-data contract and targeted test; no complete public-inventory, formal-runner, release, or consumer-adoption milestone gate completed |
| 2026-08-28 | 25% | +0 | Implemented the formal ten-file Node 22/24 suite, corrected the obsolete error diagnostic, selected unused local candidate 2.4.2-dev.167, and added the fail-closed release guard; supported-runtime and full compatibility gates remain incomplete |
| 2026-08-28 | 25% | +0 | Reconciled the active project validation rules and remaining current contract/ADR wording with the accepted S3 formal suite before release; no predefined milestone gate or consumer evidence was completed |
| 2026-08-28 | 25% | +0 | Verified 2.4.2-dev.167 commit/tag, workflow jobs, registry bytes/content, LF-clean exact-commit package equivalence, and fresh peer-inclusive API/root-nonleak import; the release milestone has no predefined partial gate and consumer adoption remains incomplete |
| 2026-08-28 | 25% | +0 | Migrated to common-governance 1.4.0 with exact-task capacity routing and all-active-task turnover; the existing governance milestone was already complete, so earned progress remains unchanged |
| 2026-09-01 | 25% | +0 | Approved, implemented, and locally validated the 3.0.0-dev.1 breaking correction that removes the unowned Stripe-derived Company fields, entitlement/private-entitlement parsers, and legacy mapper while preserving immutable 2.4.2-dev.167 as rollback; no predefined full inventory, supported-runtime baseline, release, or consumer gate is complete |
| 2026-09-01 | 25% | +0 | Recorded consumer-coordinator evidence that AirGuardV2 root and Functions already use the same exact 2.4.2-dev.167 package content, retained CCB APIs, and none of the three removed exports. Corrected-version and role-catalog adoption/build acceptance plus rollback exercise remain pending, so no predefined consumer or release gate earns credit |
