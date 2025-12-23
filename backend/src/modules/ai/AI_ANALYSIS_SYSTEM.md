# AI Lesson Analysis System - Complete Implementation

## 📋 Overview

This system provides intelligent AI-powered analysis for lesson content, including:
- **Video Analysis**: Gemini 3 Pro multimodal analysis via ProxyPal
- **Content Analysis**: Key concepts, difficulty assessment, learning objectives
- **Smart Caching**: Eliminates redundant AI requests with versioned caching
- **Background Processing**: Queue-based system with retry logic
- **Context-Aware AI Tutor**: Uses lesson analysis for better responses

## 🏗️ Architecture

### Phase 1: Database & Core Services ✅

**Migrations:**
- `043-create-ai-lesson-analysis.ts`: Stores analysis results with versioning
- `044-create-ai-analysis-queue.ts`: Queue system for async processing

**Models:**
- `AILessonAnalysis`: Analysis results (summary, video transcript, key concepts, etc.)
- `AIAnalysisQueue`: Task queue with priority and retry logic

**Core Services:**
- `ProxyPalHealthCheckService`: Monitors ProxyPal availability (singleton, 30s polling)
- `AIAnalysisQueueService`: Background worker (1-min intervals, max 3 concurrent)

### Phase 2 & 3: Analysis Services ✅

**Services:**
- `LessonAnalysisService`: Main analysis orchestrator
  - Full analysis (video + content)
  - Video-only analysis (YouTube + R2 support)
  - Content analysis (concepts, difficulty, objectives)
  - Summary generation

**AI Tutor Integration:**
- Modified `AITutorService` to inject lesson context
- Async `buildSystemPrompt()` with lesson analysis
- Context-aware responses

### Phase 4: API & Integration ✅

**Controllers:** (`ai-analysis.controller.ts`)
- `POST /ai/analysis/:lessonId` - Request analysis (instructor)
- `GET /ai/analysis/:lessonId` - Get analysis (all users)
- `DELETE /ai/analysis/:lessonId` - Re-analyze (instructor)
- `GET /ai/analysis/proxypal/status` - Check ProxyPal status
- `GET /ai/analysis/queue` - Admin queue monitoring
- `POST /ai/analysis/queue/process` - Force queue processing

**Lifecycle Hooks:** (`lesson.hooks.ts`)
- `afterCreate`: Auto-queue full analysis
- `afterUpdate`: Queue re-analysis if content/video changed
- `beforeDelete`: Cleanup handled by CASCADE

**Server Integration:**
- ProxyPal health check on startup
- Queue worker auto-start
- Graceful shutdown handling

### Phase 5: Frontend UI ✅

**API Client:** (`ai-analysis.api.ts`)
- TypeScript interfaces for all endpoints
- Full API coverage

**React Hooks:** (`useAIAnalysis.ts`)
- `useAIAnalysis`: Fetch analysis + queue status
- `useRequestAnalysis`: Request analysis (instructor)
- `useDeleteAnalysis`: Delete + re-queue
- `useProxyPalStatus`: Monitor ProxyPal health
- `useAnalysisQueue`: Admin queue management

**Components:**

1. **Instructor - AIAnalysisStatus** (`components/instructor/AIAnalysisStatus.tsx`)
   - Shows analysis status in lesson editor
   - Request/re-analyze buttons
   - Queue status display
   - Analysis metadata (concepts, difficulty, etc.)

2. **Student - AISummaryPanel** (`components/student/AISummaryPanel.tsx`)
   - Expandable summary panel
   - Key concepts with icons
   - Video highlights
   - Learning objectives
   - Difficulty + estimated time

3. **Admin - AIQueueDashboard** (`pages/admin/AIQueueDashboard.tsx`)
   - ProxyPal status card
   - Queue statistics (total, pending, processing, failed)
   - Task table with filters
   - Force process button

## 🚀 Usage

### 1. Environment Setup

Add to `.env`:

