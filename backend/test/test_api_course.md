PS H:\DACN> Write-Output "`n=== TEST: Get Enrolled Courses (after restart) ==="; $enrolledResponse = curl -X GET "http://localhost:3000/api/courses/enrolled" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json; Write-Output "Success: $($enrolledResponse.success)"; if ($enrolledResponse.success) { Write-Output "Enrolled courses: $($enrolledResponse.data.data.Count)"; } else { $enrolledResponse | ConvertTo-Json -Depth 3 }

=== TEST: Get Enrolled Courses (after restart) ===
Success: True
Enrolled courses: 2
PS H:\DACN> Write-Output "`n========================================`n=== FULL COURSES API TEST SUITE ===`n========================================`n"                                                            
                                                                      
========================================                              
=== FULL COURSES API TEST SUITE ===                                   
========================================

PS H:\DACN> 
PS H:\DACN> # Test 1: Get All Courses (Public)
PS H:\DACN> Write-Output "`n[TEST 1] GET /api/courses - Get all courses (public)"

[TEST 1] GET /api/courses - Get all courses (public)
PS H:\DACN> $r1 = curl -X GET "http://localhost:3000/api/courses?page=1&limit=5" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r1.success) | Total: $($r1.data.pagination.total)"
✓ Status: True | Total: 6
PS H:\DACN> 
PS H:\DACN> # Test 2: Get Course By ID
PS H:\DACN> Write-Output "`n[TEST 2] GET /api/courses/:id - Get course by ID"

[TEST 2] GET /api/courses/:id - Get course by ID
PS H:\DACN> $courseId = "10000000-0000-0000-0000-000000000001"
PS H:\DACN> $r2 = curl -X GET "http://localhost:3000/api/courses/$courseId" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r2.success) | Course: $($r2.data.title)"
✓ Status: True | Course: Updated Course Title
PS H:\DACN> 
PS H:\DACN> # Test 3: Get Enrolled Courses
PS H:\DACN> Write-Output "`n[TEST 3] GET /api/courses/enrolled - Get enrolled courses (auth required)"

[TEST 3] GET /api/courses/enrolled - Get enrolled courses (auth required)
PS H:\DACN> $r3 = curl -X GET "http://localhost:3000/api/courses/enrolled" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r3.success) | Enrolled: $($r3.data.data.Count)"
✓ Status: True | Enrolled: 2
PS H:\DACN> # Test 4: Create Course (Instructor)
PS H:\DACN> Write-Output "`n[TEST 4] POST /api/courses - Create course (instructor)"

[TEST 4] POST /api/courses - Create course (instructor)
PS H:\DACN> @'
>> {
>>   "title": "Test Course API",
>>   "description": "This is a test course created via API",
>>   "level": "beginner",
>>   "status": "published"
>> }
>> '@ | Out-File -Encoding utf8 create-course.json
PS H:\DACN> $r4 = curl -X POST "http://localhost:3000/api/courses" -H "Authorization: Bearer $global:instructorToken" -H "Content-Type: application/json" --data-binary "@create-course.json" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r4.success) | Created: $($r4.data.title)"
✓ Status: True | Created: Test Course API
PS H:\DACN> $global:newCourseId = $r4.data.id
PS H:\DACN> Start-Sleep -Seconds 2; Get-Content create-course.json -Raw                                                                     
{
  "title": "Test Course API",
  "description": "This is a test course created via API",
  "level": "beginner",
  "status": "published"
}

PS H:\DACN> $r4 = curl -X POST "http://localhost:3000/api/courses" -H "Authorization: Bearer $global:instructorToken" -H "Content-Type: application/json" --data-binary "@create-course.json" -s | ConvertFrom-Json; Write-Output "Status: $($r4.success)"; if ($r4.success) { Write-Output "Created: $($r4.data.title)"; $global:newCourseId = $r4.data.id; } else { $r4 | ConvertTo-Json -Depth 3 }
Status: True
Created: Test Course API
PS H:\DACN> # Test 5: Update Course
PS H:\DACN> Write-Output "`n[TEST 5] PUT /api/courses/:id - Update course"

[TEST 5] PUT /api/courses/:id - Update course
PS H:\DACN> @'
>> {
>>   "title": "Updated Test Course API",
>>   "description": "Updated description via API test"
>> }
>> '@ | Out-File -Encoding utf8 update-course.json
PS H:\DACN> $r5 = curl -X PUT "http://localhost:3000/api/courses/$global:newCourseId" -H "Authorization: Bearer $global:instructorToken" -H "Content-Type: application/json" --data-binary "@update-course.json" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r5.success) | Updated: $($r5.data.title)"
✓ Status: True | Updated: Updated Test Course API
PS H:\DACN> Start-Sleep -Seconds 2; $r5 = curl -X PUT "http://localhost:3000/api/courses/$global:newCourseId" -H "Authorization: Bearer $global:instructorToken" -H "Content-Type: application/json" --data-binary "@update-course.json" -s | ConvertFrom-Json; Write-Output "Status: $($r5.success)"; if ($r5.success) { Write-Output "Updated: $($r5.data.title)" } else { $r5 | ConvertTo-Json -Depth 3 }
Status: True
Updated: Updated Test Course API
PS H:\DACN> # Test 6: Enroll in Course (Student)
PS H:\DACN> Write-Output "`n[TEST 6] POST /api/courses/:courseId/enroll - Enroll in course"

