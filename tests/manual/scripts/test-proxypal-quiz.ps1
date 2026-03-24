# Test ProxyPal Quiz Generation (replacing MegaLLM)
$ErrorActionPreference = "Continue"

$baseUrl = "http://localhost:3000/api/v1.3.0"

Write-Host "`n=== PROXYPAL QUIZ GENERATION TEST ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[1] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "instructor1@example.com"
    password = "Instructor123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "✓ Login successful - User: $($loginResponse.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test Premium Quiz Generation với ProxyPal
Write-Host "`n[2] Testing Premium Quiz Generation (ProxyPal Premium)..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$quizBody = @{
    courseId = "test-course-proxypal"
    content = @"
TypeScript là superset của JavaScript, bổ sung type system mạnh mẽ.

**Các tính năng chính:**
1. Static Type Checking - Kiểm tra lỗi compile-time
2. Interfaces - Định nghĩa cấu trúc object
3. Generics - Tạo components tái sử dụng
4. Enum - Tập hợp constants có tên
5. Type Inference - Tự động suy luận type

**Ví dụ Interface:**
```typescript
interface User {
    id: number;
    name: string;
    email?: string; // Optional property
}

function greet(user: User): string {
    return `Hello, ${user.name}!`;
}
```

**Generics:**
```typescript
function identity<T>(arg: T): T {
    return arg;
}

let output = identity<string>("myString");
```
"@
    numberOfQuestions = 3
    difficulty = "medium"
    isPremium = $true
    userId = $loginResponse.data.user.userId
} | ConvertTo-Json

try {
    Write-Host "Sending request to quiz generator..." -ForegroundColor Gray
    $quizResponse = Invoke-RestMethod -Uri "$baseUrl/ai/generate-quiz" -Method POST -Headers $headers -Body $quizBody -TimeoutSec 120
    
    Write-Host "✓ Quiz generated successfully!" -ForegroundColor Green
    Write-Host "  Quiz ID: $($quizResponse.data.quizId)" -ForegroundColor Gray
    Write-Host "  Questions: $($quizResponse.data.questions.Count)" -ForegroundColor Gray
    Write-Host "  Model: $($quizResponse.data.metadata.model)" -ForegroundColor Gray
    Write-Host "  Stages: $($quizResponse.data.metadata.stages -join ', ')" -ForegroundColor Gray
    Write-Host "  Processing Time: $($quizResponse.data.metadata.processingTime)ms" -ForegroundColor Gray
    
    # Show first question
    if ($quizResponse.data.questions.Count -gt 0) {
        $q = $quizResponse.data.questions[0]
        Write-Host "`n  First Question:" -ForegroundColor Cyan
        Write-Host "    Q: $($q.question)" -ForegroundColor White
        Write-Host "    Type: $($q.type)" -ForegroundColor Gray
        Write-Host "    Difficulty: $($q.difficulty)" -ForegroundColor Gray
        Write-Host "    Bloom Level: $($q.bloomLevel)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "✗ Quiz generation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails)" -ForegroundColor Red
    }
}

# Step 3: Check logs for ProxyPal usage
Write-Host "`n[3] Checking backend logs for ProxyPal activity..." -ForegroundColor Yellow
try {
    $logs = docker logs lms-backend-dev-1 --tail 50 2>&1 | Select-String -Pattern "ProxyPal|gpt-5|polish|premium"
    if ($logs) {
        Write-Host "✓ Found ProxyPal activity:" -ForegroundColor Green
        $logs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "⚠ No ProxyPal activity found in logs" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not read logs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
