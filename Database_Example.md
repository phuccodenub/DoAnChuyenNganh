-- ===================================
-- 1. USER & AUTHENTICATION MANAGEMENT
-- ===================================
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, -- Thêm trường username để đăng nhập (VD: mã số sinh viên)
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
    avatar_url NVARCHAR(MAX),
    bio NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    email_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE PasswordResetTokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- ===================================
-- 2. COURSE MANAGEMENT
-- ===================================
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE Courses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    instructor_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
    category_id INT FOREIGN KEY REFERENCES Categories(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    thumbnail_url NVARCHAR(MAX),
    start_date DATE,
    end_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE Enrollments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    enrolled_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2,
    UNIQUE(user_id, course_id)
);
GO

-- ===================================
-- 3. COURSE CONTENT MANAGEMENT
-- ===================================
CREATE TABLE Sections (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    order_index INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(course_id, order_index)
);
GO

CREATE TABLE Lessons (
    id INT IDENTITY(1,1) PRIMARY KEY,
    section_id INT NOT NULL FOREIGN KEY REFERENCES Sections(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'document', 'text', 'link')),
    order_index INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(section_id, order_index)
);
GO

CREATE TABLE LessonMaterials (
    id INT IDENTITY(1,1) PRIMARY KEY,
    lesson_id INT NOT NULL FOREIGN KEY REFERENCES Lessons(id) ON DELETE CASCADE,
    file_name NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(MAX) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE LessonProgress (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    lesson_id INT NOT NULL FOREIGN KEY REFERENCES Lessons(id) ON DELETE CASCADE,
    completed BIT DEFAULT 0,
    last_position INT DEFAULT 0,
    completed_at DATETIME2,
    updated_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(user_id, lesson_id)
);
GO

-- ===================================
-- 4. LIVESTREAM & ONLINE CLASSES
-- ===================================
CREATE TABLE LiveSessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    instructor_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    scheduled_at DATETIME2 NOT NULL,
    duration_minutes INT,
    meeting_url NVARCHAR(MAX),
    meeting_id VARCHAR(100),
    meeting_password VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    recording_url NVARCHAR(MAX),
    started_at DATETIME2,
    ended_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE LiveSessionAttendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    session_id INT NOT NULL FOREIGN KEY REFERENCES LiveSessions(id) ON DELETE CASCADE,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    joined_at DATETIME2 DEFAULT GETDATE(),
    left_at DATETIME2,
    duration_minutes INT,
    UNIQUE(session_id, user_id)
);
GO

-- ===================================
-- 5. QUIZ & ASSIGNMENT MANAGEMENT
-- ===================================
CREATE TABLE Quizzes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    duration_minutes INT,
    passing_score DECIMAL(5,2),
    max_attempts INT DEFAULT 1,
    shuffle_questions BIT DEFAULT 0,
    show_correct_answers BIT DEFAULT 1,
    available_from DATETIME2,
    available_until DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE QuizQuestions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quiz_id INT NOT NULL FOREIGN KEY REFERENCES Quizzes(id) ON DELETE CASCADE,
    question_text NVARCHAR(MAX) NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
    points DECIMAL(5,2) DEFAULT 1.0,
    order_index INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE QuizOptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    question_id INT NOT NULL FOREIGN KEY REFERENCES QuizQuestions(id) ON DELETE CASCADE,
    option_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT DEFAULT 0,
    order_index INT NOT NULL
);
GO

CREATE TABLE QuizAttempts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quiz_id INT NOT NULL FOREIGN KEY REFERENCES Quizzes(id) ON DELETE CASCADE,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    started_at DATETIME2 DEFAULT GETDATE(),
    submitted_at DATETIME2,
    time_spent_minutes INT,
    UNIQUE(quiz_id, user_id, attempt_number)
);
GO

CREATE TABLE QuizAnswers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    attempt_id INT NOT NULL FOREIGN KEY REFERENCES QuizAttempts(id) ON DELETE CASCADE,
    question_id INT NOT NULL FOREIGN KEY REFERENCES QuizQuestions(id) ON DELETE CASCADE,
    selected_option_id INT FOREIGN KEY REFERENCES QuizOptions(id),
    is_correct BIT,
    points_earned DECIMAL(5,2),
    UNIQUE(attempt_id, question_id)
);
GO

