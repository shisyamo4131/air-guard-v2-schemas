# Governance Bootstrap Evidence

- Status: Historical evidence (bootstrap and prior migrations below)
- Date: 2026-08-26
- Baseline commit: bc941cb62d0965bda453a6f0dc6aaea8921db743
- Primary repository: C:\Users\seven\projects\AirGuard\air-guard-v2-schemas
- Approved branch: codex/governance-bootstrap
- Managed common-governance version: 1.3.0
- Rollback: return to the baseline commit through a separately approved non-destructive Git procedure; no history rewrite is authorized.

## Evidence Status and Current Migration

The bootstrap, R001-R050 inventory, old diagnostic failure and governance 1.3/1.4/1.5 sections below describe their historical revisions. The former `detailedInvalidReasons` failure was later resolved by the formal package suite; it is not a current unresolved defect. Old task identifiers, ACK/activation and compulsory-turnover text are not current instructions. Historical counts are not reused as governance 3 completion evidence.

The approved governance 3 migration is defined by [ADR 0010](../decisions/0010-common-governance-3-and-document-authority.md), the [original-source plan](governance-3.0.0-document-plan.json) and [supplemental rule inventory](governance-3.0.0-rule-inventory.json). It preserves the standard split and product scope. Baseline: `dc4c375f393399dace6604724cdac35954818e60`; installed normalized-LF manifest revision: `4ba483f63e7ce086975b7bce8ae39c7864122aa08094fa82210179e7c94eb87d`. Current validation, independent review and integration results are recorded only after execution in the migration completion report; they are not inferred from this historical evidence.

### User-accepted Migration Completion

- Date: 2026-09-03.
- Acceptance: After restoring the distributed verification file, the user explicitly instructed that migration and application be treated as completed. Common-governance 3.0.0 migration/application is therefore complete by user acceptance. The remaining comprehensive checks are not prerequisites to closing this accepted checkpoint; future work retains the existing verification policy.
- Source clarification: The user identified the runner as a file distributed by the scaffold-project-governance project to check the post-application state. The pre-migration Git version is not the expected byte-for-byte restoration source.
- Restoration evidence: Read-only `Get-Item` and `Get-FileHash -Algorithm SHA256` checks confirmed that the repository runner and supplied desktop copy were readable, each 10,129 bytes, with matching SHA-256 `67a3a35d83f956f46d0caf9cb9c7f9e3e9c5b56b2a9bf0af6d32407c26511de7` (comparison exit 0). A fresh hash comparison during acceptance recording confirmed the same value. The missing-file condition is resolved; Git reports the runner as modified rather than deleted.
- Verification distinction: This is acceptance of migration/application, not a claim of a fully passing comprehensive suite. The historical missing-file failures and Desktop execution-policy rejections below retain their actual results. The restored runner has not been executed by this task, and its proposed bypass-argument removal was not applied. No further runner modification or execution is authorized by this status decision.
- Integration distinction: At recording time, HEAD remained `834ecb42327bb7c6d466ef9271041667ac719e3f`, with six unstaged modified files and no missing tracked files. Acceptance does not assert a clean worktree, new commit or push.
- Recording scope: Update operations, this evidence, ADR 0010 and changelog to reflect acceptance and resolved file absence. Product specification, data contract, roadmap scope/25% credit, package code and version, managed artifacts, verification policy, indexes and consumer state are unaffected; no new milestone credit or general gate exemption is introduced. The final task report records checks of these documentation edits separately from migration acceptance.

### Current Scoped Integration Evidence

