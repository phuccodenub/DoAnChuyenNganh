# 🚀 NEXT STEPS - Roadmap Chi Tiết
## Từ Infrastructure Complete → Full MVP

**Cập nhật: 2025-10-09**  
**Trạng thái hiện tại**: ✅ Phase 1 Complete | 🔄 Integration Pending

---

## 📊 TÌNH HUỐNG HIỆN TẠI

### ✅ Những gì đã có (Infrastructure Complete)
- ✅ Docker Desktop 28.4.0 operational
- ✅ PostgreSQL database với schema đầy đủ (users, courses, enrollments, chat_messages)
- ✅ Redis cache server running
- ✅ Backend API với JWT auth, Socket.IO, REST endpoints
- ✅ Frontend React/TypeScript với UI components đầy đủ
- ✅ All services healthy và passing health checks

### ⚠️ Vấn đề cần giải quyết
- ❌ Frontend đang dùng **mock services** → Không kết nối với backend thật
- ❌ Thiếu file `frontend/.env` → Không có API/WebSocket URL
- ❌ Docker compose dùng sai env vars (REACT_APP_* thay vì VITE_*)
- ❌ Chưa test end-to-end flow

### 🎯 Mục tiêu
**Kết nối frontend với backend để có MVP hoàn chỉnh trong 3-5 ngày**

---

## 🔥 PRIORITY 1: FRONTEND-BACKEND INTEGRATION (1 ngày)

### Step 1.1: Tạo Frontend Environment File (15 phút)

**File cần tạo**: `frontend/.env`

```bash
# Environment Configuration for Vite
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

**Lý do**: Vite (build tool của frontend) yêu cầu biến môi trường bắt đầu với `VITE_` prefix

**Commands**:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_WS_URL=http://localhost:3000" >> .env
```

**Verification**:
```bash
# Check file exists
cat frontend/.env

# Restart frontend to load new env
npm run dev
# Or if using Docker:
docker-compose restart frontend
```

---

### Step 1.2: Update Docker Compose Environment (10 phút)

**File**: `docker-compose.yml`

**Tìm section `frontend` và sửa**:
```yaml
frontend:
  # ... other config ...
  environment:
    - NODE_ENV=development
    # ❌ XOÁ NHỮNG DÒNG NÀY:
    # - REACT_APP_API_URL=http://localhost:3000/api
    # - REACT_APP_WS_URL=http://localhost:3000
    
    # ✅ THÊM NHỮNG DÒNG NÀY:
    - VITE_API_URL=http://backend:3000/api
    - VITE_WS_URL=http://backend:3000
```

**Lưu ý**: 
- Trong Docker network, dùng `backend` (service name) thay vì `localhost`
- Vite requires `VITE_` prefix, not `REACT_APP_`

**Verification**:
```bash
docker-compose down
docker-compose up -d
docker-compose logs frontend | grep VITE
```

---

### Step 1.3: Connect Real Authentication Service (20 phút)

**File**: `frontend/src/stores/authStore.ts`

**Thay đổi import**:
```typescript
// ❌ DÒNG CŨ (dùng mock):
// import { mockAuthService as authService } from '../services/mockAuthService';

// ✅ DÒNG MỚI (dùng thật):
import { authService } from '../services/authService';
```

**Giải thích**: 
- `mockAuthService`: Fake data, không gọi API thật
- `authService`: Gọi backend API thật qua Axios

**Verification**:
```bash
# Restart frontend
npm run dev

# Hoặc Docker:
docker-compose restart frontend

# Check browser console for any import errors
```

---

### Step 1.4: Connect Real Socket.IO Service (20 phút)

**File**: `frontend/src/services/socketService.ts`

**Tìm và sửa**:
```typescript
// ❌ DÒNG CŨ (hard-coded):
// const SOCKET_URL = 'http://localhost:3003';

// ✅ DÒNG MỚI (đọc từ env):
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
```

**Giải thích**:
- `import.meta.env.VITE_WS_URL`: Vite cách đọc env variables
- Fallback to localhost:3000 nếu không có env var

**Verification**:
```javascript
// Mở browser console tại http://localhost:3001
console.log(import.meta.env.VITE_API_URL);  // Should show API URL
console.log(import.meta.env.VITE_WS_URL);   // Should show WebSocket URL
```

---

### Step 1.5: Test Integration (30 phút)

**Test 1 - Health Check**:
```bash
# Backend health
curl http://localhost:3000/health
# Expected: {"status":"ok",...}

# Frontend accessible
curl http://localhost:3001
# Expected: HTML content
```

