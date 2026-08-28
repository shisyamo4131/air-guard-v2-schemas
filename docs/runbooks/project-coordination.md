# Project Coordination Runbook

## Session Capacity Routing

Treat each of these user instructions as the same task-capacity request and route here before answering:

- `容量チェック`
- `タスク容量確認`
- `セッション容量確認`
- `session size / handoff threshold確認`

These phrases refer to the persisted Codex task/session JSONL size, not the model token count or context window.

## Required Measurement

Identify the current Codex task ID from trusted task metadata. Never select the newest or most recently modified session file when parallel tasks may exist.

On Windows, run the project-local script with the current task ID:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-codex-session-size.ps1 -SessionId <current-task-id>
```

Record the command result and its independently observed exit status. The script must resolve exactly one session file for the supplied ID.

## Standard Report

Report all of the following without reading or displaying the session body:

- target task ID;
- resolved session file;
- session size in MiB;
- handoff threshold in MiB;
- usage percentage;
- `handoff_required`;
- Codex-wide reference size and 10 GiB warning threshold;
- total-scan completeness and error count;
- session measurement time and Codex-total measurement time/source;
- command result and independently observed exit status.

Propose task handoff only when `handoff_required` is `true`, which means the identified session reached the default 300 MiB threshold or a separately approved project threshold. When it is `false`, do not recommend task replacement based on age, token/context estimates, or guesswork.

## Stop and Error Contract

- If the current task ID cannot be established, stop and request the ID; do not guess.
- If the ID resolves to zero or multiple session files, report the count and nonzero exit status, then stop.
- If the script fails, report a concise error and its nonzero exit status, then stop without a handoff conclusion.
- If `codex_scan_complete` is `false`, report `codex_scan_error_count`; the session measurement may be reported, but do not claim the Codex-wide total is complete or use it for a cleanup or threshold decision.
- Never output session contents, prompts, credentials, secrets, or business data. Do not query or modify Codex-owned SQLite or WAL files as part of this check.
