# 🤖 HƯỚNG DẪN CHO AI AGENTS - DỰ ÁN LMS

> **Tài liệu này dành cho các AI Agents tham gia vào dự án LMS.**
>
> **Mục đích:** Đảm bảo tất cả AI Agents làm việc theo cùng một tiêu chuẩn, quy trình và best practices.

---

## ⚠️ QUY TẮC BẮT BUỘC (CRITICAL RULES)

### 🔴 RULE 1: ĐỌC KỸ DỮ LIỆU TRƯỚC KHI CODE

**TRƯỚC KHI viết bất kỳ dòng code nào, bạn PHẢI:**

1. **Phân tích cấu trúc dự án hiện tại**
2. **Hiểu rõ Backend API:**
   - Đọc các route files trong `backend/src/modules/*/routes.ts`
   - Hiểu các endpoints API bạn sẽ tích hợp
   - Kiểm tra request/response types từ backend
3. **Kiểm tra context của task**

**❌ KHÔNG BAO GIỜ:**
- Bắt đầu code mà không đọc tài liệu (hoặc codebase)
- Tự ý thay đổi kiến trúc đã định nghĩa
- Bỏ qua việc kiểm tra code hiện có
- Làm việc mà không hiểu context

---

### 🔴 RULE 2: QUY TRÌNH HOÀN THÀNH CÔNG VIỆC

Sau khi hoàn thành code, **BẮT BUỘC** thực hiện theo thứ tự:

#### **BƯỚC 1: Kiểm tra Lỗi TypeScript**
```powershell
cd frontend && npm run type-check
cd backend && npm run lint
```

**Yêu cầu:**
- ✅ KHÔNG có lỗi TypeScript nào
- ✅ KHÔNG có `any` types (trừ khi thực sự cần thiết và có comment giải thích)
- ✅ Tất cả props đều có types rõ ràng
- ✅ API responses đều có interface definitions

**Nếu có lỗi:** Fix TẤT CẢ lỗi → Chạy lại → Lặp lại cho đến khi KHÔNG còn lỗi

#### **BƯỚC 2: Kiểm tra Linting**
```powershell
npm run lint
```
- ✅ KHÔNG có ESLint errors
- ✅ Warnings nên được fix (nếu có thể)

#### **BƯỚC 3: Test thủ công**
- [ ] Component render đúng
- [ ] Tất cả user interactions
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] API integration (nếu có)
- [ ] Error states
- [ ] Loading states

---

### 🔴 RULE 3: NGÔN NGỮ GIAO DIỆN - TIẾNG VIỆT

**DỰ ÁN NÀY DÀNH CHO NGƯỜI VIỆT NAM**

- **Giao diện mặc định: 100% TIẾNG VIỆT**
- Tất cả text hiển thị trên UI phải là tiếng Việt
- Buttons, labels, placeholders, error messages - TẤT CẢ bằng tiếng Việt
- Ngôn ngữ mặc định trong i18n: `vi` (Vietnamese)

```tsx
// ✅ ĐÚNG - Tiếng Việt
<h1>Chào mừng đến với LMS</h1>
<Button>Đăng nhập</Button>

// ❌ SAI - Tiếng Anh
<h1>Welcome to LMS</h1>
<Button>Login</Button>
```

---

## 🚀 CÁCH CHẠY DỰ ÁN

### ⚠️ DỰ ÁN CHẠY BẰNG DOCKER - KHÔNG CHẠY TRỰC TIẾP

```powershell
# ✅ ĐÚNG: Chạy full-stack (Frontend + Backend + Redis + Postgres)
npm run dev:web

# ✅ ĐÚNG: Chỉ backend + Frontend Vite riêng
npm run dev:api
cd frontend && npm run dev  # Frontend chạy trên port 5174
```

```powershell
# ❌ SAI: Không chạy trực tiếp npm run dev ở backend!
cd backend && npm run dev  # ← KHÔNG HOẠT ĐỘNG vì thiếu Redis, Postgres
```
Cung cấp cho bạn các tài khoản để test :
admin@example.com - Admin123!
instructor1@example.com - Instructor123!
student1@example.com - Student123!
Hiện tại dự án cần hoạt động với supabase nên chú ý nếu seed data hay run migration thì đều phải trỏ vào supabase. 

### 📊 Ports mặc định
| Service | Port | URL |
|---------|------|-----|
| Frontend (Docker nginx) | 3001 | http://localhost:3001 |
| Frontend (Vite dev) | 5174 | http://localhost:5174 |
| Backend API | 3000 | http://localhost:3000/api/v1.3.0 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |

