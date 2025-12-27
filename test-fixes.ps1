# Test MegaLLM Integration
# Script này test cả 2 fixes: session loginTime và ProxyPal Premium

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST PROXYPAL PREMIUM" -ForegroundColor Cyan
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

    if ($statusResponse.data) {
        $status = $statusResponse.data
    } else {
        $status = $statusResponse
    }

    if ($status.providers) {
        $providerSummary = $status.providers | ForEach-Object { "$($_.name): $($_.available)" }
        Write-Host "   Providers: $($providerSummary -join ', ')" -ForegroundColor Gray
    } elseif ($status.proxypal -or $status.google) {
        if ($status.proxypal) { Write-Host "   ProxyPal: $($status.proxypal.status)" -ForegroundColor Gray }
        if ($status.google) { Write-Host "   Google: $($status.google.status)" -ForegroundColor Gray }
        if ($status.megallm) { Write-Host "   MegaLLM: $($status.megallm.status)" -ForegroundColor Gray }
    } else {
        Write-Host "   Status payload: $($status | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    }

    Write-Host ""
} catch {
    Write-Host "   ❌ AI Status FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Quiz Generation with Premium Polish
Write-Host "4️⃣ Testing Quiz Generation (Premium Polish - ProxyPal)..." -ForegroundColor Yellow

$quizBody = @{
    courseId = "test-course"
    content = "TypeScript là superset của JavaScript. TypeScript thêm type checking và giúp code an toàn hơn. Nó compile xuống JavaScript thuần."
    numberOfQuestions = 2
    difficulty = "easy"
    isPremium = $true
    userId = $actualData.user.userId
} | ConvertTo-Json

try {
    Write-Host "   Generating quiz (có thể mất 30-60s)..." -ForegroundColor Gray
    
    $quizResponse = Invoke-RestMethod -Uri "$baseUrl/ai/generate-quiz" -Method POST -Headers $headers -Body $quizBody -TimeoutSec 90
    
    $quizData = if ($quizResponse.data) { $quizResponse.data } else { $quizResponse }

    Write-Host "   ✅ Quiz Generated!" -ForegroundColor Green
    Write-Host "   Quiz ID: $($quizData.quizId)" -ForegroundColor Gray
    Write-Host "   Questions: $($quizData.questions.Count)" -ForegroundColor Gray
    Write-Host "   Stages: $($quizData.metadata.stages -join ', ')" -ForegroundColor Gray
    Write-Host "   Model: $($quizData.metadata.model)" -ForegroundColor Gray
    
    if ($quizData.metadata.stages -contains "polish") {
        Write-Host "   🎉 PREMIUM POLISH (ProxyPal) EXECUTED!" -ForegroundColor Magenta
    } else {
        Write-Host "   ⚠️  Polish stage not found. Stages: $($quizData.metadata.stages -join ', ')" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
} catch {
    Write-Host "   ❌ Quiz Generation FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Step 5: Check ProxyPal logs
Write-Host "5️⃣ Checking ProxyPal logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$proxypalLogs = docker logs lms-backend-dev-1 --tail 150 2>&1 | Select-String -Pattern "ProxyPal|Premium.*polish|gpt-5|403|tier|permission"

if ($proxypalLogs) {
    Write-Host "   ProxyPal Activity Found:" -ForegroundColor Cyan
    $proxypalLogs | Select-Object -First 10 | ForEach-Object {
        if ($_ -match "403|permission|tier") {
            Write-Host "   ❌ $_" -ForegroundColor Red
        } elseif ($_ -match "polish|gpt-5|ProxyPal") {
            Write-Host "   ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ⚠️  No ProxyPal activity detected" -ForegroundColor Yellow
    Write-Host "   (This might mean ProxyPal was not triggered or is not configured)" -ForegroundColor Gray
}


Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
