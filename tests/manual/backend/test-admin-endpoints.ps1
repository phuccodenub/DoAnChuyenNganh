# Test Admin Endpoints - PowerShell Script
# Run this script to automatically test all admin endpoints

param(
    [string]$BaseUrl = "http://localhost:3000/api/v1",
    [string]$AdminEmail = "admin@example.com",
    [string]$AdminPassword = "Admin123!",
    [string]$StudentEmail = "student@example.com",
    [string]$StudentPassword = "Student123!"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🧪 Testing User Admin Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to print test result
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   Error: $Message" -ForegroundColor Yellow
        }
    }
}

# Function to make API request
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = "",
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

Write-Host "📝 Step 1: Login to get tokens..." -ForegroundColor Yellow
Write-Host ""

# Login as Admin
$adminLoginBody = @{
    email = $AdminEmail
    password = $AdminPassword
}

$adminLoginResult = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $adminLoginBody

if ($adminLoginResult.Success) {
    $ADMIN_TOKEN = $adminLoginResult.Data.data.accessToken
    Write-Host "✅ Admin login successful" -ForegroundColor Green
} else {
    Write-Host "❌ Admin login failed: $($adminLoginResult.Error)" -ForegroundColor Red
    Write-Host "⚠️  Please check credentials or create admin user first" -ForegroundColor Yellow
    exit 1
}

# Login as Student
$studentLoginBody = @{
    email = $StudentEmail
    password = $StudentPassword
}

$studentLoginResult = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $studentLoginBody

