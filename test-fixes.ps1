# Test MegaLLM Integration
# Script này test cả 2 fixes: session loginTime và MegaLLM 403

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST MEGALLM INTEGRATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1.3.0"

# Step 1: Login
Write-Host "1️⃣ Testing Login (Session Fix)..." -ForegroundColor Yellow

$loginBody = @{
    email = "instructor1@example.com"
    password = "Instructor123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    # Debug response structure
    Write-Host "   Response keys: $($loginResponse.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    
    if ($loginResponse.data) {
        $actualData = $loginResponse.data
        Write-Host "   Using data field" -ForegroundColor Gray
    } else {
        $actualData = $loginResponse
    }
    
    Write-Host "   ✅ Login SUCCESS" -ForegroundColor Green
    Write-Host "   User: $($actualData.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($actualData.user.role)" -ForegroundColor Gray
    
    $token = $actualData.tokens.accessToken
    Write-Host "   Token: $($token.Substring(0,20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   $($_.ScriptStackTrace)" -ForegroundColor Gray
    exit 1
}

# Step 2: Check logs for session errors
Write-Host "2️⃣ Checking logs for session errors..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

$sessionErrors = docker logs lms-backend-dev-1 --tail 50 2>&1 | Select-String -Pattern "loginTime\.getTime|suspicious.*error"
if ($sessionErrors) {
    Write-Host "   ❌ Found session errors!" -ForegroundColor Red
    $sessionErrors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "   ✅ No session errors`n" -ForegroundColor Green
}

# Step 3: Test simple AI endpoint first
Write-Host "3️⃣ Testing AI Status endpoint..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/ai/status" -Method GET -Headers $headers
    Write-Host "   ✅ AI Status OK" -ForegroundColor Green
    Write-Host "   ProxyPal: $($statusResponse.proxypal.status)" -ForegroundColor Gray
    Write-Host "   Google: $($statusResponse.google.status)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ AI Status FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Quiz Generation with Premium Polish
Write-Host "4️⃣ Testing Quiz Generation (Premium Polish - MegaLLM)..." -ForegroundColor Yellow

$quizBody = @{
    courseId = "test-course"
    content = "TypeScript là superset của JavaScript. TypeScript thêm type checking và giúp code an toàn hơn. Nó compile xuống JavaScript thuần."
    numberOfQuestions = 2
    difficulty = "easy"
    isPremium = $true
    userId = $loginResponse.user.userId
} | ConvertTo-Json

try {
    Write-Host "   Generating quiz (có thể mất 30-60s)..." -ForegroundColor Gray
    
    $quizResponse = Invoke-RestMethod -Uri "$baseUrl/ai/generate-quiz" -Method POST -Headers $headers -Body $quizBody -TimeoutSec 90
    
    Write-Host "   ✅ Quiz Generated!" -ForegroundColor Green
    Write-Host "   Quiz ID: $($quizResponse.quizId)" -ForegroundColor Gray
    Write-Host "   Questions: $($quizResponse.questions.Count)" -ForegroundColor Gray
    Write-Host "   Stages: $($quizResponse.metadata.stages -join ', ')" -ForegroundColor Gray
    Write-Host "   Model: $($quizResponse.metadata.model)" -ForegroundColor Gray
    
    if ($quizResponse.metadata.stages -contains "polish") {
        Write-Host "   🎉 PREMIUM POLISH (MegaLLM) EXECUTED!" -ForegroundColor Magenta
    } else {
        Write-Host "   ⚠️  Polish stage not found. Stages: $($quizResponse.metadata.stages -join ', ')" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
} catch {
    Write-Host "   ❌ Quiz Generation FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Step 5: Check MegaLLM logs
Write-Host "5️⃣ Checking MegaLLM logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$megallmLogs = docker logs lms-backend-dev-1 --tail 150 2>&1 | Select-String -Pattern "MegaLLM|403|Premium.*polish|Claude"

if ($megallmLogs) {
    Write-Host "   MegaLLM Activity Found:" -ForegroundColor Cyan
    $megallmLogs | Select-Object -First 10 | ForEach-Object {
        if ($_ -match "403") {
            Write-Host "   ❌ $_" -ForegroundColor Red
        } elseif ($_ -match "polish|Claude") {
            Write-Host "   ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ⚠️  No MegaLLM activity detected" -ForegroundColor Yellow
    Write-Host "   (This might mean MegaLLM was not triggered or is not configured)" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