CREATE TABLE Assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    max_score DECIMAL(5,2) DEFAULT 100.0,
    due_date DATETIME2,
    allow_late_submission BIT DEFAULT 0,
    submission_type VARCHAR(20) CHECK (submission_type IN ('file', 'text', 'both')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE AssignmentSubmissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL FOREIGN KEY REFERENCES Assignments(id) ON DELETE CASCADE,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    submission_text NVARCHAR(MAX),
    file_url NVARCHAR(MAX),
    file_name NVARCHAR(255),
    submitted_at DATETIME2 DEFAULT GETDATE(),
    score DECIMAL(5,2),
    feedback NVARCHAR(MAX),
    graded_by INT FOREIGN KEY REFERENCES Users(id),
    graded_at DATETIME2,
    UNIQUE(assignment_id, user_id)
);
GO

-- ===================================
-- 6. GRADE MANAGEMENT
-- ===================================
CREATE TABLE GradeComponents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    component_type VARCHAR(20) CHECK (component_type IN ('quiz', 'assignment', 'attendance', 'participation', 'manual')),
    component_id INT,
    weight DECIMAL(5,2) NOT NULL,
    name NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE Grades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    component_id INT FOREIGN KEY REFERENCES GradeComponents(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    graded_by INT FOREIGN KEY REFERENCES Users(id),
    graded_at DATETIME2 DEFAULT GETDATE(),
    notes NVARCHAR(MAX)
);
GO

CREATE TABLE FinalGrades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    total_score DECIMAL(5,2),
    letter_grade VARCHAR(2),
    calculated_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(user_id, course_id)
);
GO

-- ===================================
-- 7. CHAT & COMMUNICATION
-- ===================================
CREATE TABLE ChatRooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    room_type VARCHAR(20) CHECK (room_type IN ('course_group', 'private')),
    name NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE ChatParticipants (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT NOT NULL FOREIGN KEY REFERENCES ChatRooms(id) ON DELETE CASCADE,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    joined_at DATETIME2 DEFAULT GETDATE(),
    last_read_at DATETIME2,
    UNIQUE(room_id, user_id)
);
GO

CREATE TABLE ChatMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT NOT NULL FOREIGN KEY REFERENCES ChatRooms(id) ON DELETE CASCADE,
    sender_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    message_text NVARCHAR(MAX) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'link')),
    file_url NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    edited_at DATETIME2,
    deleted_at DATETIME2
);
GO

-- ===================================
-- 8. NOTIFICATIONS (Updated to M-N Relationship)
-- ===================================
-- This table stores the original content of the notification
CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT FOREIGN KEY REFERENCES Users(id), -- ID of the notification creator
    notification_type VARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    link_url NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Junction table to record which user receives which notification and their read status
CREATE TABLE NotificationRecipients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    notification_id INT NOT NULL FOREIGN KEY REFERENCES Notifications(id) ON DELETE CASCADE,
    recipient_id INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    UNIQUE(notification_id, recipient_id) -- Ensures a user receives a notification only once
);
GO

-- ===================================
-- 9. SYSTEM LOGS & ANALYTICS
-- ===================================
CREATE TABLE UserActivityLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_description NVARCHAR(MAX),
    ip_address VARCHAR(45),
    user_agent NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE CourseStatistics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL FOREIGN KEY REFERENCES Courses(id) ON DELETE CASCADE,
    total_enrollments INT DEFAULT 0,
    active_enrollments INT DEFAULT 0,
    completion_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    updated_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE(course_id)
);
GO

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================
-- Indexes for Users
CREATE INDEX idx_Users_email ON Users(email);
CREATE INDEX idx_Users_role ON Users(role);
CREATE INDEX idx_Users_active ON Users(is_active);

-- Indexes for Courses
CREATE INDEX idx_Courses_instructor ON Courses(instructor_id);
CREATE INDEX idx_Courses_category ON Courses(category_id);
CREATE INDEX idx_Courses_status ON Courses(status);

-- Indexes for Enrollments
CREATE INDEX idx_Enrollments_user ON Enrollments(user_id);
CREATE INDEX idx_Enrollments_course ON Enrollments(course_id);
CREATE INDEX idx_Enrollments_status ON Enrollments(status);

-- Indexes for Content
CREATE INDEX idx_Sections_course ON Sections(course_id);
CREATE INDEX idx_Lessons_section ON Lessons(section_id);
CREATE INDEX idx_LessonProgress_user ON LessonProgress(user_id);
CREATE INDEX idx_LessonProgress_lesson ON LessonProgress(lesson_id);

-- Indexes for Quizzes
CREATE INDEX idx_Quizzes_course ON Quizzes(course_id);
CREATE INDEX idx_QuizAttempts_user ON QuizAttempts(user_id);
CREATE INDEX idx_QuizAttempts_quiz ON QuizAttempts(quiz_id);

