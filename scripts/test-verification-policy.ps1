[CmdletBinding()]
param(
    [string]$ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$resolvedProject = (Resolve-Path -LiteralPath $ProjectPath).Path
$policyPath = Join-Path $resolvedProject 'governance\verification-policy.json'
$source = [IO.File]::ReadAllText($policyPath) | ConvertFrom-Json
$utf8 = [Text.UTF8Encoding]::new($false)
$runtimeExecutable = Join-Path $PSHOME $(if ($PSVersionTable.PSEdition -eq 'Desktop') { 'powershell.exe' } else { 'pwsh.exe' })
if (-not (Test-Path -LiteralPath $runtimeExecutable -PathType Leaf)) { throw "Runtime executable is missing: $runtimeExecutable" }

# Fixture inputs only: no .git, package, consumer, installs, or declared gate execution.
$fixtureFiles = @(
    'AGENTS.md', 'governance\common-governance.md', 'governance\project-rules.md',
    'governance\governance.lock.toml', 'governance\verification-policy.json',
    'references\task-turnover-contract.md', 'scripts\render-governance.ps1',
    'scripts\check-governance.ps1', 'docs\operations.md'
)
foreach ($relativePath in $fixtureFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $resolvedProject $relativePath) -PathType Leaf)) {
        throw "Required fixture source is missing: $relativePath"
    }
}

function Invoke-ManagedValidator([string]$FixturePath) {
    $validatorLiteral = (Join-Path $FixturePath 'scripts\check-governance.ps1').Replace("'", "''")
    $projectLiteral = $FixturePath.Replace("'", "''")
    $command = "`$ErrorActionPreference = 'Stop'; try { `$result = & '$validatorLiteral' -ProjectPath '$projectLiteral'; `$result | ConvertTo-Json -Depth 10 -Compress; exit 0 } catch { [Console]::Error.WriteLine(`$_.Exception.Message); exit 1 }"
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $runtimeExecutable
    $startInfo.Arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ' + [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($command))
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        if (-not $process.Start()) { throw 'Could not start the managed validator process.' }
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return [pscustomobject]@{
            exit_status = $process.ExitCode
            stdout = $stdoutTask.GetAwaiter().GetResult()
            stderr = $stderrTask.GetAwaiter().GetResult()
        }
    } finally {
        $process.Dispose()
    }
}

function Assert-Rejected([string]$Name, [string]$ExpectedError, [scriptblock]$Mutation) {
    $candidate = ($source | ConvertTo-Json -Depth 30) | ConvertFrom-Json
    & $Mutation $candidate
    [IO.File]::WriteAllText($fixturePolicyPath, ($candidate | ConvertTo-Json -Depth 30), $utf8)
    $result = Invoke-ManagedValidator $fixtureRoot
    if ($result.exit_status -ne 1 -or $result.stderr.Trim() -ne $ExpectedError) {
        throw "Negative case '$Name' did not fail for its intended reason. Expected exit 1 / '$ExpectedError'; actual exit $($result.exit_status) / '$($result.stderr.Trim())'; stdout: $($result.stdout)"
    }
    return [pscustomobject]@{ case = $Name; rejected = $true; exit_status = $result.exit_status; expected_error = $ExpectedError }
}

