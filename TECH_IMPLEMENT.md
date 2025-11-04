# Kế hoạch triển khai công nghệ mở rộng LMS

> Cập nhật: 2025-10-31 • Phân tích từ: `TECH_STACK.md`  
> Trạng thái: **Sẵn sàng thực hiện**

## 🔍 Phân tích hiện trạng

### ✅ Đã có sẵn trong dự án
- **File Service**: Local storage với cấu hình mở rộng (`StorageType` enum)
- **Upload System**: Multer middleware với validation hoàn chỉnh  
- **Storage Types**: Đã định nghĩa sẵn `LOCAL`, `AWS_S3`, `AZURE_BLOB`, `GOOGLE_CLOUD`
- **Infrastructure**: Docker compose, Redis, PostgreSQL

### ❌ Còn thiếu
- **Google Cloud Storage**: Chưa implement, chỉ có stub code
- **Video processing**: Thiếu transcoding, streaming optimized
- **CDN integration**: Chưa có cache distribution
- **Background jobs**: Chưa có queue system cho tasks nặng

---

## 🚀 Kế hoạch triển khai (3 phases, 90 ngày)

# PHASE 1: CLOUD STORAGE FOUNDATION (Ngày 1-30)

## Task 1.1: Google Cloud Storage Integration (Tuần 1-2)

### Bước 1: Cài đặt dependencies
```bash
cd backend
npm install @google-cloud/storage
npm install --save-dev @types/google__cloud-storage
```

### Bước 2: Cấu hình môi trường
**Cập nhật `backend/.env`:**
```env
# Google Cloud Storage
STORAGE_TYPE=google_cloud
GCP_PROJECT_ID=your-project-id
GCS_BUCKET=lms-media-storage
GOOGLE_APPLICATION_CREDENTIALS=./config/gcs-service-account.json
GCS_PUBLIC_URL=https://storage.googleapis.com/lms-media-storage
```

### Bước 3: Tạo GCS service implementation
**Tạo file `backend/src/services/storage/gcs.service.ts`:**

```typescript
import { Storage, Bucket } from '@google-cloud/storage';
import { UploadedFileInfo, FileUploadOptions } from '../../modules/files/files.types';
import logger from '../../utils/logger.util';

export class GCSStorageService {
  private storage: Storage;
  private bucket: Bucket;
  private publicUrl: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    this.bucket = this.storage.bucket(process.env.GCS_BUCKET!);
    this.publicUrl = process.env.GCS_PUBLIC_URL!;
  }

  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<UploadedFileInfo> {
    const filename = `${options.folder}/${Date.now()}_${file.originalname}`;
    const gcsFile = this.bucket.file(filename);

    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: options.userId,
          uploadedAt: new Date().toISOString(),
        }
      },
      public: true,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        const publicUrl = `${this.publicUrl}/${filename}`;
        resolve({
          filename: file.originalname,
          path: filename,
          url: publicUrl,
          size: file.size,
          mimetype: file.mimetype,
          folder: options.folder || 'misc'
        });
      });
      stream.end(file.buffer);
    });
  }

  async generateSignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    const [url] = await this.bucket.file(filename).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      await this.bucket.file(filename).delete();
      return true;
    } catch (error) {
      logger.error('GCS delete error:', error);
      return false;
    }
  }
}
```

### Bước 4: Cập nhật FilesService để hỗ trợ GCS
**Cập nhật `backend/src/modules/files/files.service.ts`:**

```typescript
import { GCSStorageService } from '../../services/storage/gcs.service';

export class FilesService {
  private gcsService?: GCSStorageService;

  constructor() {
    // Existing code...
    
    if (this.storageType === StorageType.GOOGLE_CLOUD) {
      this.gcsService = new GCSStorageService();
    }
  }

  async processUpload(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<UploadedFileInfo> {
    switch (this.storageType) {
      case StorageType.GOOGLE_CLOUD:
        return await this.gcsService!.uploadFile(file, options);
      
      case StorageType.LOCAL:
      default:
        // Existing local storage logic...
        return this.processLocalUpload(file, options);
    }
  }
}
```

