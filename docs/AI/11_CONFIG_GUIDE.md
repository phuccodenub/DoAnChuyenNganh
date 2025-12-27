# ⚙️ HƯỚNG DẪN CẤU HÌNH CHI TIẾT

**Tài liệu:** 11 - Config Guide  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P0 (Thiết yếu)

---

## 📖 TỔNG QUAN

Hướng dẫn này cung cấp các bước cấu hình chi tiết để tích hợp tất cả các dịch vụ AI vào dự án LMS. Từ các API keys đến environment variables, tất cả đều được nêu rõ ràng.

### Phạm vi
- ✅ ProxyPal installation & configuration
- ✅ ProxyPal premium models config
- ✅ Google AI Studio
- ✅ Groq Cloud
- ✅ Redis configuration
- ✅ Environment variables
- ✅ Database migrations

---

## 🚀 BƯỚC 1: CÀI ĐẶT PROXYPAL

### 1.1 Tải xuống ProxyPal

**Windows:**
```powershell
# Tải xuống từ GitHub
$url = "https://github.com/proxypal/proxypal/releases/download/v1.0/proxypal-windows.zip"
$output = "C:\ProxyPal\proxypal-windows.zip"

New-Item -ItemType Directory -Path "C:\ProxyPal" -Force
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "C:\ProxyPal"

# Thêm vào PATH
$env:Path += ";C:\ProxyPal\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ProxyPal\bin", [EnvironmentVariableTarget]::User)
```

**macOS/Linux:**
```bash
# Tải xuống
wget https://github.com/proxypal/proxypal/releases/download/v1.0/proxypal-linux.tar.gz
tar -xzf proxypal-linux.tar.gz -C ~/proxypal

# Thêm vào PATH
echo 'export PATH="$HOME/proxypal/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 1.2 Khởi tạo ProxyPal

```bash
# Kiểm tra cài đặt
proxypal --version

# Tạo directory cấu hình
mkdir -p ~/.proxypal/config

# Tạo file cấu hình chính
proxypal init --interactive
```

### 1.3 Cấu hình models

**File:** `~/.proxypal/config/models.yaml`

> ⚠️ Lưu ý: Theo `docs/AI/Provider_Rule.md`, Gemini qua ProxyPal không ổn định. Chỉ dùng GPT/Qwen trên ProxyPal (local).

```yaml
version: 1.0

providers:
  - name: "qwen"
    type: "qwen"
    apiKey: "${QWEN_API_KEY}"
    models:
      - name: "qwen3-coder-plus"
        config:
          contextWindow: 32000
          temperature: 0.5
          timeout: 15000
      
      - name: "qwen3-coder-flash"
        config:
          contextWindow: 128000
          temperature: 0.7
          timeout: 10000

  - name: "gpt"
    type: "openai"
    apiKey: "${OPENAI_API_KEY}"
    models:
      - name: "gpt-5"
        config:
          contextWindow: 128000
          temperature: 0.7
          timeout: 30000

routing:
  strategies:
    - name: "default"
      rules:
        - condition: "codeQuality == true"
          provider: "qwen"
          model: "qwen3-coder-plus"
        
        - condition: "speed == high"
          provider: "qwen"
          model: "qwen3-coder-flash"
        
        - condition: "default"
          provider: "gpt"
          model: "gpt-5"

cache:
  type: "redis"
  host: "localhost"
  port: 6379
  db: 2
  ttl: 86400

logging:
  level: "info"
  format: "json"
  output: "file"
  path: "~/.proxypal/logs/proxypal.log"
```


### 1.4 Khởi động ProxyPal

```bash
# Khởi động service
proxypal start

# Kiểm tra status
proxypal status

# Output expected:
# ProxyPal Server running on http://localhost:8888
# Models loaded: gemini-3-pro-preview, qwen3-coder-plus, qwen3-coder-flash
# Cache: Redis connected (localhost:6379)
```

---

## 🔑 BƯỚC 2: CẤU HÌNH API KEYS

### 2.1 Google AI Studio (Gemini Flash)

```bash
# Truy cập https://ai.google.dev
# 1. Click "Get API Key"
# 2. Chọn project hoặc tạo mới
# 3. Copy API key

# Lưu vào environment (key rotation)
export GEMINI_API_KEY="AIzaSyD..."
export GEMINI_API_KEY_2="AIzaSyD..."
export GEMINI_API_KEY_3="AIzaSyD..."
```


### 2.2 Groq Cloud (Llama 3)

```bash
# Truy cập https://console.groq.com
# 1. Đăng ký hoặc đăng nhập
# 2. Navigate to "API Keys"
# 3. Click "Create New API Key"
# 4. Copy và lưu

export GROQ_API_KEY="gsk_..."
```

### 2.3 ProxyPal Premium Models (GPT-5.x)

```bash
# ProxyPal Premium (local/hosted)
# GPT-5.2: debate judging / arbitration
# GPT-5.1: quiz polish

