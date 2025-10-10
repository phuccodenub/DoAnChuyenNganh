# PROMPT PHÁT TRIỂN HỆ THỐNG LMS REAL-TIME
## Từ Core Foundation đến Advanced Features

---

## � CẬP NHẬT TIẾN ĐỘ - 2025-10-09

### ✅ ĐÃ HOÀN THÀNH
**Phase 1: FOUNDATION SETUP - ✅ 100% COMPLETE**
- ✅ Docker Desktop 28.4.0 installed and operational
- ✅ PostgreSQL (port 5432) - HEALTHY with lms_db database
- ✅ Redis (port 6379) - HEALTHY
- ✅ Backend API (port 3000) - RUNNING with all endpoints
- ✅ Frontend (port 3001) - RUNNING with UI components
- ✅ Database tables created: users, courses, enrollments, chat_messages
- ✅ Environment files configured (.env with credentials)
- ✅ Sequelize models connected and working
- ✅ JWT authentication ready
- ✅ Socket.IO infrastructure ready
- ✅ Health checks passing

### 🚨 HÀNH ĐỘNG TIẾP THEO (PRIORITY)
1. **CRITICAL** - Tạo `frontend/.env` và kết nối FE → BE (xem Section: Frontend-Backend Integration)
2. **HIGH** - Test authentication flow end-to-end
3. **MEDIUM** - Hoàn thiện real-time features

### 📊 TRẠNG THÁI CÁC PHASE
- ✅ **Phase 1 (Foundation)**: 100% - Infrastructure ready
- ✅ **Phase 2 (Real-time)**: 95% - Cần thêm rate limiting & Redis adapter
- 🔄 **Phase 3 (Livestream)**: 60% - Cần backend participant management
- 🔄 **Phase 4 (Quiz)**: 40% - Cần backend schema & logic
- ✅ **Phase 5 (UI/UX)**: 90% - UI components complete
- 🔄 **Phase 6 (Deployment)**: 50% - Docker infrastructure ready

---

## �🎯 TỔNG QUAN DỰ ÁN

**Mục tiêu**: Xây dựng hệ thống LMS nhỏ gọn hỗ trợ học tương tác thời gian thực

**Nguyên tắc phát triển**:
- ✅ **Incremental Development**: Từ core → advanced
- ✅ **Modular Architecture**: Dễ thêm/sửa/debug
- ✅ **API-First Design**: Scalable và maintainable
- ✅ **Real-time Focus**: WebSocket làm backbone

---

## 📋 PHASE 1: FOUNDATION SETUP ✅ **COMPLETED - 2025-10-09**

### ✅ 1.1 Project Structure & Environment - **DONE**

**Status**: All project structure created and operational

```bash
# Cấu trúc đã hoàn thành
lms-platform/
├── backend/          ✅ Complete with all modules
├── frontend/         ✅ Complete with React + TypeScript
├── docker-compose.yml ✅ All services running
└── .env files        ✅ Configured
```

### ✅ 1.2 Backend Foundation Setup - **DONE**

**Status**: All dependencies installed, server running, database connected

✅ **COMPLETED ITEMS:**
1. ✅ All core dependencies installed (express, socket.io, pg, redis, etc.)
2. ✅ Database models implemented and connected to PostgreSQL
3. ✅ All core endpoints operational (auth, courses, chat)
4. ✅ Socket.IO setup with room management and chat
5. ✅ Complete middleware chain (CORS, auth, logging, error handling)

**Verification**:
- Backend running at http://localhost:3000
- Health check endpoint: http://localhost:3000/health
- Database connection verified
- Redis connection verified

### ✅ 1.3 Frontend Foundation Setup - **DONE**

**Status**: All UI components built, routing configured

✅ **COMPLETED ITEMS:**
1. ✅ All core dependencies installed (React, TypeScript, Tailwind, etc.)
2. ✅ All core components created (Layout, Auth, Course, Chat)
3. ✅ Pages structure complete with routing
4. ✅ Service layer created (currently using mocks)
5. ✅ State management with Zustand

