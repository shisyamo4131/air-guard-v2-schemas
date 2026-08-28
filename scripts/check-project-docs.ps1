[CmdletBinding()]
param(
    [string]$ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$resolvedProject = (Resolve-Path -LiteralPath $ProjectPath).Path

$requiredFiles = @(
    'README.md',
    'AGENTS.md',
    'CHANGELOG.md',
    'INITIAL_PROMPT.md',
    'governance/common-governance.md',
    'governance/project-rules.md',
    'governance/governance.lock.toml',
    'docs/README.md',
    'docs/specification.md',
    'docs/data-contract.md',
    'docs/operations.md',
    'docs/runbooks/project-coordination.md',
    'docs/handoffs/README.md',
    'docs/handoffs/2026-08-28-governance-1.4.0-migration.md',
    'docs/roadmaps/README.md',
    'docs/roadmaps/shared-package-readiness.md',
    'docs/decisions/README.md',
    'docs/decisions/0001-shared-domain-boundary.md',
    'docs/decisions/0002-cross-project-ownership-and-versioned-integration.md',
    'docs/decisions/0003-release-and-rollback-approval-boundaries.md',
    'docs/decisions/0004-shared-role-permission-catalog.md',
    'docs/decisions/0005-company-configuration-v1.md',
    'docs/decisions/0006-governance-1-4-session-capacity-and-turnover.md',
    'docs/evidence/governance-bootstrap.md',
    'docs/evidence/release-2.4.2-dev.167.md',
    'scripts/check-codex-session-size.ps1',
    '.codex/config.toml',
    '.codex/agents/developer.toml',
    '.codex/agents/tester.toml',
    '.codex/agents/code-explorer.toml',
    '.codex/agents/docs-researcher.toml',
    '.codex/agents/reviewer.toml',
    '.codex/agents/release-operator.toml'
)

foreach ($relativePath in $requiredFiles) {
    $path = Join-Path $resolvedProject $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required project document or configuration is missing: $relativePath"
    }
}

$excludedPrefixes = @(
    (Join-Path $resolvedProject '.git'),
    (Join-Path $resolvedProject 'node_modules')
)
$markdownFiles = Get-ChildItem -LiteralPath $resolvedProject -Recurse -File -Filter '*.md' |
    Where-Object {
        $candidate = $_.FullName
        -not ($excludedPrefixes | Where-Object { $candidate.StartsWith($_, [StringComparison]::OrdinalIgnoreCase) })
    }

$brokenLinks = @()
$linkPattern = '\[[^\]]+\]\(([^)]+)\)'
foreach ($file in $markdownFiles) {
    $content = [IO.File]::ReadAllText($file.FullName)
    foreach ($match in [regex]::Matches($content, $linkPattern)) {
        $target = $match.Groups[1].Value.Trim()
        if ($target -match '^(https?://|mailto:|#)') {
            continue
        }
        $pathPart = ($target -split '#', 2)[0].Trim()
        $pathPart = $pathPart.Trim('<', '>')
        if (-not $pathPart) {
            continue
        }
        $decoded = [uri]::UnescapeDataString($pathPart)
        $candidate = Join-Path $file.DirectoryName ($decoded.Replace('/', [IO.Path]::DirectorySeparatorChar))
        if (-not (Test-Path -LiteralPath $candidate)) {
            $brokenLinks += "$($file.FullName): $target"
        }
    }
}
if ($brokenLinks.Count -gt 0) {
    throw ("Broken relative links:" + [Environment]::NewLine + ($brokenLinks -join [Environment]::NewLine))
}

$docsIndexPath = Join-Path $resolvedProject 'docs\README.md'
$docsIndex = [IO.File]::ReadAllText($docsIndexPath)
$requiredIndexLinks = @(
    'specification.md',
    'data-contract.md',
    'operations.md',
    'runbooks/project-coordination.md',
    'handoffs/README.md',
    'roadmaps/README.md',
    'decisions/README.md',
    'evidence/governance-bootstrap.md',
    'evidence/release-2.4.2-dev.167.md',
    '../CHANGELOG.md'
)
foreach ($requiredLink in $requiredIndexLinks) {
    if (-not $docsIndex.Contains($requiredLink)) {
        throw "docs/README.md does not route to required document: $requiredLink"
    }
}