```env
# ProxyPal Configuration
PROXYPAL_API_URL=http://localhost:8080
PROXYPAL_ENABLED=true

# AI Configuration (fallback)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Groq (optional fallback)
GROQ_API_KEY=your_groq_api_key
```

### 2. Database Migration

```bash
# Backend directory
npm run migrate:up
```

This will create:
- `ai_lesson_analysis` table
- `ai_analysis_queue` table
- Indexes for performance

### 3. Start Services

**ProxyPal (for video analysis):**
```bash
# Start ProxyPal server on port 8080
# Provides unlimited Gemini 3 Pro access
```

**Backend:**
```bash
npm run dev
```

The queue worker will auto-start and log:
```
✅ ProxyPal: Available (Local AI processing enabled)
✅ AI Analysis Queue Worker started (processing every 1 minute)
```

### 4. Frontend Integration

**For Instructors (in lesson editor):**

```tsx
import { AIAnalysisStatus } from '@/components/instructor/AIAnalysisStatus';

// In your lesson editor component
<AIAnalysisStatus 
  lessonId={lesson.id} 
  isInstructor={true} 
/>
```

**For Students (in lesson view):**

```tsx
import { AISummaryPanel } from '@/components/student/AISummaryPanel';

// In your lesson detail page
<AISummaryPanel lessonId={lesson.id} />
```

**For Admins (dashboard):**

```tsx
import { AIQueueDashboard } from '@/pages/admin/AIQueueDashboard';

// In admin routes
<Route path="/admin/ai-queue" element={<AIQueueDashboard />} />
```

## 🔄 Workflow

### Automatic Workflow

1. **Instructor creates lesson** → System auto-queues full analysis
2. **Queue worker picks up task** → Checks ProxyPal availability
3. **Analysis executes:**
   - Video analysis (if video_url present) using Gemini 3 Pro
   - Content analysis (key concepts, difficulty)
   - Summary generation
4. **Results saved** → Students can view summary
5. **AI Tutor enhanced** → Uses lesson context for better responses

### Manual Workflow

1. **Instructor clicks "Analyze"** → Queues analysis
2. **Instructor clicks "Re-analyze"** → Deletes old + queues new
3. **Admin monitors queue** → Views pending/failed tasks
4. **Admin force processes** → Manually triggers worker

## 📊 Queue System

### Priority Levels
- 1-3: High priority (instructor-triggered, updates)
- 4-6: Medium priority (new lessons)
- 7-10: Low priority (bulk operations)

### Retry Logic
- **Max retries**: 5
- **Backoff**: Exponential (60s * 2^retry_count, max 5 min)
- **Example**: 1min → 2min → 4min → 5min → 5min

### Task Types
- `full_analysis`: Video + content + summary
- `video_analysis`: Video only
- `summary`: Content summary only

### Status Flow
```
pending → processing → completed
                    ↓
                  failed (retries with backoff)
```

## 🎯 Key Features

### 1. Smart Caching
- Analysis cached for 24 hours
- Version tracking prevents stale data
- Re-analysis invalidates cache

### 2. Fallback System
- ProxyPal (primary) → Gemini API (fallback) → Groq (fallback)
- Video analysis requires ProxyPal (multimodal)
- Text analysis works without ProxyPal

### 3. Context-Aware AI Tutor
- Fetches lesson analysis before chat
- Injects context into system prompt
- More accurate, lesson-specific responses

### 4. Video Support
- **YouTube**: Extracts video ID, sends URL to Gemini 3 Pro
- **R2 Storage**: Generates signed URL, sends to Gemini 3 Pro
- **Analysis**: Transcript + key points + visual elements

### 5. Content Analysis
- Key concepts extraction
- Difficulty assessment (beginner/intermediate/advanced)
- Learning objectives generation
- Prerequisite identification
- Estimated study time

## 🔍 Monitoring

### Backend Logs

```bash
# Watch queue worker
tail -f logs/app.log | grep "Queue Worker"

# Watch analysis
tail -f logs/app.log | grep "Lesson Analysis"

# ProxyPal health
tail -f logs/app.log | grep "ProxyPal"
```