### Bước 5: Testing GCS integration
**Tạo test `backend/src/tests/integration/gcs.test.ts`:**

```typescript
describe('GCS Storage Integration', () => {
  it('should upload file to GCS', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test content')
    } as Express.Multer.File;

    const result = await filesService.processUpload(mockFile, {
      folder: 'test',
      userId: 'user1'
    });

    expect(result.url).toContain('storage.googleapis.com');
  });
});
```

---

## Task 1.2: Cloudinary for Image Processing (Tuần 2-3)

### Bước 1: Cài đặt Cloudinary
```bash
npm install cloudinary
npm install --save-dev @types/cloudinary
```

### Bước 2: Cấu hình Cloudinary
**Thêm vào `.env`:**
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=lms_uploads
```

### Bước 3: Tạo Cloudinary service
**Tạo `backend/src/services/media/cloudinary.service.ts`:**

```typescript
import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'lms'
  ): Promise<{url: string; publicId: string; format: string}> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `lms/${folder}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
            format: result!.format
          });
        }
      ).end(file.buffer);
    });
  }

  async generateThumbnail(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [
        { width: 300, height: 200, crop: 'fill' },
        { quality: 'auto', format: 'webp' }
      ]
    });
  }
}
```

---

## Task 1.3: File Upload Strategy Refactoring (Tuần 3-4)

### Bước 1: Tạo Storage Factory Pattern
**Tạo `backend/src/services/storage/storage.factory.ts`:**

```typescript
import { StorageType } from '../../modules/files/files.types';
import { LocalStorageService } from './local.service';
import { GCSStorageService } from './gcs.service';
import { CloudinaryService } from '../media/cloudinary.service';

export interface IStorageService {
  uploadFile(file: Express.Multer.File, options: any): Promise<any>;
  deleteFile(path: string): Promise<boolean>;
  generateSignedUrl(path: string, expiresIn?: number): Promise<string>;
}

export class StorageFactory {
  static createStorageService(type: StorageType): IStorageService {
    switch (type) {
      case StorageType.GOOGLE_CLOUD:
        return new GCSStorageService();
      
      case StorageType.LOCAL:
      default:
        return new LocalStorageService();
    }
  }

  static createMediaService(): CloudinaryService {
    return new CloudinaryService();
  }
}
```

### Bước 2: Enhanced Upload Middleware
**Cập nhật `backend/src/modules/files/upload.middleware.ts`:**

```typescript
export const smartUploadMiddleware = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  useCloudinary?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const upload = multer({
      storage: multer.memoryStorage(), // Store in memory for cloud uploads
      fileFilter: (req, file, cb) => {
        if (options.allowedTypes?.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} not allowed`));
        }
      },
      limits: { fileSize: options.maxSize || 10 * 1024 * 1024 }
    });

    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};
```

---

# PHASE 2: ADVANCED FEATURES (Ngày 31-60)

## Task 2.1: Background Job Processing (Tuần 5-6)

### Bước 1: Cài đặt BullMQ
```bash
npm install bullmq
npm install --save-dev @types/bullmq
```

### Bước 2: Tạo Job Queue System
**Tạo `backend/src/services/queue/queue.service.ts`:**

```typescript
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export enum JobType {
  VIDEO_TRANSCODE = 'video:transcode',
  IMAGE_PROCESS = 'image:process',
  EMAIL_SEND = 'email:send',
  SEARCH_INDEX = 'search:index'
}

export class QueueService {
  private queues: Map<JobType, Queue> = new Map();
  private workers: Map<JobType, Worker> = new Map();

  constructor() {
    this.initializeQueues();
    this.initializeWorkers();
  }