**Test 2 - Registration Flow**:
1. Mở browser → http://localhost:3001/register
2. Mở DevTools (F12) → Network tab
3. Fill form:
   - Email: test@example.com
   - Password: Test123456
   - Full Name: Test User
4. Click "Register"
5. **Verify**:
   - Network tab shows POST to `http://localhost:3000/api/auth/register`
   - Response status: 201 Created
   - Response body contains `token` and `user` object
   - Browser redirects to /dashboard

**Test 3 - Login Flow**:
1. Go to http://localhost:3001/login
2. DevTools → Network tab
3. Login với credentials vừa tạo
4. **Verify**:
   - Network tab shows POST to `http://localhost:3000/api/auth/login`
   - Status: 200 OK
   - localStorage has `token` key
   - Redirects to /dashboard

**Test 4 - Check Database**:
```bash
# Connect to PostgreSQL
docker exec -it dacn-postgres-1 psql -U lms_user -d lms_db

# Check registered user
SELECT id, email, full_name, role FROM users;

# Expected: See your test user
# id | email            | full_name | role
# 1  | test@example.com | Test User | student
```

**Test 5 - Check Backend Logs**:
```bash
docker-compose logs backend | grep "POST /api/auth"
# Should see registration and login requests
```

---

## 🚀 PRIORITY 2: TEST REALTIME FEATURES (4 giờ)

### Step 2.1: Test Course Creation & Enrollment (30 phút)

**Preparation**:
1. Create an instructor account:
   ```bash
   # Update user to instructor role in database
   docker exec -it dacn-postgres-1 psql -U lms_user -d lms_db
   UPDATE users SET role = 'instructor' WHERE email = 'test@example.com';
   \q
   ```

**Test Flow**:
1. Login as instructor
2. Go to Dashboard → Create Course
3. Fill form:
   - Title: "Introduction to Programming"
   - Description: "Learn basics"
4. Submit
5. **Verify**:
   - Network: POST to `/api/courses`
   - Status: 201 Created
   - Course appears in dashboard
   - Database: `SELECT * FROM courses;`

**Test Enrollment**:
1. Create another student account
2. Login as student
3. Browse courses
4. Click "Enroll" on created course
5. **Verify**:
   - Network: POST to `/api/courses/:id/enroll`
   - Status: 200 OK
   - Course appears in "My Courses"
   - Database: `SELECT * FROM enrollments;`

---

### Step 2.2: Test Real-Time Chat (1 giờ)

**Setup**:
1. Open browser 1 → Login as User A
2. Open browser 2 (incognito) → Login as User B
3. Both users enroll in same course
4. Both open course detail page

**Test Cases**:

**Test A - Send Message**:
1. User A types: "Hello, anyone here?"
2. Click Send
3. **Verify User A**:
   - Message appears immediately
   - Shows sender name and timestamp
   - DevTools: Socket event `send-message` emitted
4. **Verify User B**:
   - Message appears in real-time (no refresh needed)
   - Shows User A's name
   - DevTools: Socket event `new-message` received

**Test B - Typing Indicator**:
1. User A starts typing
2. **Verify User B**:
   - See "User A is typing..." indicator
   - Indicator disappears after 5 seconds

**Test C - Online Users**:
1. **Verify both browsers**:
   - See "2 users online" indicator
   - See list of online users
2. User B closes tab
3. **Verify User A**:
   - See "1 user online"
   - User B removed from online list

**Test D - Message Persistence**:
1. Close both browsers
2. Open new browser → Login as User A
3. Open same course
4. **Verify**:
   - Previous messages loaded from database
   - Message history shows correctly
   - Pagination works (if > 50 messages)

**Database Verification**:
```sql
-- Check chat messages
SELECT 
  cm.message, 
  u.full_name as sender, 
  c.title as course,
  cm.created_at 
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
JOIN courses c ON cm.course_id = c.id
ORDER BY cm.created_at DESC
LIMIT 10;
```

**Backend Logs**:
```bash
docker-compose logs backend | grep "send-message"
docker-compose logs backend | grep "join-course"
```

---

### Step 2.3: Test WebSocket Connection Stability (30 phút)

**Test Reconnection**:
1. User A connected and in course
2. Stop backend: `docker-compose stop backend`
3. **Verify User A**:
   - See "Disconnected" indicator
   - UI shows reconnection attempts
4. Start backend: `docker-compose start backend`
5. **Verify User A**:
   - Automatically reconnects
   - See "Connected" indicator
   - Can send messages again