### Admin Dashboard

Access at `/admin/ai-queue`:
- Real-time queue statistics
- Task filtering (pending/processing/failed)
- ProxyPal status indicator
- Force process button for manual trigger

### API Monitoring

```bash
# Get queue status
curl http://localhost:3000/api/v1.3.0/ai/analysis/queue \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get ProxyPal status
curl http://localhost:3000/api/v1.3.0/ai/analysis/proxypal/status \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Troubleshooting

### Issue: Queue not processing

**Solution:**
1. Check queue worker logs
2. Verify ProxyPal is running: `curl http://localhost:8080/health`
3. Force process via admin dashboard
4. Check for failed tasks with error messages

### Issue: Video analysis failing

**Solution:**
1. Ensure ProxyPal is running
2. Check ProxyPal has Gemini 3 Pro enabled
3. Verify video URL is accessible
4. Check R2 credentials (for R2 videos)

### Issue: Analysis cached too long

**Solution:**
1. Delete analysis: `DELETE /ai/analysis/:lessonId`
2. Or force re-analyze via UI
3. Adjust cache time in controller (currently 24h)

### Issue: Too many queue retries

**Solution:**
1. Check error messages in queue table
2. Fix root cause (ProxyPal down, API keys invalid)
3. Delete failed tasks after fixing
4. Re-trigger analysis

## 📈 Performance

### Optimization Tips

1. **Queue Processing:**
   - Adjust `QUEUE_PROCESS_INTERVAL` (default: 60s)
   - Adjust `MAX_CONCURRENT_TASKS` (default: 3)

2. **ProxyPal:**
   - Use local ProxyPal for unlimited requests
   - No rate limits on Gemini 3 Pro

3. **Caching:**
   - 24-hour cache eliminates redundant AI calls
   - 10 students viewing = 1 AI request (not 10)

4. **Priority:**
   - Instructor-triggered = high priority
   - Auto-queued = medium priority
   - Bulk operations = low priority

## 🔐 Security

### Authentication
- All endpoints require authentication
- Instructor-only: Request/delete analysis
- Admin-only: Queue management, force process
- Student: Read-only access to completed analysis

### Data Privacy
- Analysis data deleted with lesson (CASCADE)
- No PII in analysis results
- Secure R2 signed URLs (1-hour expiry)

## 📚 API Reference

### Request Analysis
```typescript
POST /ai/analysis/:lessonId
Body: { force?: boolean }
Auth: Instructor/Admin
Returns: { analysis?, queued?, queue_task? }
```

### Get Analysis
```typescript
GET /ai/analysis/:lessonId
Auth: Any authenticated user
Returns: { analysis, queue_status[] }
```

### Delete Analysis
```typescript
DELETE /ai/analysis/:lessonId
Auth: Instructor/Admin
Returns: { success, message }
```

### ProxyPal Status
```typescript
GET /ai/analysis/proxypal/status
Auth: Any authenticated user
Returns: { available, url, models }
```

### Queue Management
```typescript
GET /ai/analysis/queue?status=pending&limit=50
Auth: Admin
Returns: { tasks[], total }
```

### Force Process
```typescript
POST /ai/analysis/queue/process
Auth: Admin
Returns: { processed }
```

## 🎓 Best Practices

1. **Always use ProxyPal** for video analysis (unlimited, multimodal)
2. **Monitor queue** regularly via admin dashboard
3. **Set appropriate priorities** for tasks
4. **Let auto-queue handle** most analyses
5. **Use re-analyze sparingly** (only when content significantly changed)
6. **Check ProxyPal status** before bulk operations

## 📝 Future Enhancements

- [ ] WebSocket real-time queue updates
- [ ] Batch analysis for multiple lessons
- [ ] Custom analysis templates
- [ ] Multi-language support
- [ ] Analysis quality ratings
- [ ] Historical analysis versions
- [ ] Export analysis to PDF
- [ ] Integration with course recommendations

## 🤝 Contributing

All phases complete. System ready for production use!

## 📄 License

Internal project - all rights reserved.
