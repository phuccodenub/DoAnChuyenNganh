param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ApiVersion = "v1.2.0"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonPost {
    param(
        [string]$Url,
        [hashtable]$Body
    )
    $json = $Body | ConvertTo-Json -Compress
    return Invoke-RestMethod -Uri $Url -Method POST -Body $json -ContentType "application/json"
}

function Test-Login {
    param(
        [string]$Email,
        [string]$Password,
        [string]$ExpectedRole
    )
    $url = "$BaseUrl/api/$ApiVersion/auth/login"
    try {
        $resp = Invoke-JsonPost -Url $url -Body @{ email = $Email; password = $Password }
        $ok = $resp.success -and $resp.data -and $resp.data.tokens -and $resp.data.user
        if (-not $ok) {
            Write-Host ("  ❌ Login failed for {0} (no tokens/user)" -f $Email) -ForegroundColor Red
            return $false
        }
        $role = $resp.data.user.role
        if ($ExpectedRole -and ($role -ne $ExpectedRole)) {
            Write-Host ("  ❌ Login role mismatch for {0}: expected {1}, got {2}" -f $Email, $ExpectedRole, $role) -ForegroundColor Red
            return $false
        }
        Write-Host ("  ✅ Login OK for {0} (role: {1})" -f $Email, $role) -ForegroundColor Green
        return $true
    } catch {
        $msg = $_.Exception.Message
        try {
            $respStream = $_.Exception.Response.GetResponseStream()
            if ($respStream) {
                $reader = New-Object System.IO.StreamReader($respStream)
                $msg = $reader.ReadToEnd()
            }
        } catch {}
        Write-Host ("  ❌ Login failed for {0}: {1}" -f $Email, $msg) -ForegroundColor Red
        return $false
    }
}

Write-Host "\n🔐 Role-based login checks" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$passed = 0
$failed = 0

if (Test-Login -Email "admin@example.com" -Password "Admin123!" -ExpectedRole "admin") { $passed++ } else { $failed++ }
if (Test-Login -Email "instructor1@example.com" -Password "Instructor123!" -ExpectedRole "instructor") { $passed++ } else { $failed++ }
if (Test-Login -Email "student1@example.com" -Password "Student123!" -ExpectedRole "student") { $passed++ } else { $failed++ }

$color = if ($failed -eq 0) { 'Green' } else { 'Yellow' }
Write-Host "\nSummary: $passed passed, $failed failed" -ForegroundColor $color
if ($failed -gt 0) { exit 1 } else { exit 0 }
