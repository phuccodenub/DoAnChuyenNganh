# 🤖 HƯỚNG DẪN CHO AI AGENTS - REFACTOR FRONTEND LMS

> **Tài liệu này dành cho các AI Agents tham gia vào quá trình refactor frontend LMS.**
> 
> **Mục đích:** Đảm bảo tất cả AI Agents làm việc theo cùng một tiêu chuẩn, quy trình và best practices.

---

## 📌 QUY TẮC BẮT BUỘC (CRITICAL RULES)

### ⚠️ RULE 1: ĐỌC KỸ DỰ ÁN TRƯỚC KHI CODE

**TRƯỚC KHI viết bất kỳ dòng code nào, bạn PHẢI:**

1. **Đọc toàn bộ tài liệu kế hoạch:** (Nếu có)

2. **Phân tích cấu trúc dự án hiện tại:**

3. **Hiểu rõ Backend API:**
   - [ ] Đọc các route files trong `backend/src/modules/*/routes.ts`
   - [ ] Hiểu các endpoints API bạn sẽ tích hợp
   - [ ] Kiểm tra request/response types từ backend

4. **Kiểm tra context của task:**
   - [ ] Xác định task bạn đang làm thuộc Phase nào
   - [ ] Đọc requirements cụ thể của task đó
   - [ ] Kiểm tra các dependencies (tasks phải hoàn thành trước)

**❌ KHÔNG BAO GIỜ:**
- Bắt đầu code mà không đọc tài liệu (hoặc codebase)
- Tự ý thay đổi kiến trúc đã định nghĩa
- Bỏ qua việc kiểm tra code hiện có
- Làm việc mà không hiểu context

---

### ⚠️ RULE 2: QUY TRÌNH HOÀN THÀNH CÔNG VIỆC

Sau khi hoàn thành code, **BẮT BUỘC** thực hiện các bước sau theo đúng thứ tự:

#### **BƯỚC 1: Kiểm tra Lỗi TypeScript**

```bash
# Chạy type-check TRƯỚC KHI commit
cd frontend
npm run type-check
```

**Yêu cầu:** 
- ✅ KHÔNG có lỗi TypeScript nào
- ✅ KHÔNG có `any` types (trừ khi thực sự cần thiết và có comment giải thích)
- ✅ Tất cả props đều có types rõ ràng
- ✅ API responses đều có interface definitions

**Nếu có lỗi:**
1. Fix TẤT CẢ lỗi TypeScript
2. Chạy lại `npm run type-check` cho frontend hoặc `npm run lint` cho backend
3. Lặp lại cho đến khi KHÔNG còn lỗi

#### **BƯỚC 2: Kiểm tra Linting**

```bash
# Chạy ESLint để kiểm tra code quality
npm run lint
```

**Yêu cầu:**
- ✅ KHÔNG có ESLint errors
- ✅ Warnings nên được fix (nếu có thể)
- ✅ Code format đúng chuẩn

#### **BƯỚC 3: Test thủ công**

- [ ] Kiểm tra component render đúng
- [ ] Kiểm tra tất cả user interactions
- [ ] Kiểm tra responsive design (mobile, tablet, desktop)
- [ ] Kiểm tra API integration (nếu có)
- [ ] Kiểm tra error states
- [ ] Kiểm tra loading states

#### **BƯỚC 4: Cập nhật Checklist cho TODO**

**Sau khi code ổn định và không còn lỗi, cập nhật checklist:**

---

### ⚠️ RULE 3: NGÔN NGỮ GIAO DIỆN - TIẾNG VIỆT

**DỰ ÁN NÀY DÀNH CHO NGƯỜI VIỆT NAM**

#### **Yêu cầu ngôn ngữ:**

1. **Giao diện mặc định: 100% TIẾNG VIỆT**
   - Tất cả text hiển thị trên UI phải là tiếng Việt
   - Buttons, labels, placeholders, error messages - TẤT CẢ bằng tiếng Việt
   - Ngôn ngữ mặc định trong i18n: `vi` (Vietnamese)

