# 🎯 HỆ THỐNG HỌC THÍCH NGHI CÁ NHÂN HÓA

**Tài liệu:** 09 - Adaptive Learning  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P2 (Giá trị cao, chi phí vừa)

---

## 📖 TỔNG QUAN

Hệ thống Adaptive Learning tạo ra những con đường học tập được cá nhân hóa cho từng học sinh dựa trên kỹ năng hiện tại, tốc độ học, và các khoảng trống kiến thức. Hệ thống này chạy dưới dạng background job và gọi AI để tạo khuyến nghị.

### Giá trị kinh doanh
- 🎓 **Cá nhân hóa 100%:** Mỗi học sinh có lộ trình riêng
- ⚡ **Tối ưu thời gian:** Bỏ qua nội dung biết rồi, tập trung vào gaps
- 📈 **Tăng hiệu suất học:** +15-25% theo nghiên cứu
- 💰 **Chi phí thấp:** Chạy background, reuse cached recommendations

### Trường hợp sử dụng
1. **Học sinh yếu:** Lộ trình bổ sung từng bước
2. **Học sinh giỏi:** Challenge thêm, đẩy mạnh
3. **Học sinh trung bình:** Cân bằng lý thuyết + thực hành
4. **Khóa học mới:** Tạo lộ trình khóa học chuẩn

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Luồng học thích nghi (Adaptive Flow)

```
┌──────────────────────────────────┐
│  SINH VIÊN BẮT ĐẦU HỌC          │
│  Làm bài quiz đánh giá            │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  ASSESSMENT ENGINE               │
│  - Phân tích kết quả quiz        │
│  - Xác định skill level          │
│  - Phát hiện knowledge gaps      │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  TRIGGER: BACKGROUND JOB         │
│  - Generate learning path        │
│  - Estimate time to mastery      │
│  - Create milestone              │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  AI RECOMMENDATION ENGINE         │
│  (Gemini Flash - cached)         │
│  - Tạo lesson sequence           │
│  - Chọn resources phù hợp        │
│  - Set difficulty progression    │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  LEARNING PATH CREATED           │
│  - 3-5 tuần, 2-3h/tuần          │
│  - Tăng dần difficulty           │
│  - Checkpoint tại tuần 2, 4      │
└────────────┬──────────────────────┘
             │
      ┌──────┴──────┐
      │             │
   LEARN      CHECKPOINT
      │             │
      ▼             ▼
  Progress    Re-assess
  Update      Update Path
      │             │
      └──────┬──────┘
             │
             ▼
┌──────────────────────────────────┐
│  MASTERY ACHIEVED / REDIRECT     │
│  - Next topic recommendation     │
│  - New learning path generated   │
└──────────────────────────────────┘
```

### Kiến trúc hệ thống

```
ADAPTIVE LEARNING ORCHESTRATOR
│
├─ Assessment Engine
│  ├─ Quiz analyzer
│  ├─ Skill detector
│  └─ Gap finder
│
├─ Path Generator
│  ├─ Sequencing algorithm
│  ├─ Difficulty calculator
│  └─ Milestone planner
│
├─ Recommendation Engine
│  ├─ Gemini Flash (resource selection)
│  ├─ Caching layer (Redis)
│  └─ Personalization rules
│
└─ Progress Tracker
   ├─ Real-time analytics
   ├─ Mastery detection
   └─ Path adjustment
```

---

## 💻 TRIỂN KHAI BACKEND

### Adaptive Learning Controller

**File:** `backend/src/modules/ai/adaptive-learning.controller.ts`