**⚠️ PENDING ACTION**: Switch from mock services to real API
- Need to create `frontend/.env` with VITE_API_URL and VITE_WS_URL
- Need to update authStore to use real authService

### ✅ 1.4 Database Schema - **DONE**

**Status**: All tables created successfully via Sequelize

✅ **COMPLETED ITEMS:**
- ✅ PostgreSQL database 'lms_db' created
- ✅ User 'lms_user' with password configured
- ✅ Tables created: users, courses, enrollments, chat_messages
- ✅ Indexes created for performance
- ✅ Model associations configured

**Verification Commands:**
```bash
# Check database
docker exec -it dacn-postgres-1 psql -U lms_user -d lms_db
\dt  # List tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## 📋 PHASE 2: REAL-TIME COMMUNICATION ✅ **95% COMPLETE**

### 1.1 Project Structure & Environment

```bash
# Tạo project structure
lms-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

### 1.2 Backend Foundation Setup

**Prompt cho Backend Developer**:

```
Tạo Node.js backend với cấu trúc sau:

1. DEPENDENCIES CORE:
   - express: Web framework
   - socket.io: WebSocket communication
   - pg: PostgreSQL client
   - redis: Caching và session
   - bcryptjs: Password hashing
   - jsonwebtoken: Authentication
   - cors: Cross-origin requests
   - helmet: Security headers
   - express-rate-limit: Rate limiting

2. DATABASE MODELS (Sequelize/Prisma):
   - User (id, email, password, role, profile)
   - Course (id, title, description, instructor_id, status)
   - Enrollment (user_id, course_id, enrolled_at)
   - ChatMessage (id, sender_id, course_id, message, timestamp)

3. CORE ENDPOINTS:
   POST /api/auth/register
   POST /api/auth/login
   GET /api/auth/profile
   GET /api/courses
   POST /api/courses (instructor only)
   POST /api/courses/:id/enroll

4. BASIC SOCKET.IO SETUP:
   - Connection handling
   - Room management (course-based)
   - Basic chat functionality
   - Error handling & reconnection

5. MIDDLEWARE CHAIN:
   - CORS configuration
   - JSON parsing
   - Authentication middleware
   - Error handling middleware
   - Request logging

Yêu cầu: Code phải có comment chi tiết, error handling đầy đủ, và logging system.
```

### 1.3 Frontend Foundation Setup

**Prompt cho Frontend Developer**:

```
Tạo React frontend với cấu trúc sau:

1. DEPENDENCIES CORE:
   - react, react-dom: UI framework
   - react-router-dom: Routing
   - socket.io-client: WebSocket client
   - axios: HTTP client
   - @tanstack/react-query: Data fetching
   - zustand: State management
   - tailwindcss: Styling
   - lucide-react: Icons

2. CORE COMPONENTS:
   - Layout/Header/Sidebar
   - AuthForm (Login/Register)
   - CourseList/CourseCard
   - Chat/ChatMessage
   - ProtectedRoute

3. PAGES STRUCTURE:
   - /login, /register
   - /dashboard (course list)
   - /course/:id (course detail)
   - /course/:id/live (livestream view)

4. SERVICES LAYER:
   - authService: Login/logout/profile
   - courseService: CRUD operations
   - socketService: WebSocket management
   - apiClient: Axios configuration

5. STATE MANAGEMENT:
   - authStore: User authentication state
   - courseStore: Courses data
   - chatStore: Chat messages
   - uiStore: Loading states, modals

Yêu cầu: 
- Responsive design (mobile-first)
- Error boundaries
- Loading states
- TypeScript interfaces (nếu dùng TS)
```

### 1.4 Database Schema

**Prompt cho Database Design**:

```sql
-- Core tables cho MVP
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft',
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_chat_messages_course_id ON chat_messages(course_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

---

## 📋 PHASE 2: REAL-TIME COMMUNICATION (Week 3-4)

### 2.1 WebSocket Architecture

**Prompt cho Real-time Developer**:

```
Implement WebSocket system với Socket.IO:

1. SOCKET EVENT STRUCTURE:
   Client → Server:
   - 'join-course': Join course room
   - 'leave-course': Leave course room
   - 'send-message': Send chat message
   - 'typing-start': User typing indicator
   - 'typing-stop': Stop typing indicator

   Server → Client:
   - 'message-received': New chat message
   - 'user-joined': User joined course
   - 'user-left': User left course
   - 'typing-indicator': Someone typing
   - 'error': Error messages

2. ROOM MANAGEMENT:
   - Course-based rooms: `course_${courseId}`
   - User presence tracking
   - Online users list
   - Room-specific message history

3. MESSAGE HANDLING:
   - Real-time message broadcast
   - Message persistence to PostgreSQL
   - Message history loading
   - Typing indicators with debounce

4. CONNECTION MANAGEMENT:
   - Authentication via JWT token
   - Graceful disconnection handling
   - Reconnection logic
   - Error recovery

5. PERFORMANCE OPTIMIZATION:
   - Redis adapter for scaling
   - Message rate limiting per user
   - Memory usage monitoring

Code yêu cầu:
- Clean event naming convention
- Comprehensive error handling
- Connection state logging
- Performance metrics
```

### 2.2 Chat System Implementation

**Prompt cho Chat Feature**:

```
Xây dựng hệ thống chat real-time:

BACKEND REQUIREMENTS:
1. Message Controller:
   - Save message to database
   - Broadcast to room members
   - Handle different message types (text, file, system)
   - Message validation & sanitization

2. Message History API:
   - Pagination support (cursor-based)
   - Filter by course
   - Load latest N messages
   - Search functionality (basic)

3. Real-time Features:
   - Typing indicators (5s timeout)
   - Online users count
   - Message delivery confirmation
   - Read receipts (optional)

FRONTEND REQUIREMENTS:
1. Chat UI Components:
   - Message list with virtual scrolling
   - Message input with emoji picker
   - File upload support
   - Typing indicators display

2. Real-time Updates:
   - Auto-scroll to new messages
   - Message timestamps (relative)
   - Sender avatar & name display
   - Message status indicators

3. UX Enhancements:
   - Smooth animations
   - Keyboard shortcuts (Enter to send)
   - Mobile-responsive design
   - Offline message queuing

TECHNICAL SPECS:
- Message length limit: 1000 characters
- File upload limit: 10MB
- History load: 50 messages per request
- Typing timeout: 5 seconds
- Reconnection: Exponential backoff
```

---

## 📋 PHASE 3: LIVESTREAM FOUNDATION (Week 5-6)

### 3.1 Basic Livestream Setup

**Prompt cho Livestream Developer**:

```
Implement cơ bản livestream với WebRTC:

1. WEBRTC SETUP:
   - PeerConnection configuration
   - ICE servers setup (STUN/TURN)
   - Media stream handling
   - Signaling server via Socket.IO

2. INSTRUCTOR STREAM (Broadcaster):
   - Camera/microphone access
   - Screen sharing capability
   - Stream quality controls
   - Start/stop streaming

3. STUDENT VIEW (Receivers):
   - Multiple peer connections management
   - Stream display optimization
   - Audio/video controls
   - Connection quality indicators

4. SIGNALING PROTOCOL:
   Socket events:
   - 'start-stream': Instructor starts
   - 'join-stream': Student joins viewing
   - 'webrtc-offer': WebRTC offer
   - 'webrtc-answer': WebRTC answer
   - 'ice-candidate': ICE candidate exchange
   - 'stream-ended': Stream terminated