2. **Ví dụ về text ĐÚNG:**
   ```tsx
   // ✅ ĐÚNG - Tiếng Việt
   <h1>Chào mừng đến với LMS</h1>
   <Button>Đăng nhập</Button>
   <Label>Email của bạn</Label>
   <p>Khóa học của tôi</p>
   <span>Chưa có khóa học nào</span>
   ```

   ```tsx
   // ❌ SAI - Tiếng Anh
   <h1>Welcome to LMS</h1>
   <Button>Login</Button>
   <Label>Your Email</Label>
   <p>My Courses</p>
   <span>No courses yet</span>
   ```

3. **Sử dụng i18n đúng cách:**
   ```tsx
   // ✅ ĐÚNG - Sử dụng translation với default là tiếng Việt
   import { useTranslation } from 'react-i18next';
   
   function MyComponent() {
     const { t } = useTranslation();
     
     return (
       <div>
         <h1>{t('common.welcome')}</h1>  {/* "Chào mừng" */}
         <Button>{t('auth.login')}</Button>  {/* "Đăng nhập" */}
       </div>
     );
   }
   ```

4. **Cấu trúc translation files:**
   ```json
   // locales/vi/common.json (MẶC ĐỊNH)
   {
     "welcome": "Chào mừng đến với LMS",
     "dashboard": "Trang chủ",
     "courses": "Khóa học",
     "myCourses": "Khóa học của tôi",
     "profile": "Hồ sơ",
     "settings": "Cài đặt",
     "logout": "Đăng xuất"
   }
   
   // locales/en/common.json (PHỤ - cho tương lai)
   {
     "welcome": "Welcome to LMS",
     "dashboard": "Dashboard",
     "courses": "Courses",
     "myCourses": "My Courses",
     "profile": "Profile",
     "settings": "Settings",
     "logout": "Logout"
   }
   ```

5. **Các trường hợp đặc biệt:**
   - Code, variable names, function names: Tiếng Anh (convention)
   - Comments: Tiếng Việt HOẶC Tiếng Anh (tùy chọn)
   - Console logs: Tiếng Việt hoặc Tiếng Anh
   - Error messages hiển thị cho user: TIẾNG VIỆT

6. **Checklist ngôn ngữ cho mỗi component:**
   - [ ] Tất cả text trong JSX là tiếng Việt
   - [ ] Tất cả button labels là tiếng Việt
   - [ ] Tất cả form labels/placeholders là tiếng Việt
   - [ ] Tất cả error/success messages là tiếng Việt
   - [ ] Tất cả tooltips/hints là tiếng Việt
   - [ ] Đã thêm translations vào `locales/vi/*.json`

---

## 📚 CODING STANDARDS & BEST PRACTICES

### 1. TypeScript Standards

#### **Type Safety:**
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

#### **API Response Types:**
```tsx
// ✅ ĐÚNG - Typed API responses
import { httpClient } from '@/services/http/client';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Course {
  id: number;
  title: string;
  instructor_id: number;
}

export const courseApi = {
  getAll: () => {
    return httpClient.get<ApiResponse<Course[]>>('/courses');
  },
};

// ❌ SAI - Untyped
export const courseApi = {
  getAll: () => {
    return httpClient.get('/courses');
  },
};
```

---

### 2. Component Standards

#### **Component Structure:**
```tsx
// ✅ ĐÚNG - Organized component
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Course } from '@/types/api/course.types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: number) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEnroll 
}) => {
  const { t } = useTranslation();

  const handleEnroll = () => {
    onEnroll?.(course.id);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-xl font-semibold">{course.title}</h3>
      <Button onClick={handleEnroll}>
        {t('course.enroll')}  {/* "Đăng ký" */}
      </Button>
    </div>
  );
};
```

#### **Naming Conventions:**
- Components: `PascalCase` - `CourseCard`, `UserProfile`
- Functions: `camelCase` - `getUserProfile`, `handleSubmit`
- Constants: `UPPER_SNAKE_CASE` - `API_BASE_URL`, `MAX_FILE_SIZE`
- Files: 
  - Components: `PascalCase.tsx` - `CourseCard.tsx`
  - Utils: `camelCase.ts` - `formatDate.ts`
  - Hooks: `camelCase.ts` - `useAuth.ts`

---

### 3. React Query Standards

#### **Query Hooks:**
```tsx
// ✅ ĐÚNG - Proper React Query usage
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/services/api/course.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(filters),
    queryFn: () => courseApi.getAll(filters),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => courseApi.enroll(courseId),
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.courses.enrolled 
      });
    },
  });
};
```