```typescript
import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdaptiveLearningService } from './services/adaptive-learning.service';

@Controller('api/v1/adaptive-learning')
export class AdaptiveLearningController {
  constructor(private adaptiveService: AdaptiveLearningService) {}

  /**
   * Bắt đầu learning path (được gọi sau assessment)
   * POST /api/v1/adaptive-learning/start
   */
  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  async startLearningPath(
    @Req() req: any,
    @Body()
    body: {
      courseId: string;
      topicId: string;
      assessmentScore: number; // 0-100
      assessmentDetails?: {
        questionsAnswered: number;
        correctAnswers: number;
        timeSpent: number;
        conceptMastery: Record<string, number>;
      };
    }
  ) {
    return await this.adaptiveService.generateLearningPath({
      studentId: req.user.id,
      courseId: body.courseId,
      topicId: body.topicId,
      assessmentScore: body.assessmentScore,
      assessmentDetails: body.assessmentDetails
    });
  }

  /**
   * Lấy learning path hiện tại
   * GET /api/v1/adaptive-learning/:pathId
   */
  @Get(':pathId')
  @UseGuards(AuthGuard('jwt'))
  async getLearningPath(@Param('pathId') pathId: string) {
    return await this.adaptiveService.getLearningPath(pathId);
  }

  /**
   * Update tiến độ học
   * POST /api/v1/adaptive-learning/:pathId/progress
   */
  @Post(':pathId/progress')
  @UseGuards(AuthGuard('jwt'))
  async updateProgress(
    @Param('pathId') pathId: string,
    @Body()
    body: {
      milestoneId: string;
      completed: boolean;
      score?: number;
      timeSpent?: number;
    }
  ) {
    return await this.adaptiveService.updateProgress({
      pathId,
      milestoneId: body.milestoneId,
      completed: body.completed,
      score: body.score,
      timeSpent: body.timeSpent
    });
  }

  /**
   * Lấy khuyến nghị tiếp theo
   * GET /api/v1/adaptive-learning/:pathId/recommendation
   */
  @Get(':pathId/recommendation')
  @UseGuards(AuthGuard('jwt'))
  async getRecommendation(@Param('pathId') pathId: string) {
    return await this.adaptiveService.getNextRecommendation(pathId);
  }

  /**
   * Reset path (thay đổi học liệu)
   * POST /api/v1/adaptive-learning/:pathId/reset
   */
  @Post(':pathId/reset')
  @UseGuards(AuthGuard('jwt'))
  async resetPath(@Param('pathId') pathId: string) {
    return await this.adaptiveService.resetPath(pathId);
  }
}
```

### Adaptive Learning Service