5. FALLBACK MECHANISMS:
   - Network quality detection
   - Adaptive bitrate (basic)
   - Graceful degradation
   - Error recovery

6. UI COMPONENTS:
   - Video player with controls
   - Stream status indicators
   - Participant list
   - Chat integration (side panel)

PERFORMANCE CONSIDERATIONS:
- Limit concurrent viewers (start with 50)
- Optimize video resolution (720p default)
- Implement buffering strategies
- Monitor connection quality

Note: Start với simple peer-to-peer, sau này có thể upgrade lên SFU/MCU
```

### 3.2 Stream Management

**Prompt cho Stream Management**:

```
Tạo hệ thống quản lý livestream:

1. STREAM STATE MANAGEMENT:
   Database schema thêm:
   ```sql
   CREATE TABLE live_streams (
       id SERIAL PRIMARY KEY,
       course_id INTEGER REFERENCES courses(id),
       instructor_id INTEGER REFERENCES users(id),
       title VARCHAR(255),
       status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, ended
       started_at TIMESTAMP,
       ended_at TIMESTAMP,
       max_viewers INTEGER DEFAULT 50,
       created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE stream_participants (
       id SERIAL PRIMARY KEY,
       stream_id INTEGER REFERENCES live_streams(id),
       user_id INTEGER REFERENCES users(id),
       joined_at TIMESTAMP DEFAULT NOW(),
       left_at TIMESTAMP
   );
   ```

2. STREAM LIFECYCLE API:
   - POST /api/streams/create
   - POST /api/streams/:id/start
   - POST /api/streams/:id/end
   - GET /api/streams/:id/participants
   - GET /api/courses/:id/current-stream

3. REAL-TIME NOTIFICATIONS:
   - Stream started notifications
   - New participant alerts
   - Stream quality updates
   - Connection status changes

4. INSTRUCTOR CONTROLS:
   - Start/stop stream
   - Mute/unmute participants
   - Kick participants (if needed)
   - Stream settings panel

5. PARTICIPANT MANAGEMENT:
   - Auto-join when stream starts
   - Viewer count display
   - Participant list with status
   - Permission controls

MONITORING & ANALYTICS:
- Track viewer count over time
- Monitor stream quality metrics
- Log connection issues
- Generate basic reports
```

---

## 📋 PHASE 4: INTERACTIVE QUIZ SYSTEM (Week 7-8)

### 4.1 Quiz Engine Development

**Prompt cho Quiz System**:

```
Xây dựng hệ thống quiz real-time:

1. DATABASE SCHEMA:
   ```sql
   CREATE TABLE quizzes (
       id SERIAL PRIMARY KEY,
       course_id INTEGER REFERENCES courses(id),
       title VARCHAR(255) NOT NULL,
       description TEXT,
       time_limit INTEGER, -- seconds
       status VARCHAR(20) DEFAULT 'draft',
       created_by INTEGER REFERENCES users(id),
       created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE quiz_questions (
       id SERIAL PRIMARY KEY,
       quiz_id INTEGER REFERENCES quizzes(id),
       question_text TEXT NOT NULL,
       question_type VARCHAR(20) DEFAULT 'multiple_choice',
       options JSONB, -- Array of options for MC questions
       correct_answer JSONB, -- Correct answer(s)
       points INTEGER DEFAULT 1,
       time_limit INTEGER, -- per question limit
       order_index INTEGER
   );

   CREATE TABLE quiz_sessions (
       id SERIAL PRIMARY KEY,
       quiz_id INTEGER REFERENCES quizzes(id),
       instructor_id INTEGER REFERENCES users(id),
       status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, ended
       current_question_id INTEGER,
       started_at TIMESTAMP,
       ended_at TIMESTAMP
   );

   CREATE TABLE quiz_responses (
       id SERIAL PRIMARY KEY,
       session_id INTEGER REFERENCES quiz_sessions(id),
       question_id INTEGER REFERENCES quiz_questions(id),
       user_id INTEGER REFERENCES users(id),
       answer JSONB,
       is_correct BOOLEAN,
       response_time INTEGER, -- milliseconds
       submitted_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. REAL-TIME QUIZ FLOW:
   Socket Events:
   - 'quiz-started': Quiz session begins
   - 'question-displayed': New question shown
   - 'answer-submitted': Student submits answer
   - 'question-results': Show correct answer & stats
   - 'quiz-ended': Quiz session complete

3. INSTRUCTOR CONTROLS:
   - Create quiz questions
   - Start quiz session
   - Control question timing
   - View live results
   - Next/previous question
   - End quiz session

4. STUDENT INTERFACE:
   - Real-time question display
   - Answer submission
   - Timer countdown
   - Result feedback
   - Final score display

5. LIVE ANALYTICS:
   - Response rate tracking
   - Correct/incorrect ratios
   - Average response time
   - Student participation metrics

TECHNICAL IMPLEMENTATION:
- Question synchronization across all clients
- Prevent multiple submissions
- Handle disconnection during quiz
- Store partial responses
- Timer synchronization
- Results aggregation in real-time
```