-- Indexes for Assignments
CREATE INDEX idx_Assignments_course ON Assignments(course_id);
CREATE INDEX idx_AssignmentSubmissions_user ON AssignmentSubmissions(user_id);
CREATE INDEX idx_AssignmentSubmissions_assignment ON AssignmentSubmissions(assignment_id);

-- Indexes for Grades
CREATE INDEX idx_Grades_user ON Grades(user_id);
CREATE INDEX idx_Grades_course ON Grades(course_id);
CREATE INDEX idx_FinalGrades_user ON FinalGrades(user_id);
CREATE INDEX idx_FinalGrades_course ON FinalGrades(course_id);

-- Indexes for Chat
CREATE INDEX idx_ChatMessages_room ON ChatMessages(room_id);
CREATE INDEX idx_ChatMessages_sender ON ChatMessages(sender_id);
CREATE INDEX idx_ChatMessages_created ON ChatMessages(created_at DESC);

-- Indexes for Notifications (Updated)
CREATE INDEX idx_Notifications_sender ON Notifications(sender_id);
CREATE INDEX idx_NotificationRecipients_recipient ON NotificationRecipients(recipient_id);
CREATE INDEX idx_NotificationRecipients_unread ON NotificationRecipients(recipient_id, is_read) WHERE is_read = 0;

-- Indexes for UserActivityLogs
CREATE INDEX idx_UserActivityLogs_user ON UserActivityLogs(user_id);
CREATE INDEX idx_UserActivityLogs_created ON UserActivityLogs(created_at DESC);
GO

-- ===================================
-- TRIGGERS FOR AUTO-UPDATE updated_at
-- ===================================

CREATE TRIGGER trg_Users_update_updated_at
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET updated_at = GETDATE()
    FROM Users AS u
    INNER JOIN inserted AS i ON u.id = i.id;
END;
GO

CREATE TRIGGER trg_Courses_update_updated_at
ON Courses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE c
    SET updated_at = GETDATE()
    FROM Courses AS c
    INNER JOIN inserted AS i ON c.id = i.id;
END;
GO

CREATE TRIGGER trg_Lessons_update_updated_at
ON Lessons
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE l
    SET updated_at = GETDATE()
    FROM Lessons AS l
    INNER JOIN inserted AS i ON l.id = i.id;
END;
GO

CREATE TRIGGER trg_Quizzes_update_updated_at
ON Quizzes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE q
    SET updated_at = GETDATE()
    FROM Quizzes AS q
    INNER JOIN inserted AS i ON q.id = i.id;
END;
GO

CREATE TRIGGER trg_Assignments_update_updated_at
ON Assignments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE a
    SET updated_at = GETDATE()
    FROM Assignments AS a
    INNER JOIN inserted AS i ON a.id = i.id;
END;
GO


Dưới đây là một vài nghiệp vụ (Mô tả tên bảng bằng tiếng việt): 
Sơ đồ Ký hiệu
[Bảng A] 1 ---< [Bảng B]: Mối quan hệ Một - Nhiều (One-to-Many). Một bản ghi ở Bảng A có thể liên quan đến nhiều bản ghi ở Bảng B.

[Bảng A] >---< [Bảng B]: Mối quan hệ Nhiều - Nhiều (Many-to-Many), thường được hiện thực hóa qua một bảng trung gian.

[Bảng A] 1 --- 1 [Bảng B]: Mối quan hệ Một - Một (One-to-One).

1. Quản lý Người dùng & Xác thực
NguoiDung: Bảng trung tâm, lưu trữ thông tin về tất cả các tài khoản trong hệ thống (quản trị viên, giảng viên, sinh viên).

TokenDatLaiMatKhau: Bảng lưu các token dùng cho chức năng "quên mật khẩu".

Quan hệ:

NguoiDung 1 ---< TokenDatLaiMatKhau

Nghiệp vụ: Một người dùng có thể yêu cầu đặt lại mật khẩu nhiều lần (tạo ra nhiều token ở các thời điểm khác nhau), nhưng mỗi token chỉ thuộc về một và chỉ một người dùng.

Ràng buộc: ON DELETE CASCADE đảm bảo rằng nếu một tài khoản người dùng bị xóa, tất cả các token yêu cầu đặt lại mật khẩu liên quan cũng sẽ tự động bị xóa theo.