**Test Multiple Rooms**:
1. Create 2 courses
2. User A joins Course 1 chat
3. User B joins Course 2 chat
4. Both send messages
5. **Verify**:
   - User A only sees Course 1 messages
   - User B only sees Course 2 messages
   - Messages don't leak between courses

---

### Step 2.4: Test Authentication with Socket.IO (20 phút)

**Test Unauthorized Access**:
1. Open DevTools console
2. Try to connect without token:
   ```javascript
   const socket = io('http://localhost:3000');
   socket.on('connect_error', (err) => {
     console.log('Error:', err.message);
   });
   ```
3. **Verify**:
   - Connection rejected
   - Error: "Authentication error" or similar

**Test With Token**:
```javascript
const token = localStorage.getItem('token');
const socket = io('http://localhost:3000', {
  auth: { token: token }
});
socket.on('connect', () => {
  console.log('✅ Connected with ID:', socket.id);
});
```

---

## 🎯 PRIORITY 3: ENHANCE REALTIME (2-3 ngày)

### Step 3.1: Add Message Rate Limiting (2 giờ)

**Objective**: Prevent spam, limit to 5 messages per 5 seconds per user

**File**: `backend/src/socket/socketHandler.js`

**Implementation**:
```javascript
// Add at top of file
const messageRateLimiter = new Map(); // userId → { count, resetTime }

// In 'send-message' handler
socket.on('send-message', async ({ courseId, message }) => {
  const userId = socket.user.id;
  const now = Date.now();
  
  // Get or create rate limit record
  if (!messageRateLimiter.has(userId)) {
    messageRateLimiter.set(userId, { count: 0, resetTime: now + 5000 });
  }
  
  const rateLimit = messageRateLimiter.get(userId);
  
  // Reset if time window passed
  if (now > rateLimit.resetTime) {
    rateLimit.count = 0;
    rateLimit.resetTime = now + 5000;
  }
  
  // Check limit
  if (rateLimit.count >= 5) {
    socket.emit('error', { 
      message: 'Too many messages. Please slow down.' 
    });
    return;
  }
  
  // Increment counter
  rateLimit.count++;
  
  // ... rest of message handling
});
```

**Test**:
1. Send 5 messages quickly → Success
2. Send 6th message → Error "Too many messages"
3. Wait 5 seconds → Can send again

---

### Step 3.2: Add Message Delivery Acknowledgment (1 giờ)

**Backend**: `socketHandler.js`
```javascript
// After saving message to database
const savedMessage = await ChatMessage.create({ ... });

// Send ACK to sender
socket.emit('message-delivered', {
  tempId: data.tempId,  // Client-generated temp ID
  messageId: savedMessage.id,
  timestamp: savedMessage.created_at
});
```

**Frontend**: `socketService.ts`
```typescript
// When sending message
const tempId = Date.now().toString();
socket.emit('send-message', { 
  courseId, 
  message,
  tempId 
});

// Listen for ACK
socket.on('message-delivered', ({ tempId, messageId, timestamp }) => {
  // Update message in UI: pending → delivered
  chatStore.markMessageDelivered(tempId, messageId);
});
```

---

### Step 3.3: Add Message Search API (1 giờ)

**File**: `backend/src/routes/courses.js`

```javascript
// GET /api/courses/:id/messages/search?q=keyword
router.get('/:id/messages/search', 
  authenticateToken,
  async (req, res, next) => {
    try {
      const { q } = req.query;
      const courseId = req.params.id;
      
      if (!q || q.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query is required' 
        });
      }
      
      // Use existing model method
      const messages = await ChatMessage.searchInCourse(courseId, q);
      
      res.json({
        success: true,
        data: messages,
        count: messages.length
      });
    } catch (error) {
      next(error);
    }
  }
);
```

**Test**:
```bash
# Search for messages containing "hello"
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/courses/1/messages/search?q=hello"
```

---

### Step 3.4: Add Redis Adapter for Scaling (2 giờ)

**Objective**: Allow horizontal scaling with multiple backend instances

**Install dependency**:
```bash
cd backend
npm install @socket.io/redis-adapter redis
```

**File**: `backend/src/app.js`

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

// Create Redis clients for Socket.IO adapter
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

// Connect clients
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    // Set up Socket.IO with Redis adapter
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.IO Redis adapter configured');
  })
  .catch((err) => {
    logger.error('Failed to connect Redis adapter:', err);
  });
