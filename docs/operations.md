# Operations

## Current Availability

Implemented:

- npm package metadata and public export map
- development-tag publish workflow requiring Node 22 and Node 24 formal tests, then Node 24 release guard and `npm publish --tag dev`
- governance renderer and validators after bootstrap
- root diagnostic scripts
- published 2.4.2-dev.166 shared role preset catalog and public `./constants` exports
- targeted `test:role-presets` check through the public package self-reference
- verified 2.4.2-dev.166 main and annotated tag, successful workflow run 32932703563 and publish job 98067873113, npm registry version and `dev` dist-tag, canonical integrity, and peer-inclusive fresh public import
- Node 24 direct-test, public-import, and package evidence for the role preset catalog
- published and content-verified 2.4.2-dev.167 CCB v1 package, formal ten-file test suite, and fail-closed release guard
- AirGuardV2 root and Functions consumption of the same exact 2.4.2-dev.167 tarball/integrity with retained CCB APIs; the three correction-removed exports are unused
- published and content-verified 3.0.0-dev.1 breaking correction with exact commit/tag, successful Node 22/24 workflow tests, Node 24 release guard and Trusted Publishing, matching registry bytes/content, and fresh public imports
- managed common governance, exact-task capacity routing, evidence-bound identifiers, and impact-selected verification through the governance lock, policy, coordination runbook, and project validators

Planned or not yet verified:

- consumer adoption of the published correction that removes the legacy Stripe-derived Company/CCB scaffold
- simultaneous AirGuardV2 root and Functions adoption of one exact published corrected version/content with aligned consumer code
- shared role-catalog import adoption and local catalog deletion
- supported Node range
- stable release policy
- complete public compatibility evidence
- verified two-consumer adoption and rollback exercise

Unavailable in this project without separate approval:

- tag, push, main merge, npm publish, deployment, remote-service operation, real-data operation, and history rewrite

## Preparation

Use the primary repository at C:\Users\seven\projects\AirGuard\air-guard-v2-schemas. Confirm that cwd and Git top-level both resolve to this path, the intended branch is active, and unrelated changes are identified before any write.

Do not use a linked worktree, task-specific worktree, or alternate repository copy unless the user explicitly approves its reason, path, branch, owner, integration method, lifetime, and cleanup plan.

Do not add secrets or production data. Network access remains disabled unless separately approved.

## Evidence-bound Critical Identifier Preflight

Before delegating or changing state with a package name or version, digest or integrity value, repository path, branch, commit, tag, environment, project or database ID, deploy target, or data target:

1. Select the smallest task-routed authoritative source or inspect the actual target in the current turn.
2. Record the exact source, location or command, and value.
3. Treat chat history, summaries, memory, prompts, delegated-task reports, and multiple-agent agreement as leads only.
4. Require a delegated task to repeat the comparison before its first file write, Git mutation, validator or test, install, network call, or other state change.
5. Stop and callback without an application or package diff when any material value is missing, stale, ambiguous, or contradictory.

For this package, verify the source or tag manifest through `package.json`, `package-lock.json`, and the actual Git object for a commit or tag, then use the indexed `docs/evidence/release-*.md` record or separately approved registry query for release metadata. Published-artifact release or consumer adoption additionally requires the consumer manifest or lock name, version, resolved location, and integrity. If network use is unapproved, do not query or infer remote state; mark remote freshness, including registry, workflow, and branch state, unverified.

This preflight does not merge approval gates. Package code or tests, tag creation, push, npm publication, registry access, consumer adoption, deployment, remote service, and data operations retain their separate approvals.

## Verification Matrix

`governance/verification-policy.json` is the machine-readable source for change classes, stable gate IDs, stages, inclusion, invalidation, comprehensive fallback, and omission destinations. Classify every affected surface before implementation. Mixed changes use the union of all selected gates. Unknown or unbounded impact uses the comprehensive suite. Scaffold creation, governance migration, managed sync, common-contract changes, permission or agent-policy changes, and build/release/deploy completion also use the comprehensive suite.