#### **Query Keys Convention:**
```tsx
// constants/queryKeys.ts
export const QUERY_KEYS = {
  courses: {
    all: ['courses'] as const,
    list: (filters: any) => ['courses', 'list', filters] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
  },
} as const;
```

---

### 4. Form Standards

#### **React Hook Form + Zod:**
```tsx
// ✅ ĐÚNG - Form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        label="Email"
        error={errors.email?.message}
      />
      <Input
        {...register('password')}
        type="password"
        label="Mật khẩu"
        error={errors.password?.message}
      />
      <Button type="submit">Đăng nhập</Button>
    </form>
  );
};
```

---

### 5. Styling Standards

#### **TailwindCSS Best Practices:**
```tsx
// ✅ ĐÚNG - Organized classes
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'font-medium rounded-lg transition-colors',
        // Variant styles
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        // Size styles
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// ❌ SAI - Inline styles, hard to maintain
<button style={{ 
  backgroundColor: 'blue', 
  padding: '10px',
  borderRadius: '8px' 
}}>
  {children}
</button>
```

---

### 6. Error Handling Standards

#### **Error Boundaries:**
```tsx
// components/common/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Đã xảy ra lỗi
          </h2>
          <p className="mt-2 text-gray-600">
            Vui lòng thử lại sau
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### **API Error Handling:**
```tsx
// ✅ ĐÚNG - Handle all error cases
const { data, isLoading, error } = useCourses();

if (isLoading) {
  return <LoadingSkeleton />;
}

if (error) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">
        Không thể tải danh sách khóa học
      </p>
      <Button onClick={() => refetch()}>
        Thử lại
      </Button>
    </div>
  );
}

if (!data || data.length === 0) {
  return (
    <EmptyState 
      message="Chưa có khóa học nào"
      action={<Button>Khám phá khóa học</Button>}
    />
  );
}

return <CourseList courses={data} />;
```

---

## 🔧 DEVELOPMENT WORKFLOW

### Task Workflow

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
6. Fix TypeScript errors
   ↓
7. Fix ESLint errors
   ↓
8. Manual testing
   ↓
9. Update checklist
   ↓
10. Commit & push
```

### Testing Checklist

- [ ] **Unit Test** (nếu có):
  ```bash
  npm run test
  ```

- [ ] **Type Check**:
  ```bash
  npm run type-check
  ```

- [ ] **Lint Check**:
  ```bash
  npm run lint
  ```

- [ ] **Build Test**:
  ```bash
  npm run build
  ```

- [ ] **Manual Test**:
  - [ ] Component renders correctly
  - [ ] All interactions work
  - [ ] API integration works (nếu có)
  - [ ] Error states display correctly
  - [ ] Loading states display correctly
  - [ ] Responsive on mobile
  - [ ] Responsive on tablet
  - [ ] Responsive on desktop

---

## 📁 FILE ORGANIZATION

### Where to Put Your Code

1. **UI Components** → `components/ui/`
   - Generic, reusable components
   - No business logic
   - Example: Button, Input, Modal

2. **Domain Components** → `components/domain/`
   - Business-specific components
   - Example: CourseCard, UserProfile

3. **Pages** → `pages/{role}/`
   - Route-level components
   - Example: `pages/student/DashboardPage.tsx`

4. **Layouts** → `layouts/`
   - Layout wrappers
   - Example: StudentDashboardLayout

5. **Hooks** → `hooks/`
   - Custom hooks
   - Example: useAuth, useCourses

6. **Services** → `services/api/`
   - API service functions
   - Example: course.api.ts, user.api.ts

7. **Types** → `types/api/`
   - TypeScript interfaces/types
   - Example: course.types.ts

8. **Utils** → `utils/`
   - Helper functions
   - Example: formatDate, cn

9. **Constants** → `constants/`
   - App constants
   - Example: routes.ts, queryKeys.ts

---

## 🐛 COMMON PITFALLS (Tránh Những Lỗi Này)

### ❌ DON'T:

1. **Hardcode strings trong JSX:**
   ```tsx
   // ❌ SAI
   <h1>Welcome to LMS</h1>
   
   // ✅ ĐÚNG
   <h1>{t('common.welcome')}</h1>
   ```

2. **Sử dụng `any` type:**
   ```tsx
   // ❌ SAI
   function handleUser(user: any) { }
   
   // ✅ ĐÚNG
   function handleUser(user: User) { }
   ```