---

## 📋 KIỂM TRA LOGS

```powershell
# Xem logs realtime
docker logs lms-backend-dev -f

# Xem 50 dòng cuối
docker logs lms-backend-dev --tail 50

# Tìm lỗi cụ thể
docker logs lms-backend-dev 2>&1 | Select-String -Pattern "error|Error|ERROR"

# Restart backend
docker-compose -p lms -f docker/environments/development/full-stack.yml restart backend-dev
```

---

## 🔌 API & AUTHENTICATION

### JWT Token (QUAN TRỌNG!)
```typescript
// Token payload structure
interface JWTPayload {
  userId: string;    // ← Dùng userId, KHÔNG phải id
  email: string;
  role: string;
}

// Trong controller, lấy user từ request:
const userId = req.user.userId;  // ✅ ĐÚNG
const userId = req.user.id;      // ❌ SAI
```

---

## 💻 CODING STANDARDS

### TypeScript Standards
```tsx
// ✅ ĐÚNG - Strongly typed
interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
}

function UserCard({ user }: { user: User }) {
  return <div>{user.full_name}</div>;
}

// ❌ SAI - Weak typing
function UserCard({ user }: { user: any }) {
  return <div>{user.full_name}</div>;
}
```

### React Query Standards
```tsx
const { data, isLoading, error } = useQuery(...);

// ✅ ĐÚNG - Handle all states
if (isLoading) return <Spinner />;
if (error) return <Error />;
return <div>{data.map(...)}</div>;

// ❌ SAI - No error/loading handling
return <div>{data.map(...)}</div>;
```

### Naming Conventions
- Components: `PascalCase` - `CourseCard`, `UserProfile`
- Functions: `camelCase` - `getUserProfile`, `handleSubmit`
- Constants: `UPPER_SNAKE_CASE` - `API_BASE_URL`
- Files: Components `PascalCase.tsx`, Utils `camelCase.ts`

---

## 🔧 DEVELOPMENT WORKFLOW

```
1. Nhận task
   ↓
2. Đọc docs & analyze code
   ↓
3. Plan implementation
   ↓
4. Write code
   ↓
5. Test locally
   ↓
6. Fix TypeScript errors (npm run type-check)
   ↓
7. Fix ESLint errors (npm run lint)
   ↓
8. Manual testing
   ↓
9. Commit & push
```

---

## 🐞 COMMON PITFALLS

| ❌ SAI | ✅ ĐÚNG |
|--------|---------|
| `user: any` | `user: User` |
| Hardcode strings | Dùng i18n translations |
| Inline styles | TailwindCSS classes |
| Không cleanup useEffect | `return () => cleanup()` |
| Không handle loading/error | Luôn check `isLoading`, `error` |
| `req.user.id` | `req.user.userId` |

---

## ✅ FINAL CHECKLIST

Trước khi đánh dấu task hoàn thành:

- [ ] Code chạy không có lỗi
- [ ] TypeScript type-check passed (`npm run type-check`)
- [ ] ESLint check passed (`npm run lint`)
- [ ] Tất cả text trong UI là tiếng Việt
- [ ] Component responsive (mobile, tablet, desktop)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] API integration tested (nếu có)
- [ ] Đã commit code với message rõ ràng
- [ ] Không còn console.log không cần thiết

---

## 📚 FILES QUAN TRỌNG

| File | Mô tả |
|------|-------|
| `backend/src/api/v1/routes/index.ts` | Đăng ký tất cả API routes |
| `backend/src/middlewares/auth.middleware.ts` | JWT authentication |
| `frontend/src/services/http/client.ts` | Axios client setup |
| `frontend/src/services/socketService.ts` | Socket.IO client |
| `docker/environments/development/full-stack.yml` | Docker compose |

---

## 🎯 WORKFLOW CHO AI

1. **Đọc kỹ codebase** trước khi sửa đổi
2. **Đọc logs trước** khi debug
3. **Dùng Docker commands** để kiểm tra, KHÔNG chạy trực tiếp
4. **Kiểm tra JWT payload** khi có lỗi authentication (`userId` không phải `id`)
5. **Test API bằng curl** trước khi sửa code
6. **Restart container** sau khi sửa backend code
7. **Chạy type-check và lint** trước khi commit

---

*Last updated: 2025-12-05*