This section records the initial local-preservation checkpoint before runner restoration was approved. Its missing-file observations and unavailable gates remain historical results of that checkpoint. The subsequent failed attempt is recorded in [Policy Test Runner Restoration](#policy-test-runner-restoration); the resolved absence and current accepted status are recorded in [User-accepted Migration Completion](#user-accepted-migration-completion).

- Scope decision: The user deferred reconstruction of the missing tracked `scripts/test-verification-policy.ps1`; common-governance application, document organization, available verification, independent review and scoped local integration continue. Runner restoration, execution, cause investigation and security-product inquiry are outside this work.
- Status: The central coordinator authorized local preservation of the reviewed migration changes despite the recorded Windows PowerShell execution-policy rejection. Comprehensive verification and migration acceptance remain blocked; authorization to save is not a passing validation result.
- Known unavailable gate: `verification-policy-negative-tests` is not run. Its previous Core result is stale after removal; the previous Desktop failure is not erased or promoted to success.
- Dependent gate: `project-docs` retains the missing-file check. Both runtime results must be recorded as actually observed; downstream checks after that failure are not claimed to have run.
- Integration boundary: Commit reviewed owned migration files only, excluding the missing runner. Any remaining unstaged deletion is reported as an explicit user-authorized handover candidate exception, never as clean. Required gates and the ordinary clean-replacement rule remain unchanged.
- Verification and review: The measured results below distinguish executed gates from unavailable work. Source hashes in the original plan remain immutable. Independent final document review found no additional required correction and confirmed preserved safety, approval, consumer and product boundaries; this does not accept the blocked comprehensive gates or integration.
- Local preservation boundary: Save only the reviewed 26 migration paths, excluding `scripts/test-verification-policy.ps1` whether absent or supplied by the user. Report the actual Git commit and residual status separately; do not predict success, bypass the execution-policy rejection or repeat a rejected commit request. Any runner reconstruction or execution remains separately scoped future work.
- User supplementation: The user announced an intention to supply the test file. The latest pre-integration observation still found it absent; completion of that user action, source provenance, safety and execution authority are not inferred. If it appears, preserve it and perform read-only comparison only; never include it in this local save.

Commands below were run from the primary repository on 2026-09-03. `skill-root` means the verified installed `C:\Users\seven\.agents\skills\scaffold-project-governance`; `central` means the approved `C:\Users\seven\projects\ScaffoldProjectGovernance`. Each listed exit was independently observed. `-ProjectPath` was the primary repository and the document `-PlanPath` was `docs/evidence/governance-3.0.0-document-plan.json`.

| Check / command | Observed result | Exit |
| --- | --- | ---: |
| Normalized-LF hash and exact file-set comparison with the approved immutable installation manifest | All 41 installed files match; implicit invocation remains false | 0 |
| `skill-root/scripts/validate-skill.ps1 -SkillPath <skill-root>` with bytecode writes disabled | Skill and explicit-only invocation policy valid; no dependency installation | 0 |
| `skill-root/scripts/sync-project-governance.ps1 -Plan` | Nine-leaf plan; only the generated operations summary differs | 0 |
| Same sync command with `-Apply` | One changed leaf: operations summary; renderer and validator each invoked once | 0 |
| Same sync command with `-Check` | Aligned; zero writes | 0 |
| `central/scripts/manage-document-migration.ps1 -Action ValidateResult` | Standard split, three target authorities; structural result only | 0 |
| `pwsh -NoProfile -File scripts/check-governance.ps1` | Core 7.6.4: managed hashes, generated entry, nine gates, seven classes and two required runtime profiles valid; included renderer result/exit 0 preserved | 0 |
| `powershell.exe -NoProfile -File scripts/check-governance.ps1` | Desktop 5.1.26100.9168: script execution disabled; UnauthorizedAccess before script body | 1 |
| `pwsh -NoProfile -File scripts/check-project-docs.ps1` | Missing required `scripts/test-verification-policy.ps1`; later documentation checks did not run | 1 |
| `powershell.exe -NoProfile -File scripts/check-project-docs.ps1` | Script execution disabled; UnauthorizedAccess before the missing-file check | 1 |
| Node 22.23.2 invoking the installed npm CLI with `test` | All ten maintained formal test files passed | 0 |
| Node 24.19.0 invoking the same npm CLI with `test` | All ten maintained formal test files passed | 0 |
| Read-only in-memory comparison of Git baseline Markdown units with the original plan and supplemental inventory | Independent reviewer verified all 216 source units across 28 project-owned Markdown documents; original normalized-LF hashes match, without missing, duplicate or unexpected units. This is source correspondence, not comprehensive acceptance | 0 |
| `Parser::ParseFile` on `scripts/check-project-docs.ps1`, separately in Core and Desktop | Both parser-only diagnostics succeeded; script body was not executed | 0 each |
| Isolated in-memory lock extraction from the actual two source expressions, separately in Core and Desktop | LF/CRLF/CR and four malformed cases behaved as intended; seven cases per runtime. Supporting diagnostics only, not replacement for the blocked document gate | 0 each |
| `git diff --check` | No whitespace errors; checkout line-ending warnings are not errors | 0 |
| `verification-policy-negative-tests`, both PowerShell profiles | Unavailable / not run; reconstruction explicitly deferred | Not run |

Node 22 used `C:\Program Files\nodejs\node.exe`; Node 24 used `C:\Users\seven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Both invoked `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js test`, put their own runtime first in the child-process PATH and restored that environment afterward. Later documentation-only edits do not invalidate package-suite evidence under the policy. Successful managed-governance evidence must be refreshed if operations or another listed input changes. No standalone release guard, publication, install, registry or remote gate was selected: no release or external action was authorized; the maintained release-guard regression test remained inside the formal suite.

The Desktop rejection is independent of the deferred missing runner. No execution-policy override, security-setting change, alternate script-body invocation or restoration was attempted in response. The central coordinator has authorized a local save of reviewed work without accepting the incomplete comprehensive verification. Actual save results belong to Git and the integration report; successor acceptance is not claimed.

### Policy Test Runner Restoration

This section preserves the earlier failed restoration attempt and its measured results. It is superseded for current status by [User-accepted Migration Completion](#user-accepted-migration-completion).

- Date: 2026-09-03
- Approval: The user approved restoring the supplied desktop revision, removing its child-process execution-policy bypass argument, required validation, independent review and affected record updates. The desktop original remains preserved; no security-setting change, policy override, external action, stage or commit is authorized by this checkpoint.
- Baseline: Primary repository, `main`, HEAD `834ecb42327bb7c6d466ef9271041667ac719e3f`; the initial worktree contained only the unstaged deletion of `scripts/test-verification-policy.ps1`.
- Supplied source: `C:\Users\seven\OneDrive\デスクトップ\test-verification-policy.ps1`; SHA-256 `67a3a35d83f956f46d0caf9cb9c7f9e3e9c5b56b2a9bf0af6d32407c26511de7`. It differs from the Git baseline and contains 15 intended-negative checks against the actual managed validator. Identity with the disappeared working copy and disappearance cause remain unverified.
- Owned scope: Repository runner, operations, this evidence, ADR 0010 and changelog. Product specification/version, data contract, roadmap credit, package implementation/metadata/dependencies/product tests, consumers, managed governance, verification policy, indexes and installed skill remain unchanged because their governed contracts or navigation are unaffected.
- Validation selection: `governance-permissions-agents`; unchanged six comprehensive gate IDs, including `generated-governance` through a successful `managed-governance` result that preserves its renderer exit. Core and Desktop governance, runner and documentation checks retain independent results. Node 22/24 formal package suite and `git diff --check` are selected. Release guard is omitted because no release is authorized. Managed sync, skill reinstallation and document remapping are outside this bounded restoration; original migration hashes remain unchanged.
- Restoration result: The tester independently verified the supplied source and missing destination, removed the unique `-ExecutionPolicy Bypass ` byte sequence in memory, and attempted `[IO.File]::WriteAllBytes($restoreDestination, $restoredBytes)` for the exact repository path. The write threw `Access to the path ... scripts/test-verification-policy.ps1 is denied`; the command exited 1. No alternate write method, filename, elevation or policy/security change was attempted. Cause is unverified.
- Post-failure observation: The coordinator independently confirmed at 2026-09-03 17:17 JST that the repository file was still absent and the supplied original retained the SHA-256 above. The tester created no owned file diff; the original tracked deletion remains unstaged. The restored runner was not executed under either runtime because no destination file was created.
- Status: Restoration is blocked by write denial. Comprehensive verification and migration acceptance remain incomplete; other independent gate results are recorded below. The original source and Git baseline remain available for comparison, not as an automatic retry or security-bypass authorization.

Each command below was invoked independently from the primary repository. The source paths and runtimes were reconfirmed in this restoration turn. Node suite invocations prepended their own runtime directory to the child-process PATH and restored PATH afterward; each wrapper returned the npm process exit code.

| Restoration check / command | Observed result | Exit |
| --- | --- | ---: |
| Byte-preserving source-minus-bypass `WriteAllBytes` attempt described above | Access denied; repository runner remains absent | 1 |
| `Test-Path -LiteralPath scripts/test-verification-policy.ps1` and `Get-FileHash` on the supplied desktop file | Destination absent; supplied source hash unchanged | 0 |
| `pwsh.exe -NoProfile -File scripts/check-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas` | Core 7.6.4: managed hashes, generated entry, nine gates, seven classes and two required runtime profiles valid; renderer result and exit 0 preserved | 0 |
| `pwsh.exe -NoProfile -File scripts/check-project-docs.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas` | Missing required runner; later documentation checks did not run | 1 |
| `powershell.exe -NoProfile -File scripts/check-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas` | Desktop 5.1.26100.9168: script loading rejected with UnauthorizedAccess before body execution | 1 |
| `powershell.exe -NoProfile -File scripts/check-project-docs.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas` | Desktop script loading rejected with UnauthorizedAccess before body execution | 1 |
| `C:\Program Files\nodejs\node.exe C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js test` (paths passed as separate quoted arguments) | Node 22.23.2: all ten maintained formal test files passed | 0 |
| `C:\Users\seven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js test` (paths passed as separate quoted arguments) | Node 24.19.0: all ten maintained formal test files passed | 0 |
| `verification-policy-negative-tests`, Core and Desktop | Not run: restoration failed and required file is absent | Not run |
| `git diff --check` | No whitespace errors; checkout line-ending warnings only | 0 |

The Node suites and Core managed-governance results remain valid across subsequent edits confined to this evidence under the policy's invalidation rules. Documentation and whitespace checks are rerun after the evidence update and reported in the final task response. Desktop failures above are retained as blocked evidence, not passing results; no bypass or repeated attempt is authorized by those failures. Independent read-only final review of the four owned Markdown changes found no actionable correction and independently confirmed the absent runner, unchanged desktop hash, unchanged HEAD, unstaged scope and preserved gates. The reviewer did not rerun executable checks; its review is not substitute test evidence. No restoration, runner compatibility, clean worktree, local commit or comprehensive acceptance is claimed.

## Repository Baseline

- cwd and Git top-level matched the primary repository.
- Baseline branch was main.
- Baseline worktree was clean.
- The only registered worktree was the primary repository.
- No linked worktree, alternate repository, network action, package code change, test change, tag, push, merge, publish, deployment, or real-data operation was used.

## Rule Inventory

| ID | Existing rule or evidence | Disposition and authoritative destination |
| --- | --- | --- |
| R001 | node_modules is ignored | Retained in .gitignore; development orientation in README |
| R002 | All Markdown was ignored by *.md | Rule retained; authoritative root, governance, and docs Markdown explicitly unignored in .gitignore |
| R003 | npm package excludes repository, logs, tests, lockfile, and other development files | Retained in .npmignore; package boundary in data-contract.md |
| R004 | Package name is @shisyamo4131/air-guard-v2-schemas | README, specification, data-contract.md |
| R005 | Existing version is 2.4.2-dev.164 | README and data-contract.md; stable policy remains open |
| R006 | Package is an ECMAScript module with root index.js | specification and data-contract.md |
| R007 | Public subpaths are root, ./constants, ./apis, and ./utils | README and data-contract.md |
| R008 | Package files include README.md but README was absent and ignored | README created; conflict preserved in this evidence |
| R009 | Peer dependencies are holiday_jp and air-firebase-v2 | specification and data-contract.md |
| R010 | jsconfig uses ESNext and bundler resolution | Existing jsconfig retained; environment boundary in specification |
| R011 | Publish workflow triggers on v*-dev.* tags | operations and ADR 0003 |
| R012 | Publish workflow uses Node 24 | Node 24 recorded as formal candidate, not sole supported runtime |
| R013 | Publish workflow runs npm ci and npm publish --tag dev | operations and ADR 0003; external execution requires approval |
| R014 | index.js is the public root export source | data-contract.md |
| R015 | constants are publicly re-exported | data-contract.md; complete constant compatibility inventory remains |
| R016 | utilities are publicly re-exported | data-contract.md; complete utility inventory remains |
| R017 | ./apis helpers invoke fetch methods and source marks them for future removal | specification open decision and data-contract compatibility question |
| R018 | Document models generally extend FireModel | specification and data-contract.md; inherited runtime compatibility remains open |
| R019 | Embedded values generally extend BaseClass | data-contract.md |
| R020 | classProps and defField carry defaults, validation, and metadata | specification and data-contract.md |
| R021 | Field definitions include AirVuetify-oriented component metadata | specification and data-contract compatibility question |
| R022 | Validation errors can carry code, English message, and localized messages | specification and data-contract.md |
| R023 | Date utilities and domain models use JST-oriented conversions | data-contract.md; formal behavior inventory remains |
| R024 | Package includes deterministic work-time, billing, insurance, and related calculations | specification in scope; full contract inventory remains |
| R025 | Firestore document models expose collectionPath conventions | data-contract.md; full collection inventory remains |
| R026 | Seven root JavaScript scripts are directly executable diagnostics | project rules and operations |
| R027 | test-error-definitions.js exits 1 at line 19 because detailedInvalidReasons is undefined | specification, operations, roadmap, and this evidence; not fixed |
| R028 | package.json defines no test script | operations and roadmap; formal runner remains open |
| R029 | Git tags use the 2.4.2-dev.N pattern | data-contract.md and specification open stable-version decision |
| R030 | No AGENTS, README, changelog, specification, ADR, roadmap, or operations source existed | Governance bootstrap document plan |
| R031 | Schemas is a durable shared package for multiple consumers | specification, project rules, ADR 0002 |
| R032 | Current required consumers are Nuxt Web and Firebase Cloud Functions at the same version/content | specification, data-contract.md, ADR 0002 |
| R033 | Package code/test writes and external actions have separate approval boundaries | project rules, specification, operations, ADR 0003 |
| R034 | Every task must use the primary repository without unapproved linked worktrees | project rules and operations |
| R035 | Instruction-chain changes require new non-forked tasks and user-controlled coordinator replacement | project rules and operations |
| R036 | Capacity aliases must resolve to persisted task/session measurement, not token or context estimates | docs/README.md and docs/runbooks/project-coordination.md |
| R037 | Capacity measurement requires the actual current task ID, exactly one match, and no newest-session inference | project rules, coordination runbook, and scripts/check-codex-session-size.ps1 |
| R038 | The per-session handoff threshold is 300 MiB and the separate Codex-wide reference warning is 10 GiB | project rules, coordination runbook, and measurement script |
| R039 | Capacity reports use the standard fields and fail closed without session-content exposure | coordination runbook, measurement script, operations, and project validator |
| R040 | Critical identifiers are confirmed only from a current-turn task-routed source or actual target with source, location or command, and value recorded | common governance 1.4.1, project rules, specification, operations, and coordination runbook |
| R041 | Chat history, summaries, memory, prompts, agent reports, and multiple-agent agreement are leads only | common governance 1.4.1, project rules, specification, ADR 0008, and initial prompt |
| R042 | Coordinator and delegated task independently verify critical identifiers before delegation or state change and stop without an application/package diff on conflict | project rules, operations, coordination runbook, ADR 0008, and validator |
| R043 | Published-artifact release/adoption verifies source or tag manifest, release evidence or registry metadata, and consumer manifest-lock name/version/resolved/integrity | docs/README.md, operations, coordination runbook, specification, and ADR 0008 |
| R044 | Unapproved network gaps leave remote freshness explicitly unverified and common-governance 1.4.1 requires all-affected-task turnover | common governance 1.4.1, project rules, operations, ADR 0008, current handoff, and validator |
| R045 | Verification selection is based on six impact classes and stable gate IDs rather than one unconditional command list | common governance 1.5.0, verification-policy.json, operations, ADR 0009, and initial prompt |
| R046 | Iteration, targeted regression, completion, and release-only stages remain distinct | verification-policy.json, operations, project rules, and ADR 0009 |
| R047 | Mixed changes use the union of selected gates and unknown impact uses the comprehensive fallback | common governance 1.5.0, verification-policy.json, operations, and initial prompt |
| R048 | Governance migration, managed sync, common-contract, permission/agent-policy, and build/release/deploy completion require comprehensive verification | common governance 1.5.0, verification-policy.json, operations, project rules, and ADR 0009 |
| R049 | Inclusion is acyclic, failures and later edits invalidate matching evidence, and omissions require a recorded reason | verification-policy.json, operations, managed validator, and negative policy tests |
| R050 | The generated operations summary must exactly match the project-owned JSON policy | verification-policy.json, operations, canonical sync, managed validator, and project validator |

- Inventory items: 50
- Mapped items: 50
- Explicitly retired items: 0
- Unmapped items: 0

## Existing Package Diagnostic Evidence

These commands ran during intake under Node v22.23.2. They are diagnostic, not Node 24 compatibility or formal completion evidence.

| Command | Exit | Result |
| --- | ---: | --- |
| node test-class-imports.js | 0 | Imports succeeded |
| node test-field-definitions.js | 0 | Diagnostic completed |
| node test-error-definitions.js | 1 | TypeError at line 19 because detailedInvalidReasons is undefined |
| node test-format-jst-date.js | 0 | Diagnostic completed |
| node test-refactored-date-formatting.js | 0 | 13 checks reported passing |
| node test-employee-insurance.js | 0 | Diagnostic completed |
| node test-validator-debug.js | 0 | Diagnostic completed |

Known impact: the validation-error integration diagnostic does not complete, so it does not prove the expected validation behavior. Product impact is unverified. The failure remains unmodified.

## Governance Validation Evidence

Every required command below was run independently. The local governance commit containing this evidence satisfies the final commit sub-gate; its exact hash is reported in the turnover handoff and remains available through Git history without a self-referential document edit.

| Command | Exit | Result |
| --- | ---: | --- |
| validate-skill.ps1 without SkillPath | 1 | Initial invocation error: the required SkillPath parameter was missing; no repository change |
| validate-skill.ps1 -SkillPath C:\Users\seven\.agents\skills\scaffold-project-governance | 0 | Skill is valid; shared PyYAML environment available |
| sync-project-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas -Apply | 0 | Generated AGENTS.md; common version 1.3.0; hashes current; AGENTS size 12,398 of 32,768 bytes |
| .\scripts\check-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas | 0 | Managed hashes, generated entry point, size, and project rules valid |
| .\scripts\render-governance.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas -Check | 0 | Generated AGENTS.md current; common SHA-256 d2cdb79f86e034a533e880ec7c4dddc51ca1e40bbeb16cfde497f1abf41d4e10 |
| .\scripts\check-project-docs.ps1 -ProjectPath C:\Users\seven\projects\AirGuard\air-guard-v2-schemas | 0 | Required documents, relative links, indexes, ADR statuses, TOML, roadmap arithmetic, and 35/35 rule mapping valid |
| git diff --check | 0 | No whitespace error; Git reported only the existing checkout-policy warning that .gitignore LF may become CRLF |

## Review Evidence

- The changed set contains only .gitignore and approved governance, documentation, configuration, and validator files.
- package implementation, tests, package.json, package-lock.json, and the publish workflow are unchanged.
- git status and git ls-files --others --exclude-standard confirmed that authoritative Markdown is visible for tracking.
- A diagnostic check-ignore wrapper exited 1 because git check-ignore reports matching negation rules as output; the direct status and untracked-file inventory provide the correct tracking evidence. This diagnostic was not a completion gate.
- The governance commit and clean post-commit worktree complete the final predefined five-point sub-gate.

## Approval Boundaries Preserved

This bootstrap does not authorize package implementation or test changes, the known failure fix, tag, push, main merge, history rewrite, npm publish, deployment, remote services, real-data operations, network access, or alternate worktrees.

## Coordinator Turnover Verification

- Date: 2026-08-26
- A replacement Schemas primary coordinator resumed from repository sources of truth using governance bootstrap commit `8e667da51938a7320f07ec48685113a008b290f5` as the baseline.
- Read-only checks confirmed that cwd and Git top-level were `C:\Users\seven\projects\AirGuard\air-guard-v2-schemas`, the branch was `codex/governance-bootstrap`, HEAD was the baseline commit, the worktree was clean, and the registry contained only the primary repository with no linked worktree.
- The replacement coordinator restored managed common-governance version 1.3.0 and SHA-256 `d2cdb79f86e034a533e880ec7c4dddc51ca1e40bbeb16cfde497f1abf41d4e10`, the active repository instruction sources, permissions, coordinator-owned Git integration, one-shot callback behavior, task turnover, and the 300 MiB coordinator session lifecycle.
- The durable cross-project roles remain the Schemas primary coordinator and each consumer project primary coordinator. This ownership boundary is not specific to one numbered consumer checkpoint.
- Package-code and test writes require an explicitly approved file and behavior scope. Tag creation, push, main merge, npm publish, deployment, remote-service operations, and real-data operations retain their separate explicit approval boundaries.
- The required no-change callback route succeeded without embedding temporary routing identifiers in durable documentation.
- Shared-package readiness remains at 25 percent, the package version remains `2.4.2-dev.164`, and the known `test-error-definitions.js` failure remains unmodified and separate from governance validation.
- After this file-limited local commit succeeds, ownership may retire from the former coordinator. Former task deletion remains a user-only action; Codex does not archive or delete it.

## Common-governance 1.4.0 Migration

- Date: 2026-08-28
- Owner-approved checkpoint: GOV14-SCHEMAS-01
- Program selection source: `25fb125a1a656b7a6906d11456f6c7f0a4050363`
- Pre-migration repository baseline: `bb2390997153b2e57470d0c04012d93ddde2f971`
- Installed skill inventory: 36 files; `validate-skill.ps1` exit 0 before migration
- Managed common-governance version: 1.4.0
- Managed common-governance SHA-256: `d2511f9c2fcb2a90ac43f8c168241fd7cc026da9db1f37b7c66daf10ebfc1d47`
- Project-owned additions: exact-task capacity aliases/routing, coordination runbook, 300 MiB per-session and separate 10 GiB Codex-wide thresholds, fail-closed session-size script, ADR 0006, current handoff/index, and validator regression coverage
- Product boundary: package runtime, public API, version, release workflow, and ten-file formal test inventory are unchanged
- Task boundary: every affected active Schemas task is replaced after the clean migration commit; replacements are new tasks in the primary directory and are never forks
- Former tasks remain unarchived and undeleted for user-controlled deletion

The exact migration commit, post-commit checks, replacement task ID/host, accepted no-change callback, and self-routing state are recorded in the latest handoff and the GOV14-SCHEMAS-01 completion callback rather than through a self-referential edit to this evidence.

## Common-governance 1.4.1 Migration

- Date: 2026-09-01
- Owner-approved checkpoint: GOV19-SCHEMAS-EVIDENCE-BOUND-SYNC-001
- Pre-migration repository baseline: `e9e40888a963776b8ba091f0ad1c315db8e9877c`
- Managed common-governance version: 1.4.1
- Managed common-governance SHA-256: `21e2be90d274a11001f788f78e647d7d537a45124baa731be5ccbadf89cd5eca`
- Project-owned additions: evidence-bound critical-identifier rules and routing, ADR 0008, current migration handoff, source/tag/release/consumer manifest-lock preflight, remote-freshness boundary, and validator coverage
- Inventory: 44 mapped items, 0 unmapped
- Product boundary: package runtime, API, schema, manifest, lock, version, tag, tests, workflow, release evidence, and consumer adoption are unchanged
- Progress boundary: Shared-package readiness remains 25 percent; no product/package milestone credit is added
- Task boundary: all affected active Schemas tasks require new non-forked replacements after the clean migration commit; PM（Schemas）-05 remains active until PM（Schemas）-06 activation succeeds
- Former tasks remain unarchived and undeleted for user-controlled deletion

The migration commit, post-commit Git state, independent validator exits, callback result, and replacement task metadata are reported outside this pre-commit evidence to avoid self-reference. Network access was not approved, so remote branch, workflow, registry, and dist-tag freshness remain unverified.

## Common-governance 1.5.0 Migration

- Date: 2026-09-01
- Owner-approved checkpoint: GOV20-SCHEMAS-GOVERNANCE-1.5.0-MIGRATION-001
- Pre-migration repository baseline: `9c3bf095d3d992734662282ebf92130d153f39c9`
- Canonical scaffold baseline: `de5b39e90ecf8c4f94d89dbc514c982b1652ba04`
- Managed common-governance version: 1.5.0
- Managed common-governance SHA-256: `0a13fc03273030594e4355dc3ec29b62ee1abb350311761de77154817fcaf6ac`
- Project-owned additions: verification-policy.json, six impact classes, stable staged gate IDs, comprehensive fallback, omission and invalidation records, generated operations summary, ADR 0009, negative policy tests, current handoff, and validator routing
- Inventory: 50 mapped items, 0 unmapped
- Product boundary: package implementation, API, schema, manifest, lock, version, tag, tests, workflow, release evidence, and consumer adoption remain unchanged
- Progress boundary: Shared-package readiness remains 25 percent; no product milestone credit is added
- Task boundary: PM（Schemas）-06 prepares PM（Schemas）-07 turnover, but creation or replacement requires later explicit user approval after coordinator review and local integration
- Former tasks remain unarchived and undeleted for user-controlled deletion

The independent comprehensive-suite exits, exact unstaged diff, omissions, worktree state, and callback delivery are reported to PM（SPG）-05. This migration performs no benchmark, network request, release action, or remote write.
