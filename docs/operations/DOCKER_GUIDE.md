# 🐳 Docker Quick Start Guide

## 📋 Hai Cách Sử Dụng Chính

### 🌐 Full-Stack Development (Web App)
**Khi nào dùng**: Phát triển React frontend + Backend API

```bash
# Khởi động full-stack
npm run dev:web

# Xem logs
npm run dev:web:logs

# Dừng services
npm run dev:down:web
```

**Truy cập**:
- 🌐 Frontend: http://localhost:3001
- 🔌 Backend API: http://localhost:3000/api
- 🗄️ Database: localhost:5432 (user: lms_user, db: lms_db)

---

### 📱 Backend-Only (Mobile Development) ✅ WORKING
**Khi nào dùng**: Phát triển Flutter app hoặc React Native

```bash
# Khởi động chỉ backend services
npm run dev:api

# Xem logs
npm run dev:api:logs

# Dừng services  
npm run dev:down:api
```

**API Endpoints cho Mobile**:
- 📱 Local: `http://localhost:3000`
- 📱 Android Emulator: `http://10.0.2.2:3000`  
- 📱 iOS Simulator: `http://localhost:3000`

**Health Checks**:
- ✅ `GET /health` - Basic health check
- ✅ `GET /health/redis` - Redis connection status
- ✅ `GET /health/database` - Database connection status

## 🔧 Flutter Integration

### 1. Start Backend Services
```bash
npm run dev:api
```

### 2. Configure Flutter HTTP Client  
```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android Emulator
  // static const String baseUrl = 'http://localhost:3000'; // iOS Simulator  
}
```

### 3. Test Connection
```dart
// Test health endpoint first
final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/health'));
print('Health: ${response.body}'); 
// Expected: {"success":true,"message":"Health check passed"...}
```

### 3. Example API Call
```dart
// Example login API call
Future<Map<String, dynamic>> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('${ApiConfig.baseUrl}/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  return jsonDecode(response.body);
}
```

## 🚨 Troubleshooting

### Port đã được sử dụng
```bash
npm run docker:cleanup:all
npm run dev:api
```

### Database không kết nối được
```bash
# Xem logs database
npm run dev:api:logs

# Hoặc connect trực tiếp
docker exec -it lms_postgres_api_dev psql -U lms_user -d lms_db
```

### Mobile không kết nối được API
- ✅ Đảm bảo backend đang chạy: `npm run dev:api`
- ✅ Android Emulator: Dùng `10.0.2.2:3000`
- ✅ iOS Simulator: Dùng `localhost:3000`
- ✅ Physical Device: Dùng IP máy tính (VD: `192.168.1.100:3000`)

## 📝 Test Credentials

Backend tự động tạo test accounts:
- **Super Admin**: superadmin@example.com / SuperAdmin123!
- **Admin**: admin@example.com / Admin123!
- **Instructor**: instructor1@example.com / Instructor123!
- **Student**: student1@example.com / Student123!

## 🧹 Maintenance

```bash
# Dọn dẹp Docker resources
npm run docker:cleanup

# Dọn dẹp tất cả (cẩn thận - xóa data!)
npm run docker:cleanup:all
```

## ✅ Recent Fixes

### Redis Cache Issue (SOLVED)
- **Problem**: `redis_config_1.redisClient.setex is not a function`  
- **Root Cause**: Redis client v4+ uses camelCase `setEx` instead of `setex`
- **Solution**: Updated all cache strategy files to use correct method
- **Status**: ✅ Working perfectly - no more cache errors

---

**💡 Tip**: Sử dụng `npm run dev:api` cho mobile development và `npm run dev:web` cho web development!