$capacityAliases = @(
    '容量チェック',
    'タスク容量確認',
    'セッション容量確認',
    'session size / handoff threshold確認'
)
$coordinationPath = Join-Path $resolvedProject 'docs\runbooks\project-coordination.md'
$coordination = [IO.File]::ReadAllText($coordinationPath)
foreach ($alias in $capacityAliases) {
    if (-not $docsIndex.Contains($alias) -or -not $coordination.Contains($alias)) {
        throw "Capacity alias is not routed through both the documentation map and coordination runbook: $alias"
    }
}

$capacityScript = [IO.File]::ReadAllText((Join-Path $resolvedProject 'scripts\check-codex-session-size.ps1'))
$capacityScriptRequirements = @(
    "SessionId is required",
    'Expected exactly one session',
    '[long]$ThresholdBytes = 300MB',
    '[long]$TotalThresholdBytes = 10GB',
    'usage_percent',
    'selection = ''session_id'''
)
foreach ($requirement in $capacityScriptRequirements) {
    if (-not $capacityScript.Contains($requirement)) {
        throw "Capacity script requirement is missing: $requirement"
    }
}
if ($capacityScript.Contains('most_recently_updated') -or $capacityScript.Contains('Select-Object -First 1')) {
    throw 'Capacity script still contains newest-session inference.'
}

$projectRules = [IO.File]::ReadAllText((Join-Path $resolvedProject 'governance\project-rules.md'))
if (-not $projectRules.Contains('Managed common-governance version: 1.4.0')) {
    throw 'Project rules do not declare managed common-governance version 1.4.0.'
}

$decisionsRoot = Join-Path $resolvedProject 'docs\decisions'
$decisionIndex = [IO.File]::ReadAllLines((Join-Path $decisionsRoot 'README.md'))
$adrFiles = Get-ChildItem -LiteralPath $decisionsRoot -File -Filter '0*.md'
foreach ($adr in $adrFiles) {
    $content = [IO.File]::ReadAllText($adr.FullName)
    $statusMatch = [regex]::Match($content, '(?m)^- Status:\s*(Proposed|Accepted|Rejected|Superseded)\s*$')
    if (-not $statusMatch.Success) {
        throw "ADR status is missing or invalid: $($adr.Name)"
    }
    $id = $adr.BaseName.Substring(0, 4)
    $indexLine = $decisionIndex | Where-Object { $_.Contains("[$id]($($adr.Name))") }
    if (@($indexLine).Count -ne 1) {
        throw "ADR index entry missing or duplicated: $($adr.Name)"
    }
    if (-not $indexLine.Contains("| $($statusMatch.Groups[1].Value) |")) {
        throw "ADR index status differs from ADR body: $($adr.Name)"
    }
}

$roadmapPath = Join-Path $resolvedProject 'docs\roadmaps\shared-package-readiness.md'
$roadmap = [IO.File]::ReadAllText($roadmapPath)
$roadmapLines = [IO.File]::ReadAllLines($roadmapPath)
$weightTotal = 0
$earnedTotal = 0
foreach ($line in $roadmapLines) {
    $row = [regex]::Match($line, '^\|\s*[^|]+\|\s*(\d+)\s*\|\s*(\d+)\s*\|')
    if ($row.Success) {
        $weightTotal += [int]$row.Groups[1].Value
        $earnedTotal += [int]$row.Groups[2].Value
    }
}
if ($weightTotal -ne 100) {
    throw "Roadmap milestone weights total $weightTotal instead of 100."
}
$progressMatch = [regex]::Match($roadmap, '(?m)^- Current progress:\s*(\d+)%\s*$')
if (-not $progressMatch.Success) {
    throw 'Roadmap current progress is missing.'
}
$progress = [int]$progressMatch.Groups[1].Value
if ($progress -ne $earnedTotal) {
    throw "Roadmap current progress $progress does not equal earned points $earnedTotal."
}
$roadmapIndex = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs\roadmaps\README.md'))
if (-not $roadmapIndex.Contains("| Shared-package readiness | $progress% |")) {
    throw 'Roadmap index progress differs from the roadmap.'
}

