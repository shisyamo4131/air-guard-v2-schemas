[CmdletBinding()]
param(
    [string]$ProjectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$policyPath = Join-Path (Resolve-Path -LiteralPath $ProjectPath).Path 'governance\verification-policy.json'
$source = [IO.File]::ReadAllText($policyPath) | ConvertFrom-Json -Depth 20

function Copy-Policy($Policy) {
    return (($Policy | ConvertTo-Json -Depth 20) | ConvertFrom-Json -Depth 20)
}

function Test-Policy($Policy) {
    $gateIds = @{}
    $allowedStages = @('iteration', 'targeted', 'completion', 'release')
    foreach ($gate in @($Policy.gates)) {
        if ($gateIds.ContainsKey([string]$gate.id)) { throw "duplicate gate: $($gate.id)" }
        $gateIds[[string]$gate.id] = @($gate.includes)
        foreach ($stage in @($gate.stages)) {
            if ($allowedStages -notcontains $stage) { throw "invalid stage: $stage" }
        }
    }
    foreach ($class in @($Policy.classes)) {
        foreach ($property in @('iterationGateIds', 'targetedRegressionGateIds', 'completionGateIds', 'releaseOnlyGateIds', 'omittableGateIds')) {
            foreach ($gateId in @($class.$property)) {
                if (-not $gateIds.ContainsKey([string]$gateId)) { throw "unknown class gate: $gateId" }
            }
        }
    }
    foreach ($gateId in @($Policy.comprehensiveGateIds) + @($Policy.unknownImpactGateIds)) {
        if (-not $gateIds.ContainsKey([string]$gateId)) { throw "unknown comprehensive gate: $gateId" }
    }
    $visited = @{}
    $visiting = @{}
    function Visit([string]$GateId) {
        if ($visiting.ContainsKey($GateId)) { throw "cycle: $GateId" }
        if ($visited.ContainsKey($GateId)) { return }
        $visiting[$GateId] = $true
        foreach ($included in @($gateIds[$GateId])) {
            if (-not $gateIds.ContainsKey([string]$included)) { throw "unknown included gate: $included" }
            Visit ([string]$included)
        }
        $visiting.Remove($GateId)
        $visited[$GateId] = $true
    }
    foreach ($gateId in @($gateIds.Keys)) { Visit $gateId }
}

function Assert-Rejected([string]$Name, [scriptblock]$Mutation) {
    $candidate = Copy-Policy $source
    & $Mutation $candidate
    try {
        Test-Policy $candidate
    } catch {
        return [pscustomobject]@{ case = $Name; rejected = $true }
    }
    throw "Negative verification-policy case was accepted: $Name"
}

Test-Policy $source
$results = @(
    Assert-Rejected 'duplicate-gate-id' { param($p) $p.gates[1].id = $p.gates[0].id }
    Assert-Rejected 'unknown-class-reference' { param($p) $p.classes[0].completionGateIds = @('missing-gate') }
    Assert-Rejected 'unknown-included-gate' { param($p) $p.gates[0].includes = @('missing-gate') }
    Assert-Rejected 'cyclic-inclusion' { param($p) $p.gates[1].includes = @($p.gates[0].id) }
    Assert-Rejected 'unknown-comprehensive-gate' { param($p) $p.comprehensiveGateIds = @('missing-gate') }
    Assert-Rejected 'invalid-stage' { param($p) $p.gates[0].stages = @('diagnostic') }
)

[pscustomobject]@{
    policy_path = $policyPath
    positive_policy_valid = $true
    negative_cases = $results.Count
    all_negative_cases_rejected = $true
}
