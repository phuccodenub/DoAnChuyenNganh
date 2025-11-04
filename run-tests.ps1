# Comprehensive Backend Test Runner
# Auto-executes all test phases

$ErrorActionPreference = "Continue"
$testResults = @()
$passCount = 0
$failCount = 0

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧪 LMS BACKEND COMPREHENSIVE TEST SUITE 🧪           ║" -ForegroundColor Cyan  
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Helper function
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = $Body
            $params["ContentType"] = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ $TestName" -ForegroundColor Green
            $script:passCount++
            return $true
        } else {
            Write-Host "  ❌ $TestName (Status: $($response.StatusCode), Expected: $ExpectedStatus)" -ForegroundColor Red
            $script:failCount++
            return $false
        }
    } catch {
        $actualStatus = $_.Exception.Response.StatusCode.value__
        if ($actualStatus -eq $ExpectedStatus) {
            Write-Host "  ✅ $TestName (Status: $actualStatus)" -ForegroundColor Green
            $script:passCount++
            return $true
        } else {
            Write-Host "  ❌ $TestName (Status: $actualStatus, Expected: $ExpectedStatus)" -ForegroundColor Red
            $script:failCount++
            return $false
        }
    }
}

# ================================
# PHASE 1: INFRASTRUCTURE
# ================================
Write-Host "`n📋 PHASE 1: Infrastructure Validation" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-Endpoint -TestName "Health endpoint" -Url "http://localhost:3000/health"
Test-Endpoint -TestName "Metrics endpoint" -Url "http://localhost:3000/metrics"

# ================================
# PHASE 2: AUTHENTICATION
# ================================
Write-Host "`n🔐 PHASE 2: Authentication Testing" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Test 1: Admin Login
$adminBody = '{"email":"admin@example.com","password":"Admin123!"}'
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/v1.2.0/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
    $global:adminToken = $resp.data.tokens.accessToken
    Write-Host "  ✅ Admin login successful" -ForegroundColor Green
    $passCount++
} catch {
    Write-Host "  ❌ Admin login failed" -ForegroundColor Red
    $failCount++
    exit 1
}

# Test 2: Student Login
$studentBody = '{"email":"student1@example.com","password":"Student123!"}'
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/v1.2.0/auth/login" -Method POST -Body $studentBody -ContentType "application/json"
    $global:studentToken = $resp.data.tokens.accessToken
    Write-Host "  ✅ Student login successful" -ForegroundColor Green
    $passCount++
} catch {
    Write-Host "  ⚠️  Student login failed (continuing...)" -ForegroundColor Yellow
    $global:studentToken = ""
}

# Test 3: Invalid Credentials
Test-Endpoint -TestName "Invalid credentials rejected" `
    -Url "http://localhost:3000/api/v1.2.0/auth/login" `
    -Method POST `
    -Body '{"email":"admin@example.com","password":"wrong"}' `
    -ExpectedStatus 401

# Test 4: Invalid Token
$invalidHeaders = @{"Authorization" = "Bearer invalid_token"}
Test-Endpoint -TestName "Invalid token rejected" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/stats" `
    -Headers $invalidHeaders `
    -ExpectedStatus 401

# ================================
# PHASE 3: ADMIN ENDPOINTS
# ================================
Write-Host "`n👥 PHASE 3: Admin User Management" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$adminHeaders = @{"Authorization" = "Bearer $global:adminToken"}

# Test 5: Get User Statistics
Test-Endpoint -TestName "Get user statistics (admin)" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/stats" `
    -Headers $adminHeaders

# Test 6: List All Users
Test-Endpoint -TestName "List all users with pagination" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users?page=1&limit=10" `
    -Headers $adminHeaders

# Test 7: List Users with Filters
Test-Endpoint -TestName "Filter users by role" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users?role=student&status=active" `
    -Headers $adminHeaders

# Test 8: Get Users by Role
Test-Endpoint -TestName "Get users by role (students)" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/role/student" `
    -Headers $adminHeaders

# Test 9: Get User by ID
Test-Endpoint -TestName "Get user by ID" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/00000000-0000-0000-0000-000000000002" `
    -Headers $adminHeaders

# Test 10: Search by Email
Test-Endpoint -TestName "Search user by email" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/email/search?email=admin@example.com" `
    -Headers $adminHeaders

# Test 11: Create New User
$newUserBody = @{
    email = "test$(Get-Random)@example.com"
    password = "Test123!@#"
    first_name = "Test"
    last_name = "User"
    role = "student"
} | ConvertTo-Json

Test-Endpoint -TestName "Create new user" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users" `
    -Method POST `
    -Headers $adminHeaders `
    -Body $newUserBody `
    -ExpectedStatus 201

# Test 12: Invalid Email Format
$invalidEmailBody = '{"email":"invalid-email","password":"Test123!","first_name":"Test","last_name":"User","role":"student"}'
Test-Endpoint -TestName "Reject invalid email format" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users" `
    -Method POST `
    -Headers $adminHeaders `
    -Body $invalidEmailBody `
    -ExpectedStatus 400

# Test 13: Weak Password
$weakPwdBody = '{"email":"test@example.com","password":"weak","first_name":"Test","last_name":"User","role":"student"}'
Test-Endpoint -TestName "Reject weak password" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users" `
    -Method POST `
    -Headers $adminHeaders `
    -Body $weakPwdBody `
    -ExpectedStatus 400

# Test 14: Student Access to Admin Endpoint (should fail)
if ($global:studentToken) {
    $studentHeaders = @{"Authorization" = "Bearer $global:studentToken"}
    Test-Endpoint -TestName "Student denied access to admin stats" `
        -Url "http://localhost:3000/api/v1.2.0/admin/users/stats" `
        -Headers $studentHeaders `
        -ExpectedStatus 403
}

# Test 15: Non-existent User
Test-Endpoint -TestName "Get non-existent user returns 404" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/00000000-0000-0000-0000-000000000099" `
    -Headers $adminHeaders `
    -ExpectedStatus 404

# Test 16: Invalid UUID Format
Test-Endpoint -TestName "Invalid UUID returns 400" `
    -Url "http://localhost:3000/api/v1.2.0/admin/users/invalid-uuid" `
    -Headers $adminHeaders `
    -ExpectedStatus 400

# ================================
# RESULTS SUMMARY
# ================================
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    📊 TEST SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$total = $passCount + $failCount
$successRate = if ($total -gt 0) { [math]::Round(($passCount / $total) * 100, 2) } else { 0 }

Write-Host "  Total Tests:    $total" -ForegroundColor White
Write-Host "  ✅ Passed:      $passCount" -ForegroundColor Green
Write-Host "  ❌ Failed:      $failCount" -ForegroundColor Red
Write-Host "  Success Rate:   $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! 🎉" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the results above." -ForegroundColor Yellow
    exit 1
}