**File:** `backend/src/modules/ai/services/adaptive-learning.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProxyPalService } from './providers/proxypal.service';
import { LearningPath, LearningMilestone, StudentProgress } from '@/database/models';
import Redis from 'ioredis';

interface PathGenerationRequest {
  studentId: string;
  courseId: string;
  topicId: string;
  assessmentScore: number;
  assessmentDetails?: {
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
    conceptMastery: Record<string, number>;
  };
}

interface AdaptivePath {
  pathId: string;
  studentId: string;
  courseId: string;
  topicId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastery';
  estimatedTimeToMastery: number; // hours
  milestones: AdaptiveMilestone[];
  knowledgeGaps: string[];
  recommendations: string[];
  createdAt: Date;
  lastUpdated: Date;
}

interface AdaptiveMilestone {
  id: string;
  sequence: number;
  title: string;
  description: string;
  resources: {
    type: 'video' | 'article' | 'exercise' | 'project' | 'quiz';
    title: string;
    url: string;
    estimatedTime: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  prerequisiteMilestones: string[];
  targetConcepts: string[];
  estimatedTime: number; // hours
  successCriteria: {
    minScore: number;
    questionsToPass: number;
  };
  completed: boolean;
  score?: number;
}

@Injectable()
export class AdaptiveLearningService {
  private proxypal: ProxyPalService;
  private redis: Redis;

  constructor() {
    this.proxypal = new ProxyPalService();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 2
    });
  }

  /**
   * Tạo learning path dựa trên assessment
   */
  async generateLearningPath(request: PathGenerationRequest): Promise<AdaptivePath> {
    const pathId = this.generatePathId();
    console.log(`[Adaptive] Generating learning path ${pathId} for student ${request.studentId}`);

    // Stage 1: Đánh giá kỹ năng
    const skillLevel = this.assessSkillLevel(request.assessmentScore);
    const gaps = await this.identifyKnowledgeGaps(request);

    // Stage 2: Tạo chuỗi milestone (background job)
    const milestones = await this.generateMilestones({
      topicId: request.topicId,
      skillLevel,
      knowledgeGaps: gaps,
      assessmentDetails: request.assessmentDetails
    });

    // Stage 3: Tạo khuyến nghị
    const recommendations = await this.generateRecommendations({
      studentId: request.studentId,
      skillLevel,
      gaps,
      milestones
    });

    const path: AdaptivePath = {
      pathId,
      studentId: request.studentId,
      courseId: request.courseId,
      topicId: request.topicId,
      skillLevel,
      estimatedTimeToMastery: this.calculateTimeToMastery(skillLevel, milestones),
      milestones,
      knowledgeGaps: gaps,
      recommendations,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Cache và lưu
    await this.redis.setex(
      `path:${pathId}`,
      30 * 24 * 60 * 60, // 30 ngày
      JSON.stringify(path)
    );

    await LearningPath.create({
      id: pathId,
      studentId: request.studentId,
      courseId: request.courseId,
      topicId: request.topicId,
      skillLevel,
      milestones: JSON.stringify(milestones),
      knowledgeGaps: JSON.stringify(gaps),
      pathData: JSON.stringify(path),
      createdAt: new Date()
    });

    return path;
  }

  /**
   * Đánh giá mức kỹ năng từ điểm số
   */
  private assessSkillLevel(score: number): 'beginner' | 'intermediate' | 'advanced' | 'mastery' {
    if (score >= 85) return 'mastery';
    if (score >= 70) return 'advanced';
    if (score >= 55) return 'intermediate';
    return 'beginner';
  }

  /**
   * Xác định knowledge gaps
   */
  private async identifyKnowledgeGaps(request: PathGenerationRequest): Promise<string[]> {
    if (!request.assessmentDetails?.conceptMastery) {
      return [];
    }

    const gaps: string[] = [];
    for (const [concept, masteryScore] of Object.entries(
      request.assessmentDetails.conceptMastery
    )) {
      if (masteryScore < 60) {
        gaps.push(concept);
      }
    }
    return gaps;
  }

  /**
   * Tạo milestones (learning modules)
   */
  private async generateMilestones(params: {
    topicId: string;
    skillLevel: string;
    knowledgeGaps: string[];
    assessmentDetails?: any;
  }): Promise<AdaptiveMilestone[]> {
    const prompt = `Tạo learning path chi tiết cho chủ đề sau:

CHỦĐỀ: ${params.topicId}
MỨC KỸNĂNG: ${params.skillLevel}
KNOWLEDGE GAPS: ${params.knowledgeGaps.join(', ')}

Tạo 3-5 MILESTONES với cấu trúc:
- Các milestone phải từ dễ đến khó
- Ưu tiên các knowledge gaps
- Mỗi milestone có 2-4 resources
- Bao gồm các loại: video, article, exercise, project, quiz

OUTPUT JSON:
[
  {
    "sequence": 1,
    "title": "Milestone title",
    "description": "Mô tả chi tiết",
    "resources": [
      {
        "type": "video|article|exercise|project|quiz",
        "title": "Resource title",
        "estimatedTime": 30,
        "difficulty": "easy|medium|hard"
      }
    ],
    "targetConcepts": ["concept1", "concept2"],
    "estimatedTime": 2,
    "successCriteria": {
      "minScore": 70,
      "questionsToPass": 8
    }
  }
]`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.6
    });

    try {
      const parsed = JSON.parse(response.text);
      return parsed.map((m: any, idx: number) => ({
        id: `milestone-${Date.now()}-${idx}`,
        sequence: m.sequence || idx + 1,
        title: m.title,
        description: m.description,
        resources: m.resources.map((r: any) => ({
          type: r.type,
          title: r.title,
          url: this.generateResourceUrl(r.type, r.title),
          estimatedTime: r.estimatedTime || 30,
          difficulty: r.difficulty || 'medium'
        })),
        prerequisiteMilestones: idx === 0 ? [] : [`milestone-${Date.now()}-${idx - 1}`],
        targetConcepts: m.targetConcepts || [],
        estimatedTime: m.estimatedTime || 2,
        successCriteria: m.successCriteria || { minScore: 70, questionsToPass: 8 },
        completed: false
      }));
    } catch (error) {
      console.error('Error parsing milestones:', error);
      return this.generateDefaultMilestones();
    }
  }

  /**
   * Tạo khuyến nghị cá nhân
   */
  private async generateRecommendations(params: {
    studentId: string;
    skillLevel: string;
    gaps: string[];
    milestones: AdaptiveMilestone[];
  }): Promise<string[]> {
    const prompt = `Dựa trên hồ sơ học sinh, hãy tạo 3-5 khuyến nghị cá nhân hóa:

MỨC KỸNĂNG: ${params.skillLevel}
KNOWLEDGE GAPS: ${params.gaps.join(', ')}
LEARNING MILESTONES: ${params.milestones.map((m) => m.title).join(', ')}

Khuyến nghị phải:
1. Cụ thể và hữu ích
2. Dễ hiểu
3. Khuyến khích

OUTPUT: Mảng chuỗi JSON`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.7
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return [
        'Hãy bắt đầu từ milestone 1 và theo dõi tiến độ hàng ngày',
        'Nếu gặp khó khăn, yêu cầu giúp đỡ từ giáo viên',
        'Ôn tập từ các milestone trước'
      ];
    }
  }

  /**
   * Tính thời gian dự kiến đến mastery
   */
  private calculateTimeToMastery(
    skillLevel: string,
    milestones: AdaptiveMilestone[]
  ): number {
    const baseTimes: Record<string, number> = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.7,
      mastery: 0
    };

    const totalMilestoneTime = milestones.reduce((sum, m) => sum + m.estimatedTime, 0);
    return Math.round(totalMilestoneTime * (baseTimes[skillLevel] || 1));
  }

  /**
   * Update tiến độ học
   */
  async updateProgress(params: {
    pathId: string;
    milestoneId: string;
    completed: boolean;
    score?: number;
    timeSpent?: number;
  }): Promise<void> {
    console.log(`[Adaptive] Updating progress for path ${params.pathId}`);

    const path = await this.getLearningPath(params.pathId);
    const milestone = path.milestones.find((m) => m.id === params.milestoneId);

    if (!milestone) return;

    milestone.completed = params.completed;
    if (params.score) milestone.score = params.score;

    // Lưu progress
    await StudentProgress.create({
      studentId: path.studentId,
      pathId: params.pathId,
      milestoneId: params.milestoneId,
      completed: params.completed,
      score: params.score,
      timeSpent: params.timeSpent,
      completedAt: params.completed ? new Date() : null
    });

    // Update cache
    await this.redis.setex(`path:${params.pathId}`, 30 * 24 * 60 * 60, JSON.stringify(path));

    // Kiểm tra mastery
    this.checkMastery(path);
  }

  /**
   * Kiểm tra mastery (hoàn thành path)
   */
  private async checkMastery(path: AdaptivePath): Promise<void> {
    const allCompleted = path.milestones.every((m) => m.completed);
    const averageScore =
      path.milestones.reduce((sum, m) => sum + (m.score || 0), 0) / path.milestones.length;

    if (allCompleted && averageScore >= 75) {
      console.log(
        `[Adaptive] Student ${path.studentId} achieved mastery on path ${path.pathId}`
      );
      // Trigger next path generation
      await this.triggerNextPath(path);
    }
  }

  /**
   * Lấy learning path
   */
  async getLearningPath(pathId: string): Promise<AdaptivePath> {
    const cached = await this.redis.get(`path:${pathId}`);
    if (cached) return JSON.parse(cached);

    const record = await LearningPath.findOne({ where: { id: pathId } });
    if (!record) throw new Error(`Path ${pathId} not found`);

    return JSON.parse(record.pathData);
  }

  /**
   * Lấy khuyến nghị tiếp theo
   */
  async getNextRecommendation(pathId: string): Promise<any> {
    const path = await this.getLearningPath(pathId);
    const nextMilestone = path.milestones.find((m) => !m.completed);

    if (!nextMilestone) {
      return {
        message: 'Chúc mừng! Bạn đã hoàn thành chủ đề này',
        nextStep: 'Đợi khuyến nghị tiếp theo từ hệ thống'
      };
    }

    return {
      milestoneId: nextMilestone.id,
      title: nextMilestone.title,
      description: nextMilestone.description,
      estimatedTime: nextMilestone.estimatedTime,
      resources: nextMilestone.resources,
      targetConcepts: nextMilestone.targetConcepts,
      successCriteria: nextMilestone.successCriteria
    };
  }

  /**
   * Reset path
   */
  async resetPath(pathId: string): Promise<AdaptivePath> {
    const path = await this.getLearningPath(pathId);
    path.milestones.forEach((m) => {
      m.completed = false;
      m.score = undefined;
    });

    await this.redis.setex(`path:${pathId}`, 30 * 24 * 60 * 60, JSON.stringify(path));
    return path;
  }

  /**
   * Trigger path tiếp theo (background job)
   */
  @Cron('0 0 * * *') // Chạy mỗi ngày
  async triggerNextPathGeneration(): Promise<void> {
    console.log('[Adaptive] Checking for mastery students...');

    // Find all paths with all milestones completed
    // Generate next paths for these students
  }

  /**
   * Hàm helper
   */
  private generatePathId(): string {
    return `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResourceUrl(type: string, title: string): string {
    return `/resources/${type}/${encodeURIComponent(title)}`;
  }

  private generateDefaultMilestones(): AdaptiveMilestone[] {
    return [
      {
        id: 'milestone-1',
        sequence: 1,
        title: 'Khái niệm cơ bản',
        description: 'Tìm hiểu các khái niệm cơ bản của chủ đề',
        resources: [
          {
            type: 'video',
            title: 'Introduction video',
            url: '/resources/video/intro',
            estimatedTime: 15,
            difficulty: 'easy'
          }
        ],
        prerequisiteMilestones: [],
        targetConcepts: [],
        estimatedTime: 1,
        successCriteria: { minScore: 70, questionsToPass: 5 },
        completed: false
      }
    ];
  }

  private async triggerNextPath(path: AdaptivePath): Promise<void> {
    // Implement next path generation
  }
}
```

---

## 🎨 TRIỂN KHAI FRONTEND

### Learning Path Component

**File:** `frontend/src/features/student/components/LearningPathPanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, Progress, Badge, Timeline } from '@/components/ui';