[TEST 6] POST /api/courses/:courseId/enroll - Enroll in course        
PS H:\DACN> $r6 = curl -X POST "http://localhost:3000/api/courses/$global:newCourseId/enroll" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r6.success) | Message: $($r6.message)"
✓ Status: True | Message: Enrolled in course successfully
PS H:\DACN> Start-Sleep -Seconds 2; $r6 = curl -X POST "http://localhost:3000/api/courses/$global:newCourseId/enroll" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json; Write-Output "Status: $($r6.success) | Message: $($r6.message)"                            
Status: False | Message: User is already enrolled in this course      
PS H:\DACN> $testCourseId = "10000000-0000-0000-0000-000000000003"; $r6b = curl -X POST "http://localhost:3000/api/courses/$testCourseId/enroll" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json; Write-Output "Status: $($r6b.success) | Message: $($r6b.message)"
Status: True | Message: Enrolled in course successfully
PS H:\DACN> # Test 7: Get Course Students (Instructor only)
PS H:\DACN> Write-Output "`n[TEST 7] GET /api/courses/:courseId/students - Get course students"

[TEST 7] GET /api/courses/:courseId/students - Get course students    
PS H:\DACN> $r7 = curl -X GET "http://localhost:3000/api/courses/$global:newCourseId/students" -H "Authorization: Bearer $global:instructorToken" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r7.success) | Total students: $($r7.data.pagination.total)"
✓ Status: True | Total students: 1
PS H:\DACN> 
PS H:\DACN> # Test 8: Unenroll from Course
PS H:\DACN> Write-Output "`n[TEST 8] DELETE /api/courses/:courseId/unenroll - Unenroll from course"

[TEST 8] DELETE /api/courses/:courseId/unenroll - Unenroll from course
PS H:\DACN> $r8 = curl -X DELETE "http://localhost:3000/api/courses/$testCourseId/unenroll" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r8.success) | Message: $($r8.message)"
✓ Status: True | Message: Unenrolled from course successfully
PS H:\DACN> Start-Sleep -Seconds 3; $r7 = curl -X GET "http://localhost:3000/api/courses/$global:newCourseId/students" -H "Authorization: Bearer $global:instructorToken" -s | ConvertFrom-Json; Write-Output "Status: $($r7.success) | Total students: $($r7.data.pagination.total)"; $r8 = curl -X DELETE "http://localhost:3000/api/courses/$testCourseId/unenroll" -H "Authorization: Bearer $global:studentToken" -s | ConvertFrom-Json; Write-Output "Unenroll Status: $($r8.success) | Message: $($r8.message)"
Status: True | Total students: 1
Unenroll Status: False | Message: Enrollment not found
PS H:\DACN> # Test 9: Delete Course (Instructor only)
PS H:\DACN> Write-Output "`n[TEST 9] DELETE /api/courses/:id - Delete course"

[TEST 9] DELETE /api/courses/:id - Delete course
PS H:\DACN> $r9 = curl -X DELETE "http://localhost:3000/api/courses/$global:newCourseId" -H "Authorization: Bearer $global:instructorToken" -s | ConvertFrom-Json
PS H:\DACN> Write-Output "✓ Status: $($r9.success) | Message: $($r9.message)"
✓ Status: True | Message: Course deleted successfully
PS H:\DACN> 
PS H:\DACN> Write-Output "`n========================================`n=== TEST SUMMARY ===`n========================================"       

========================================
=== TEST SUMMARY ===
========================================
PS H:\DACN> Write-Output "✓ All 9 Course API endpoints tested successfully!"
✓ All 9 Course API endpoints tested successfully!
PS H:\DACN> Write-Output "`nTested endpoints:"

Tested endpoints:
PS H:\DACN> Write-Output "1. GET /api/courses - List all courses (public)"
1. GET /api/courses - List all courses (public)
PS H:\DACN> Write-Output "2. GET /api/courses/:id - Get course details"
2. GET /api/courses/:id - Get course details
PS H:\DACN> Write-Output "3. GET /api/courses/enrolled - Get enrolled courses (auth)"
3. GET /api/courses/enrolled - Get enrolled courses (auth)
PS H:\DACN> Write-Output "4. POST /api/courses - Create course (instructor)"
4. POST /api/courses - Create course (instructor)
PS H:\DACN> Write-Output "5. PUT /api/courses/:id - Update course (instructor)"
5. PUT /api/courses/:id - Update course (instructor)
PS H:\DACN> Write-Output "6. POST /api/courses/:courseId/enroll - Enroll in course"
6. POST /api/courses/:courseId/enroll - Enroll in course
PS H:\DACN> Write-Output "7. GET /api/courses/:courseId/students - Get course students"
7. GET /api/courses/:courseId/students - Get course students
PS H:\DACN> Write-Output "8. DELETE /api/courses/:courseId/unenroll - Unenroll from course"
8. DELETE /api/courses/:courseId/unenroll - Unenroll from course
PS H:\DACN> Write-Output "9. DELETE /api/courses/:id - Delete course (instructor)"
9. DELETE /api/courses/:id - Delete course (instructor)
PS H:\DACN> Start-Sleep -Seconds 2; $r9 = curl -X DELETE "http://localhost:3000/api/courses/$global:newCourseId" -H "Authorization: Bearer $global:instructorToken" -s | ConvertFrom-Json; Write-Output "Status: $($r9.success) | Message: $($r9.message)"; Write-Output "`n=== ALL TESTS COMPLETED ==="                                                      
Status: False | Message: Course not found                                                                                                   
=== ALL TESTS COMPLETED ===