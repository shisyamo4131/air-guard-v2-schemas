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
    'governance/verification-policy.json',
    'governance/governance.lock.toml',
    'docs/README.md',
    'docs/specification.md',
    'docs/data-contract.md',
    'docs/operations.md',
    'docs/runbooks/project-coordination.md',
    'docs/handoffs/README.md',
    'docs/handoffs/2026-08-28-governance-1.4.0-migration.md',
    'docs/handoffs/2026-09-01-governance-1.4.1-migration.md',
    'docs/handoffs/2026-09-01-governance-1.5.0-migration.md',
    'docs/roadmaps/README.md',
    'docs/roadmaps/shared-package-readiness.md',
    'docs/decisions/README.md',
    'docs/decisions/0001-shared-domain-boundary.md',
    'docs/decisions/0002-cross-project-ownership-and-versioned-integration.md',
    'docs/decisions/0003-release-and-rollback-approval-boundaries.md',
    'docs/decisions/0004-shared-role-permission-catalog.md',
    'docs/decisions/0005-company-configuration-v1.md',
    'docs/decisions/0006-governance-1-4-session-capacity-and-turnover.md',
    'docs/decisions/0007-legacy-stripe-schema-scaffold-removal.md',
    'docs/decisions/0008-evidence-bound-critical-identifiers.md',
    'docs/decisions/0009-impact-based-verification-selection.md',
    'docs/evidence/governance-bootstrap.md',
    'docs/evidence/governance-3.0.0-document-plan.json',
    'docs/evidence/governance-3.0.0-rule-inventory.json',
    'docs/decisions/0010-common-governance-3-and-document-authority.md',
    'references/document-migration-contract.md',
    'references/task-turnover-contract.md',
    'docs/evidence/release-2.4.2-dev.167.md',
    'docs/evidence/release-3.0.0-dev.1.md',
    'scripts/check-codex-session-size.ps1',
    'scripts/test-verification-policy.ps1',
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
    'evidence/release-3.0.0-dev.1.md',
    '../references/document-migration-contract.md',
    '../references/task-turnover-contract.md',
    'evidence/governance-3.0.0-document-plan.json',
    'evidence/governance-3.0.0-rule-inventory.json',
    '../CHANGELOG.md'
)
foreach ($requiredLink in $requiredIndexLinks) {
    if (-not $docsIndex.Contains($requiredLink)) {
        throw "docs/README.md does not route to required document: $requiredLink"
    }
}