```

**Test with multiple instances**:
```bash
# Terminal 1 - Start backend instance 1
PORT=3000 npm start

# Terminal 2 - Start backend instance 2
PORT=3001 npm start

# Test: Connect client to 3000, another to 3001
# Messages should sync between both instances via Redis
```

---

## 🎬 PRIORITY 4: COMPLETE LIVESTREAM (2-3 ngày)

### Step 4.1: Add Livestream Backend Events (3 giờ)

**File**: `backend/src/socket/socketHandler.js`

**Add participant tracking**:
```javascript
const liveStreamParticipants = new Map(); // courseId → Set of userIds

socket.on('join-livestream', async ({ courseId, role }) => {
  try {
    // Verify user is enrolled
    const enrollment = await Enrollment.findOne({
      where: { user_id: socket.user.id, course_id: courseId }
    });
    
    if (!enrollment) {
      socket.emit('error', { message: 'Not enrolled in course' });
      return;
    }
    
    // Join livestream room
    const roomName = `livestream_${courseId}`;
    socket.join(roomName);
    
    // Track participant
    if (!liveStreamParticipants.has(courseId)) {
      liveStreamParticipants.set(courseId, new Set());
    }
    liveStreamParticipants.get(courseId).add(socket.user.id);
    
    // Store in Redis
    await redisClient.sadd(`livestream:${courseId}:participants`, socket.user.id);
    
    // Notify others
    socket.to(roomName).emit('participant-joined-stream', {
      userId: socket.user.id,
      userName: socket.user.full_name,
      role: role
    });
    
    // Send current participants to new joiner
    const participants = await redisClient.smembers(`livestream:${courseId}:participants`);
    socket.emit('livestream-participants', {
      courseId,
      participants,
      count: participants.length
    });
    
    logger.info(`User ${socket.user.id} joined livestream in course ${courseId}`);
  } catch (error) {
    logger.error('Join livestream error:', error);
    socket.emit('error', { message: 'Failed to join livestream' });
  }
});

socket.on('end-livestream', async ({ courseId }) => {
  try {
    // Verify user is instructor
    const course = await Course.findByPk(courseId);
    if (!course || course.instructor_id !== socket.user.id) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }
    
    // Notify all participants
    const roomName = `livestream_${courseId}`;
    io.to(roomName).emit('livestream-ended', {
      courseId,
      endedBy: socket.user.full_name,
      timestamp: new Date()
    });
    
    // Clean up participants
    liveStreamParticipants.delete(courseId);
    await redisClient.del(`livestream:${courseId}:participants`);
    
    logger.info(`Livestream ended for course ${courseId}`);
  } catch (error) {
    logger.error('End livestream error:', error);
  }
});

// Handle disconnect
socket.on('disconnect', async () => {
  // Remove from all livestream rooms
  for (const [courseId, participants] of liveStreamParticipants) {
    if (participants.has(socket.user.id)) {
      participants.delete(socket.user.id);
      await redisClient.srem(`livestream:${courseId}:participants`, socket.user.id);
      
      io.to(`livestream_${courseId}`).emit('participant-left-stream', {
        userId: socket.user.id,
        userName: socket.user.full_name
      });
    }
  }
});
```

---

### Step 4.2: Update Frontend Livestream (2 giờ)

**File**: `frontend/src/services/webRTCService.ts`

**Add participant management**:
```typescript
class WebRTCService {
  private participants: Map<string, RTCPeerConnection> = new Map();
  
  // Listen for participant events
  setupParticipantListeners() {
    socketService.on('participant-joined-stream', (data) => {
      console.log('New participant:', data.userName);
      // Create peer connection for new participant
      if (data.userId !== getCurrentUserId()) {
        this.createPeerConnection(data.userId);
      }
    });
    
    socketService.on('participant-left-stream', (data) => {
      console.log('Participant left:', data.userName);
      this.closePeerConnection(data.userId);
    });
    
    socketService.on('livestream-ended', () => {
      console.log('Livestream ended by instructor');
      this.stopAllStreams();
      // Show notification to users
    });
  }
  