$evidence = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs\evidence\governance-bootstrap.md'))
$inventoryMatch = [regex]::Match($evidence, '(?m)^- Inventory items:\s*(\d+)\s*$')
$mappedMatch = [regex]::Match($evidence, '(?m)^- Mapped items:\s*(\d+)\s*$')
if (-not $inventoryMatch.Success -or -not $mappedMatch.Success) {
    throw 'Governance evidence does not declare inventory and mapped counts.'
}
if ($inventoryMatch.Groups[1].Value -ne $mappedMatch.Groups[1].Value) {
    throw 'Governance rule inventory count does not equal mapped count.'
}
if ($evidence -notmatch '(?m)^- Unmapped items:\s*0\s*$') {
    throw 'Governance rule inventory has unmapped items or lacks the zero-unmapped declaration.'
}
if (-not $evidence.Contains('bc941cb62d0965bda453a6f0dc6aaea8921db743')) {
    throw 'Governance evidence does not contain the approved baseline commit.'
}
if (-not $evidence.Contains('test-error-definitions.js') -or -not $evidence.Contains('detailedInvalidReasons')) {
    throw 'Governance evidence does not preserve the known diagnostic failure.'
}

$pythonCommand = Get-Command python -ErrorAction Stop
$tomlScript = @'
import pathlib
import sys
import tomllib

root = pathlib.Path(sys.argv[1])
config_path = root / ".codex" / "config.toml"
with config_path.open("rb") as stream:
    config = tomllib.load(stream)
agents_config = config.get("agents", {})
if agents_config.get("enabled") is not True:
    raise SystemExit("agents.enabled must be true")
maximum = agents_config.get("max_concurrent_threads_per_session")
if not isinstance(maximum, int) or maximum < 1 or maximum > 4:
    raise SystemExit("max_concurrent_threads_per_session must be between 1 and 4")

expected = {
    "developer": "workspace-write",
    "tester": "workspace-write",
    "code-explorer": "read-only",
    "docs-researcher": "read-only",
    "reviewer": "read-only",
    "release-operator": "read-only",
}
for stem, sandbox in expected.items():
    path = root / ".codex" / "agents" / f"{stem}.toml"
    with path.open("rb") as stream:
        agent = tomllib.load(stream)
    for key in ("name", "description", "developer_instructions"):
        if not isinstance(agent.get(key), str) or not agent[key].strip():
            raise SystemExit(f"{path}: missing non-empty {key}")
    if agent.get("sandbox_mode") != sandbox:
        raise SystemExit(f"{path}: expected sandbox_mode {sandbox}")
    if "model" in agent:
        raise SystemExit(f"{path}: model must remain unpinned")
print(f"Validated {1 + len(expected)} TOML files.")
'@
& $pythonCommand.Source -c $tomlScript $resolvedProject
if ($LASTEXITCODE -ne 0) {
    throw "TOML validation failed with exit code $LASTEXITCODE."
}

[pscustomobject]@{
    project_path = $resolvedProject
    markdown_files_checked = @($markdownFiles).Count
    relative_links_current = $true
    index_coverage_current = $true
    adr_statuses_current = $true
    roadmap_weight_total = $weightTotal
    roadmap_earned_total = $earnedTotal
    rule_inventory_items = [int]$inventoryMatch.Groups[1].Value
    unmapped_rule_items = 0
    toml_files_current = $true
    capacity_routing_current = $true
}
