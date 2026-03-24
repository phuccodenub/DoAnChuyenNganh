# ⚡ QUICK START - LMS Backend

## 🚀 Khởi động nhanh trong 3 bước

### **Step 1: Start Docker services**
```bash
docker-compose up -d
```

### **Step 2: Verify connection**
```bash
npm run db:check
```

### **Step 3: Seed data**
```bash
npm run seed:docker
```

### **Step 4: Test API**
```bash
curl http://localhost:3000/api/courses
```

---

## 📋 Daily Workflow

### **Bắt đầu làm việc:**
```bash
# 1. Start services
docker-compose up -d

# 2. Check status
docker ps

# 3. View logs
docker-compose logs -f backend
```

### **Kết thúc làm việc:**
```bash
docker-compose down
```

---

## � Kết nối Database Tools (pgAdmin/DBeaver)

### **Connection Settings:**
```
Host:       localhost
Port:       5432
Database:   lms_db
Username:   lms_user
Password:   123456
```

### **Quick Connect:**
```bash
# Test connection với psql
psql -h localhost -p 5432 -U lms_user -d lms_db

# Or với npm script
npm run db:check
```

### **Verify data:**
```sql
-- Trong pgAdmin/DBeaver, chạy:
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_users FROM users;
```

**📖 Chi tiết:** Xem `DATABASE_TOOLS_CONNECTION.md`

---

## �🔧 Common Tasks

### **Seed data mới:**
```bash
npm run seed:docker
docker restart lms-backend-dev
```

### **Xem database:**
```bash
npm run db:check
```

### **Clear cache:**
```bash
docker exec lms-redis-dev redis-cli FLUSHALL
docker restart lms-backend-dev
```

### **Reset database (DELETE ALL!):**
```bash
docker-compose down -v
docker volume rm lms_postgres_api_dev_data
docker-compose up -d
npm run seed:docker
```

---

## 🐛 Troubleshooting

### **Problem: "API không trả về course mới"**
```bash
# Solution:
npm run db:check                    # Kiểm tra connection
docker restart lms-backend-dev      # Clear cache
curl http://localhost:3000/api/courses  # Test lại
```

### **Problem: "Database connection refused"**
```bash
# Solution:
docker ps                           # Check container running
docker restart lms-postgres-dev     # Restart database
npm run db:check                    # Verify connection
```

### **Problem: "Seed script failed"**
```bash
# Solution:
docker logs lms-postgres-dev        # Check database logs
npm run db:check                    # Verify connection
# Check error message for specific issue
```

---

## 📚 Useful Commands

```bash
# Check services status
docker ps

# View backend logs
docker logs lms-backend-dev --tail 50

# View database logs
docker logs lms-postgres-dev --tail 50

# Access PostgreSQL directly
docker exec -it lms-postgres-dev psql -U lms_user -d lms_db

# Count courses
docker exec lms-postgres-dev psql -U lms_user -d lms_db -c "SELECT COUNT(*) FROM courses;"

# List all courses
docker exec lms-postgres-dev psql -U lms_user -d lms_db -c "SELECT id, title FROM courses;"
```

---

## 📖 More Information

- **Setup Guide:** `DEVELOPMENT_SETUP.md` - Chi tiết 2 options (Docker vs Local)
- **Docker Issues:** `DOCKER_VOLUME_SOLUTION.md` - Hiểu về Docker volumes
- **API Documentation:** `POSTMAN_TESTING_GUIDE.md` - Test API với Postman

---

**Need help?** Run `npm run db:check` để kiểm tra environment của bạn!
