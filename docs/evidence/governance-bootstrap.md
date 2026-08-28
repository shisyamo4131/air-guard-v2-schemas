# Governance Bootstrap Evidence

- Status: Complete
- Date: 2026-08-26
- Baseline commit: bc941cb62d0965bda453a6f0dc6aaea8921db743
- Primary repository: C:\Users\seven\projects\AirGuard\air-guard-v2-schemas
- Approved branch: codex/governance-bootstrap
- Managed common-governance version: 1.3.0
- Rollback: return to the baseline commit through a separately approved non-destructive Git procedure; no history rewrite is authorized.

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

- Inventory items: 39
- Mapped items: 39
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