### 4.2 Quiz Results & Analytics

**Prompt cho Quiz Analytics**:

```
Implement quiz results và analytics system:

1. REAL-TIME RESULTS DISPLAY:
   Frontend Components:
   - Live results dashboard (instructor)
   - Student progress indicators
   - Question statistics visualization
   - Leaderboard (optional)

2. RESULTS CALCULATION:
   Backend Services:
   - Score calculation algorithm
   - Response time analysis
   - Participation tracking
   - Performance metrics

3. VISUALIZATION COMPONENTS:
   - Bar charts cho answer distribution
   - Line charts cho response times
   - Progress indicators
   - Summary statistics

4. DATA AGGREGATION:
   - Per-question analysis
   - Per-student performance
   - Course-level statistics
   - Time-based trends

5. EXPORT FUNCTIONALITY:
   - CSV export của results
   - PDF reports generation
   - Email summary to instructor
   - Student individual reports

ANALYTICS METRICS:
- Participation rate
- Average score
- Question difficulty analysis
- Time spent per question
- Most/least understood topics
```

---

## 📋 PHASE 5: UI/UX POLISH & OPTIMIZATION (Week 9-10)

### 5.1 Advanced UI Components

**Prompt cho UI/UX Enhancement**:

```
Nâng cấp UI/UX cho production-ready:

1. COMPONENT LIBRARY:
   Tạo reusable components:
   - Button với loading states
   - Modal với animation
   - Toast notifications
   - Loading skeletons
   - Empty states
   - Error boundaries

2. RESPONSIVE DESIGN:
   - Mobile-first approach
   - Tablet optimization
   - Desktop enhancements
   - Touch-friendly interactions
   - Swipe gestures (mobile)

3. THEME SYSTEM:
   - Light/dark mode toggle
   - Color scheme variables
   - Consistent spacing system
   - Typography hierarchy
   - Component theming

4. MICRO-INTERACTIONS:
   - Button hover effects
   - Loading animations
   - Page transitions
   - Message animations
   - Success/error feedback

5. ACCESSIBILITY (A11Y):
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance
   - Focus management
   - ARIA labels

6. PERFORMANCE OPTIMIZATION:
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle size analysis
   - Caching strategies

UI PATTERNS:
- Navigation breadcrumbs
- Search functionality
- Filtering & sorting
- Pagination
- Drag & drop (future)
```

### 5.2 Advanced Features

**Prompt cho Advanced Features**:

```
Implement advanced features:

1. NOTIFICATION SYSTEM:
   - Browser push notifications
   - Email notifications
   - In-app notification center
   - Real-time alerts
   - Notification preferences

2. FILE SHARING:
   - Drag & drop file upload
   - File preview
   - Course materials library
   - Download tracking
   - File versioning

3. SCREEN SHARING:
   - Instructor screen share
   - Application window sharing
   - Screen annotation tools
   - Recording capability (future)
   - Quality controls

4. USER PREFERENCES:
   - Profile customization
   - Notification settings
   - Display preferences
   - Language selection
   - Timezone settings

5. OFFLINE CAPABILITY:
   - Service worker implementation
   - Offline message queuing
   - Sync when online
   - Cached content
   - PWA features

INTEGRATION POINTS:
- Calendar integration
- Email notifications
- Social login (Google, etc.)
- External tool embedding
- Export/import functionality
```

---

## 📋 PHASE 6: DEPLOYMENT & MONITORING (Week 11-12)

### 6.1 Production Deployment

**Prompt cho DevOps Setup**:

```
Chuẩn bị production deployment:

1. DOCKER CONFIGURATION:
   ```dockerfile
   # Backend Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]

   # Frontend Dockerfile
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. DOCKER COMPOSE:
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://...
         - REDIS_URL=redis://redis:6379
       depends_on:
         - postgres
         - redis
       ports:
         - "3000:3000"

     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend

     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: lms_db
         POSTGRES_USER: lms_user
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
   ```

3. ENVIRONMENT CONFIGURATION:
   - Production environment variables
   - SSL certificate setup
   - Database connection pooling
   - Redis configuration
   - Logging configuration

4. CI/CD PIPELINE:
   - GitHub Actions setup
   - Automated testing
   - Build & deployment
   - Health checks
   - Rollback procedures

5. MONITORING SETUP:
   - Application metrics
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring
   - Log aggregation
```

### 6.2 Performance & Security

**Prompt cho Performance & Security**:

```
Production readiness checklist:

1. PERFORMANCE OPTIMIZATION:
   Backend:
   - Database query optimization
   - Connection pooling
   - Caching strategies (Redis)
   - API response compression
   - Rate limiting implementation

   Frontend:
   - Bundle optimization
   - Image lazy loading
   - Code splitting
   - Service worker caching
   - CDN integration

2. SECURITY HARDENING:
   - JWT token security
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Input validation
   - File upload security
   - API rate limiting
   - HTTPS enforcement

3. MONITORING & LOGGING:
   - Application logs
   - Error tracking
   - Performance metrics
   - User analytics
   - System health checks
   - Automated alerts

4. BACKUP & RECOVERY:
   - Database backups
   - File storage backups
   - Recovery procedures
   - Data retention policies

5. SCALING PREPARATION:
   - Load balancer setup
   - Horizontal scaling config
   - Database replication
   - CDN configuration
   - Cache optimization

SECURITY CHECKLIST:
- Environment variables secure
- Database credentials encrypted
- API endpoints authenticated
- File uploads validated
- User input sanitized
- Error messages don't leak info
```

---

## 🔧 DEBUGGING & MAINTENANCE

### Debug Guidelines

**Prompt cho Debugging Strategy**:

```
Debugging strategy cho từng component:

1. BACKEND DEBUGGING:
   - Structured logging với Winston
   - Request/response logging
   - Database query logging
   - WebSocket event tracing
   - Performance profiling

   Debug Tools:
   - Node.js debugger
   - PostgreSQL query analyzer
   - Redis monitoring tools
   - Network traffic analysis

2. FRONTEND DEBUGGING:
   - React DevTools
   - Redux/Zustand DevTools
   - Network tab monitoring
   - Console error tracking
   - Performance profiler

3. REAL-TIME DEBUGGING:
   - Socket.IO admin UI
   - WebRTC statistics
   - Connection state monitoring
   - Event flow tracing

4. COMMON ISSUES & SOLUTIONS:
   WebSocket:
   - Connection drops → Reconnection logic
   - Message loss → Acknowledgment system
   - Room sync issues → State validation

   Database:
   - Query performance → Index optimization
   - Connection timeout → Pool configuration
   - Lock issues → Transaction optimization

   Frontend:
   - State sync issues → State debugging tools
   - Performance → React Profiler
   - Memory leaks → Memory tab analysis

DEBUGGING WORKFLOW:
1. Reproduce issue in development
2. Add detailed logging
3. Use appropriate debugging tools
4. Fix and test
5. Add prevention measures
```