2. Quản lý Khóa học
DanhMuc: Lưu các danh mục hoặc chủ đề của khóa học (VD: "Lập trình", "Thiết kế", "Kinh doanh").

KhoaHoc: Lưu thông tin chi tiết về từng khóa học.

GhiDanh: Bảng trung gian ghi lại việc sinh viên nào đã đăng ký vào khóa học nào.

Quan hệ:

NguoiDung 1 ---< KhoaHoc (qua instructor_id)

Nghiệp vụ: Một giảng viên (NguoiDung với role='instructor') có thể tạo và quản lý nhiều khóa học, nhưng mỗi khóa học chỉ do một giảng viên duy nhất phụ trách.

DanhMuc 1 ---< KhoaHoc

Nghiệp vụ: Một danh mục có thể chứa nhiều khóa học, nhưng mỗi khóa học chỉ thuộc về một danh mục.

NguoiDung >---< KhoaHoc (qua bảng GhiDanh)

Nghiệp vụ: Đây là mối quan hệ Nhiều-Nhiều. Một sinh viên có thể ghi danh vào nhiều khóa học, và một khóa học có thể có nhiều sinh viên ghi danh.

Bảng GhiDanh hiện thực hóa mối quan hệ này. Mỗi dòng trong bảng GhiDanh là một "lượt đăng ký" của một sinh viên vào một khóa học cụ thể, cùng với trạng thái của việc đăng ký đó (chờ duyệt, đã duyệt, đã hoàn thành...).

Ràng buộc: UNIQUE(user_id, course_id) đảm bảo một sinh viên chỉ có thể ghi danh vào một khóa học một lần duy nhất. ON DELETE CASCADE nghĩa là nếu sinh viên hoặc khóa học bị xóa, bản ghi ghi danh tương ứng cũng sẽ bị xóa.

3. Quản lý Nội dung Khóa học
Đây là một cấu trúc phân cấp rõ ràng: Khóa học > Chương mục > Bài học > Tài liệu.

ChuongMuc: Các phần lớn, chương của một khóa học.

BaiHoc: Các bài học nhỏ trong mỗi chương.

TaiLieuBaiHoc: Các file (video, pdf, docx...) đính kèm cho mỗi bài học.

TienDoBaiHoc: Ghi lại tiến độ học tập của sinh viên đối với từng bài học.

Quan hệ:

KhoaHoc 1 ---< ChuongMuc

Nghiệp vụ: Một khóa học được chia thành nhiều chương mục.

ChuongMuc 1 ---< BaiHoc

Nghiệp vụ: Một chương mục bao gồm nhiều bài học.

BaiHoc 1 ---< TaiLieuBaiHoc

Nghiệp vụ: Một bài học có thể có nhiều tài liệu đính kèm.

NguoiDung >---< BaiHoc (qua bảng TienDoBaiHoc)

Nghiệp vụ: Quan hệ Nhiều-Nhiều. Một sinh viên có tiến độ trên nhiều bài học, và một bài học được nhiều sinh viên học. Bảng TienDoBaiHoc lưu trạng thái cụ thể (đã hoàn thành chưa, xem đến đâu...) của một sinh viên đối với một bài học.

4. Lớp học Trực tuyến
BuoiHocTrucTuyen: Lịch các buổi học live-stream (qua Zoom, Google Meet...).

DiemDanhTrucTuyen: Ghi lại việc tham gia của sinh viên trong các buổi học đó.

Quan hệ:

KhoaHoc 1 ---< BuoiHocTrucTuyen

Nghiệp vụ: Một khóa học có thể có nhiều buổi học trực tuyến được lên lịch.

NguoiDung >---< BuoiHocTrucTuyen (qua bảng DiemDanhTrucTuyen)

Nghiệp vụ: Quan hệ Nhiều-Nhiều. Một sinh viên có thể tham gia nhiều buổi học, và một buổi học có nhiều sinh viên tham gia. Bảng DiemDanhTrucTuyen ghi lại thông tin tham dự này.

5. Quản lý Trắc nghiệm & Bài tập
Cấu trúc phân cấp tương tự phần nội dung: Khóa học > Trắc nghiệm > Câu hỏi > Phương án.

Quan hệ:

KhoaHoc 1 ---< TracNghiem và BaiTap

Nghiệp vụ: Một khóa học có thể có nhiều bài trắc nghiệm và nhiều bài tập lớn.

TracNghiem 1 ---< CauHoiTracNghiem

Nghiệp vụ: Một bài trắc nghiệm gồm nhiều câu hỏi.

CauHoiTracNghiem 1 ---< PhuongAnTracNghiem