3. **Không handle loading/error states:**
   ```tsx
   // ❌ SAI
   const { data } = useQuery(...);
   return <div>{data.map(...)}</div>;
   
   // ✅ ĐÚNG
   const { data, isLoading, error } = useQuery(...);
   if (isLoading) return <Spinner />;
   if (error) return <Error />;
   return <div>{data.map(...)}</div>;
   ```

4. **Không cleanup side effects:**
   ```tsx
   // ❌ SAI
   useEffect(() => {
     socket.on('message', handleMessage);
   }, []);
   
   // ✅ ĐÚNG
   useEffect(() => {
     socket.on('message', handleMessage);
     return () => {
       socket.off('message', handleMessage);
     };
   }, []);
   ```

5. **Inline styles thay vì TailwindCSS:**
   ```tsx
   // ❌ SAI
   <div style={{ padding: '20px', color: 'red' }}>
   
   // ✅ ĐÚNG
   <div className="p-5 text-red-600">
   ```

---

## ✅ BEFORE YOU FINISH

### Final Checklist

Trước khi đánh dấu task hoàn thành, confirm tất cả điều sau:

- [ ] ✅ Code chạy không có lỗi
- [ ] ✅ TypeScript type-check passed
- [ ] ✅ ESLint check passed
- [ ] ✅ Tất cả text trong UI là tiếng Việt
- [ ] ✅ Đã thêm translations vào `locales/vi/*.json`
- [ ] ✅ Component responsive (mobile, tablet, desktop)
- [ ] ✅ Loading states implemented
- [ ] ✅ Error states implemented
- [ ] ✅ API integration tested (nếu có)
- [ ] ✅ Đã cập nhật checkbox trong Detail_Refactor_Frontend1.md hoặc Detail_Refactor_Frontend2.md
- [ ] ✅ Đã commit code với message rõ ràng
- [ ] ✅ Không còn console.log/console.error không cần thiết

---

## 📞 COMMUNICATION

### Reporting Issues

Nếu gặp vấn đề không thể giải quyết:

1. **Document the issue:**
   - Mô tả vấn đề rõ ràng
   - Attach error messages
   - Provide steps to reproduce

2. **Add note in checklist:**
   ```markdown
   - [ ] Task name
     > 🐛 Issue: [Mô tả vấn đề]
     > Status: Blocked
     > Waiting for: [Giải pháp/Thông tin cần thiết]
   ```

3. **Continue with other tasks** nếu có thể

### Requesting Clarification

Nếu requirements không rõ ràng:

```markdown
- [ ] Task name
  > ❓ Question: [Câu hỏi cụ thể]
  > Need clarification on: [Chi tiết]
```

---

## 🎯 SUCCESS CRITERIA

Task được coi là hoàn thành khi:

1. ✅ Code chạy không lỗi
2. ✅ TypeScript type-check passed
3. ✅ ESLint check passed  
4. ✅ UI 100% tiếng Việt
5. ✅ Responsive design hoạt động tốt
6. ✅ API integration hoạt động (nếu có)
7. ✅ Error/Loading states implemented
8. ✅ Checkbox trong plan được tích
9. ✅ Code được commit

---

## 📚 RESOURCES

### Documentation Links

- [Detail_Refactor_Frontend1.md](./Detail_Refactor_Frontend1.md) - Backend API & Architecture
- [Detail_Refactor_Frontend2.md](./Detail_Refactor_Frontend2.md) - Implementation Roadmap
- [REFACTOR_FRONTEND.md](./REFACTOR_FRONTEND.md) - Original Plan
- [tree_frontend_src.md](./tree_frontend_src.md) - Current Frontend Structure

### Tech Stack Docs

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- React Query: https://tanstack.com/query/latest/docs/react
- React Router: https://reactrouter.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- TailwindCSS: https://tailwindcss.com
- i18next: https://www.i18next.com

---

## 🚀 LET'S BUILD!

**Remember:**
1. 📖 Đọc docs trước khi code
2. ✅ Check TypeScript errors trước
3. 🇻🇳 UI phải là tiếng Việt
4. 📝 Cập nhật checklist sau khi xong
5. 🎯 Follow the plan, don't freestyle

**Good luck! Chúc bạn code thành công! 💪**

---

*Last updated: 2025-11-11*
*Version: 1.0*