if ($studentLoginResult.Success) {
    $STUDENT_TOKEN = $studentLoginResult.Data.data.accessToken
    Write-Host "✅ Student login successful" -ForegroundColor Green
} else {
    Write-Host "❌ Student login failed: $($studentLoginResult.Error)" -ForegroundColor Red
    $STUDENT_TOKEN = ""
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🧪 Running Tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get User Statistics (Admin only)
Write-Host "Test 1: Get User Statistics (Admin)" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/stats" -Token $ADMIN_TOKEN
Test-Result -TestName "Admin can access statistics" -Success $result.Success

if ($STUDENT_TOKEN) {
    $result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/stats" -Token $STUDENT_TOKEN
    Test-Result -TestName "Student is denied access to statistics (403)" -Success ($result.StatusCode -eq 403)
}
Write-Host ""

# Test 2: Get All Users
Write-Host "Test 2: Get All Users (Admin)" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users?page=1&limit=10" -Token $ADMIN_TOKEN
Test-Result -TestName "Admin can list all users" -Success $result.Success

if ($result.Success) {
    $hasData = $result.Data.data -is [Array]
    Test-Result -TestName "Response contains user array" -Success $hasData
    
    $hasPagination = $result.Data.pagination -ne $null
    Test-Result -TestName "Response contains pagination" -Success $hasPagination
}
Write-Host ""

# Test 3: Get Users with Filters
Write-Host "Test 3: Get Users with Filters" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users?role=student&status=active" -Token $ADMIN_TOKEN
Test-Result -TestName "Admin can filter users by role and status" -Success $result.Success
Write-Host ""

# Test 4: Create New User
Write-Host "Test 4: Create New User (Admin)" -ForegroundColor Yellow
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$newUser = @{
    email = "testuser$timestamp@example.com"
    password = "TestPass123!"
    first_name = "Test"
    last_name = "User"
    phone = "+84912345678"
    role = "student"
    bio = "Test user created by automated script"
}

$result = Invoke-ApiRequest -Method POST -Endpoint "/admin/users" -Token $ADMIN_TOKEN -Body $newUser
Test-Result -TestName "Admin can create new user" -Success $result.Success

$newUserId = $null
if ($result.Success) {
    $newUserId = $result.Data.data.id
    Write-Host "   Created user ID: $newUserId" -ForegroundColor Gray
}

# Test that student cannot create user
if ($STUDENT_TOKEN) {
    $result = Invoke-ApiRequest -Method POST -Endpoint "/admin/users" -Token $STUDENT_TOKEN -Body $newUser
    Test-Result -TestName "Student is denied creating user (403)" -Success ($result.StatusCode -eq 403)
}
Write-Host ""

# Test 5: Get User by ID
if ($newUserId) {
    Write-Host "Test 5: Get User by ID" -ForegroundColor Yellow
    $result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/$newUserId" -Token $ADMIN_TOKEN
    Test-Result -TestName "Admin can get user by ID" -Success $result.Success
    
    if ($STUDENT_TOKEN) {
        $result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/$newUserId" -Token $STUDENT_TOKEN
        Test-Result -TestName "Student can view user profile (read-only)" -Success $result.Success
    }
    Write-Host ""
}

# Test 6: Update User
if ($newUserId) {
    Write-Host "Test 6: Update User (Admin)" -ForegroundColor Yellow
    $updateData = @{
        first_name = "Updated"
        last_name = "Name"
        bio = "Updated by admin"
    }
    
    $result = Invoke-ApiRequest -Method PATCH -Endpoint "/admin/users/$newUserId" -Token $ADMIN_TOKEN -Body $updateData
    Test-Result -TestName "Admin can update user" -Success $result.Success
    
    if ($STUDENT_TOKEN) {
        $result = Invoke-ApiRequest -Method PATCH -Endpoint "/admin/users/$newUserId" -Token $STUDENT_TOKEN -Body $updateData
        Test-Result -TestName "Student is denied updating user (403)" -Success ($result.StatusCode -eq 403)
    }
    Write-Host ""
}

# Test 7: Change User Status
if ($newUserId) {
    Write-Host "Test 7: Change User Status (Admin)" -ForegroundColor Yellow
    $statusUpdate = @{
        status = "suspended"
    }
    
    $result = Invoke-ApiRequest -Method PATCH -Endpoint "/admin/users/$newUserId/status" -Token $ADMIN_TOKEN -Body $statusUpdate
    Test-Result -TestName "Admin can change user status" -Success $result.Success
    Write-Host ""
}

# Test 8: Get Users by Role
Write-Host "Test 8: Get Users by Role" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/role/student" -Token $ADMIN_TOKEN
Test-Result -TestName "Admin can get users by role" -Success $result.Success
Write-Host ""

# Test 9: Search User by Email
Write-Host "Test 9: Search User by Email" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/email/search?email=$AdminEmail" -Token $ADMIN_TOKEN
Test-Result -TestName "Admin can search user by email" -Success $result.Success
Write-Host ""

# Test 10: Validation Tests
Write-Host "Test 10: Validation Tests" -ForegroundColor Yellow

# Invalid email
$invalidUser = @{
    email = "invalid-email"
    password = "Test123!"
    first_name = "Test"
    last_name = "User"
    role = "student"
}
$result = Invoke-ApiRequest -Method POST -Endpoint "/admin/users" -Token $ADMIN_TOKEN -Body $invalidUser
Test-Result -TestName "Rejects invalid email format (400)" -Success ($result.StatusCode -eq 400)

# Weak password
$weakPasswordUser = @{
    email = "test@example.com"
    password = "123"
    first_name = "Test"
    last_name = "User"
    role = "student"
}
$result = Invoke-ApiRequest -Method POST -Endpoint "/admin/users" -Token $ADMIN_TOKEN -Body $weakPasswordUser
Test-Result -TestName "Rejects weak password (400)" -Success ($result.StatusCode -eq 400)

Write-Host ""

# Test 11: Delete User
if ($newUserId) {
    Write-Host "Test 11: Delete User (Admin)" -ForegroundColor Yellow
    $result = Invoke-ApiRequest -Method DELETE -Endpoint "/admin/users/$newUserId" -Token $ADMIN_TOKEN
    Test-Result -TestName "Admin can delete user" -Success $result.Success
    
    # Verify user is deleted
    $result = Invoke-ApiRequest -Method GET -Endpoint "/admin/users/$newUserId" -Token $ADMIN_TOKEN
    Test-Result -TestName "Deleted user returns 404" -Success ($result.StatusCode -eq 404)
    Write-Host ""
}

# Test 12: User Self-Service Endpoints (Comparison)
Write-Host "Test 12: User Self-Service Endpoints" -ForegroundColor Yellow
if ($STUDENT_TOKEN) {
    # Get own profile
    $result = Invoke-ApiRequest -Method GET -Endpoint "/users/profile" -Token $STUDENT_TOKEN
    Test-Result -TestName "User can access own profile" -Success $result.Success
    
    # Update own profile
    $profileUpdate = @{
        bio = "Updated by self"
    }
    $result = Invoke-ApiRequest -Method PUT -Endpoint "/users/profile" -Token $STUDENT_TOKEN -Body $profileUpdate
    Test-Result -TestName "User can update own profile" -Success $result.Success
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
