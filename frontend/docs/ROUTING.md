Dưới đây là bản phân tích lại theo phong cách rõ ràng, trực quan, sử dụng bảng để bạn dễ dàng đối chiếu giữa **Cấu trúc File (Vật lý)** và **Routing (Logic)**.

---

# **📊 Phân Tích & Tái Cấu Trúc: Hybrid Routing Model**

Mô hình **Hybrid** kết hợp giữa tài nguyên chung (Resource-Centric) và không gian làm việc riêng (Role-Centric) là mô hình rất tốt cho LMS. Tuy nhiên, hiện trạng dự án đang có sự **bất nhất** giữa code định nghĩa route và nơi đặt file.

### **1\. Đánh Giá Mô Hình Routing Hiện Tại (Logic)**

Về mặt tư duy Routing (URL), hệ thống đang thiết kế **ĐÚNG**.

| Phân Loại | Route Prefix | Ý Nghĩa (Role) | Ví Dụ URL | Đánh Giá |
| :---- | :---- | :---- | :---- | :---- |
| **🔵 Resource-Centric** *(Tài nguyên chung)* | /courses | **Public / Shared** Ai cũng xem được, dùng chung logic hiển thị. | /courses /courses/:id /livestream | ✅ Chuẩn |
| **🟢 Role-Centric** *(Workspace đặc thù)* | /student/\* | **Student Only** Không gian học tập riêng của học viên. | /student/dashboard /student/my-courses | ✅ Chuẩn |
|  | /instructor/\* | **Instructor Only** Không gian quản lý của giảng viên. | /instructor/dashboard /instructor/create | ✅ Chuẩn |

---

### **2\. Vấn Đề Bất Cập: Cấu Trúc File vs. Routing**

Về mặt tổ chức File (Physical), hệ thống đang **SAI**. Các file dành riêng cho role (Student/Instructor) lại đang bị "nhét" chung vào thư mục public (pages/course/).

**Bảng phân tích các vi phạm:**

| Tên Page | Vị Trí File Hiện Tại (SAI) ❌ | Route URL Thực Tế (ĐÚNG) ✅ | Tại Sao Sai? |
| :---- | :---- | :---- | :---- |
| **LearningPage** | pages/course/learning/ | /student/courses/:id/learn | File nằm ở thư mục chung, nhưng URL lại thuộc về **Student**. |
| **EditorPage** | pages/course/editor/ | /instructor/courses/:id/edit | File nằm ở thư mục chung, nhưng URL lại thuộc về **Instructor**. |
| **MyCoursesPage** | pages/course/management/ | /instructor/my-courses | File nằm ở thư mục chung, nhưng URL lại thuộc về **Instructor**. |

**⚠️ Hệ quả:** Cấu trúc folder không phản ánh đúng quyền hạn người dùng, gây khó khăn khi bảo trì (ví dụ: tìm file của instructor nhưng lại phải vào folder course).

---

### **3\. Giải Pháp Đề Xuất (Phương Án A)**

Chúng ta sẽ **giữ nguyên Routing**, nhưng **di chuyển File** về đúng "nhà" của nó.

**Cấu trúc thư mục mục tiêu (Recommended):**

Plaintext

frontend/src/pages/  
├── 📂 course/                  (🔵 PUBLIC \- Chỉ chứa cái ai cũng xem được)  
│   ├── catalog/                → Route: /courses  
│   └── detail/                 → Route: /courses/:id  
│  
├── 📂 student/                 (🟢 STUDENT WORKSPACE)  
│   ├── DashboardPage.tsx       → Route: /student/dashboard  
│   ├── MyCoursesPage.tsx       → Route: /student/my-courses  
│   └── LearningPage.tsx        ✨ (Chuyển từ course/learning sang đây)  
│  
└── 📂 instructor/              (🟢 INSTRUCTOR WORKSPACE)  
    ├── DashboardPage.tsx       → Route: /instructor/dashboard  
    ├── MyCoursesPage.tsx       ✨ (Chuyển từ course/management sang đây)  
    └── CourseEditorPage.tsx    ✨ (Chuyển từ course/editor sang đây)

---

### **4\. Tổng Kết & Kế Hoạch Hành Động**

**Đánh giá cuối cùng:**

| Tiêu Chí | Trạng Thái | Nhận Xét |
| :---- | :---- | :---- |
| **Routing Constants** (routes.ts) | ✅ Tốt | Đã tuân thủ Hybrid Model. |
| **Route Definitions** (index.tsx) | ✅ Tốt | Đã phân chia quyền truy cập đúng. |
| **File Structure** (pages/) | ❌ Cần sửa | Đang vi phạm nguyên tắc tổ chức. |

Hành động tiếp theo:  
Bạn nên thực hiện Move Files theo cấu trúc ở mục 3\. Việc này đảm bảo:

1. **Tính nhất quán:** Nhìn vào folder student là thấy toàn bộ chức năng của student.  
2. **Bảo mật:** Dễ dàng áp dụng các Middleware/Guard check quyền ngay từ cấp thư mục cha nếu cần sau này.  
3. **Dễ mở rộng:** Khi thêm tính năng mới cho Instructor, bạn biết ngay phải tạo file ở đâu (pages/instructor/) thay vì phân vân ném vào pages/course/.