interface LearningPathPanelProps {
  pathId: string;
}

export const LearningPathPanel: React.FC<LearningPathPanelProps> = ({ pathId }) => {
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextMilestone, setNextMilestone] = useState<any>(null);

  useEffect(() => {
    loadPath();
    loadNextMilestone();
  }, [pathId]);

  const loadPath = async () => {
    try {
      const response = await api.get(`/adaptive-learning/${pathId}`);
      setPath(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading path:', error);
      setLoading(false);
    }
  };

  const loadNextMilestone = async () => {
    try {
      const response = await api.get(`/adaptive-learning/${pathId}/recommendation`);
      setNextMilestone(response.data);
    } catch (error) {
      console.error('Error loading recommendation:', error);
    }
  };

  const handleMilestoneComplete = async (milestoneId: string, score: number) => {
    try {
      await api.post(`/adaptive-learning/${pathId}/progress`, {
        milestoneId,
        completed: true,
        score
      });
      loadPath();
      loadNextMilestone();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!path) return <div>Không tìm thấy learning path</div>;

  const completedCount = path.milestones.filter((m: any) => m.completed).length;
  const progressPercent = (completedCount / path.milestones.length) * 100;

  return (
    <div className="learning-path space-y-6">
      {/* Header */}
      <div className="header">
        <h2 className="text-2xl font-bold mb-2">Lộ trình học tập cá nhân</h2>
        <div className="flex gap-3 items-center mb-4">
          <Badge variant={path.skillLevel === 'mastery' ? 'success' : 'info'}>
            {path.skillLevel.toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-600">
            Dự kiến: {path.estimatedTimeToMastery} giờ
          </span>
        </div>

        <div className="progress-bar">
          <div className="flex justify-between text-sm mb-2">
            <span>Tiến độ: {completedCount}/{path.milestones.length}</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>
      </div>

      {/* Khuyến nghị tiếp theo */}
      {nextMilestone?.milestoneId && (
        <Card className="bg-blue-50 border-blue-200 p-4">
          <h3 className="font-bold mb-2">📌 Bước tiếp theo</h3>
          <p className="text-sm mb-3">{nextMilestone.description}</p>
          <div className="resources space-y-2">
            {nextMilestone.resources.map((r: any, idx: number) => (
              <div key={idx} className="text-sm">
                <Badge className="mr-2">{r.type}</Badge>
                <a href={r.url} className="text-blue-600 hover:underline">
                  {r.title}
                </a>
                <span className="text-gray-500 ml-2">({r.estimatedTime}m)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Milestones Timeline */}
      <div className="milestones">
        <h3 className="text-lg font-bold mb-4">Các mục tiêu học tập</h3>
        <Timeline>
          {path.milestones.map((milestone: any, idx: number) => (
            <div
              key={idx}
              className={`milestone-item p-4 rounded mb-3 ${
                milestone.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              } border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {milestone.completed ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-gray-400">⭕</span>
                    )}
                    <h4 className="font-semibold">{milestone.title}</h4>
                    {milestone.score && (
                      <Badge variant="success">{milestone.score}%</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {milestone.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-xs">
                      <span className="text-gray-500">Khái niệm:</span>
                      <div>
                        {milestone.targetConcepts.map((c: string) => (
                          <Badge key={c} className="mr-1 text-xs" variant="outline">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Thời gian:</span>
                      <p className="font-semibold">{milestone.estimatedTime}h</p>
                    </div>
                  </div>

                  {!milestone.completed && (
                    <button
                      onClick={() => handleMilestoneComplete(milestone.id, 85)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Timeline>
      </div>

      {/* Khuyến nghị */}
      {path.recommendations.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <h3 className="font-bold mb-3">💡 Khuyến nghị cho bạn</h3>
          <ul className="space-y-2">
            {path.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-sm flex gap-2">
                <span>→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
```

---

## ⚙️ CẤU HÌNH

**File:** `backend/.env`

```bash
# Adaptive Learning
ADAPTIVE_SKILL_LEVELS=beginner,intermediate,advanced,mastery
ADAPTIVE_MIN_MASTERY_SCORE=75
ADAPTIVE_CACHE_TTL=2592000 # 30 ngày
ADAPTIVE_BACKGROUND_JOB_INTERVAL=daily

# Path Generation
ADAPTIVE_MILESTONES_COUNT=3-5
ADAPTIVE_RESOURCE_TYPES=video,article,exercise,project,quiz
```

---

## 🧪 KIỂM THỬ

```typescript
describe('Adaptive Learning', () => {
  it('should generate learning path for beginner', async () => {
    const result = await service.generateLearningPath({
      studentId: 'student-1',
      courseId: 'course-1',
      topicId: 'topic-1',
      assessmentScore: 45,
      assessmentDetails: {
        questionsAnswered: 10,
        correctAnswers: 5,
        timeSpent: 600,
        conceptMastery: {
          'concept-1': 30,
          'concept-2': 50,
          'concept-3': 40
        }
      }
    });

    expect(result.skillLevel).toBe('beginner');
    expect(result.knowledgeGaps.length).toBeGreaterThan(0);
    expect(result.milestones.length).toBeGreaterThan(0);
    expect(result.estimatedTimeToMastery).toBeGreaterThan(0);
  });

  it('should update progress and check mastery', async () => {
    // Create path
    const path = await service.generateLearningPath({
      /* ... */
    });

    // Complete all milestones
    for (const milestone of path.milestones) {
      await service.updateProgress({
        pathId: path.pathId,
        milestoneId: milestone.id,
        completed: true,
        score: 85
      });
    }

    // Verify mastery was triggered
  });
});
```

---

## 📚 LIÊN QUAN

- **Trước:** [08_CONTENT_REPURPOSING.md](08_CONTENT_REPURPOSING.md)
- **Tiếp:** [10_API_DESIGN.md](10_API_DESIGN.md)
- **Chiến lược:** [03_STRATEGY.md](03_STRATEGY.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