  private initializeQueues() {
    Object.values(JobType).forEach(jobType => {
      const queue = new Queue(jobType, { connection: redis });
      this.queues.set(jobType, queue);
    });
  }

  async addJob(
    type: JobType,
    data: any,
    options?: { delay?: number; priority?: number }
  ): Promise<Job> {
    const queue = this.queues.get(type);
    if (!queue) throw new Error(`Queue ${type} not found`);

    return await queue.add(type, data, options);
  }

  async addVideoTranscodeJob(videoPath: string, outputOptions: any): Promise<Job> {
    return this.addJob(JobType.VIDEO_TRANSCODE, {
      inputPath: videoPath,
      outputOptions,
      timestamp: Date.now()
    });
  }
}
```

### Bước 3: Video Processing Worker
**Tạo `backend/src/workers/video.worker.ts`:**

```typescript
import { Worker } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export class VideoWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('video:transcode', async (job) => {
      const { inputPath, outputOptions } = job.data;
      
      return new Promise((resolve, reject) => {
        const outputPath = path.join(
          path.dirname(inputPath),
          `transcoded_${Date.now()}.mp4`
        );

        ffmpeg(inputPath)
          .outputOptions([
            '-c:v libx264',
            '-preset medium',
            '-crf 23',
            '-c:a aac',
            '-b:a 128k'
          ])
          .output(outputPath)
          .on('end', () => {
            resolve({ 
              success: true, 
              outputPath,
              originalPath: inputPath 
            });
          })
          .on('error', reject)
          .run();
      });
    });
  }
}
```

---

## Task 2.2: Search Integration với Meilisearch (Tuần 7-8)

### Bước 1: Setup Meilisearch
**Thêm vào `docker-compose.yml`:**

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=your-master-key
      - MEILI_ENV=production
    volumes:
      - meilisearch_data:/meili_data
```

### Bước 2: Cài đặt Meilisearch client
```bash
npm install meilisearch
```

### Bước 3: Tạo Search Service
**Tạo `backend/src/services/search/meilisearch.service.ts`:**

```typescript
import { MeiliSearch } from 'meilisearch';

export class MeilisearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY,
    });
  }

  async indexCourse(course: any): Promise<void> {
    const index = this.client.index('courses');
    
    await index.addDocuments([{
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      tags: course.tags,
      difficulty: course.difficulty,
      updatedAt: course.updatedAt
    }]);
  }

  async searchCourses(query: string, filters?: any): Promise<any> {
    const index = this.client.index('courses');
    
    return await index.search(query, {
      attributesToHighlight: ['title', 'description'],
      filter: filters,
      limit: 20
    });
  }
}
```

---

## Task 2.3: Realtime Scaling với Redis Adapter (Tuần 8)

### Bước 1: Cài đặt Redis Adapter cho Socket.IO
```bash
npm install @socket.io/redis-adapter ioredis
```

### Bước 2: Cập nhật Socket.IO configuration
**Cập nhật `backend/src/services/socket/socket.service.ts`:**

```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class SocketService {
  private io: Server;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') }
    });

    this.setupRedisAdapter();
  }

  private async setupRedisAdapter() {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.io.adapter(createAdapter(pubClient, subClient));
  }
}
```

---

# PHASE 3: MONITORING & OPTIMIZATION (Ngày 61-90)

## Task 3.1: Prometheus + Grafana Monitoring (Tuần 9-10)

### Bước 1: Cài đặt Prometheus client
```bash
npm install prom-client
```

### Bước 2: Tạo Metrics Service
**Tạo `backend/src/services/monitoring/metrics.service.ts`:**

```typescript
import client from 'prom-client';

export class MetricsService {
  private register: client.Registry;
  private httpRequestsTotal: client.Counter<string>;
  private httpRequestDuration: client.Histogram<string>;
  private activeConnections: client.Gauge<string>;

  constructor() {
    this.register = new client.Registry();
    
    // HTTP Requests Counter
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // Active WebSocket connections
    this.activeConnections = new client.Gauge({
      name: 'websocket_active_connections',
      help: 'Number of active WebSocket connections',
    });

    this.register.registerMetric(this.httpRequestsTotal);
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.activeConnections);

    // Default metrics
    client.collectDefaultMetrics({ register: this.register });
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }
}
```