  // ... rest of WebRTC logic
}
```

---

### Step 4.3: Test Livestream (1 giờ)

**Test Flow**:
1. **Instructor** starts livestream
2. **Student 1** joins → Sees instructor video
3. **Student 2** joins → Sees instructor video
4. **Verify**:
   - All students see "3 participants"
   - Instructor sees participant list
   - Video/audio streams working
5. Instructor ends livestream
6. **Verify**:
   - All students receive "livestream-ended" event
   - Streams stop gracefully
   - UI shows "Stream ended" message

---

## 📝 PRIORITY 5: QUIZ SYSTEM BACKEND (3-4 ngày)

### Step 5.1: Create Database Schema (1 giờ)

**File**: `backend/src/models/Quiz.js`
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'courses', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  time_limit: {
    type: DataTypes.INTEGER, // seconds
    defaultValue: 600 // 10 minutes
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived'),
    defaultValue: 'draft'
  }
});

module.exports = Quiz;
```

**Similar files**: QuizQuestion.js, QuizSession.js, QuizResponse.js

---

### Step 5.2: Implement Quiz Socket Events (4 giờ)

**File**: `backend/src/socket/socketHandler.js`

```javascript
const activeQuizSessions = new Map(); // sessionId → session data

socket.on('quiz-start', async ({ courseId, quizId }) => {
  // Instructor only
  // Create session, notify all enrolled students
});

socket.on('quiz-response', async ({ sessionId, questionId, answer }) => {
  // Validate & save response
  // Check if duplicate submission
  // Calculate if correct
});

socket.on('quiz-end', async ({ sessionId }) => {
  // Calculate final scores
  // Broadcast results
});
```

---

### Step 5.3: Create Quiz REST Endpoints (2 giờ)

**File**: `backend/src/routes/quizzes.js`

```javascript
router.post('/', authenticateToken, requireInstructor, createQuiz);
router.get('/:id', authenticateToken, getQuiz);
router.get('/:id/results', authenticateToken, getQuizResults);
router.get('/:id/analytics', authenticateToken, getQuizAnalytics);
```

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Foundation ✅ **COMPLETE**
- [x] Docker infrastructure
- [x] Database schema
- [x] Backend API
- [x] Frontend UI

### Phase 2: Integration 🔄 **IN PROGRESS**
- [ ] Frontend .env created
- [ ] Auth service connected
- [ ] Socket service connected
- [ ] End-to-end test passing

### Phase 3: Real-Time Enhancement
- [ ] Message rate limiting
- [ ] Delivery acknowledgment
- [ ] Message search API
- [ ] Redis adapter

### Phase 4: Livestream
- [ ] Backend participant management
- [ ] Socket events complete
- [ ] Frontend integration
- [ ] Multi-user test

### Phase 5: Quiz System
- [ ] Database models
- [ ] Socket events
- [ ] REST endpoints
- [ ] Frontend integration

### Phase 6: Production Ready
- [ ] Comprehensive testing
- [ ] Error monitoring (Sentry)
- [ ] API documentation
- [ ] Deployment guide

---

## 📅 ESTIMATED TIMELINE

| Phase | Tasks | Estimated Time | Dependencies |
|-------|-------|----------------|--------------|
| ✅ Phase 1 | Infrastructure | **DONE** | None |
| 🔥 Integration | Connect FE-BE | **1 day** | Phase 1 |
| Real-Time | Enhancements | 2-3 days | Integration |
| Livestream | Complete backend | 2-3 days | Integration |
| Quiz | Full implementation | 3-4 days | Integration |
| Production | Polish & deploy | 3-5 days | All above |

**Total to MVP**: 3-5 days  
**Total to Production**: 2-3 weeks

---

## 🆘 TROUBLESHOOTING GUIDE

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:3000/health

# Check frontend env vars
cat frontend/.env

# Check browser console for errors
# Expected to see: VITE_API_URL and VITE_WS_URL defined
```

### Socket.IO connection fails
```bash
# Check backend logs
docker-compose logs backend | grep Socket

# Test connection manually
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('✅ Connected'));
socket.on('connect_error', (e) => console.log('❌ Error:', e.message));
"
```

### Database connection error
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker exec -it dacn-postgres-1 psql -U lms_user -d lms_db -c "SELECT 1"

# Check backend env
docker exec -it dacn-backend-1 env | grep DATABASE_URL
```

---

## 📞 SUPPORT & RESOURCES

- **Report.md**: Overall progress tracking
- **BACKEND_FRONTEND_STATUS_REPORT.md**: Detailed technical status
- **lms_development_prompt.md**: Original development plan
- **Backend Logs**: `docker-compose logs backend -f`
- **Frontend Logs**: `docker-compose logs frontend -f`
- **Database Access**: `docker exec -it dacn-postgres-1 psql -U lms_user -d lms_db`

---

**🎉 Chúc mừng đã hoàn thành Phase 1! Hãy bắt đầu với Priority 1 để kết nối hệ thống!**