export PROXYPAL_MODEL_PREMIUM="gpt-5.2"
export PROXYPAL_MODEL_POLISH="gpt-5.1"
export PROXYPAL_MODEL_FALLBACK="gpt-5"
```

---

## 📦 BƯỚC 3: CẤU HÌNH ENVIRONMENT

### 3.1 Backend Environment

**File:** `backend/.env` (tham khảo `backend/env.example`)

```bash
# ============ NODE ============
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# ============ DATABASE ============
DATABASE_URL=postgresql://lms_user:123456@localhost:5432/lms_db

# ============ REDIS ============
REDIS_URL=redis://localhost:6379

# ============ PROXYPAL (Local only) ============
# NOTE: ProxyPal chỉ dùng local/dev, không khuyến nghị production
# Dùng 127.0.0.1 để tránh IPv6 issues
PROXYPAL_BASE_URL=http://127.0.0.1:8317/v1
PROXYPAL_API_KEY=proxypal-local
PROXYPAL_ENABLED=false
PROXYPAL_TIMEOUT=60000

# ============ TIER 1: SPEED (Cloud Free) ============
GROQ_API_KEY=gsk_...
GROQ_MODEL_DEFAULT=llama-3.3-70b-versatile
GROQ_MODEL_REASONING=llama-3.3-70b-versatile
GROQ_MODEL_MATH=qwen-3-32b
GROQ_MODEL_VISION=llama-4-scout
GROQ_MODEL_SPEECH=whisper-large-v3
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=2048

# Google AI Studio (Gemini Flash) - key rotation
GEMINI_API_KEY=your-gemini-api-key-1
GEMINI_API_KEY_2=your-gemini-api-key-2
GEMINI_API_KEY_3=your-gemini-api-key-3
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Models
GOOGLE_MODEL_3_FLASH=gemini-3-flash-preview
GOOGLE_MODEL_2_5_FLASH=gemini-2.5-flash
GOOGLE_MODEL_2_5_FLASH_LITE=gemini-2.5-flash-lite
GOOGLE_MODEL_2_5_FLASH_TTS=gemini-2.5-flash-preview-tts

# ============ TIER 3: PREMIUM (ProxyPal) ============
PROXYPAL_MODEL_PREMIUM=gpt-5.2
PROXYPAL_MODEL_POLISH=gpt-5.1
PROXYPAL_MODEL_FALLBACK=gpt-5

# ============ AI FEATURE FLAGS ============
AI_TUTOR_ENABLED=true
AI_QUIZ_GENERATOR_ENABLED=true
AI_GRADER_ENABLED=false
AI_CONTENT_REPURPOSING_ENABLED=false

# ============ CACHE TTL ============
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=3600
```

### 3.2 Frontend Environment

**File:** `frontend/.env.production` (Vite)

```bash
VITE_API_URL=/api/v1.2.0
VITE_SOCKET_URL=http://localhost:3000
VITE_DEMO_MODE=false
VITE_FILE_UPLOAD_MAX_SIZE=10485760
VITE_DEBUG_MODE=false
```

### 3.3 Docker Environment

**File:** `docker/.env`

```bash
# Docker Compose
COMPOSE_PROJECT_NAME=lms-ai
COMPOSE_FILE=docker-compose.prod.yml

# Database
POSTGRES_PASSWORD=db-secure-password
POSTGRES_DB=lms_db

# Redis
REDIS_PASSWORD=redis-secure-password

# Backend
BACKEND_PORT=3000
BACKEND_REPLICAS=3

# Frontend
FRONTEND_PORT=80
```


---

## 🗄️ BƯỚC 4: SETUP DATABASE

### 4.1 Tạo database

```bash
# Kết nối đến PostgreSQL
psql -U postgres -h localhost

# Tạo database
CREATE DATABASE lms_ai;
CREATE USER lms_admin WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE lms_ai TO lms_admin;

# Thoát
\q
```

### 4.2 Chạy migrations

```bash
cd backend

# Install dependencies
npm install

# Tạo tables
npm run typeorm migration:run

# Verify
npm run typeorm migration:show

# Expected output:
# ✓ CreateLearningPathTable
# ✓ CreateDebateHistoryTable
# ✓ CreateAIUsageTable
# ... etc
```

### 4.3 Seed dữ liệu mẫu

```bash
# Tạo seed file
cat > backend/scripts/seed-ai-data.ts << 'EOF'
import { AppDataSource } from '@/database/data-source';

async function seedData() {
  await AppDataSource.initialize();
  
  // Seed rubrics
  const rubricRepo = AppDataSource.getRepository('Rubric');
  await rubricRepo.save({
    name: 'Default Code Grading',
    criteria: {
      Correctness: { weight: 40, levels: 5 },
      CodeQuality: { weight: 30, levels: 5 },
      Performance: { weight: 20, levels: 4 },
      Security: { weight: 10, levels: 3 }
    }
  });
  
  console.log('✓ Seed data created');
  await AppDataSource.destroy();
}

