# 📱 Chạy Backend với Mobile App

## ⚡ Khởi Động Nhanh

### 1. Khởi Động Backend Services
```bash
# Từ thư mục root của project (DACN/)
npm run dev:api
```

### 2. API Endpoints cho Mobile

| Platform | Endpoint |
|----------|----------|
| **Android Emulator** | `http://10.0.2.2:3000/api` |
| **iOS Simulator** | `http://localhost:3000/api` |
| **Physical Device** | `http://[YOUR-IP]:3000/api` |

### 3. Services Đã Khởi Động

✅ **PostgreSQL Database** - Port 5432  
✅ **Redis Cache** - Port 6379  
✅ **Backend API** - Port 3000  
✅ **Auto Database Setup & Seeding**

## 🔗 API Information

- **Base URL**: `http://localhost:3000/api`
- **API Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## 📱 Platform-Specific Configuration

### Flutter
```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android
  // static const String baseUrl = 'http://localhost:3000/api'; // iOS
}

// Sử dụng
final response = await http.get('${ApiConfig.baseUrl}/users');
```

### React Native
```javascript
// src/config/api.js
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api'
});

// Sử dụng
fetch(`${API_BASE_URL}/users`)
```

## 🛠️ Commands Hữu Ích

```bash
# Xem logs backend
npm run dev:api:logs

# Dừng services  
npm run dev:down:api

# Rebuild nếu có thay đổi code
npm run dev:api:build

# Dọn dẹp nếu có lỗi
npm run docker:cleanup
```

## 🔧 Troubleshooting

### Port 3000 đã được sử dụng
```bash
npm run docker:cleanup:all
npm run dev:api
```

### Không kết nối được database
```bash
# Kiểm tra logs
npm run dev:api:logs

# Restart services
npm run dev:down:api && npm run dev:api
```

### Android không kết nối được API
- Đảm bảo sử dụng `10.0.2.2:3000` thay vì `localhost:3000`
- Kiểm tra firewall/antivirus

### iOS không kết nối được API  
- Sử dụng `localhost:3000` 
- Đảm bảo simulator và backend cùng chạy trên máy

## 📋 Database Access

```bash
# Connect trực tiếp vào PostgreSQL
docker exec -it lms_postgres_api_dev psql -U lms_user -d lms_db

# Hoặc dùng GUI tools:
# Host: localhost
# Port: 5432  
# User: lms_user
# Password: 123456
# Database: lms_db
```

## ✨ Features

- 🔄 **Hot Reload**: Code changes tự động reload
- 🗄️ **Auto DB Setup**: Database và seeds tự động cài đặt
- 📊 **Logging**: Comprehensive logs cho debugging
- 🚀 **Fast Startup**: Optimized cho mobile development
- 🔒 **CORS Enabled**: Cho phép mobile apps kết nối

---

**Ready for Mobile Development!** 🚀  
Backend API đã sẵn sàng cho Flutter, React Native, và các mobile frameworks khác.