| Change class | Typical triggers | Iteration | Targeted regression | Completion | Release only |
| --- | --- | --- | --- | --- | --- |
| `documentation-only` | Markdown and indexes with no behavior or configuration impact | `project-docs` | `project-docs` | `project-docs`, `git-whitespace` | None |
| `ui-css-layout` | A proposed UI, visual, interaction, or accessibility surface | `project-docs` | `package-suite` | `package-suite`, `project-docs`, `git-whitespace` | None |
| `application-logic` | Package implementation, exports, executable tests | `package-suite` | affected targeted package gates | `package-suite`, `project-docs`, `git-whitespace` | `release-guard` |
| `data-contract-schema-migration` | Schema, serialization, compatibility, persistence, migration | targeted contract gate | `package-suite` | `package-suite`, `project-docs`, `git-whitespace` | `release-guard` |
| `project-guidance-metadata` | Descriptive guidance metadata with no instruction, permission, safety, routing, executable, or product effect | `project-docs` | `project-docs` | `project-docs`, `git-whitespace` | None |
| `governance-permissions-agents` | Governance, permissions, agents, managed sync, routing, turnover | `generated-governance` | `managed-governance`, `project-docs` | comprehensive suite | None |
| `build-release-deploy` | Metadata, workflow, build, release, publish, deploy, rollback | `package-suite` | `release-guard` | comprehensive suite | `release-guard` |

