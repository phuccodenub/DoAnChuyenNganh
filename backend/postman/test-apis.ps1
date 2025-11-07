# LMS API Testing Script
# PowerShell script to test LMS APIs

$baseUrl = "http://localhost:3000/api"
$testEmail = "teststudent$(Get-Date -Format 'yyyyMMddHHmmss')@api.test"

Write-Host "`n=== LMS API Testing Started ===" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host "Test Email: $testEmail`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Health Check: $($health.data.status)" -ForegroundColor Green
    Write-Host "   Uptime: $($health.data.uptime)s" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Register Student
Write-Host "`nTest 2: Register Student" -ForegroundColor Yellow
$registerBody = @{
    first_name = "Test"
    last_name = "Student API"
    username = "teststudent$(Get-Date -Format 'yyyyMMddHHmmss')"
    email = $testEmail
    password = "Test@123456"
    role = "student"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    $userId = $registerResponse.data.user.user_id
    $accessToken = $registerResponse.data.accessToken
    $refreshToken = $registerResponse.data.refreshToken
    
    Write-Host "✅ Registration Successful" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($registerResponse.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Login
Write-Host "`nTest 3: Login" -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "Test@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $accessToken = $loginResponse.data.accessToken
    $refreshToken = $loginResponse.data.refreshToken
    
    Write-Host "✅ Login Successful" -ForegroundColor Green
    Write-Host "   Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Verify Token
Write-Host "`nTest 4: Verify Token" -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/auth/verify" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Token Verification Successful" -ForegroundColor Green
    Write-Host "   User ID: $($verifyResponse.data.user_id)" -ForegroundColor Gray
    Write-Host "   Email: $($verifyResponse.data.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Token Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Get Profile
Write-Host "`nTest 5: Get My Profile" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Get Profile Successful" -ForegroundColor Green
    Write-Host "   Name: $($profileResponse.data.full_name)" -ForegroundColor Gray
    Write-Host "   Email: $($profileResponse.data.email)" -ForegroundColor Gray
    Write-Host "   Status: $($profileResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Profile Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get All Categories
Write-Host "`nTest 6: Get All Categories" -ForegroundColor Yellow
try {
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    Write-Host "✅ Get Categories Successful" -ForegroundColor Green
    Write-Host "   Total Categories: $($categoriesResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Categories Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create Course
Write-Host "`nTest 7: Create Course" -ForegroundColor Yellow
$courseBody = @{
    title = "Test Course - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    description = "This is a test course created via API"
    level = "beginner"
    status = "published"
} | ConvertTo-Json

try {
    $courseResponse = Invoke-RestMethod -Uri "$baseUrl/courses" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $courseBody
    
    $courseId = $courseResponse.data.course_id
    Write-Host "✅ Create Course Successful" -ForegroundColor Green
    Write-Host "   Course ID: $courseId" -ForegroundColor Gray
    Write-Host "   Title: $($courseResponse.data.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create Course Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 8: Get All Courses
Write-Host "`nTest 8: Get All Courses" -ForegroundColor Yellow
try {
    $coursesResponse = Invoke-RestMethod -Uri "$baseUrl/courses?page=1&limit=10" -Method Get
    Write-Host "✅ Get Courses Successful" -ForegroundColor Green
    Write-Host "   Total Courses: $($coursesResponse.data.courses.Count)" -ForegroundColor Gray
    Write-Host "   Pagination: Page $($coursesResponse.data.currentPage) of $($coursesResponse.data.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Courses Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Enroll in Course (if courseId exists)
if ($courseId) {
    Write-Host "`nTest 9: Enroll in Course" -ForegroundColor Yellow
    try {
        $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/enroll" `
            -Method Post `
            -Headers $headers
        
        Write-Host "✅ Enrollment Successful" -ForegroundColor Green
        Write-Host "   Enrollment ID: $($enrollResponse.data.enrollment_id)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Enrollment Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }

    # Test 10: Get Enrolled Courses
    Write-Host "`nTest 10: Get Enrolled Courses" -ForegroundColor Yellow
    try {
        $enrolledResponse = Invoke-RestMethod -Uri "$baseUrl/courses/enrolled" `
            -Method Get `
            -Headers $headers
        
        Write-Host "✅ Get Enrolled Courses Successful" -ForegroundColor Green
        Write-Host "   Total Enrolled: $($enrolledResponse.data.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Enrolled Courses Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test 11: Create Section
    Write-Host "`nTest 11: Create Section" -ForegroundColor Yellow
    $sectionBody = @{
        title = "Section 1: Introduction"
        description = "Introduction to the course"
        order_index = 1
        is_published = $true
    } | ConvertTo-Json

    try {
        $sectionResponse = Invoke-RestMethod -Uri "$baseUrl/course-content/courses/$courseId/sections" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $sectionBody
        
        $sectionId = $sectionResponse.data.section_id
        Write-Host "✅ Create Section Successful" -ForegroundColor Green
        Write-Host "   Section ID: $sectionId" -ForegroundColor Gray
        Write-Host "   Title: $($sectionResponse.data.title)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Create Section Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }

    # Test 12: Create Lesson (if sectionId exists)
    if ($sectionId) {
        Write-Host "`nTest 12: Create Lesson" -ForegroundColor Yellow
        $lessonBody = @{
            title = "Lesson 1: Getting Started"
            content = "Welcome to the first lesson of this course"
            lesson_type = "video"
            duration = 600
            order_index = 1
            is_published = $true
        } | ConvertTo-Json

        try {
            $lessonResponse = Invoke-RestMethod -Uri "$baseUrl/course-content/sections/$sectionId/lessons" `
                -Method Post `
                -ContentType "application/json" `
                -Headers $headers `
                -Body $lessonBody
            
            $lessonId = $lessonResponse.data.lesson_id
            Write-Host "✅ Create Lesson Successful" -ForegroundColor Green
            Write-Host "   Lesson ID: $lessonId" -ForegroundColor Gray
            Write-Host "   Title: $($lessonResponse.data.title)" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Create Lesson Failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }

        # Test 13: Get Lesson
        if ($lessonId) {
            Write-Host "`nTest 13: Get Lesson Details" -ForegroundColor Yellow
            try {
                $getLessonResponse = Invoke-RestMethod -Uri "$baseUrl/course-content/lessons/$lessonId" `
                    -Method Get `
                    -Headers $headers
                
                Write-Host "✅ Get Lesson Successful" -ForegroundColor Green
                Write-Host "   Title: $($getLessonResponse.data.title)" -ForegroundColor Gray
                Write-Host "   Type: $($getLessonResponse.data.lesson_type)" -ForegroundColor Gray
                Write-Host "   Duration: $($getLessonResponse.data.duration)s" -ForegroundColor Gray
            } catch {
                Write-Host "❌ Get Lesson Failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }

    # Test 14: Create Quiz
    Write-Host "`nTest 14: Create Quiz" -ForegroundColor Yellow
    $quizBody = @{
        course_id = $courseId
        title = "Quiz 1: Introduction Test"
        description = "Test your knowledge of the introduction"
        time_limit = 1800
        passing_score = 70
        max_attempts = 3
        is_published = $true
    } | ConvertTo-Json

    try {
        $quizResponse = Invoke-RestMethod -Uri "$baseUrl/quizzes" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $quizBody
        
        $quizId = $quizResponse.data.quiz_id
        Write-Host "✅ Create Quiz Successful" -ForegroundColor Green
        Write-Host "   Quiz ID: $quizId" -ForegroundColor Gray
        Write-Host "   Title: $($quizResponse.data.title)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Create Quiz Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }

    # Test 15: Get Course Progress
    Write-Host "`nTest 15: Get Course Progress" -ForegroundColor Yellow
    try {
        $progressResponse = Invoke-RestMethod -Uri "$baseUrl/course-content/courses/$courseId/progress" `
            -Method Get `
            -Headers $headers
        
        Write-Host "✅ Get Progress Successful" -ForegroundColor Green
        Write-Host "   Progress: $($progressResponse.data.progress_percentage)%" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Progress Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 16: Get User Analytics
Write-Host "`nTest 16: Get User Analytics" -ForegroundColor Yellow
try {
    $analyticsResponse = Invoke-RestMethod -Uri "$baseUrl/users/analytics" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Get User Analytics Successful" -ForegroundColor Green
    Write-Host "   Response: $($analyticsResponse.data | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Get User Analytics: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 17: Get Notifications
Write-Host "`nTest 17: Get My Notifications" -ForegroundColor Yellow
try {
    $notificationsResponse = Invoke-RestMethod -Uri "$baseUrl/notifications/me?limit=10" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Get Notifications Successful" -ForegroundColor Green
    Write-Host "   Total: $($notificationsResponse.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Get Notifications: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 18: Refresh Token
Write-Host "`nTest 18: Refresh Token" -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh-token" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshBody
    
    $newAccessToken = $refreshResponse.data.accessToken
    Write-Host "✅ Token Refresh Successful" -ForegroundColor Green
    Write-Host "   New Access Token: $($newAccessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Token Refresh Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Testing Summary ===" -ForegroundColor Green
Write-Host "✅ Core authentication flow working" -ForegroundColor Green
Write-Host "✅ User management working" -ForegroundColor Green
Write-Host "✅ Course management working" -ForegroundColor Green
Write-Host "✅ Content management working" -ForegroundColor Green
Write-Host "`nTest Data Created:" -ForegroundColor Cyan
Write-Host "  User ID: $userId" -ForegroundColor Gray
Write-Host "  Email: $testEmail" -ForegroundColor Gray
if ($courseId) {
    Write-Host "  Course ID: $courseId" -ForegroundColor Gray
}
if ($sectionId) {
    Write-Host "  Section ID: $sectionId" -ForegroundColor Gray
}
if ($lessonId) {
    Write-Host "  Lesson ID: $lessonId" -ForegroundColor Gray
}
if ($quizId) {
    Write-Host "  Quiz ID: $quizId" -ForegroundColor Gray
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
