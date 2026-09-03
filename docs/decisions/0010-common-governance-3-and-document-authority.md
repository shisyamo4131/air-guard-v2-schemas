# 0010 Common Governance 3 and Document Authority

- Date: 2026-09-03
- Status: Accepted
- Scope: Approved governance/document migration only; product requirements and specification version 1.0.3 are unchanged
- Partially supersedes: [0006](0006-governance-1-4-session-capacity-and-turnover.md), [0008](0008-evidence-bound-critical-identifiers.md), [0009](0009-impact-based-verification-selection.md)

## Context

The existing standard split already separates specification, project rules and operations. Governance 1.5 nevertheless requires task replacement after instruction-chain changes and uses old handoffs as current routing. The approved common 3.0.0 and task-replacement 2.0.0 contracts use ordinary repository startup and replacement only on request. Document migration 1.0.1 preserves contextual index links and binds the mapping to original source hashes.

## Decision

Apply the verified installed skill through its fixed nine-leaf Plan/Apply/Check workflow. Keep implicit invocation false; ordinary governed tasks read repository authorities without loading the installed skill. Only an explicit governance or skill-maintenance task uses it.

Keep project facts and next work in existing authorities, not task registries, histories, caches or activation records. For a user-requested replacement, update those facts, commit reviewed owned changes in sensible groups and leave the primary clean; then create a fresh non-fork task with the same base name and next sequence number. Manual creation or recovery without the old owner uses the same startup. No old-owner ACK, activation callback or replacement-specific validator is required. Governance edits do not force rotation. Former tasks must not be archived or deleted by Codex.

Preserve ordinary delegated one-shot callbacks, identifier verification, capacity routing and thresholds, primary-only work, disjoint ownership, coordinator integration, independent evidence and all approval/security boundaries. Capacity-derived proposals require the measured threshold; an explicit user replacement request is separate.

Keep the standard document split. Validate the original-source plan and synchronize the bounded index before source edits; validate result topology afterward without changing original hashes. Retain unchanged product/historical content and record the meaning of approved replacements, not merely heading counts.

Preserve the existing nine gate IDs and six comprehensive IDs. Add the nonbehavioral project-guidance-metadata class without allowing it to classify permission, safety, instruction or routing changes. Require Windows PowerShell 5.1 Desktop and Core 7 on Windows for governance scripts; this is separate from the package Node support decision. Make project validators PS5.1-compatible and exercise actual managed validation with positive and intended-negative fixtures.

## Alternatives

- Re-split or duplicate the specification: rejected; the standard split already provides unique authorities.
- Keep mandatory turnover and old activation routing: rejected under the approved replacement contract.
- Add a replacement ledger/validator or copy central helpers: rejected as unnecessary ownership and startup dependencies.
- Remove failing gates: rejected; preserve their purpose and correct only approved compatibility defects.

## Impact and Unaffected Surfaces

Affected: managed governance, project rules/policy, operations/startup, navigation, historical classification, this ADR and partial supersession notices, changelog, document mapping and governance validators.

Unaffected: product requirements, specification version, roadmap scope/evidence/25% credit, data contract, product ADRs, release evidence, package source/API/metadata/dependencies/product tests, consumer code, .codex roles/permissions and capacity implementation/runbook. These surfaces need no unrelated edits or zero-progress history. The specification's final documentation-update paragraph changes only to limit updates to affected surfaces and preserve consumer ownership.

The old three handoff bodies remain historical and unchanged. Original bootstrap counts and failures remain historical rather than current completion evidence. No remote or release action is authorized.

## Validation and Completion

Use the existing comprehensive policy plus document plan/index/result and skill/sync checks. Run governance, project-docs and policy fixtures under both declared PowerShell profiles and the formal npm suite under actual Node22 and Node24, with child PATH bound to the runtime. Record independent commands/results/exits, inclusion and omission reasons; review the final owned diff and rerun evidence invalidated by subsequent edits. Completion requires independent review, a scoped local commit and a clean primary repository. Future successful results are not prewritten here.

## Migration and Rollback

For the current scoped integration, the user deferred the missing policy-test runner's reconstruction and excluded its restoration, execution and security investigation. Required gates remain unchanged; the negative gate is unavailable and the documentation gate remains blocked by its required-file check. Available verification and independent review still apply. The central coordinator may receive a reviewed local commit with only the precisely reported unstaged runner deletion as a handover candidate; this is neither comprehensive acceptance nor a clean-status claim. See [operations](../operations.md#current-governance-migration-scope) and [current evidence](../evidence/governance-bootstrap.md#current-scoped-integration-evidence). Ordinary replacement and rollback rules are unchanged.

The content-free plan records baseline dc4c375f393399dace6604724cdac35954818e60 and whole_change rollback. Installed source revision is 4ba483f63e7ce086975b7bce8ae39c7864122aa08094fa82210179e7c94eb87d; common3.0.0/document1.0.1/turnover2.0.0 are separately versioned. Verify current identifiers before use.

Keep rollback bounded to the whole owned migration, including project-owned preparation and managed bytes; inspect sync's automatic invocation rollback on failure. Preserve unrelated work. After commit, rollback needs a separately approved non-destructive forward change, not reset, history rewrite, tag mutation or former-task deletion. The final user-requested successor is created by the central coordinator after reviewed integration; this project task does not create it.

## Reconsider When

A user-approved common contract changes, document authorities genuinely diverge, or supported governance runtime requirements change. Product Node support and consumer adoption remain separate open decisions.