### Bước 3: Thêm Grafana dashboard
**Tạo `docker-compose.monitoring.yml`:**

```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/dashboards:/var/lib/grafana/dashboards

volumes:
  prometheus_data:
  grafana_data:
```

---

## Task 3.2: Error Tracking với Sentry (Tuần 11)

### Bước 1: Cài đặt Sentry
```bash
# Backend
npm install @sentry/node @sentry/profiling-node

# Frontend 
cd ../frontend
npm install @sentry/react @sentry/tracing
```

### Bước 2: Backend Sentry setup
**Cập nhật `backend/src/app.ts`:**

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry before other imports
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

// Sentry error handler (add before other error handlers)
app.use(Sentry.Handlers.errorHandler());
```

### Bước 3: Frontend Sentry setup
**Cập nhật `frontend/src/main.tsx`:**

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});

const App = Sentry.withSentryConfig(YourApp);
```

---

## Task 3.3: CI/CD Pipeline với GitHub Actions (Tuần 12)

### Bước 1: Tạo GitHub Actions workflow
**Tạo `.github/workflows/deploy.yml`:**

```yaml
name: Deploy LMS Application

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t lms-backend ./backend
          docker build -t lms-frontend ./frontend
      
      - name: Deploy to production
        run: |
          # Add your deployment script here
          echo "Deploying to production..."
```

---

## 📊 Roadmap tổng quan

### Phase 1 (Tháng 1) - Foundation 🏗️
- ✅ Google Cloud Storage cho video/files lớn
- ✅ Cloudinary cho image processing  
- ✅ Storage abstraction layer
- 🎯 **Mục tiêu**: Hỗ trợ upload file quy mô lớn, tối ưu images

### Phase 2 (Tháng 2) - Scaling 🚀  
- ✅ BullMQ background jobs
- ✅ Meilisearch cho tìm kiếm
- ✅ Socket.IO Redis adapter
- 🎯 **Mục tiêu**: Scale horizontal, search nhanh, realtime ổn định

### Phase 3 (Tháng 3) - Operations 📈
- ✅ Prometheus + Grafana monitoring
- ✅ Sentry error tracking
- ✅ CI/CD pipeline  
- 🎯 **Mục tiêu**: Observability hoàn chỉnh, deployment tự động

---

## 🔧 Commands tóm tắt cho từng phase

### Phase 1 Commands:
```bash
# Setup GCS
npm install @google-cloud/storage
# Setup Cloudinary  
npm install cloudinary
# Test storage
npm run test:storage
```

### Phase 2 Commands:
```bash
# Setup job queue
npm install bullmq
# Setup search
docker-compose -f docker-compose.monitoring.yml up -d meilisearch
npm install meilisearch
# Setup realtime scaling  
npm install @socket.io/redis-adapter ioredis
```

### Phase 3 Commands:
```bash
# Setup monitoring
npm install prom-client
docker-compose -f docker-compose.monitoring.yml up -d
# Setup error tracking
npm install @sentry/node @sentry/react
# Deploy
git push origin main  # Triggers CI/CD
```

---

## 📝 Ghi chú quan trọng

1. **Google Cloud Storage**: Đã có sẵn types và interfaces, chỉ cần implement actual code
2. **Cloudinary**: Tối ưu cho images, thumbnails tự động  
3. **Background Jobs**: Quan trọng cho video processing, không block main thread
4. **Search**: Meilisearch nhanh hơn Elasticsearch cho use case này
5. **Monitoring**: Bắt buộc trước khi production

**Ưu tiên thực hiện**: Phase 1 → Task 1.1 (GCS) là **CRITICAL** cho video storage!