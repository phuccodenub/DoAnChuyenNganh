# 🚀 ĐỀ XUẤT CHỨC NĂNG: COURSE, AI & BLOCKCHAIN

**Ngày tạo:** 30/11/2025  
**Mục tiêu:** Đề xuất các tính năng mới và mở rộng cho 3 lĩnh vực trọng tâm

---

## 📋 MỤC LỤC

1. [Course Features](#1-course-features)
2. [AI Features](#2-ai-features)
3. [ML/DL for Course Intelligence](#3-mldl-for-course-intelligence)
4. [Blockchain Features](#4-blockchain-features)
5. [Integration Roadmap](#5-integration-roadmap)

---

## 1. COURSE FEATURES

### 1.1. Course Discovery & Search (Priority: HIGH)

#### 🔍 Advanced Search System
**Mô tả:** Hệ thống tìm kiếm thông minh với nhiều bộ lọc

**Tính năng:**
- ✅ Full-text search (title, description, tags)
- ✅ Filter theo: category, level, instructor, price, rating, duration
- ✅ Sort: newest, popular, highest-rated, price
- ✅ Search suggestions & autocomplete
- ✅ Search history & saved searches
- ✅ Related courses recommendations

**API Endpoints:**
```typescript
GET /api/v1/courses/search?q=keyword&category=web&level=beginner&sort=popular
GET /api/v1/courses/suggestions?q=keyw
GET /api/v1/courses/related/:courseId
```

**Implementation:**
- Backend: Elasticsearch hoặc PostgreSQL full-text search
- Frontend: Search bar với filters sidebar
- Caching: Redis cache cho popular searches

---

#### 📊 Course Analytics Dashboard (Instructor)
**Mô tả:** Dashboard phân tích chi tiết cho instructor về khóa học của họ

**Tính năng:**
- 📈 Enrollment trends (daily/weekly/monthly)
- 👥 Student demographics (age, location, background)
- ⏱️ Average completion time
- 📉 Dropout rate & retention analysis
- 💬 Most engaged sections/lessons
- ⭐ Rating & review analytics
- 💰 Revenue statistics (nếu có payment)
- 📊 Quiz/Assignment performance metrics

**API Endpoints:**
```typescript
GET /api/v1/courses/:courseId/analytics
GET /api/v1/courses/:courseId/analytics/enrollments
GET /api/v1/courses/:courseId/analytics/engagement
GET /api/v1/courses/:courseId/analytics/revenue
```

**Visualization:**
- Charts: Line, Bar, Pie (sử dụng Recharts)
- Time range selector: 7 days, 30 days, 90 days, All time
- Export reports: PDF, CSV

---

### 1.2. Course Content Enhancement

#### 🎬 Video Player với Advanced Features
**Mô tả:** Video player chuyên dụng với nhiều tính năng

**Tính năng:**
- ⏯️ Playback controls (play, pause, speed, quality)
- 📝 Timestamp notes (ghi chú tại thời điểm cụ thể)
- 🔖 Bookmarks (đánh dấu vị trí quan trọng)
- 📊 Watch progress tracking (auto-save)
- 💬 In-video comments (comments tại timestamp)
- 🔍 Video transcript & search
- 📱 Picture-in-picture mode
- 🌐 Subtitle support (multiple languages)

**API Endpoints:**
```typescript
POST /api/v1/lessons/:lessonId/video-notes
GET /api/v1/lessons/:lessonId/video-notes
POST /api/v1/lessons/:lessonId/bookmarks
GET /api/v1/lessons/:lessonId/transcript
POST /api/v1/lessons/:lessonId/progress
```

**Implementation:**
- Frontend: Video.js hoặc Plyr.js
- Backend: Store notes, bookmarks, progress trong database
- Transcript: Auto-generate từ video hoặc manual upload

---

#### 📚 Course Prerequisites & Learning Paths
**Mô tả:** Hệ thống prerequisites và learning paths

**Tính năng:**
- 🔗 Course prerequisites (khóa học cần hoàn thành trước)
- 🗺️ Learning paths (lộ trình học tập được đề xuất)
- ✅ Prerequisite validation (check trước khi enroll)
- 📋 Suggested learning order
- 🎯 Skill-based prerequisites (cần có kỹ năng X trước)

**Database Schema:**
```sql
-- Course Prerequisites
CREATE TABLE course_prerequisites (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  prerequisite_course_id UUID REFERENCES courses(id),
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- Learning Paths
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category_id UUID,
  created_by UUID REFERENCES users(id)
);

CREATE TABLE learning_path_courses (
  learning_path_id UUID REFERENCES learning_paths(id),
  course_id UUID REFERENCES courses(id),
  order_index INTEGER,
  PRIMARY KEY (learning_path_id, course_id)
);
```

**API Endpoints:**
```typescript
GET /api/v1/courses/:courseId/prerequisites
POST /api/v1/courses/:courseId/prerequisites
GET /api/v1/learning-paths
GET /api/v1/learning-paths/:pathId
POST /api/v1/learning-paths
```

---

#### ⭐ Course Reviews & Ratings System
**Mô tả:** Hệ thống đánh giá và review khóa học

**Tính năng:**
- ⭐ Rating (1-5 stars)
- 📝 Written reviews
- 👍 Helpful votes (upvote reviews)
- 📸 Photo attachments
- ✅ Verified purchase badge
- 🔍 Filter reviews: newest, highest-rated, most helpful
- 📊 Review statistics (average rating, distribution)

**Database Schema:**
```sql
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(course_id, user_id)
);
```

**API Endpoints:**
```typescript
GET /api/v1/courses/:courseId/reviews
POST /api/v1/courses/:courseId/reviews
PUT /api/v1/reviews/:reviewId
DELETE /api/v1/reviews/:reviewId
POST /api/v1/reviews/:reviewId/helpful
GET /api/v1/courses/:courseId/reviews/stats
```

---

### 1.3. Course Monetization (Optional)

#### 💳 Course Pricing & Payments
**Mô tả:** Hệ thống pricing và thanh toán

**Tính năng:**
- 💰 Course pricing (free, one-time, subscription)
- 🎟️ Discount codes & coupons
- 💳 Payment integration (Stripe, PayPal, VNPay)
- 📦 Course bundles (mua nhiều khóa với giá ưu đãi)
- 🎁 Gift courses (tặng khóa học cho người khác)
- 💵 Instructor revenue sharing
- 📊 Sales analytics

**API Endpoints:**
```typescript
POST /api/v1/courses/:courseId/purchase
POST /api/v1/payments/create-intent
GET /api/v1/payments/:paymentId/status
POST /api/v1/courses/:courseId/gift
GET /api/v1/instructor/revenue
```

---

### 1.4. Course Collaboration

#### 👥 Co-Instructor System
**Mô tả:** Cho phép nhiều instructor cùng quản lý một khóa học

**Tính năng:**
- 👨‍🏫 Add co-instructors
- 🔐 Permission levels (view, edit, publish)
- 📝 Activity log (ai đã làm gì)
- 💬 Instructor chat/notes

**Database Schema:**
```sql
CREATE TABLE course_instructors (
  course_id UUID REFERENCES courses(id),
  instructor_id UUID REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'co_instructor', -- owner, co_instructor, assistant
  permissions JSONB, -- {can_edit: true, can_publish: false}
  added_at TIMESTAMP,
  PRIMARY KEY (course_id, instructor_id)
);
```

---

## 2. AI FEATURES

### 2.1. AI-Powered Course Recommendations (Priority: HIGH)

#### 🎯 Personalized Course Recommendations
**Mô tả:** Gợi ý khóa học dựa trên hành vi và sở thích người dùng

**Tính năng:**
- 📊 Analyze user learning history
- 🎯 Recommend courses based on:
  - Completed courses
  - Quiz performance
  - Time spent on lessons
  - Search history
  - Enrolled but not started courses
- 🔄 Real-time recommendations (update khi có activity mới)
- 📈 Explain why (tại sao recommend khóa học này)

**Implementation:**
```typescript
// AI Service Extension
class AIService {
  async getPersonalizedRecommendations(userId: string): Promise<CourseRecommendation[]> {
    // 1. Collect user data
    const userProfile = await this.getUserLearningProfile(userId);
    
    // 2. Content-based filtering
    const contentBased = await this.contentBasedFiltering(userProfile);
    
    // 3. Collaborative filtering
    const collaborative = await this.collaborativeFiltering(userProfile);
    
    // 4. Hybrid approach
    const recommendations = this.hybridRecommendation(contentBased, collaborative);
    
    // 5. Add explanations
    return recommendations.map(rec => ({
      ...rec,
      reason: this.explainRecommendation(rec, userProfile)
    }));
  }
}
```

**API Endpoints:**
```typescript
GET /api/v1/ai/recommendations/courses?userId=xxx
GET /api/v1/ai/recommendations/learning-path?userId=xxx
POST /api/v1/ai/recommendations/feedback (thumbs up/down)
```

**Frontend Integration:**
- Homepage: "Recommended for You" section
- Course detail page: "You might also like"
- Search results: Personalized sorting

---

#### 🧠 Intelligent Learning Path Generator
**Mô tả:** AI tự động tạo learning path dựa trên mục tiêu học tập

**Tính năng:**
- 🎯 User sets learning goal (e.g., "Become a Full Stack Developer")
- 🤖 AI analyzes goal và tạo learning path
- 📚 Suggest courses theo thứ tự
- ⏱️ Estimate completion time
- 📊 Track progress along path
- 🔄 Adjust path based on performance

**API Endpoints:**
```typescript
POST /api/v1/ai/learning-paths/generate
  Body: { goal: "Become a Full Stack Developer", currentSkills: [...] }
GET /api/v1/ai/learning-paths/:pathId/progress
POST /api/v1/ai/learning-paths/:pathId/adjust
```

---

### 2.2. AI Content Generation

#### ✍️ AI Course Content Generator
**Mô tả:** AI hỗ trợ tạo nội dung khóa học

**Tính năng:**
- 📝 Generate course outline từ topic
- 📄 Generate lesson content từ outline
- ❓ Auto-generate quiz questions từ lesson content
- 📋 Generate course description & marketing copy
- 🏷️ Auto-tag courses
- 🔍 Generate SEO-friendly metadata

**API Endpoints:**
```typescript
POST /api/v1/ai/generate/course-outline
  Body: { topic: "React Advanced Patterns", level: "intermediate" }
POST /api/v1/ai/generate/lesson-content
  Body: { topic: "React Hooks", outline: "..." }
POST /api/v1/ai/generate/quiz
  Body: { lessonContent: "...", numberOfQuestions: 10 }
POST /api/v1/ai/generate/course-description
  Body: { courseTitle: "...", keyTopics: [...] }
```

**Use Cases:**
- Instructor nhập topic → AI generate outline → Instructor review & edit
- Instructor upload lesson transcript → AI generate quiz questions
- Instructor viết content → AI suggest improvements

---

#### 🎨 AI Thumbnail & Image Generator
**Mô tả:** Tạo thumbnail và images cho khóa học bằng AI

**Tính năng:**
- 🖼️ Generate course thumbnail từ title/description
- 🎨 Multiple style options (modern, professional, creative)
- 🔄 Regenerate với different styles
- 📐 Auto-resize & optimize

**API Endpoints:**
```typescript
POST /api/v1/ai/generate/thumbnail
  Body: { courseTitle: "...", style: "modern" }
```

**Integration:**
- Course creation flow: Auto-generate thumbnail option
- Course edit: Regenerate thumbnail button

---

### 2.3. AI Learning Assistant

#### 💬 AI Tutor Chatbot (Priority: HIGH)
**Mô tả:** AI chatbot hỗ trợ học tập 24/7

**Tính năng:**
- 💬 Answer questions về course content
- 📚 Explain concepts với examples
- 🎯 Provide study tips
- ❓ Help with quiz/assignment questions (không trả lời trực tiếp)
- 📖 Suggest additional resources
- 🔍 Search course content
- 🌐 Multi-language support

**Implementation:**
```typescript
// Extend existing AIService
class AIService {
  async chatWithTutor(request: TutorChatRequest): Promise<TutorChatResponse> {
    // 1. Get course context
    const courseContext = await this.getCourseContext(request.courseId);
    
    // 2. Get user learning history
    const userHistory = await this.getUserLearningHistory(request.userId);
    
    // 3. Build context-aware prompt
    const prompt = this.buildTutorPrompt(request.message, courseContext, userHistory);
    
    // 4. Get AI response
    const response = await this.chat({
      message: prompt,
      context: {
        courseTitle: courseContext.title,
        courseDescription: courseContext.description,
        userProgress: userHistory.progress
      }
    });
    
    return {
      response: response.response,
      suggestions: this.generateSuggestions(response.response),
      relatedContent: await this.findRelatedContent(request.message, courseContext)
    };
  }
}
```

**API Endpoints:**
```typescript
POST /api/v1/ai/tutor/chat
  Body: { 
    message: "What is React Hooks?",
    courseId: "xxx",
    conversationHistory: [...]
  }
GET /api/v1/ai/tutor/suggestions?courseId=xxx&topic=react
```

**Frontend Integration:**
- Course page: Floating AI tutor button
- Lesson page: AI tutor sidebar
- Chat interface: Toggle between human/AI

---

#### 📊 AI Learning Analytics & Insights
**Mô tả:** Phân tích học tập và đưa ra insights

**Tính năng:**
- 📈 Performance predictions (dự đoán điểm số)
- ⚠️ At-risk student detection (phát hiện học viên có nguy cơ bỏ học)
- 🎯 Learning gap identification (xác định kiến thức còn thiếu)
- 📅 Optimal study schedule suggestions
- 💡 Personalized study tips
- 📊 Compare với peers (anonymized)

**API Endpoints:**
```typescript
GET /api/v1/ai/analytics/performance-prediction?userId=xxx&courseId=xxx
GET /api/v1/ai/analytics/learning-gaps?userId=xxx&courseId=xxx
GET /api/v1/ai/analytics/study-schedule?userId=xxx
GET /api/v1/ai/analytics/insights?userId=xxx
```

**Implementation:**
```typescript
class AIService {
  async getLearningAnalytics(userId: string, courseId: string): Promise<LearningAnalytics> {
    // 1. Collect data
    const progress = await this.getUserProgress(userId, courseId);
    const quizScores = await this.getQuizScores(userId, courseId);
    const timeSpent = await this.getTimeSpent(userId, courseId);
    const peerData = await this.getPeerComparison(courseId);
    
    // 2. Analyze với AI
    const analysis = await this.analyzeLearningData({
      progress,
      quizScores,
      timeSpent,
      peerData
    });
    
    // 3. Generate insights
    return {
      performancePrediction: analysis.predictedScore,
      learningGaps: analysis.weakAreas,
      recommendations: analysis.studyTips,
      riskLevel: analysis.dropoutRisk,
      optimalSchedule: this.suggestSchedule(analysis)
    };
  }
}
```

---

### 2.4. AI Assessment & Grading

#### ✅ AI Auto-Grading for Essays
**Mô tả:** Tự động chấm điểm bài luận

**Tính năng:**
- 📝 Grade essay assignments
- 📊 Provide detailed feedback
- ✅ Check grammar & spelling
- 📈 Score breakdown (content, structure, grammar)
- 🔍 Plagiarism detection hints

**API Endpoints:**
```typescript
POST /api/v1/ai/grade/essay
  Body: {
    assignmentId: "xxx",
    submissionId: "xxx",
    rubric: {...}
  }
```

**Limitations:**
- Cần human review cho final grade
- AI chỉ suggest score, instructor quyết định

---

#### 🔍 AI Plagiarism Detection
**Mô tả:** Phát hiện đạo văn trong assignments

**Tính năng:**
- 🔍 Check similarity với online sources
- 📊 Similarity percentage
- 📝 Highlight similar sections
- 🔗 Provide source links

**API Endpoints:**
```typescript
POST /api/v1/ai/plagiarism/check
  Body: { submissionId: "xxx", content: "..." }
```

---

## 3. ML/DL FOR COURSE INTELLIGENCE

### 3.1. ML-Based Recommendation System (Priority: HIGH)

#### 🎯 Collaborative Filtering Recommendation
**Mô tả:** Hệ thống gợi ý dựa trên hành vi của người dùng tương tự

**Approach:**
- **User-based CF:** Tìm users tương tự → recommend courses họ đã học
- **Item-based CF:** Tìm courses tương tự → recommend cho users đã học course liên quan
- **Matrix Factorization:** SVD, NMF để giảm chiều dữ liệu

**Features:**
- 📊 User similarity matrix
- 📊 Course similarity matrix
- 🔄 Real-time recommendations
- 📈 Cold-start problem handling (new users/courses)

**Implementation:**
```python
# Python ML Service (Microservice hoặc separate service)
import numpy as np
from sklearn.decomposition import NMF
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

class CourseRecommendationEngine:
    def __init__(self):
        self.model = None
        self.user_features = None
        self.course_features = None
    
    def train_collaborative_filtering(self, user_course_matrix):
        """
        Train collaborative filtering model
        user_course_matrix: pandas DataFrame với index=user_id, columns=course_id, values=rating/enrollment
        """
        # Matrix Factorization với NMF
        self.model = NMF(n_components=50, random_state=42)
        self.user_features = self.model.fit_transform(user_course_matrix)
        self.course_features = self.model.components_.T
        
        return self.model
    
    def recommend_courses(self, user_id, n_recommendations=10):
        """
        Recommend courses cho user
        """
        # Get user vector
        user_vector = self.user_features[user_id]
        
        # Calculate similarity với all courses
        similarities = cosine_similarity(
            user_vector.reshape(1, -1),
            self.course_features
        )[0]
        
        # Get top N recommendations
        top_indices = np.argsort(similarities)[::-1][:n_recommendations]
        
        return {
            'course_ids': top_indices.tolist(),
            'scores': similarities[top_indices].tolist()
        }
    
    def get_similar_courses(self, course_id, n_similar=5):
        """
        Find similar courses
        """
        course_vector = self.course_features[course_id]
        similarities = cosine_similarity(
            course_vector.reshape(1, -1),
            self.course_features
        )[0]
        
        # Exclude itself
        similarities[course_id] = -1
        
        top_indices = np.argsort(similarities)[::-1][:n_similar]
        return top_indices.tolist()
```

**Backend Integration:**
```typescript
// ML Service Integration
class MLRecommendationService {
  private mlServiceUrl: string;
  
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
  }
  
  async getRecommendations(userId: string, limit: number = 10): Promise<CourseRecommendation[]> {
    // Call ML service
    const response = await axios.post(`${this.mlServiceUrl}/recommend`, {
      user_id: userId,
      n_recommendations: limit
    });
    
    // Get course details
    const courseIds = response.data.course_ids;
    const courses = await Course.findAll({
      where: { id: { [Op.in]: courseIds } }
    });
    
    // Sort theo recommendation score
    return courses.map((course, index) => ({
      course,
      score: response.data.scores[index],
      reason: 'Recommended based on similar users'
    }));
  }
  
  async trainModel(): Promise<void> {
    // Trigger model retraining
    await axios.post(`${this.mlServiceUrl}/train`);
  }
}
```

**API Endpoints:**
```typescript
GET /api/v1/ml/recommendations?userId=xxx&limit=10
GET /api/v1/ml/similar-courses/:courseId
POST /api/v1/ml/train (admin only)
GET /api/v1/ml/model-status
```

**Data Pipeline:**
```typescript
// Collect training data
class MLDataCollector {
  async collectUserCourseData(): Promise<UserCourseMatrix> {
    // Get enrollment data
    const enrollments = await Enrollment.findAll({
      include: [{ model: User }, { model: Course }]
    });
    
    // Get user ratings
    const reviews = await CourseReview.findAll();
    
    // Get user progress
    const progress = await LessonProgress.findAll();
    
    // Build matrix
    const matrix = this.buildUserCourseMatrix(enrollments, reviews, progress);
    
    return matrix;
  }
  
  private buildUserCourseMatrix(
    enrollments: Enrollment[],
    reviews: CourseReview[],
    progress: LessonProgress[]
  ): UserCourseMatrix {
    // Create matrix với scores:
    // - Enrollment: 1
    // - Review rating: 1-5
    // - Progress: 0-1 (completion percentage)
    // - Final score: weighted combination
  }
}
```

---

#### 🧠 Deep Learning Content-Based Filtering
**Mô tả:** Sử dụng Deep Learning để extract features từ course content

**Approach:**
- **Text Embeddings:** BERT/Word2Vec cho course descriptions
- **Image Embeddings:** CNN cho course thumbnails
- **Feature Fusion:** Combine multiple features
- **Neural Collaborative Filtering:** Deep learning cho recommendations

**Implementation:**
```python
import torch
import torch.nn as nn
from transformers import BertModel
import torchvision.models as models

class CourseEmbeddingModel(nn.Module):
    def __init__(self):
        super().__init__()
        # Text encoder (BERT)
        self.text_encoder = BertModel.from_pretrained('bert-base-uncased')
        
        # Image encoder (ResNet)
        self.image_encoder = models.resnet50(pretrained=True)
        self.image_encoder.fc = nn.Linear(2048, 512)
        
        # Feature fusion
        self.fusion = nn.Sequential(
            nn.Linear(768 + 512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128)
        )
    
    def forward(self, text_input, image_input):
        # Text embedding
        text_embedding = self.text_encoder(text_input).pooler_output
        
        # Image embedding
        image_embedding = self.image_encoder(image_input)
        
        # Fuse features
        fused = torch.cat([text_embedding, image_embedding], dim=1)
        course_embedding = self.fusion(fused)
        
        return course_embedding

class NeuralCollaborativeFiltering(nn.Module):
    def __init__(self, num_users, num_courses, embedding_dim=128):
        super().__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.course_embedding = nn.Embedding(num_courses, embedding_dim)
        
        self.mlp = nn.Sequential(
            nn.Linear(embedding_dim * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, user_ids, course_ids):
        user_emb = self.user_embedding(user_ids)
        course_emb = self.course_embedding(course_ids)
        
        concat = torch.cat([user_emb, course_emb], dim=1)
        prediction = self.mlp(concat)
        
        return prediction
```

---

### 3.2. Student Performance Prediction (Priority: HIGH)

#### 📊 Dropout Risk Prediction
**Mô tả:** Dự đoán học viên có nguy cơ bỏ học

**Features:**
- 📈 Login frequency
- ⏱️ Time spent on lessons
- 📝 Quiz scores trend
- 💬 Engagement (comments, questions)
- 📅 Days since last activity
- 📊 Progress completion rate

**Model:**
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd

class DropoutPredictionModel:
    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )
        self.scaler = StandardScaler()
    
    def extract_features(self, user_id, course_id):
        """
        Extract features từ user behavior
        """
        features = {
            'login_frequency': self.get_login_frequency(user_id),
            'avg_time_per_lesson': self.get_avg_time_spent(user_id, course_id),
            'quiz_score_trend': self.get_quiz_trend(user_id, course_id),
            'engagement_score': self.get_engagement_score(user_id, course_id),
            'days_since_last_activity': self.get_days_since_activity(user_id),
            'completion_rate': self.get_completion_rate(user_id, course_id),
            'assignment_submission_rate': self.get_submission_rate(user_id, course_id)
        }
        return features
    
    def predict_dropout_risk(self, user_id, course_id):
        """
        Predict dropout risk (0-1, higher = more risk)
        """
        features = self.extract_features(user_id, course_id)
        features_df = pd.DataFrame([features])
        features_scaled = self.scaler.transform(features_df)
        
        risk_score = self.model.predict_proba(features_scaled)[0][1]
        
        return {
            'risk_score': float(risk_score),
            'risk_level': self.get_risk_level(risk_score),
            'recommendations': self.get_recommendations(risk_score, features)
        }
    
    def get_risk_level(self, score):
        if score < 0.3:
            return 'low'
        elif score < 0.6:
            return 'medium'
        else:
            return 'high'
```

**Backend Integration:**
```typescript
// Dropout Prediction Service
class DropoutPredictionService {
  async predictRisk(userId: string, courseId: string): Promise<DropoutRisk> {
    // Collect features
    const features = await this.collectFeatures(userId, courseId);
    
    // Call ML service
    const response = await axios.post(`${this.mlServiceUrl}/predict/dropout`, {
      user_id: userId,
      course_id: courseId,
      features: features
    });
    
    return {
      riskScore: response.data.risk_score,
      riskLevel: response.data.risk_level,
      recommendations: response.data.recommendations
    };
  }
  
  async getAtRiskStudents(courseId: string): Promise<AtRiskStudent[]> {
    // Get all enrolled students
    const enrollments = await Enrollment.findAll({
      where: { course_id: courseId, status: 'active' }
    });
    
    // Predict for each student
    const predictions = await Promise.all(
      enrollments.map(async (enrollment) => {
        const risk = await this.predictRisk(enrollment.user_id, courseId);
        return {
          userId: enrollment.user_id,
          ...risk
        };
      })
    );
    
    // Filter high-risk students
    return predictions
      .filter(p => p.riskLevel === 'high')
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}
```

**API Endpoints:**
```typescript
GET /api/v1/ml/predict/dropout?userId=xxx&courseId=xxx
GET /api/v1/courses/:courseId/at-risk-students (instructor only)
POST /api/v1/ml/train/dropout-model (admin only)
```

**Frontend Integration:**
- Instructor dashboard: Show at-risk students với alerts
- Student dashboard: Show personalized recommendations để giảm risk

---

#### 🎯 Grade Prediction
**Mô tả:** Dự đoán điểm số cuối khóa dựa trên performance hiện tại

**Features:**
- 📊 Quiz scores history
- 📝 Assignment scores
- ⏱️ Time spent on each lesson
- 📈 Progress completion
- 💬 Engagement metrics

**Model:**
```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import numpy as np

class GradePredictionModel:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
    
    def predict_final_grade(self, user_id, course_id):
        """
        Predict final grade (0-100)
        """
        features = self.extract_features(user_id, course_id)
        predicted_grade = self.model.predict([features])[0]
        
        return {
            'predicted_grade': float(predicted_grade),
            'confidence': self.calculate_confidence(features),
            'grade_breakdown': self.predict_breakdown(features)
        }
    
    def extract_features(self, user_id, course_id):
        return {
            'avg_quiz_score': self.get_avg_quiz_score(user_id, course_id),
            'avg_assignment_score': self.get_avg_assignment_score(user_id, course_id),
            'completion_rate': self.get_completion_rate(user_id, course_id),
            'time_spent_ratio': self.get_time_spent_ratio(user_id, course_id),
            'engagement_score': self.get_engagement_score(user_id, course_id)
        }
```

**API Endpoints:**
```typescript
GET /api/v1/ml/predict/grade?userId=xxx&courseId=xxx
GET /api/v1/courses/:courseId/grade-predictions (instructor only)
```

---

### 3.3. Content Difficulty Assessment (Priority: MEDIUM)

#### 📚 Automatic Difficulty Rating
**Mô tả:** Tự động đánh giá độ khó của course content

**Approach:**
- **Text Analysis:** Analyze course description, lesson content
- **Student Performance:** Use actual student performance data
- **Content Complexity:** Analyze quiz questions, assignment complexity

**Model:**
```python
from sklearn.cluster import KMeans
import numpy as np

class DifficultyAssessmentModel:
    def __init__(self):
        self.difficulty_model = None
    
    def assess_course_difficulty(self, course_id):
        """
        Assess course difficulty (1-5 scale)
        """
        # Extract features
        features = {
            'text_complexity': self.analyze_text_complexity(course_id),
            'quiz_difficulty': self.analyze_quiz_difficulty(course_id),
            'student_performance': self.get_avg_student_performance(course_id),
            'prerequisites_count': self.get_prerequisites_count(course_id),
            'content_length': self.get_content_length(course_id)
        }
        
        # Predict difficulty
        difficulty_score = self.model.predict([list(features.values())])[0]
        
        return {
            'difficulty_score': float(difficulty_score),
            'difficulty_level': self.map_to_level(difficulty_score),
            'factors': self.explain_factors(features)
        }
    
    def analyze_text_complexity(self, course_id):
        """
        Analyze text complexity using NLP
        """
        # Get course description and lesson content
        content = self.get_course_content(course_id)
        
        # Calculate metrics:
        # - Average sentence length
        # - Vocabulary complexity
        # - Technical terms count
        # - Readability score (Flesch-Kincaid)
        
        return self.calculate_text_metrics(content)
```

**API Endpoints:**
```typescript
GET /api/v1/ml/assess/difficulty?courseId=xxx
GET /api/v1/courses/:courseId/difficulty-analysis
```

---

### 3.4. Adaptive Learning Path (Priority: MEDIUM)

#### 🗺️ Personalized Learning Path Generation
**Mô tả:** Tạo learning path tối ưu cho từng học viên

**Approach:**
- **Reinforcement Learning:** Optimize learning path based on outcomes
- **Multi-Armed Bandit:** Test different paths và optimize
- **Graph-based:** Model prerequisites as graph, find optimal path

**Model:**
```python
import networkx as nx
from sklearn.cluster import KMeans

class AdaptiveLearningPathModel:
    def __init__(self):
        self.prerequisite_graph = nx.DiGraph()
        self.path_optimizer = None
    
    def generate_learning_path(self, user_id, goal):
        """
        Generate optimal learning path
        """
        # 1. Get user current skills
        current_skills = self.get_user_skills(user_id)
        
        # 2. Get goal requirements
        goal_skills = self.get_goal_requirements(goal)
        
        # 3. Find path in prerequisite graph
        path = self.find_optimal_path(
            current_skills,
            goal_skills
        )
        
        # 4. Personalize based on learning style
        personalized_path = self.personalize_path(path, user_id)
        
        return {
            'path': personalized_path,
            'estimated_duration': self.estimate_duration(personalized_path),
            'difficulty_progression': self.analyze_difficulty_progression(personalized_path)
        }
    
    def find_optimal_path(self, start_skills, goal_skills):
        """
        Find shortest path in prerequisite graph
        """
        # Build graph from prerequisites
        self.build_prerequisite_graph()
        
        # Find courses that teach goal skills
        goal_courses = self.get_courses_for_skills(goal_skills)
        
        # Find shortest path from current skills to goal
        path = nx.shortest_path(
            self.prerequisite_graph,
            source=start_skills,
            target=goal_courses
        )
        
        return path
```

**API Endpoints:**
```typescript
POST /api/v1/ml/learning-path/generate
  Body: { userId: "xxx", goal: "Become Full Stack Developer" }
GET /api/v1/ml/learning-path/:pathId/progress
POST /api/v1/ml/learning-path/:pathId/optimize
```

---

### 3.5. Learning Pattern Analysis (Priority: MEDIUM)

#### 📊 Clustering Students by Learning Patterns
**Mô tả:** Phân nhóm học viên theo learning patterns

**Use Cases:**
- Identify different learning styles
- Group similar students for recommendations
- Personalized content delivery

**Model:**
```python
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

class LearningPatternAnalyzer:
    def __init__(self):
        self.cluster_model = KMeans(n_clusters=5, random_state=42)
        self.scaler = StandardScaler()
    
    def cluster_students(self, course_id):
        """
        Cluster students by learning patterns
        """
        # Extract learning features for each student
        student_features = []
        student_ids = []
        
        enrollments = self.get_enrollments(course_id)
        for enrollment in enrollments:
            features = self.extract_learning_features(enrollment.user_id, course_id)
            student_features.append(features)
            student_ids.append(enrollment.user_id)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(student_features)
        
        # Cluster
        clusters = self.cluster_model.fit_predict(features_scaled)
        
        # Analyze clusters
        cluster_analysis = self.analyze_clusters(clusters, student_features)
        
        return {
            'clusters': clusters.tolist(),
            'student_clusters': dict(zip(student_ids, clusters.tolist())),
            'cluster_characteristics': cluster_analysis
        }
    
    def extract_learning_features(self, user_id, course_id):
        """
        Extract features that represent learning pattern
        """
        return {
            'preferred_time': self.get_preferred_study_time(user_id),
            'study_duration': self.get_avg_study_duration(user_id),
            'quiz_attempts': self.get_quiz_attempts(user_id, course_id),
            'video_watch_speed': self.get_video_speed(user_id),
            'note_taking_frequency': self.get_note_frequency(user_id),
            'interaction_frequency': self.get_interaction_frequency(user_id)
        }
```

**API Endpoints:**
```typescript
GET /api/v1/ml/analyze/learning-patterns?courseId=xxx
GET /api/v1/ml/student-cluster?userId=xxx&courseId=xxx
```

---

### 3.6. Content Optimization (Priority: LOW)

#### 🎯 A/B Testing & Content Optimization
**Mô tả:** Tối ưu hóa course content dựa trên student performance

**Approach:**
- **Multi-Armed Bandit:** Test different content versions
- **Thompson Sampling:** Optimize content selection
- **Content Performance Analysis:** Identify best-performing content

**Model:**
```python
import numpy as np

class ContentOptimizer:
    def __init__(self):
        self.alpha = 1.0  # Prior for success
        self.beta = 1.0   # Prior for failure
    
    def select_best_content(self, content_variants):
        """
        Select best content variant using Thompson Sampling
        """
        # Get performance data for each variant
        performances = []
        for variant in content_variants:
            success, total = self.get_variant_performance(variant)
            # Beta distribution
            sample = np.random.beta(
                self.alpha + success,
                self.beta + (total - success)
            )
            performances.append((variant, sample))
        
        # Select variant with highest sample
        best_variant = max(performances, key=lambda x: x[1])[0]
        
        return best_variant
```

---

## 3.7. ML/DL Infrastructure & Deployment

### Tech Stack

**ML Framework:**
- **Python:** scikit-learn, TensorFlow, PyTorch
- **MLOps:** MLflow cho model tracking
- **API:** FastAPI cho ML service
- **Data Processing:** Pandas, NumPy

**Deployment Options:**

1. **Microservice Approach (Recommended):**
   ```
   LMS Backend (Node.js) ←→ ML Service (Python/FastAPI)
   ```

2. **In-Process (Simple):**
   - Use TensorFlow.js trong Node.js
   - Limited functionality nhưng đơn giản hơn

3. **Cloud ML:**
   - Google Cloud AI Platform
   - AWS SageMaker
   - Azure Machine Learning

**ML Service Architecture:**
```python
# FastAPI ML Service
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load models
recommendation_model = joblib.load('models/recommendation_model.pkl')
dropout_model = joblib.load('models/dropout_model.pkl')

@app.post("/recommend")
async def recommend(request: RecommendationRequest):
    recommendations = recommendation_model.predict(request.user_id)
    return {"course_ids": recommendations}

@app.post("/predict/dropout")
async def predict_dropout(request: DropoutRequest):
    risk = dropout_model.predict(request.features)
    return {"risk_score": risk}

@app.post("/train")
async def train_model():
    # Retrain model với latest data
    # Background job
    pass
```

**Data Pipeline:**
```typescript
// Scheduled job để collect data và train models
class MLDataPipeline {
  async runDailyPipeline(): Promise<void> {
    // 1. Collect user behavior data
    const data = await this.collectData();
    
    // 2. Preprocess
    const processed = await this.preprocess(data);
    
    // 3. Send to ML service for training
    await axios.post(`${this.mlServiceUrl}/train`, {
      data: processed
    });
  }
}
```

**Model Retraining:**
- **Schedule:** Weekly hoặc monthly
- **Trigger:** Khi có đủ data mới
- **Versioning:** MLflow để track model versions
- **A/B Testing:** Test new models trước khi deploy

---

### 3.8. ML/DL Features Summary

| Feature | Priority | ML Technique | Impact | Effort |
|---------|----------|--------------|--------|--------|
| Collaborative Filtering | HIGH | Matrix Factorization | Very High | Medium |
| Dropout Prediction | HIGH | Gradient Boosting | High | Medium |
| Grade Prediction | HIGH | Random Forest | High | Medium |
| Content Difficulty | MEDIUM | NLP + Clustering | Medium | High |
| Adaptive Learning Path | MEDIUM | Graph Algorithms | High | High |
| Learning Pattern Analysis | MEDIUM | K-Means Clustering | Medium | Medium |
| Content Optimization | LOW | Multi-Armed Bandit | Low | High |

---

## 4. BLOCKCHAIN FEATURES

### 3.1. Blockchain Certificates (Priority: HIGH)

#### 🏆 Digital Certificate Issuance
**Mô tả:** Cấp chứng chỉ số trên blockchain

**Tính năng:**
- ✅ Auto-issue khi hoàn thành course (đạt điểm >= passing grade)
- 🔗 Store certificate hash trên blockchain
- 📄 Generate PDF certificate
- 🎨 Custom certificate templates
- 📱 QR code cho verification
- 🔐 Cryptographic signature

**Smart Contract (Solidity):**
```solidity
// CertificateRegistry.sol
contract CertificateRegistry {
    struct Certificate {
        address student;
        string courseName;
        uint256 completionDate;
        bytes32 certificateHash;
        string ipfsHash; // Metadata on IPFS
        bool revoked;
    }
    
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bytes32[]) public studentCertificates;
    
    function issueCertificate(
        address student,
        string memory courseName,
        bytes32 certHash,
        string memory ipfsHash
    ) public onlyInstructor {
        bytes32 certId = keccak256(abi.encodePacked(student, courseName, block.timestamp));
        certificates[certId] = Certificate({
            student: student,
            courseName: courseName,
            completionDate: block.timestamp,
            certificateHash: certHash,
            ipfsHash: ipfsHash,
            revoked: false
        });
        studentCertificates[student].push(certId);
        emit CertificateIssued(certId, student, courseName);
    }
    
    function verifyCertificate(bytes32 certId) 
        public view returns (Certificate memory) {
        require(!certificates[certId].revoked, "Certificate revoked");
        return certificates[certId];
    }
    
    function revokeCertificate(bytes32 certId) public onlyAdmin {
        certificates[certId].revoked = true;
        emit CertificateRevoked(certId);
    }
}
```

**Backend Integration:**
```typescript
// Certificate Service
class CertificateService {
  async issueCertificate(userId: string, courseId: string): Promise<Certificate> {
    // 1. Check completion requirements
    const enrollment = await this.checkCompletion(userId, courseId);
    if (!enrollment.isCompleted) {
      throw new Error("Course not completed");
    }
    
    // 2. Generate certificate data
    const certificateData = {
      studentId: userId,
      courseId: courseId,
      completionDate: new Date(),
      grade: enrollment.finalGrade
    };
    
    // 3. Upload metadata to IPFS
    const ipfsHash = await this.uploadToIPFS(certificateData);
    
    // 4. Generate certificate hash
    const certHash = this.generateCertificateHash(certificateData);
    
    // 5. Issue on blockchain
    const txHash = await this.blockchainService.issueCertificate({
      studentAddress: user.walletAddress,
      courseName: course.title,
      certificateHash: certHash,
      ipfsHash: ipfsHash
    });
    
    // 6. Save to database
    const certificate = await Certificate.create({
      user_id: userId,
      course_id: courseId,
      certificate_hash: certHash,
      ipfs_hash: ipfsHash,
      blockchain_tx_hash: txHash,
      status: 'issued'
    });
    
    // 7. Generate PDF
    const pdfUrl = await this.generatePDFCertificate(certificate);
    
    return certificate;
  }
}
```

**API Endpoints:**
```typescript
POST /api/v1/certificates/issue
  Body: { courseId: "xxx" }
GET /api/v1/certificates/:certificateId
GET /api/v1/certificates/verify/:certificateHash
GET /api/v1/certificates/:certificateId/pdf
GET /api/v1/certificates/:certificateId/qr
```

**Frontend:**
- Certificate page: Display all certificates
- Certificate detail: Show blockchain info, QR code
- Verification page: Public page để verify certificate

---

#### ✅ Certificate Verification System
**Mô tả:** Hệ thống xác minh chứng chỉ công khai

**Tính năng:**
- 🔍 Verify bằng certificate hash
- 🔍 Verify bằng QR code
- 🔍 Verify bằng certificate number
- 📊 Display certificate details (anonymized nếu cần)
- 🔗 Share certificate link
- 📱 Mobile-friendly verification

**Public Verification Page:**
```
/certificates/verify/:hash
```

**API Endpoints:**
```typescript
GET /api/v1/certificates/verify/:hash
POST /api/v1/certificates/verify/qr
  Body: { qrData: "..." }
```

---

### 3.2. Smart Contracts for Course Management

#### 📜 Course Enrollment Smart Contract
**Mô tả:** Smart contract quản lý enrollment và payments

**Tính năng:**
- 💰 Handle course payments (nếu có)
- ✅ Auto-enroll sau payment
- 🔄 Refund policy enforcement
- 📊 Transparent enrollment records

**Smart Contract:**
```solidity
contract CourseEnrollment {
    struct Enrollment {
        address student;
        uint256 courseId;
        uint256 enrolledAt;
        bool active;
        uint256 amountPaid;
    }
    
    mapping(address => mapping(uint256 => Enrollment)) public enrollments;
    
    function enroll(uint256 courseId) public payable {
        uint256 coursePrice = getCoursePrice(courseId);
        require(msg.value >= coursePrice, "Insufficient payment");
        
        enrollments[msg.sender][courseId] = Enrollment({
            student: msg.sender,
            courseId: courseId,
            enrolledAt: block.timestamp,
            active: true,
            amountPaid: msg.value
        });
        
        emit Enrolled(msg.sender, courseId, msg.value);
    }
    
    function refund(uint256 courseId) public {
        Enrollment storage enrollment = enrollments[msg.sender][courseId];
        require(enrollment.active, "Not enrolled");
        require(block.timestamp < enrollment.enrolledAt + 7 days, "Refund period expired");
        
        enrollment.active = false;
        payable(msg.sender).transfer(enrollment.amountPaid);
        emit Refunded(msg.sender, courseId);
    }
}
```

---

#### 🎯 Achievement & Badge System
**Mô tả:** Hệ thống achievement và badge trên blockchain

**Tính năng:**
- 🏅 Issue badges cho achievements
- 📊 Track achievements on blockchain
- 🎁 NFT badges (optional)
- 🔗 Share achievements

**Smart Contract:**
```solidity
contract AchievementSystem {
    struct Achievement {
        address student;
        string achievementType; // "first_quiz_100", "complete_10_courses", etc.
        uint256 earnedAt;
        string metadata; // IPFS hash
    }
    
    mapping(address => Achievement[]) public achievements;
    
    function awardAchievement(
        address student,
        string memory achievementType,
        string memory metadata
    ) public onlySystem {
        achievements[student].push(Achievement({
            student: student,
            achievementType: achievementType,
            earnedAt: block.timestamp,
            metadata: metadata
        }));
        emit AchievementAwarded(student, achievementType);
    }
}
```

---

### 3.3. IPFS Integration

#### 🌐 Decentralized Content Storage
**Mô tả:** Lưu trữ nội dung trên IPFS

**Tính năng:**
- 📄 Store course materials trên IPFS
- 🔗 IPFS hash trong database
- 🔄 Content versioning
- 📊 Content integrity verification

**Implementation:**
```typescript
// IPFS Service
class IPFSService {
  async uploadContent(content: Buffer, metadata: any): Promise<string> {
    // Upload to IPFS (Pinata hoặc self-hosted node)
    const ipfsHash = await this.pinata.upload(content, metadata);
    return ipfsHash;
  }
  
  async getContent(ipfsHash: string): Promise<Buffer> {
    // Retrieve from IPFS
    return await this.pinata.get(ipfsHash);
  }
  
  async verifyContent(ipfsHash: string, expectedHash: string): Promise<boolean> {
    // Verify content integrity
    const content = await this.getContent(ipfsHash);
    const actualHash = this.calculateHash(content);
    return actualHash === expectedHash;
  }
}
```

**Use Cases:**
- Certificate metadata
- Course materials backup
- User-generated content
- Historical records

---

### 3.4. Token Economy (Optional - Advanced)

#### 🪙 Learning Token System
**Mô tả:** Token rewards cho học tập

**Tính năng:**
- 🎁 Earn tokens khi hoàn thành lessons
- 🎁 Earn tokens khi đạt điểm cao
- 🎁 Earn tokens khi help others
- 💰 Spend tokens để unlock premium content
- 💰 Spend tokens để get discounts
- 📊 Token balance & transaction history

**Smart Contract:**
```solidity
contract LearningToken is ERC20 {
    mapping(address => uint256) public learningPoints;
    
    function rewardTokens(address student, uint256 amount) public onlySystem {
        _mint(student, amount);
        learningPoints[student] += amount;
        emit TokensRewarded(student, amount);
    }
    
    function spendTokens(address student, uint256 amount) public {
        require(balanceOf(student) >= amount, "Insufficient tokens");
        _burn(student, amount);
        emit TokensSpent(student, amount);
    }
}
```

**Backend Integration:**
```typescript
// Token Service
class TokenService {
  async rewardCompletion(userId: string, courseId: string): Promise<void> {
    const tokens = 100; // Base reward
    await this.blockchainService.mintTokens(user.walletAddress, tokens);
    await this.logReward(userId, 'course_completion', tokens);
  }
  
  async rewardHighScore(userId: string, quizId: string, score: number): Promise<void> {
    if (score >= 90) {
      const tokens = 50;
      await this.blockchainService.mintTokens(user.walletAddress, tokens);
    }
  }
}
```

---

## 5. INTEGRATION ROADMAP

### Phase 1: Foundation (4-6 tuần)
**Priority: Course Features**

1. ✅ Advanced Search System
2. ✅ Course Reviews & Ratings
3. ✅ Course Prerequisites
4. ✅ Video Player với Notes & Bookmarks
5. ✅ Course Analytics Dashboard

---

### Phase 2: ML/DL Foundation (6-8 tuần)
**Priority: ML/DL Core Features**

1. ✅ ML Recommendation System (Collaborative Filtering)
2. ✅ Dropout Risk Prediction Model
3. ✅ Grade Prediction Model
4. ✅ ML Service Setup (Python/FastAPI microservice)
5. ✅ Data Pipeline cho model training

---

### Phase 3: AI Integration (4-6 tuần)
**Priority: AI Features**

1. ✅ AI Course Recommendations (hybrid với ML)
2. ✅ AI Tutor Chatbot
3. ✅ AI Content Generator (outline, quiz)
4. ✅ AI Learning Analytics

---

### Phase 4: ML/DL Advanced (4-6 tuần)
**Priority: Advanced ML Features**

1. ✅ Deep Learning Content-Based Filtering
2. ✅ Adaptive Learning Path (Graph-based)
3. ✅ Learning Pattern Analysis (Clustering)
4. ✅ Content Difficulty Assessment

---

### Phase 5: Blockchain Foundation (4-6 tuần)
**Priority: Blockchain Features**

1. ✅ Blockchain Certificate Issuance
2. ✅ Certificate Verification System
3. ✅ IPFS Integration
4. ✅ Smart Contract Setup (testnet)

---

### Phase 6: Advanced Features (6-8 tuần)

1. ✅ AI Auto-Grading
2. ✅ Smart Contract Enrollment
3. ✅ Achievement System
4. ✅ Content Optimization (A/B Testing)

---

### Phase 7: Token Economy (Optional - 4-6 tuần)

1. ✅ Learning Token System
2. ✅ Token Marketplace
3. ✅ NFT Badges

---

## 📊 PRIORITY MATRIX

| Feature | Priority | Impact | Effort | Timeline |
|---------|----------|--------|--------|----------|
| **Course Features** |
| Course Search | HIGH | High | Medium | 2 weeks |
| Course Reviews | HIGH | High | Low | 1 week |
| Course Analytics | MEDIUM | Medium | Medium | 2 weeks |
| **ML/DL Features** |
| ML Recommendations (CF) | HIGH | Very High | Medium | 3 weeks |
| Dropout Prediction | HIGH | High | Medium | 2 weeks |
| Grade Prediction | HIGH | High | Medium | 2 weeks |
| Deep Learning Content Filtering | MEDIUM | High | High | 4 weeks |
| Adaptive Learning Path | MEDIUM | High | High | 4 weeks |
| Learning Pattern Analysis | MEDIUM | Medium | Medium | 3 weeks |
| Content Difficulty | MEDIUM | Medium | High | 3 weeks |
| **AI Features** |
| AI Recommendations (Hybrid) | HIGH | Very High | Medium | 3 weeks |
| AI Tutor Chatbot | HIGH | Very High | Medium | 3 weeks |
| AI Content Generator | MEDIUM | Medium | High | 4 weeks |
| AI Learning Analytics | MEDIUM | Medium | Medium | 2 weeks |
| **Blockchain Features** |
| Blockchain Certificates | MEDIUM | High | High | 4 weeks |
| Certificate Verification | MEDIUM | High | Medium | 2 weeks |
| IPFS Integration | MEDIUM | Medium | Medium | 2 weeks |
| Smart Contracts | LOW | Medium | Very High | 6 weeks |
| Token Economy | LOW | Low | Very High | 6 weeks |

---

## 🛠️ TECHNICAL STACK RECOMMENDATIONS

### ML/DL
- **ML Framework:** scikit-learn, TensorFlow, PyTorch
- **ML Service:** FastAPI (Python) - Microservice approach
- **MLOps:** MLflow cho model tracking & versioning
- **Data Processing:** Pandas, NumPy
- **Deployment:** Docker container cho ML service
- **Model Serving:** TensorFlow Serving hoặc custom FastAPI endpoints

### AI
- **LLM:** Google Gemini (đã có) hoặc OpenAI GPT-4
- **Recommendations:** Hybrid approach (ML + AI)
- **NLP:** Transformers (BERT, Word2Vec) cho text embeddings
- **Image Processing:** ResNet, CNN cho image embeddings

### Blockchain
- **Network:** Ethereum (testnet: Sepolia, mainnet) hoặc Polygon (lower fees)
- **Smart Contracts:** Solidity
- **Web3 Library:** ethers.js hoặc web3.js
- **IPFS:** Pinata (managed) hoặc self-hosted IPFS node
- **Wallet Integration:** MetaMask, WalletConnect

### Infrastructure
- **Search:** Elasticsearch hoặc PostgreSQL full-text search
- **Video:** Video.js, Plyr.js, hoặc HLS.js
- **Charts:** Recharts, Chart.js
- **PDF Generation:** PDFKit, jsPDF, hoặc Puppeteer
- **Data Pipeline:** Scheduled jobs (node-cron) để collect data cho ML training

---

## 📝 NOTES

### ML/DL Features
- **Data Requirements:** Cần thu thập đủ data (ít nhất 1000+ users, 100+ courses) để models hoạt động tốt
- **Model Training:** Retrain định kỳ (weekly/monthly) với data mới
- **Cold Start Problem:** Cần fallback strategies cho new users/courses
- **Performance:** ML models có thể chậm, cần caching và async processing
- **Cost:** ML service cần compute resources (CPU/GPU), có thể dùng cloud (GCP, AWS)

### AI Features
- **API Costs:** Cần API keys và có thể tốn chi phí (Gemini free tier có giới hạn)
- **Rate Limiting:** Implement rate limiting để tránh cost overrun
- **Hybrid Approach:** Kết hợp ML recommendations với AI explanations

### Blockchain Features
- **Testnet First:** Cần testnet setup trước, mainnet deployment cần cẩn thận
- **Gas Fees:** Mainnet transactions tốn phí, cần optimize
- **IPFS:** Có thể dùng Pinata free tier hoặc self-host
- **Token Economy:** Chỉ implement nếu thực sự cần, phức tạp và tốn gas fees

### Integration Strategy
- **Start Simple:** Bắt đầu với ML recommendations (Collaborative Filtering) - dễ implement và có impact cao
- **Incremental:** Thêm features từng bước, test và measure impact
- **A/B Testing:** Test ML models trước khi fully deploy

---

**Tài liệu này sẽ được cập nhật dựa trên feedback và implementation progress.**