$capacityAliases = @(
    ([regex]::Unescape('\u5bb9\u91cf\u30c1\u30a7\u30c3\u30af')),
    ([regex]::Unescape('\u30bf\u30b9\u30af\u5bb9\u91cf\u78ba\u8a8d')),
    ([regex]::Unescape('\u30bb\u30c3\u30b7\u30e7\u30f3\u5bb9\u91cf\u78ba\u8a8d')),
    ([regex]::Unescape('session size / handoff threshold\u78ba\u8a8d'))
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
$lockText = [IO.File]::ReadAllText((Join-Path $resolvedProject 'governance/governance.lock.toml')).Replace("`r`n", "`n").Replace("`r", "`n")
$versionMatch = [regex]::Match($lockText, '(?m)^common_governance_version = "([^"]+)"$')
if (-not $versionMatch.Success) { throw 'Managed version is missing from the governance lock.' }
$managedVersion = $versionMatch.Groups[1].Value
$agentsText = [IO.File]::ReadAllText((Join-Path $resolvedProject 'AGENTS.md'))
if (-not $projectRules.Contains("Managed common-governance version: $managedVersion") -or
    -not $agentsText.Contains("Common governance version: $managedVersion")) {
    throw 'Project rules, generated entrypoint and governance lock versions disagree.'
}

$operations = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs\operations.md'))
$initialPrompt = [IO.File]::ReadAllText((Join-Path $resolvedProject 'INITIAL_PROMPT.md'))
$evidenceBoundRequirements = @(
    'critical identifier',
    'current turn',
    'task-routed',
    'actual target',
    'source, location or command, and value',
    'application or package diff',
    'source or tag manifest',
    'consumer manifest or lock',
    'remote freshness'
)
foreach ($requirement in $evidenceBoundRequirements) {
    foreach ($surface in @(
        @{ Name = 'governance/project-rules.md'; Content = $projectRules },
        @{ Name = 'docs/operations.md'; Content = $operations },
        @{ Name = 'docs/runbooks/project-coordination.md'; Content = $coordination }
    )) {
        if ($surface.Content.IndexOf($requirement, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "$($surface.Name) does not contain evidence-bound requirement: $requirement"
        }
    }
}

foreach ($requirement in @('critical identifier', 'current turn', 'task-routed', 'actual target', 'source or tag manifest', 'consumer manifest or lock', 'remote freshness')) {
    if ($docsIndex.IndexOf($requirement, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw "docs/README.md does not route evidence-bound requirement: $requirement"
    }
    if ($initialPrompt.IndexOf($requirement, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw "INITIAL_PROMPT.md does not preserve evidence-bound requirement: $requirement"
    }
}

$specification = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs\specification.md'))
if (-not $specification.Contains('Specification version: 1.0.3')) {
    throw 'Specification version is not the approved 1.0.3 governance patch.'
}

$handoffIndex = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs\handoffs\README.md'))
foreach ($historicalName in @(
    '2026-08-28-governance-1.4.0-migration.md',
    '2026-09-01-governance-1.4.1-migration.md',
    '2026-09-01-governance-1.5.0-migration.md'
)) {
    if (-not $handoffIndex.Contains($historicalName)) {
        throw "Historical handoff is not indexed: $historicalName"
    }
}
if (-not $handoffIndex.Contains('historical evidence only') -or -not $handoffIndex.Contains('not current routing')) {
    throw 'Handoff index must distinguish historical evidence from current routing.'
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
$inventoryRows = [regex]::Matches($evidence, '(?m)^\| R\d{3} \|')
if ($inventoryRows.Count -ne [int]$inventoryMatch.Groups[1].Value) {
    throw "Governance rule inventory declares $($inventoryMatch.Groups[1].Value) items but contains $($inventoryRows.Count) rule rows."
}
if ($evidence -notmatch '(?m)^- Unmapped items:\s*0\s*$') {
    throw 'Governance rule inventory has unmapped items or lacks the zero-unmapped declaration.'
}
if (-not $evidence.Contains('bc941cb62d0965bda453a6f0dc6aaea8921db743')) {
    throw 'Governance evidence does not contain the approved baseline commit.'
}
if (-not $evidence.Contains('test-error-definitions.js') -or -not $evidence.Contains('detailedInvalidReasons')) {
    throw 'Governance evidence does not preserve the historical diagnostic failure.'
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


foreach ($requirement in @('common-governance 1.5.0', 'verification-policy.json', 'six impact classes', '50 mapped items', '0 unmapped')) {
    if ($evidence.IndexOf($requirement, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw "Governance evidence does not preserve verification-selection migration requirement: $requirement"
    }
}

foreach ($requirement in @('governance/verification-policy.json', 'mixed changes', 'unknown impact', 'comprehensive suite', 'omissions', 'invalidated')) {
    if ($initialPrompt.IndexOf($requirement, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw "INITIAL_PROMPT.md does not preserve verification-selection requirement: $requirement"
    }
}

# Document mapping is content-free evidence, never a replacement task ledger.
function Get-NormalizedDocumentHash([string]$Path) {
    $text = [IO.File]::ReadAllText($Path).Replace("`r`n", "`n").Replace("`r", "`n")
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($text)))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
$documentHash = Get-NormalizedDocumentHash (Join-Path $resolvedProject 'references/document-migration-contract.md')
if ($documentHash -ne 'aa0a8d53995881c042229d70336dd936e46e252124d9477b33550b4cab24b3e3') {
    throw 'Document migration 1.0.1 snapshot differs from the approved source.'
}
$migrationPlan = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs/evidence/governance-3.0.0-document-plan.json')) | ConvertFrom-Json
$ruleInventory = [IO.File]::ReadAllText((Join-Path $resolvedProject 'docs/evidence/governance-3.0.0-rule-inventory.json')) | ConvertFrom-Json
if ($migrationPlan.contract_version -ne '1.0.1' -or $migrationPlan.source_shape -ne 'standard_split' -or
    $migrationPlan.target_shape -ne 'standard_split' -or $migrationPlan.rollback.mode -ne 'whole_change' -or
    $migrationPlan.rollback.baseline_required -ne $true -or
    $migrationPlan.rollback.baseline_commit -ne $ruleInventory.baseline_commit) {
    throw 'Document plan contract, shape, rollback or baseline is inconsistent.'
}
if (@($migrationPlan.units).Count -ne 47 -or @($ruleInventory.supplemental_units).Count -ne 169 -or
    $ruleInventory.core_unit_count -ne 47 -or $ruleInventory.supplemental_unit_count -ne 169 -or
    $ruleInventory.mapped_supplemental_units -ne 169 -or $ruleInventory.unmapped_units -ne 0) {
    throw 'Current migration inventory counts are inconsistent.'
}
$mappedKeys = @{}
foreach ($unit in @($migrationPlan.units) + @($ruleInventory.supplemental_units)) {
    $key = "$($unit.source_path)#$($unit.unit_id)"
    if ($mappedKeys.ContainsKey($key)) { throw "Duplicate document inventory unit: $key" }
    $mappedKeys[$key] = $unit
    if ($unit.content_sha256 -notmatch '^[0-9a-f]{64}$' -or $unit.mapping_status -ne 'mapped' -or
        $unit.disposition -ne 'retain' -or $unit.source_path -ne $unit.target_path -or
        [string]::IsNullOrWhiteSpace($unit.rationale) -or [string]::IsNullOrWhiteSpace($unit.authority_id)) {
        throw "Incomplete document inventory mapping: $key"
    }
    if ([IO.Path]::IsPathRooted($unit.target_path) -or ($unit.target_path.Replace('\', '/') -split '/') -contains '..' -or
        -not (Test-Path -LiteralPath (Join-Path $resolvedProject $unit.target_path) -PathType Leaf)) {
        throw "Unsafe or missing mapped document target: $key"
    }
}
foreach ($amendment in @($ruleInventory.core_semantic_amendments)) {
    $key = "$($amendment.source_path)#$($amendment.unit_id)"
    if (-not $mappedKeys.ContainsKey($key) -or $amendment.content_sha256 -ne $mappedKeys[$key].content_sha256 -or
        [string]::IsNullOrWhiteSpace($amendment.rationale)) { throw "Unbound semantic amendment: $key" }
}
foreach ($unit in @($ruleInventory.core_semantic_amendments) + @($ruleInventory.supplemental_units)) {
    foreach ($paragraph in @($unit.changed_paragraphs)) {
        if ($paragraph.content_sha256 -notmatch '^[0-9a-f]{64}$' -or $paragraph.ordinal -lt 1 -or
            [string]::IsNullOrWhiteSpace($paragraph.disposition) -or [string]::IsNullOrWhiteSpace($paragraph.rationale)) {
            throw "Incomplete semantic paragraph mapping: $($unit.source_path)#$($unit.unit_id)"
        }
    }
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
    evidence_bound_routing_current = $true
    historical_handoff_records = 3
    managed_governance_version = $managedVersion
    document_contract_hash_current = $true
    core_migration_units = @($migrationPlan.units).Count
    supplemental_migration_units = @($ruleInventory.supplemental_units).Count
}