### Maintenance & Updates

**Prompt cho Maintenance Plan**:

```
Long-term maintenance strategy:

1. CODE MAINTENANCE:
   - Regular dependency updates
   - Security patch management
   - Code refactoring schedule
   - Technical debt tracking
   - Performance audits

2. DATABASE MAINTENANCE:
   - Query performance monitoring
   - Index optimization
   - Data cleanup procedures
   - Backup verification
   - Migration management

3. MONITORING & ALERTS:
   - System health checks
   - Performance thresholds
   - Error rate monitoring
   - User activity tracking
   - Resource utilization

4. FEATURE EVOLUTION:
   - User feedback collection
   - Feature usage analytics
   - A/B testing framework
   - Gradual rollout procedures
   - Feature flag management

5. SCALING PLANNING:
   - Load testing procedures
   - Capacity planning
   - Infrastructure scaling
   - Cost optimization
   - Performance benchmarking

MAINTENANCE SCHEDULE:
- Daily: Health checks, error monitoring
- Weekly: Performance reviews, user feedback
- Monthly: Security updates, feature planning
- Quarterly: Major updates, architecture review
- Yearly: Technology stack evaluation
```

---

## 🎯 SUCCESS METRICS & KPIs

### Key Performance Indicators

```
TECHNICAL METRICS:
- Page load time < 2 seconds
- API response time < 500ms
- WebSocket connection success > 99%
- System uptime > 99.5%
- Error rate < 1%

USER EXPERIENCE METRICS:
- User registration conversion
- Daily/monthly active users
- Session duration
- Feature adoption rates
- User satisfaction scores

BUSINESS METRICS:
- Course completion rates
- Student engagement levels
- Instructor adoption
- Platform usage growth
- Support ticket volume

REAL-TIME PERFORMANCE:
- Concurrent user capacity
- Message delivery success rate
- Video stream quality
- Quiz participation rates
- Chat response latency
```

---

## 📚 DOCUMENTATION REQUIREMENTS

### Required Documentation

```
1. TECHNICAL DOCUMENTATION:
   - API documentation (OpenAPI/Swagger)
   - Database schema documentation
   - WebSocket event documentation
   - Deployment guides
   - Troubleshooting guides

2. USER DOCUMENTATION:
   - User manual for students
   - Instructor guide
   - Admin documentation
   - FAQ section
   - Video tutorials

3. DEVELOPER DOCUMENTATION:
   - Code architecture overview
   - Contributing guidelines
   - Local development setup
   - Testing procedures
   - Release process

4. OPERATIONAL DOCUMENTATION:
   - Monitoring setup
   - Backup procedures
   - Incident response
   - Scaling guidelines
   - Security protocols
```

---

**🎉 COMPLETION CHECKLIST**

✅ Phase 1: Foundation Setup
✅ Phase 2: Real-time Communication  
✅ Phase 3: Livestream Foundation
✅ Phase 4: Interactive Quiz System
✅ Phase 5: UI/UX Polish & Optimization
✅ Phase 6: Deployment & Monitoring

**📈 NEXT STEPS AFTER COMPLETION:**
- User acceptance testing
- Performance optimization
- Security audit
- Production deployment
- User training
- Marketing & launch

---

*Prompt này được thiết kế để đảm bảo development process có cấu trúc, dễ debug, và có thể mở rộng trong tương lai. Mỗi phase có thể được thực hiện độc lập và có checkpoint rõ ràng.*