<!-- BEGIN GENERATED VERIFICATION POLICY SUMMARY -->
- Root: schemaVersion=1.0; comprehensiveGateIds=[managed-governance,generated-governance,verification-policy-negative-tests,project-docs,package-suite,git-whitespace]; unknownImpactGateIds=[managed-governance,generated-governance,verification-policy-negative-tests,project-docs,package-suite,git-whitespace]
- RuntimeProfile: id=windows-powershell-5.1; platform=windows; edition=Desktop; executable=powershell.exe; versionRule=major-minor=5.1; required=True; supportStatus=supported
- RuntimeProfile: id=powershell-core-7; platform=windows; edition=Core; executable=pwsh.exe; versionRule=minimum-major=7; required=True; supportStatus=supported
- Class: id=documentation-only; triggers=[*.md,docs/**,README.md,CHANGELOG.md,no executable\, configuration\, package\, or data-contract effect]; iterationGateIds=[project-docs]; targetedRegressionGateIds=[project-docs]; completionGateIds=[project-docs,git-whitespace]; releaseOnlyGateIds=[]; omittableGateIds=[managed-governance,generated-governance,package-suite,release-guard]; omissionRecord=task callback or completion report
- Class: id=ui-css-layout; triggers=[consumer-facing UI\, CSS\, layout\, template\, visual\, interaction\, or accessibility impact,introduction of a UI-owned surface into this package]; iterationGateIds=[project-docs]; targetedRegressionGateIds=[package-suite]; completionGateIds=[package-suite,project-docs,git-whitespace]; releaseOnlyGateIds=[]; omittableGateIds=[managed-governance,generated-governance,release-guard]; omissionRecord=task callback or completion report\; UI implementation remains outside the confirmed package scope
- Class: id=application-logic; triggers=[index.js,src/**/*.js,test*.js,scripts/run-package-tests.mjs,executable package behavior or public export impact]; iterationGateIds=[package-suite]; targetedRegressionGateIds=[company-configuration-targeted,role-presets-targeted]; completionGateIds=[package-suite,project-docs,git-whitespace]; releaseOnlyGateIds=[release-guard]; omittableGateIds=[managed-governance,generated-governance]; omissionRecord=task callback or completion report\; release-only omission also records that no release was authorized
- Class: id=data-contract-schema-migration; triggers=[docs/data-contract.md,schema\, field\, serialization\, compatibility\, persistence meaning\, or migration impact,src/** schema or contract surface]; iterationGateIds=[company-configuration-targeted]; targetedRegressionGateIds=[package-suite]; completionGateIds=[package-suite,project-docs,git-whitespace]; releaseOnlyGateIds=[release-guard]; omittableGateIds=[managed-governance,generated-governance]; omissionRecord=task callback or completion report\; authorized release evidence for release-only gates
- Class: id=project-guidance-metadata; triggers=[descriptive project-guidance metadata only\; no instruction\, permission\, safety\, routing\, executable\, or product effect]; iterationGateIds=[project-docs]; targetedRegressionGateIds=[project-docs]; completionGateIds=[project-docs,git-whitespace]; releaseOnlyGateIds=[]; omittableGateIds=[managed-governance,generated-governance,verification-policy-negative-tests,package-suite,release-guard]; omissionRecord=task callback or completion report\; any instruction or safety effect uses governance-permissions-agents
- Class: id=governance-permissions-agents; triggers=[AGENTS.md,governance/**,.codex/**,INITIAL_PROMPT.md,docs/operations.md,docs/runbooks/**,scripts/check-governance.ps1,scripts/render-governance.ps1,managed sync\, permissions\, agents\, approval\, callback\, or turnover impact,references/**,scripts/check-project-docs.ps1,scripts/test-verification-policy.ps1,explicit-only skill invocation or instruction-entrypoint routing]; iterationGateIds=[generated-governance]; targetedRegressionGateIds=[managed-governance,project-docs]; completionGateIds=[managed-governance,generated-governance,verification-policy-negative-tests,project-docs,package-suite,git-whitespace]; releaseOnlyGateIds=[]; omittableGateIds=[release-guard]; omissionRecord=task callback or completion report\; release guard omitted only when package release is outside scope
- Class: id=build-release-deploy; triggers=[package.json,package-lock.json,.github/workflows/**,scripts/check-release-package.mjs,build\, packaging\, version\, tag\, publish\, install\, deploy\, or rollback impact]; iterationGateIds=[package-suite]; targetedRegressionGateIds=[release-guard]; completionGateIds=[managed-governance,generated-governance,verification-policy-negative-tests,project-docs,package-suite,git-whitespace]; releaseOnlyGateIds=[release-guard]; omittableGateIds=[]; omissionRecord=task callback\, completion report\, and authorized release evidence
- Gate: id=managed-governance; command=pwsh -NoProfile -File .\\scripts\\check-governance.ps1 -ProjectPath C:\\Users\\seven\\projects\\AirGuard\\air-guard-v2-schemas; stages=[targeted,completion,release]; includes=[generated-governance]; invalidatedBy=[AGENTS.md,governance/**,docs/operations.md,scripts/check-governance.ps1,scripts/render-governance.ps1,references/task-turnover-contract.md,PowerShell runtime]; evidenceDestination=task callback or completion report
- Gate: id=generated-governance; command=pwsh -NoProfile -File .\\scripts\\render-governance.ps1 -ProjectPath C:\\Users\\seven\\projects\\AirGuard\\air-guard-v2-schemas -Check; stages=[iteration,targeted,completion,release]; includes=[]; invalidatedBy=[AGENTS.md,governance/common-governance.md,governance/project-rules.md,governance/governance.lock.toml,scripts/render-governance.ps1,references/task-turnover-contract.md,PowerShell runtime]; evidenceDestination=task callback or completion report
- Gate: id=verification-policy-negative-tests; command=pwsh -NoProfile -File .\\scripts\\test-verification-policy.ps1 -ProjectPath C:\\Users\\seven\\projects\\AirGuard\\air-guard-v2-schemas; stages=[targeted,completion,release]; includes=[]; invalidatedBy=[governance/verification-policy.json,scripts/test-verification-policy.ps1,scripts/check-governance.ps1,AGENTS.md,governance/common-governance.md,governance/project-rules.md,governance/governance.lock.toml,references/task-turnover-contract.md,scripts/render-governance.ps1,docs/operations.md,PowerShell runtime]; evidenceDestination=task callback or completion report
- Gate: id=project-docs; command=pwsh -NoProfile -File .\\scripts\\check-project-docs.ps1 -ProjectPath C:\\Users\\seven\\projects\\AirGuard\\air-guard-v2-schemas; stages=[iteration,targeted,completion,release]; includes=[]; invalidatedBy=[*.md,docs/**,governance/project-rules.md,governance/verification-policy.json,.codex/**,scripts/check-project-docs.ps1,references/**,PowerShell runtime]; evidenceDestination=task callback or completion report
- Gate: id=package-suite; command=npm test; stages=[iteration,targeted,completion,release]; includes=[]; invalidatedBy=[index.js,src/**,test*.js,scripts/run-package-tests.mjs,package.json,package-lock.json,Node.js runtime,installed dependencies]; evidenceDestination=task callback\, completion report\, or release evidence
- Gate: id=company-configuration-targeted; command=npm run test:company-configuration; stages=[iteration,targeted]; includes=[]; invalidatedBy=[src/company-configuration/**,test-company-configuration.js,package.json,Node.js runtime,installed dependencies]; evidenceDestination=task callback or completion report
- Gate: id=role-presets-targeted; command=npm run test:role-presets; stages=[targeted]; includes=[]; invalidatedBy=[src/constants/**,test-role-presets.js,package.json,Node.js runtime,installed dependencies]; evidenceDestination=task callback or completion report
- Gate: id=release-guard; command=npm run check:release -- --tag <approved-candidate-tag>; stages=[targeted,release]; includes=[package-suite]; invalidatedBy=[package.json,package-lock.json,index.js,src/**,test*.js,scripts/check-release-package.mjs,scripts/run-package-tests.mjs,.github/workflows/**,candidate tag,Node.js runtime,installed dependencies]; evidenceDestination=authorized release evidence and task callback
- Gate: id=git-whitespace; command=git diff --check; stages=[completion,release]; includes=[]; invalidatedBy=[any later worktree edit]; evidenceDestination=task callback or completion report
<!-- END GENERATED VERIFICATION POLICY SUMMARY -->

### Gate Catalog and Inclusion

The exact marker-bounded summary above is generated from the JSON policy. Do not maintain a second manual command catalog. Inclusion must be acyclic. A selected parent gate that preserves an included gate's named result and exit status and fails with it satisfies that child. Diagnostic batches never satisfy completion evidence.

For an explicitly approved governance update, confirm the installed skill identity and invoke its `scripts/sync-project-governance.ps1` with the confirmed primary `-ProjectPath`: first `-Plan`, then approved `-Apply`, then `-Check`. The current installed root is `C:\Users\seven\.agents\skills\scaffold-project-governance`; reverify it in the actual update turn. Managed sync owns the fixed nine-leaf plan; the renderer is check-only. Do not copy helpers or edit managed artifacts directly.

For this document migration, the reviewed [original-source plan](evidence/governance-3.0.0-document-plan.json) retains its source hashes and whole-change baseline. The approved central `scripts/manage-document-migration.ps1` helper performs `ValidatePlan` and `SyncIndex` before editing the three source documents, then `ValidateResult` after migration. Do not replace the original hashes or rerun pre-migration index sync against edited sources to conceal drift. The [rule inventory](evidence/governance-3.0.0-rule-inventory.json) records preserved and intentionally changed meaning. The [document contract](../references/document-migration-contract.md) defines the topology checks; they do not substitute for project gates.

Governance scripts are required to validate on Windows PowerShell 5.1 Desktop and PowerShell Core 7 on Windows. `runtimeProfiles` declares the required support targets, not a claim that future checks have passed. Run managed governance, project-docs, and negative fixtures independently under each profile. The Core commands are in the policy; for Desktop invoke the same file and arguments with `powershell.exe -NoProfile -File`, subject to the approved execution policy. An execution-policy rejection is a reported blocked gate, not authority to add an override or invoke the script body another way; the [current scoped work](#current-governance-migration-scope) does not authorize such a retry. Node22/24 package evidence uses each existing runtime, including that runtime first in the child-process PATH, and restores the environment afterward. This does not settle the supported package Node range.

Run selected commands independently and record their results and exit statuses. A grouped runner is acceptable only when it is verified to preserve every named result and exit status and exits nonzero if any included gate fails. Do not use `;` or another status-masking chain as completion evidence.

### Evidence Validity and Retry

- Bind successful evidence to the current revision or worktree state and impact classification.
- A failure or later edit invalidates the failed gate and every gate whose `invalidatedBy` entry matches the changed path, configuration, dependency, generated artifact, runtime, or environment.
- Unaffected successful evidence may be reused only when the matrix proves it remains valid.
- Record omitted gates and matrix-based reasons in the task callback or completion report, and in durable release evidence when applicable. Never omit a gate to avoid a known failure.
- Release-only, publish, registry, install, deploy, remote-service, and data gates retain separate approval boundaries.

## Package Diagnostics

Node 24 is the formal validation runtime candidate and the publish runtime, while CI requires the formal suite on both Node 22 and Node 24. The supported Node range remains open. `npm test` executes the exact maintained root-test inventory and fails closed on additions, omissions, and nonzero exits. The inventory is:

- node test-class-imports.js
- node test-field-definitions.js
- node test-error-definitions.js
- node test-format-jst-date.js
- node test-refactored-date-formatting.js
- node test-employee-insurance.js
- node test-validator-debug.js
- node test-company-configuration.js
- node test-role-presets.js
- node test-release-guard.js

`test-error-definitions.js` now asserts the maintained `invalidReasons`, `isInvalid`, and `validate()` behavior. `test-release-guard.js` covers the positive contract plus tag, version, required/forbidden export, required/forbidden content, import, test, and inventory-negative paths.

## Company Configuration Boundary Delivery

CCB v1 is published through `./company-configuration` in exact version 2.4.2-dev.167 from commit `bb2390997153b2e57470d0c04012d93ddde2f971` and annotated tag `v2.4.2-dev.167`. The tag-triggered workflow completed its Node 22 and Node 24 test jobs, Node 24 release guard, and Trusted Publishing job successfully. Registry metadata and downloaded bytes matched, LF-clean exact-commit package content matched the published artifact, and a fresh peer-inclusive install verified the public 27-name API and package-root non-leak. The AirGuardV2 root and Functions consumers separately confirm current use of the same exact package content and retained CCB APIs; the three removed exports are unused.

Before a future CCB correction release, run `npm run check:release` with the intended exact tag. It proves tag/package/lock alignment, export and root compatibility, all formal tests, public self-import, required packed CCB content, forbidden-content exclusion, and absence of repository package archives. `prepublishOnly` repeats the guard, and the tag-only workflow requires Node 22 and Node 24 tests before the Node 24 publish job. Tag creation, push, npm publication, registry confirmation, and consumer installation remain distinct approval gates.

If validation or publication fails, retain immutable published versions and correct forward with a later development version. Rollback does not move/delete a tag, unpublish a package, rewrite history, deploy, or modify real data. Corrected AirGuardV2 root and Functions adoption remains consumer-owned and starts only after exact corrected published version/content evidence is accepted.

### Breaking Stripe-scaffold Correction

[ADR 0007](decisions/0007-legacy-stripe-schema-scaffold-removal.md) approves published `3.0.0-dev.1` as a breaking forward correction. It removes `stripeCustomerId` and `subscription` from the public `Company` schema and removes the entitlement/private-entitlement parsers, legacy mapper export, and packed `src/company-configuration/legacy.js`. Legacy-shaped input may be accepted only on discard-only paths and must not reintroduce or serialize the removed fields.

Local completion requires the changed targeted tests to pass independently, followed by the unchanged formal ten-file `npm test` suite on existing local Node 22 and Node 24 runtimes. The release guard must treat the removed exports and file as forbidden, retain the remaining required-export/content checks, pass with exact candidate tag `v3.0.0-dev.1`, and fail its negative paths. Governance, generated-entry, project-document, link/index, roadmap, ADR, and whitespace checks remain independent evidence items.

The separately approved release checkpoint created annotated tag `v3.0.0-dev.1` at commit `c84bee2f3c934618489b691dadecbd23a534372a`, fast-forwarded `main`, and completed workflow run `33467705041`. Registry version and `dev` dist-tag, shasum `e195a1de3ccafe7b369c79e1c8e327fe571fd666`, integrity `sha512-Pg5ZdBI5MDP5Ks2sN/HtzLGDhtOYcGSOczFI+AYvT2hf0b4EqoS6ditTm3ca66mQ0YVNHX7EHchX19lbmv9/CA==`, 83-file tagged-commit content, and fresh imports are verified in [the release evidence](evidence/release-3.0.0-dev.1.md). No consumer edit, Stripe API operation, deployment, or production-data migration was performed.

AirGuardV2 root and Functions may adopt only one exact verified corrected version/content and must remove their indirect legacy root `Company` Stripe dependency in the same consumer checkpoint. A consumer that still requires a removed surface must stay on its previous verified dependency until it owns and verifies an explicit replacement.

Rollback retains immutable published 3.0.0-dev.1 and exact published 2.4.2-dev.167 with their evidence. It does not unpublish, move or delete tags, rewrite history, deploy, call Stripe, or modify data. A package correction is released forward in a later version; a consumer adoption failure restores both AirGuardV2 root and Functions to exact 2.4.2-dev.167 and their previous consumer code, then reruns consumer compatibility evidence under consumer ownership.

## Git Integration

Delegated tasks edit and validate only explicitly owned files, then report exact files, diff, tests, unverified items, approval boundaries, and worktree state. They do not stage or commit by default.

The Schemas primary coordinator reviews accepted files, stages only those files, creates the local commit, and performs integration. Reuse a reviewed delegated commit rather than duplicating it. Never use unintegrated work as a confirmed dependency.

Branch creation, stage, and local commit require the applicable approval. Tag, push, main merge, history rewrite, and publish each require a separate approval.

## Cross-project Checkpoint Loop

The durable parties are the Schemas primary coordinator and a consumer project primary coordinator. Temporary task, thread, host, and callback identifiers belong only in the current checkpoint; historical handoffs are not current routing.

Before issuing work:

1. Confirm the current phase, specification, roadmap, baseline, unresolved decisions, and existing behavior.
2. Confirm cwd, Git top-level, branch, HEAD, worktree, owned and forbidden files, validation, rollback, approval boundaries, ending condition, and callback destination.
3. After ordinary delegated-task creation or application restart, verify a no-change callback. Requested replacement uses ordinary repository startup, not an activation handshake.
4. Issue one reviewable checkpoint.
5. Wait for one completion, failure, specification-question, or approval-boundary callback.
6. Review the report and owned diff before integration.
7. Continue only while safe independent work remains. Stop when it is exhausted or the user instructs a stop.

A callback is sent once. If delivery fails, preserve the complete report in the task and stop for recovery; do not retry repeatedly. Report approvals, failures, conflicts, progress decreases, state or callback failures, and capacity thresholds immediately.

## Parallel Work

Parallel work requires independent scopes, a common baseline, checkpoint IDs, disjoint file ownership, bounded integration order, and explicit promotion criteria. The coordinator integrates completed work before starting another write cycle when integration is waiting.

## Shared Role Preset Contract Delivery

The shared role preset contract in [ADR 0004](decisions/0004-shared-role-permission-catalog.md) is implemented, published, and verified in version 2.4.2-dev.166. Verification covers commit `1a6024ceedd03684020ef82af55fda2b73579eb1`, annotated tag object `fb36b67b1cd79b50e9d5dcf8a542196801b0c642`, successful workflow run `32932703563` and publish job `98067873113`, npm registry version and `dev` dist-tag, canonical shasum `a284c1b4c961733f167a4195f46d4cc35378ec11`, integrity `sha512-z1lPb3Q/DhXffFXxxih69b7fqUJlrnC8jZ1LotwGqflCA+tL1iO/gjH92Pky0YxIaxSbHGkNX4Cby6PZymeb/g==`, and peer-inclusive fresh public import with schemas 2.4.2-dev.166, `@holiday-jp/holiday_jp` 2.5.1, and `@shisyamo4131/air-firebase-v2` 2.3.1-dev.6.

Version 2.4.2-dev.166 is a documentation/version-metadata-only correction relative to immutable 2.4.2-dev.165. It does not change the role preset API, data, tests, dependencies, exports, scripts, or authorization boundary. Published consumer availability is true.

The local public imports are `ROLE_PRESETS`, `ROLE_PRESET_IDS`, and `isRolePresetId` from `@shisyamo4131/air-guard-v2-schemas/constants`. Package implementation is limited to catalog data and prototype-safe membership validation. Consumer authorization evaluators, write-to-read implication, and strict or general policy semantics remain consumer-owned.

Targeted role-preset evidence uses Node 24 as the formal package evidence candidate and includes the direct `node:test` command, the package script with the same Node runtime, a public self-reference import smoke check, and package evidence confirming that `src/constants/role-presets.js` is included while root tests are excluded. Published 2.4.2-dev.167 and 3.0.0-dev.1 additionally provide the formal ten-file runner and Node 22/24 workflow suite evidence. This does not establish the complete supported Node range; Firebase Functions Node 22 compatibility remains separate consumer evidence.

Deliver and verify the contract in this order:

1. Keep the accepted contract, local implementation, targeted test, package version, and current authoritative documents aligned in one reviewed local integration.
2. Record Node 22/24 formal-suite, targeted public-import, immutability, catalog-shape, package-file, governance, and Git evidence independently. Firebase Functions Node 22 compatibility remains consumer-owned evidence.
3. Review and locally commit only the approved files. Produce release evidence before any remote action.
4. Obtain separate explicit approvals for tag creation, push, and the push-triggered npm publication. A local version or tag is not publication evidence.
5. Confirm the published version and content before asking consumer coordinators to adopt it.
6. Each confirmed consumer updates its dependency, code, tests, and documentation in its own repository. Combined role-preset and corrected Company/CCB adoption must use one separately approved, published, content-verified corrected version with matching resolved content and integrity in AirGuardV2 root and Functions; local catalog deletion occurs only in that consumer-owned adoption. Exact 2.4.2-dev.167 remains immutable rollback and historical evidence, not the corrected adoption target.

Rollback does not depend on npm unpublish, tag deletion or movement, history rewrite, deployment, or data action. Published 2.4.2-dev.165, 2.4.2-dev.166, 2.4.2-dev.167, and 3.0.0-dev.1 remain immutable. If a published version is not adopted, leave it published and issue a later corrected version if necessary. If consumer adoption fails, the consumer coordinator restores the previously verified exact package version and local catalog/import implementation in all affected consumers, reruns compatibility evidence, and accepts that rollback in the consumer repository.

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

## Governance Updates and Requested Task Replacement

Use approved managed sync for common governance, root AGENTS.md, lock, renderer, validator, and turnover reference; project rules, policy and surrounding operations are project-owned. Permission, approval, delegation, critical-identifier, verification, and safety changes retain their applicable explicit approval boundaries. Resolve scope blockers, review the owned diff, rerun invalidated gates, and commit meaningful reviewed groups. Governance changes do not force rotation.

The [task replacement contract](../references/task-turnover-contract.md) uses two steps only when the user requests replacement:

1. Update existing authoritative project facts and next work, commit reviewed owned changes in sensible groups, and leave the primary repository clean. Do not create per-edit/task-action or empty replacement commits.
2. Create a fresh non-fork task in that primary project with the same base name and next sequence number. Every task reads AGENTS.md, governance/project-rules.md and routed repository authorities before work.

Manual creation and recovery without the old task use the same startup. No old task ID or old-owner cooperation, activation ACK, task registry/history/cache, self-routing state, or replacement-specific validator is required. Ordinary tasks do not load the installed scaffold skill. A normal delegated-work callback remains required and is not a replacement handshake. Former tasks remain in place; Codex must not archive or delete them.

The approved migration rollback covers the whole owned change at its recorded baseline, including project-owned preparation and managed bytes. Check sync's invocation-touched rollback after a failure; do not leave competing authorities and claim completion. Restore only owned changes through a separately approved non-destructive procedure; after commit use an approved forward revert, never reset, history rewrite, or unrelated-change discard. [ADR 0010](decisions/0010-common-governance-3-and-document-authority.md) records the change and unaffected surfaces.

## Coordinator Session Lifecycle

Route `容量チェック`, `タスク容量確認`, `セッション容量確認`, and `session size / handoff threshold確認` through [the project coordination runbook](runbooks/project-coordination.md). Run scripts/check-codex-session-size.ps1 with the actual current task ID from trusted task metadata and require exactly one match. Never infer the newest or most recently modified session.

The handoff proposal threshold is 300 MiB per session. The Codex-wide 10 GiB threshold is a separate reference warning and does not trigger task replacement. Report every standard field, scan completeness/error count, command result, and independently observed exit status without exposing session contents. Unknown task identity, zero or multiple matches, command failure, or incomplete total scanning stops the affected conclusion. Measure at work-session start, after callback-driven material changes, and at stop or completion, no more than hourly when nothing changes.

Coordinator replacement requires an explicit user request. Delegated replacement remains limited to approved conditions at a safe checkpoint. A user-requested replacement is not a capacity-triggered proposal and does not require a threshold crossing.

The retiring coordinator commits its completed owned work. A retiring delegated task reports exact files, diff, tests, unverified items, and worktree state; the coordinator reviews, commits, and integrates accepted work. Do not give the same dirty files to old and new tasks.

Do not make direct maintenance of Codex-owned SQLite or WAL files a normal operation.

## Current Governance Migration Scope

The user has deferred reconstruction of the missing tracked `scripts/test-verification-policy.ps1`. The current work is limited to common-governance application, document organization, available verification, independent review and reviewed local integration. Do not restore, recreate under another name, execute or investigate that runner, or request security-product analysis or exclusion decisions as part of this work.

`verification-policy-negative-tests` remains required but unavailable / not run. `project-docs` retains its required-file check and cannot pass while that file is missing; report its actual failure and exit status, not a skipped check or successful substitute. Comprehensive verification remains incomplete. Other independent gates must still run, and any additional failure must be reported separately. Current measured results belong in [the migration evidence](evidence/governance-bootstrap.md#current-scoped-integration-evidence).

Only reviewed migration paths other than the missing runner may be staged and committed. Do not stage its deletion, hide it with Git flags, change Git configuration, or recreate it to obtain a clean status. The user permits returning the precise remaining unstaged deletion as a scoped handover candidate to the central coordinator, not as a clean repository or fully accepted migration. This is a one-time scope decision, not a change to the verification policy or ordinary clean-replacement rule. Reconstruction remains separate future work requiring its own scope.

The central coordinator has explicitly authorized local preservation of the reviewed 26 migration paths while the recorded Desktop execution-policy rejection and incomplete verification remain unresolved. This local commit is a save of reviewed work, not comprehensive acceptance. The user announced an intention to supply the runner; its absence or user-provided contents remain outside staging and must be preserved. Recheck actual existence without assuming the user's operation has finished, compare any supplied file read-only, and do not execute it. If commit approval is rejected, stop after that attempt, preserve the reviewed index and report the reason without another route or repeated request.

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