seedData().catch(console.error);
EOF

npm run ts-node scripts/seed-ai-data.ts
```

---

## 🔴 BƯỚC 5: SETUP REDIS

### 5.1 Cài đặt Redis

**Windows (via WSL2):**
```bash
# Trong WSL2
sudo apt update
sudo apt install redis-server

# Khởi động
redis-server

# Kiểm tra
redis-cli ping
# Output: PONG
```

**macOS:**
```bash
brew install redis
brew services start redis
redis-cli ping
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
redis-cli ping
```

### 5.2 Cấu hình Redis

**File:** `/etc/redis/redis.conf` (hoặc config location)

```conf
# Redis Security
requirepass redis-secure-password
maxclients 10000

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Database selection for AI features
# DB 0: General cache
# DB 1: Session cache
# DB 2: AI cache (reserved)
# DB 3: Queue/jobs

# Logging
loglevel notice
logfile "/var/log/redis/redis-server.log"
```

### 5.3 Kiểm tra Redis

```bash
redis-cli
> AUTH redis-secure-password
> PING
> SELECT 2
> INFO

# Expected: 
# redis_version: 7.0+
# connected_clients: 1
# used_memory_human: 1.5M
```

---

## 🧪 BƯỚC 6: CẤU HÌNH TESTING

### 6.1 Test file structure

**File:** `backend/test/integration/ai.integration.spec.ts`

```typescript
import axios from 'axios';

describe('AI Integration Tests', () => {
  const API_URL = 'http://localhost:3000/api/v1';
  let token: string;

  beforeAll(async () => {
    // Get auth token
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    });
    token = loginRes.data.token;
  });

  it('should generate quiz', async () => {
    const res = await axios.post(
      `${API_URL}/ai/quiz/generate`,
      {
        topicId: 'topic-123',
        questionCount: 5,
        difficulty: 'medium'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(res.status).toBe(202);
    expect(res.data.jobId).toBeDefined();
  });

  it('should create learning path', async () => {
    const res = await axios.post(
      `${API_URL}/adaptive-learning/start`,
      {
        topicId: 'topic-123',
        assessmentScore: 65
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.skillLevel).toBeDefined();
  });
});
```

### 6.2 Chạy integration tests

```bash
cd backend

# Run tests
npm run test:integration

# With coverage
npm run test:integration -- --coverage

# Watch mode
npm run test:integration -- --watch
```

---

## ✅ BƯỚC 7: VERIFICATION CHECKLIST

```bash
# 1. ProxyPal running
curl http://localhost:8888/health

# 2. Backend API running
curl http://localhost:3000/health

# 3. Redis connected
redis-cli PING

# 4. Database connected
psql -U lms_admin -d lms_ai -c "SELECT COUNT(*) FROM learning_paths;"

# 5. Test quiz generation
curl -X POST http://localhost:3000/api/v1/ai/quiz/generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topicId":"topic-1","questionCount":5}'

# 6. Test chat connection
wscat -c ws://localhost:3000/ws/ai/chat

# 7. Check logs
tail -f backend/logs/app.log
```

---

## 🔐 BƯỚC 8: SECURITY HARDENING

### 8.1 Bảo vệ API Keys

```bash
# Sử dụng .env.local (không commit)
echo ".env.local" >> backend/.gitignore
echo ".env.production.local" >> backend/.gitignore

# Rotate keys monthly
# Set calendar reminder
```

### 8.2 Rate Limiting

**File:** `backend/src/middleware/rate-limit.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const aiQuizLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many quiz requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

export const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 messages per minute
  skipSuccessfulRequests: false
});
```

### 8.3 Input Validation

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class QuizGenerationDto {
  @IsString()
  @Length(1, 500)
  topicId: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  questionCount: number;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;
}

// Sử dụng
export async function generateQuiz(req: Request, res: Response) {
  const dto = plainToClass(QuizGenerationDto, req.body);
  const errors = await validate(dto);
  
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  
  // Process...
}
```

---

## 📊 BƯỚC 9: MONITORING SETUP

### 9.1 Prometheus Metrics

**File:** `backend/src/metrics/prometheus.ts`

```typescript
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const quizGenerationCounter = new Counter({
  name: 'ai_quiz_generations_total',
  help: 'Total quiz generations',
  labelNames: ['model', 'status']
});

export const quizGenerationDuration = new Histogram({
  name: 'ai_quiz_generation_duration_seconds',
  help: 'Quiz generation duration',
  buckets: [1, 5, 10, 30, 60, 120]
});

export const aiCostGauge = new Gauge({
  name: 'ai_monthly_cost_usd',
  help: 'Current monthly AI cost'
});

// Endpoint cho Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### 9.2 Sentry Error Tracking

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## 📚 LIÊN QUAN

- **Trước:** [10_API_DESIGN.md](10_API_DESIGN.md)
- **Tiếp:** [12_DEPLOYMENT.md](12_DEPLOYMENT.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
