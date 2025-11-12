# Manual Testing Guide - Phase 2.3: Course Detail Page

## ✅ Phase 2.3 Completed

### Files Created
1. ✅ `src/pages/CourseDetailPage.tsx` - Main detail page with enrollment
2. ✅ `src/routes/index.tsx` - Updated with CourseDetailPage route

### Route Added
- `/courses/:id` → CourseDetailPage

---

## Test Scenarios

### 1. **Navigation to Course Detail**

#### From Course Catalog
1. Navigate to `/courses`
2. Click on any course card's "Xem chi tiết" button
3. ✅ Should navigate to `/courses/:id`
4. ✅ Should display full course information

#### Direct URL
1. Navigate directly to `/courses/1` (or any valid course ID)
2. ✅ Should load course details
3. ✅ Should show breadcrumb: Trang chủ / Khóa học / [Course Title]

---

### 2. **Course Overview Section (Hero)**

#### Course Info Display
- ✅ Breadcrumb navigation working
- ✅ Course title displayed (large, bold)
- ✅ Course description displayed
- ✅ Difficulty badge (Cơ bản/Trung cấp/Nâng cao) with correct color
- ✅ Student count displayed (icon + number)
- ✅ Duration hours displayed (icon + hours)

#### Instructor Card
- ✅ Instructor avatar (first letter, circular)
- ✅ Instructor full name
- ✅ "Giảng viên" label

---

### 3. **Enrollment Card (Sidebar)**

#### Price Display
- ✅ Free course: "Miễn phí" (green text)
- ✅ Paid course: Price with VND format (e.g., "1.000.000 đ")
- ✅ Dollar sign icon for paid courses

#### Thumbnail
- ✅ Course thumbnail displays if available
- ✅ Placeholder icon if no thumbnail (BookOpen icon)
- ✅ Aspect ratio 16:9 maintained

#### Enroll Button
- ✅ "Đăng ký ngay" button visible
- ✅ Full width button
- ✅ "30 ngày đảm bảo hoàn tiền" text below

#### Sticky Behavior
- ✅ Card should stick to top on scroll (desktop)

---

### 4. **Main Content Sections**

#### "Bạn sẽ học được gì" Section
- ✅ Card with title
- ✅ 2-column grid (desktop)
- ✅ Checkmark icons (green)
- ✅ 4 learning points displayed

#### "Mô tả khóa học" Section
- ✅ Full course description
- ✅ Text formatted with whitespace-pre-line
- ✅ Readable typography

#### "Yêu cầu" Section
- ✅ Requirements list
- ✅ Bullet points with blue dots
- ✅ Default requirements shown

---

### 5. **Instructor Info Card (Sidebar)**

#### Instructor Details
- ✅ Large avatar (64x64)
- ✅ Instructor name
- ✅ "Giảng viên" label
- ✅ Experience indicators (Award icon)
- ✅ Student count (Users icon)

---

### 6. **Enrollment Flow**

#### When User is NOT Logged In
1. Click "Đăng ký ngay" button
2. ✅ Should redirect to `/login`
3. ✅ Should pass return URL in state

#### When User IS Logged In
1. Click "Đăng ký ngay" button
2. ✅ Modal should open with title "Xác nhận đăng ký"
3. ✅ Modal shows course title
4. ✅ Free course: Shows "✓ Khóa học này hoàn toàn miễn phí"
5. ✅ Paid course: Shows "Giá: X đ"

#### Modal Actions
1. Click "Hủy" button
   - ✅ Modal closes
   - ✅ No API call made

2. Click "Xác nhận đăng ký" button
   - ✅ Button shows loading state
   - ✅ API call to `POST /courses/:id/enroll`
   - ✅ On success: Modal closes
   - ✅ On success: Redirect to `/student/courses/:id/learn`

#### Modal Features
- ✅ ESC key closes modal
- ✅ Click outside closes modal
- ✅ Buttons disabled during enrollment
- ✅ Loading spinner on confirm button

---

### 7. **Error Handling**

#### Invalid Course ID
1. Navigate to `/courses/99999` (non-existent)
2. ✅ Should show "Không tìm thấy khóa học"
3. ✅ Should show link "Quay lại danh sách khóa học"
4. ✅ Link should navigate to `/courses`

#### Loading State
1. Navigate to course detail page
2. ✅ Should show full-screen spinner (XL size)
3. ✅ Spinner centered on page

#### Network Error
1. Simulate network failure
2. ✅ Should show error message
3. ✅ Should allow retry

---

### 8. **Responsive Design**

#### Mobile (< 768px)
- ✅ Single column layout
- ✅ Hero section: stacked vertically
- ✅ Enrollment card appears after hero
- ✅ Main content: full width
- ✅ "Bạn sẽ học được gì": single column
- ✅ Breadcrumb wraps properly

#### Tablet (768px - 1024px)
- ✅ 2-column layout maintained
- ✅ Enrollment card in sidebar
- ✅ Content readable

#### Desktop (> 1024px)
- ✅ 3-column grid (2 cols content, 1 col sidebar)
- ✅ Sticky enrollment card
- ✅ Optimal reading width

---

### 9. **Visual & UX**

#### Typography
- ✅ Title: 3xl on mobile, 4xl on desktop
- ✅ Text hierarchy clear
- ✅ Consistent spacing

#### Colors
- ✅ Hero gradient: blue-600 to blue-800
- ✅ White text on hero
- ✅ Proper contrast ratios
- ✅ Badge colors match difficulty

#### Hover States
- ✅ Breadcrumb links hover effect
- ✅ "Hủy" button hover effect
- ✅ "Đăng ký ngay" button hover effect

---

## Integration Test

### Complete Flow
1. Start at `/courses` (catalog)
2. Search for a course
3. Click "Xem chi tiết" on a course card
4. Review course details
5. Click "Đăng ký ngay"
6. Confirm enrollment in modal
7. Verify redirect to learning page

---

## Known Limitations

1. **Curriculum Preview**: Not yet implemented (Phase 2.4)
2. **Reviews Section**: Not yet implemented (Phase 2.5)
3. **Already Enrolled State**: Not handled yet (should show "Tiếp tục học" button)
4. **Dynamic Learning Outcomes**: Currently hardcoded, should come from API

---

## Next Steps

Phase 2.3 is **COMPLETE** ✅

Ready for Phase 2.4: Learning Environment (Week 4)