Nghiệp vụ: Một câu hỏi có nhiều phương án trả lời.

NguoiDung >---< TracNghiem (qua LanLamBaiTracNghiem)

Nghiệp vụ: Một sinh viên có thể làm một bài trắc nghiệm nhiều lần (attempt_number), và một bài trắc nghiệm có thể được nhiều sinh viên làm. Bảng LanLamBaiTracNghiem lưu lại mỗi lượt làm bài.

NguoiDung >---< BaiTap (qua NopBaiTap)

Nghiệp vụ: Một sinh viên nộp bài cho nhiều bài tập, và một bài tập nhận bài nộp từ nhiều sinh viên. Bảng NopBaiTap lưu bài nộp của sinh viên.

6. Quản lý Điểm số
ThanhPhanDiem: Định nghĩa các cột điểm của một khóa học và trọng số của chúng (VD: Trắc nghiệm 30%, Bài tập lớn 70%).

DiemSo: Lưu điểm chi tiết của sinh viên cho từng thành phần điểm.

DiemTongKet: Lưu điểm tổng kết cuối cùng của sinh viên cho cả khóa học.

Quan hệ:

KhoaHoc 1 ---< ThanhPhanDiem

Nghiệp vụ: Mỗi khóa học có cấu trúc điểm riêng, bao gồm nhiều thành phần điểm.

DiemSo liên kết với NguoiDung, KhoaHoc, và ThanhPhanDiem

Nghiệp vụ: Bảng này là nơi ghi nhận điểm số cụ thể. Ví dụ: Sinh viên "Nguyễn Văn A" (user_id) trong khóa học "CS101" (course_id) đạt được 8 điểm (score) cho "Bài tập lớn 1" (component_id).

NguoiDung >---< KhoaHoc (qua DiemTongKet)

Nghiệp vụ: Về mặt lý thuyết, đây là mối quan hệ Một-Một. Một sinh viên chỉ có một điểm tổng kết duy nhất cho một khóa học. Ràng buộc UNIQUE(user_id, course_id) đã đảm bảo điều này.

7. Chat & Giao tiếp
Quan hệ:

KhoaHoc 1 ---< PhongChat

Nghiệp vụ: Mỗi khóa học có thể có một phòng chat chung. Ngoài ra, có thể có các phòng chat riêng không thuộc khóa học nào.

NguoiDung >---< PhongChat (qua NguoiThamGiaChat)

Nghiệp vụ: Một người dùng có thể tham gia nhiều phòng chat, và một phòng chat có nhiều người tham gia.

PhongChat 1 ---< TinNhanChat

Nghiệp vụ: Một phòng chat chứa nhiều tin nhắn.

NguoiDung 1 ---< TinNhanChat (qua sender_id)

Nghiệp vụ: Một người dùng có thể gửi nhiều tin nhắn.

8. Thông báo
Quan hệ:

NguoiDung >---< ThongBao (qua NhanThongBao)

Khi giáo viên gửi thông báo cho 30 sinh viên:

Hệ thống chỉ cần INSERT một bản ghi duy nhất vào bảng ThongBao để lưu nội dung.

Sau đó, hệ thống INSERT 30 bản ghi vào bảng NhanThongBao, mỗi bản ghi chứa notification_id của thông báo vừa tạo và recipient_id của từng sinh viên.

Khi sinh viên xem danh sách thông báo:

Hệ thống sẽ truy vấn bảng NhanThongBao với recipient_id của sinh viên đó, sau đó JOIN với bảng ThongBao để lấy nội dung chi tiết.

Khi sinh viên đánh dấu "đã đọc" một thông báo:

Hệ thống chỉ cần UPDATE một bản ghi duy nhất trong bảng NhanThongBao (ví dụ: SET is_read = 1) tương ứng với sinh viên và thông báo đó mà không ảnh hưởng đến người khác.

9. Nhật ký hệ thống & Phân tích
Quan hệ:

NguoiDung 1 ---< NhatKyHoatDong

Nghiệp vụ: Hệ thống ghi lại nhiều hành động của một người dùng để phục vụ việc kiểm tra, giám sát.

KhoaHoc 1 --- 1 ThongKeKhoaHoc

Nghiệp vụ: Mỗi khóa học có một và chỉ một bản ghi thống kê đi kèm (tổng số ghi danh, tỷ lệ hoàn thành...). Ràng buộc UNIQUE(course_id) đảm bảo mối quan hệ Một-Một này.

Các bảng liên quan đến AI sẽ được cập nhật và triển khai sau. 