$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\', '/')
$fixtureRoot = Join-Path $tempRoot ('schemas-verification-policy-' + [Guid]::NewGuid().ToString('N'))
$fixturePolicyPath = Join-Path $fixtureRoot 'governance\verification-policy.json'
$results = @()
try {
    [void](New-Item -ItemType Directory -Path $fixtureRoot)
    foreach ($relativePath in $fixtureFiles) {
        $destination = Join-Path $fixtureRoot $relativePath
        [void](New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force)
        Copy-Item -LiteralPath (Join-Path $resolvedProject $relativePath) -Destination $destination
    }

    # Require a successful actual validator baseline before negative mutations.
    $positive = Invoke-ManagedValidator $fixtureRoot
    if ($positive.exit_status -ne 0 -or -not [string]::IsNullOrWhiteSpace($positive.stderr)) {
        throw "Positive managed-validator fixture failed: exit $($positive.exit_status); $($positive.stderr); $($positive.stdout)"
    }
    $positiveEvidence = $positive.stdout | ConvertFrom-Json
    if ($positiveEvidence.managed_hashes_current -ne $true -or $positiveEvidence.generated_agents_current -ne $true -or
        $positiveEvidence.renderer_check_exit_status -ne 0 -or $positiveEvidence.verification_gate_count -ne 9 -or
        $positiveEvidence.verification_class_count -ne 7 -or $positiveEvidence.runtime_profile_count -ne 2 -or
        $positiveEvidence.required_runtime_profile_count -ne 2 -or $positiveEvidence.verification_documentation_aligned -ne $true) {
        throw "Positive fixture did not preserve the expected managed validation evidence: $($positive.stdout)"
    }
    $expectedComprehensive = @('managed-governance', 'generated-governance', 'verification-policy-negative-tests', 'project-docs', 'package-suite', 'git-whitespace')
    if (@(Compare-Object $expectedComprehensive @($source.comprehensiveGateIds)).Count -ne 0) {
        throw 'The project comprehensive six-gate set changed unexpectedly.'
    }

    $results = @(
        Assert-Rejected 'duplicate-gate-id' 'Duplicate verification gate ID: managed-governance' { param($p) $p.gates[1].id = 'managed-governance' }
        Assert-Rejected 'unknown-class-reference' 'Verification class documentation-only references unknown gate ID: missing-gate' { param($p) ($p.classes | Where-Object id -eq 'documentation-only').completionGateIds = @('missing-gate') }
        Assert-Rejected 'unknown-included-gate' 'Unknown included verification gate ID: missing-gate' { param($p) ($p.gates | Where-Object id -eq 'managed-governance').includes = @('missing-gate') }
        Assert-Rejected 'cyclic-inclusion' 'Cyclic verification gate inclusion: generated-governance' { param($p) ($p.gates | Where-Object id -eq 'generated-governance').includes = @('generated-governance') }
        Assert-Rejected 'unknown-comprehensive-gate' 'Comprehensive verification gate is not a valid completion gate: missing-gate' { param($p) $p.comprehensiveGateIds = @('missing-gate') }
        Assert-Rejected 'invalid-stage' 'Unknown verification stage for managed-governance: diagnostic' { param($p) ($p.gates | Where-Object id -eq 'managed-governance').stages = @('diagnostic') }
        Assert-Rejected 'missing-metadata-class' 'Required verification class is missing: project-guidance-metadata' { param($p) $p.classes = @($p.classes | Where-Object id -ne 'project-guidance-metadata') }
        Assert-Rejected 'missing-runtime-profiles' 'Verification policy root lacks required property: runtimeProfiles' { param($p) $p.PSObject.Properties.Remove('runtimeProfiles') }
        Assert-Rejected 'empty-runtime-profiles' 'Verification policy must declare at least one runtime profile and one required runtime profile.' { param($p) $p.runtimeProfiles = @() }
        Assert-Rejected 'no-required-runtime' 'Verification policy must declare at least one runtime profile and one required runtime profile.' { param($p) foreach ($profile in $p.runtimeProfiles) { $profile.required = $false } }
        Assert-Rejected 'unsupported-required-runtime' ('Required runtime profile is not a supported Windows compatibility target: ' + $source.runtimeProfiles[0].id) { param($p) $p.runtimeProfiles[0].supportStatus = 'unverified' }
        Assert-Rejected 'unknown-impact-drops-comprehensive' 'Unknown-impact fallback does not include comprehensive gate: package-suite' { param($p) $p.unknownImpactGateIds = @($p.unknownImpactGateIds | Where-Object { $_ -ne 'package-suite' }) }
        Assert-Rejected 'governance-drops-comprehensive' 'Governance completion does not include comprehensive gate: package-suite' { param($p) $class = $p.classes | Where-Object id -eq 'governance-permissions-agents'; $class.completionGateIds = @($class.completionGateIds | Where-Object { $_ -ne 'package-suite' }) }
        Assert-Rejected 'release-drops-comprehensive' 'Build/release/deploy completion does not include comprehensive gate: package-suite' { param($p) $class = $p.classes | Where-Object id -eq 'build-release-deploy'; $class.completionGateIds = @($class.completionGateIds | Where-Object { $_ -ne 'package-suite' }) }
        Assert-Rejected 'generated-summary-drift' 'Generated verification-policy summary in docs/operations.md does not match governance/verification-policy.json.' { param($p) $p.classes[0].omissionRecord += ' (intentional fixture drift)' }
    )
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        $resolvedFixture = (Resolve-Path -LiteralPath $fixtureRoot).Path
        $expectedFixture = [IO.Path]::GetFullPath($fixtureRoot)
        if ($resolvedFixture -ne $expectedFixture -or
            -not $resolvedFixture.StartsWith($tempRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or
            (Split-Path -Leaf $resolvedFixture) -notmatch '^schemas-verification-policy-[0-9a-f]{32}$') {
            throw "Refusing cleanup outside the exact temporary fixture: $resolvedFixture"
        }
        Remove-Item -LiteralPath $resolvedFixture -Recurse -Force
    }
}

[pscustomobject]@{
    policy_path = $policyPath
    runtime_executable = $runtimeExecutable
    runtime_version = $PSVersionTable.PSVersion.ToString()
    runtime_edition = $PSVersionTable.PSEdition
    positive_policy_valid = $true
    positive_exit_status = $positive.exit_status
    positive_managed_evidence = $positiveEvidence
    negative_cases = $results.Count
    negative_results = $results
    all_negative_cases_rejected_for_expected_reason = $true
    fixture_removed = -not (Test-Path -LiteralPath $fixtureRoot)
} | ConvertTo-Json -Depth 10
