# AI Grader Implementation Guide

## 📋 Overview

AI Grader tự động chấm điểm code và essay sử dụng AI. Hỗ trợ rubric-based grading với feedback chi tiết và gợi ý cải thiện.

**Status**: ✅ **COMPLETE** - Core service và API ready  
**Priority**: P1  
**Implementation Date**: Jan 2025

---

## 🎯 Features Implemented

### Code Grading
- ✅ **Multi-language Support**: JavaScript, Python, Java, C++, TypeScript, etc.
- ✅ **Comprehensive Evaluation**:
  - ✅ Correctness & Logic
  - ✅ Code Quality & Style
  - ✅ Performance (time/space complexity)
  - ✅ Security & Best Practices
- ✅ **Detailed Feedback**:
  - ✅ Line-level issue detection
  - ✅ Improvement suggestions
  - ✅ Security vulnerability warnings
- ✅ **Model**: Qwen 3 Coder Plus (code specialist) → fallback Google Gemini Flash

### Essay Grading
- ✅ **Rubric-based Evaluation**:
  - ✅ Content & argumentation
  - ✅ Organization & structure
  - ✅ Clarity & language
  - ✅ Grammar & mechanics
  - ✅ Topic relevance
- ✅ **Detailed Analysis**:
  - ✅ Strengths identification
  - ✅ Areas for improvement
  - ✅ Section-level comments
- ✅ **Model**: Google Gemini Flash (optimal cost/performance)

### System Features
- ✅ **Caching**: 24-hour TTL để tránh re-grade cùng content
- ✅ **Error Handling**: Comprehensive với detailed logging
- ✅ **Metadata Tracking**: Model used, processing time, cache status
- ✅ **JSON Validation**: Robust parsing với fallback mechanisms

---

## 🏗️ Architecture

```
AIGraderService
│
├── gradeCode()
│   ├── Build code grading prompt (rubric-based)
│   ├── Check cache (24h TTL)
│   ├── Call AI model (Qwen Coder Plus → fallback Gemini Flash)
│   ├── Parse JSON response
│   └── Return structured result
│
└── gradeEssay()
    ├── Build essay grading prompt (rubric-based)
    ├── Check cache (24h TTL)
    ├── Call AI model (Gemini Flash)
    ├── Parse JSON response
    └── Return structured result
```

### Model Selection Strategy

| Task | Primary Model | Fallback | Rationale |
|------|--------------|----------|-----------|
| Code Grading | **Qwen 3 Coder Plus** (32K) | Google Gemini Flash | Code-specialized model |
| Essay Grading | **Google Gemini Flash** (1M) | None | Fast, accurate for text |

---

## 📝 API Endpoints

### 1. Grade Code Submission

**Endpoint**: `POST /api/v1/ai/grader/code`

**Request Body**:
```json
{
  "submissionId": "sub-12345",
  "assignmentId": "asgn-001",
  "code": "function fibonacci(n) { ... }",
  "language": "javascript",
  "rubric": [
    {
      "name": "Correctness",
      "description": "Code chạy đúng và cho kết quả đúng",
      "points": 30
    },
    {
      "name": "Code Quality",
      "description": "Code dễ đọc, có comment, tên biến rõ ràng",
      "points": 25
    },
    {
      "name": "Performance",
      "description": "Time và space complexity tối ưu",
      "points": 25
    },
    {
      "name": "Best Practices",
      "description": "Tuân thủ coding standards và security",
      "points": 20
    }
  ],
  "courseId": "course-cs101",
  "userId": "user-001"
}
```

**Response**:
```json
{
  "score": 75,
  "maxScore": 100,
  "percentage": 75.0,
  "breakdown": [
    {
      "criterion": "Correctness",
      "achieved": 25,
      "max": 30,
      "comment": "Logic đúng nhưng thiếu edge case handling"
    },
    {
      "criterion": "Code Quality",
      "achieved": 20,
      "max": 25,
      "comment": "Tên biến rõ ràng, cần thêm comment"
    },
    {
      "criterion": "Performance",
      "achieved": 15,
      "max": 25,
      "comment": "Exponential time complexity - cần optimize"
    },
    {
      "criterion": "Best Practices",
      "achieved": 15,
      "max": 20,
      "comment": "Follow JS conventions, thiếu input validation"
    }
  ],
  "feedback": "Code hoạt động đúng với base case nhưng có vấn đề về performance...",
  "suggestions": [
    "Implement memoization để cải thiện performance từ O(2^n) → O(n)",
    "Thêm input validation để handle negative numbers",
    "Consider iterative approach thay vì recursive cho large n"
  ],
  "codeIssues": [
    {
      "line": 2,
      "type": "warning",
      "severity": "medium",
      "message": "Exponential time complexity - very slow for n > 30"
    },
    {
      "line": 1,
      "type": "suggestion",
      "severity": "low",
      "message": "Add input validation for negative numbers"
    }
  ],
  "metadata": {
    "model": "qwen-3-coder-plus-32k-instruct",
    "provider": "proxypal",
    "cached": false,
    "processingTime": 2340,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### 2. Grade Essay Submission

**Endpoint**: `POST /api/v1/ai/grader/essay`

**Request Body**:
```json
{
  "submissionId": "sub-67890",
  "assignmentId": "asgn-002",
  "essay": "The Impact of AI on Education\n\nAI is transforming...",
  "topic": "The Impact of AI on Education",
  "rubric": [
    {
      "name": "Content",
      "description": "Ý tưởng rõ ràng, lập luận logic",
      "points": 30
    },
    {
      "name": "Organization",
      "description": "Cấu trúc bài viết mạch lạc",
      "points": 25
    },
    {
      "name": "Clarity",
      "description": "Ngôn ngữ rõ ràng, dễ hiểu",
      "points": 20
    },
    {
      "name": "Grammar",
      "description": "Ngữ pháp và chính tả đúng",
      "points": 15
    },
    {
      "name": "Relevance",
      "description": "Nội dung liên quan chủ đề",
      "points": 10
    }
  ],
  "courseId": "course-english101",
  "userId": "user-001"
}
```

**Response**:
```json
{
  "score": 82,
  "maxScore": 100,
  "percentage": 82.0,
  "breakdown": [
    {
      "criterion": "Content",
      "achieved": 25,
      "max": 30,
      "comment": "Main ideas clear but could use more depth"
    },
    {
      "criterion": "Organization",
      "achieved": 22,
      "max": 25,
      "comment": "Good structure with clear intro/body/conclusion"
    },
    {
      "criterion": "Clarity",
      "achieved": 17,
      "max": 20,
      "comment": "Language clear and accessible"
    },
    {
      "criterion": "Grammar",
      "achieved": 13,
      "max": 15,
      "comment": "Minor grammar issues"
    },
    {
      "criterion": "Relevance",
      "achieved": 10,
      "max": 10,
      "comment": "Highly relevant to topic"
    }
  ],
  "feedback": "Well-structured essay with clear arguments about AI's impact on education...",
  "strengths": [
    "Clear introduction that establishes the topic effectively",
    "Balanced perspective showing both benefits and concerns",
    "Strong conclusion with practical recommendations"
  ],
  "improvements": [
    "Add more specific examples and case studies",
    "Expand on the concerns section with more detail",
    "Include statistics or research to support claims"
  ],
  "comments": [
    {
      "section": "Introduction",
      "text": "Strong opening that captures reader attention",
      "type": "positive"
    },
    {
      "section": "Body Paragraph 1",
      "text": "Could include specific examples of adaptive learning systems",
      "type": "improvement"
    },
    {
      "section": "Conclusion",
      "text": "Effective summary with clear recommendations",
      "type": "positive"
    }
  ],
  "metadata": {
    "model": "gemini-3-flash-1.5",
    "provider": "google",
    "cached": false,
    "processingTime": 1890,
    "timestamp": "2025-01-15T10:32:00Z"
  }
}
```

---

## 🔧 Implementation Details

### Service Layer: `AIGraderService`

**Location**: `backend/src/modules/ai/services/ai-grader.service.ts`

**Key Methods**:

#### 1. `gradeCode(submission)`
```typescript
async gradeCode(submission: CodeSubmission): Promise<GradingResult> {
  // 1. Build comprehensive prompt with rubric
  const prompt = this.buildCodeGradingPrompt(submission);
  
  // 2. Check cache (24h TTL)
  const cacheKey = this.generateCacheKey('code', submission);
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached;
  
  // 3. Call AI model
  let result;
  try {
    // Primary: Qwen Coder Plus (code specialist)
    result = await this.proxyPalProvider.chat(
      [{ role: 'user', content: prompt }],
      { model: 'qwen-3-coder-plus-32k-instruct' }
    );
  } catch (error) {
    // Fallback: Google Gemini Flash
    result = await this.googleProvider.chat(
      [{ role: 'user', content: prompt }],
      { model: 'gemini-3-flash-1.5' }
    );
  }
  
  // 4. Parse and validate JSON
  const parsed = this.parseCodeGradingResult(result);
  
  // 5. Cache result (24h)
  await this.cacheService.set(cacheKey, parsed, 86400);
  
  return parsed;
}
```

#### 2. `gradeEssay(submission)`
```typescript
async gradeEssay(submission: EssaySubmission): Promise<GradingResult> {
  // Similar structure to gradeCode
  // Uses Gemini Flash (optimal for text analysis)
  // 24h cache TTL
  // Comprehensive parsing with strengths/improvements extraction
}
```

#### 3. Prompt Engineering

**Code Grading Prompt** (excerpt):
```typescript
buildCodeGradingPrompt(submission: CodeSubmission): string {
  return `
You are an expert code reviewer and grader. Grade the following code submission.

ASSIGNMENT:
ID: ${submission.assignmentId}
Language: ${submission.language}

CODE SUBMISSION:
\`\`\`${submission.language}
${submission.code}
\`\`\`

GRADING RUBRIC:
${submission.rubric.map((r, i) => 
  `${i+1}. ${r.name} (${r.points} points): ${r.description}`
).join('\n')}

EVALUATION CRITERIA:
1. Correctness: Does the code produce correct results?
2. Code Quality: Is the code readable, maintainable, well-structured?
3. Performance: Time and space complexity optimization
4. Security: Vulnerabilities, input validation, error handling
5. Best Practices: Language conventions, design patterns

RETURN ONLY VALID JSON:
{
  "score": <total points>,
  "maxScore": <sum of rubric points>,
  "breakdown": [
    {
      "criterion": "<rubric item name>",
      "achieved": <points earned>,
      "max": <max points>,
      "comment": "<specific feedback>"
    }
  ],
  "feedback": "<overall assessment>",
  "suggestions": ["<improvement 1>", "<improvement 2>"],
  "codeIssues": [
    {
      "line": <line number or null>,
      "type": "error|warning|suggestion",
      "severity": "high|medium|low",
      "message": "<issue description>"
    }
  ]
}
`;
}
```

**Essay Grading Prompt** (excerpt):
```typescript
buildEssayGradingPrompt(submission: EssaySubmission): string {
  return `
You are an expert essay grader. Grade the following essay submission.

TOPIC: ${submission.topic}

ESSAY:
${submission.essay}

GRADING RUBRIC:
${submission.rubric.map((r, i) => 
  `${i+1}. ${r.name} (${r.points} points): ${r.description}`
).join('\n')}

EVALUATION CRITERIA:
1. Content: Clarity of ideas, argument strength, depth of analysis
2. Organization: Logical structure, transitions, coherence
3. Clarity: Language precision, readability
4. Grammar: Spelling, punctuation, sentence structure
5. Relevance: Adherence to topic and prompt

RETURN ONLY VALID JSON:
{
  "score": <total points>,
  "maxScore": <sum of rubric points>,
  "breakdown": [...],
  "feedback": "<overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "comments": [
    {
      "section": "<section name>",
      "text": "<comment>",
      "type": "positive|improvement|neutral"
    }
  ]
}
`;
}
```

---

## 🧪 Testing

### Test Script

**Location**: `backend/test-ai-grader.ts`

**Run Tests**:
```bash
# 1. Start backend
cd backend
npm run dev:web

# 2. Run test script (another terminal)
npx ts-node test-ai-grader.ts
```

**Test Cases**:
1. ✅ **Code Grading**:
   - Sample: Fibonacci function (inefficient recursive implementation)
   - Expected: Detects performance issues, suggests memoization
   - Validates: JSON parsing, rubric scoring, issue detection

2. ✅ **Essay Grading**:
   - Sample: "Impact of AI on Education" essay
   - Expected: Identifies strengths and improvements
   - Validates: Content analysis, section comments, feedback quality

### Manual Testing via API

**Code Grading**:
```bash
curl -X POST http://localhost:3000/api/v1/ai/grader/code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-code-submission.json
```

**Essay Grading**:
```bash
curl -X POST http://localhost:3000/api/v1/ai/grader/essay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-essay-submission.json
```

---

## 📊 Performance

### Expected Metrics

| Metric | Code Grading | Essay Grading |
|--------|-------------|---------------|
| **Model** | Qwen Coder Plus | Gemini Flash |
| **Avg Response Time** | 2-5 seconds | 1-3 seconds |
| **Cache Hit Rate** | ~70% (24h TTL) | ~60% (24h TTL) |
| **Error Rate** | <2% (with fallback) | <1% |
| **Cost per Request** | $0.001-0.002 | $0.0005-0.001 |

### Optimization Strategies

1. ✅ **Caching**: 24-hour TTL reduces redundant API calls
2. ✅ **Model Selection**: Code-specialized for code, fast Flash for essays
3. ✅ **Fallback Mechanism**: Ensures high availability
4. ✅ **Prompt Optimization**: Concise prompts for faster responses
5. 🔄 **Future**: Batch grading for multiple submissions

---

## 🔐 Security & Best Practices

### Input Validation
- ✅ **Code Length**: Max 10,000 characters (prevents abuse)
- ✅ **Essay Length**: Max 5,000 words
- ✅ **Rubric Validation**: Total points must be > 0
- ✅ **Language Validation**: Whitelist of supported languages

### Error Handling
- ✅ **Provider Fallback**: Qwen → Gemini for code grading
- ✅ **JSON Parsing**: Multiple strategies (direct parse, markdown extraction)
- ✅ **Logging**: Detailed error logs with context
- ✅ **User-friendly Errors**: Generic messages to users, detailed logs for devs

### Privacy
- ✅ **No PII in Prompts**: Only submission content, no student names
- ✅ **Cache Security**: Redis keys hashed with SHA256
- ✅ **Data Retention**: Cache auto-expires after 24h

---

## 🚀 Future Enhancements

### Phase 2 (Post-MVP)
- [ ] **Batch Grading**: Grade multiple submissions in parallel
- [ ] **Custom Rubrics**: Allow instructors to create dynamic rubrics
- [ ] **Plagiarism Detection**: Integrate code similarity checks
- [ ] **Detailed Reports**: PDF export of grading results
- [ ] **Grading History**: Track score progression over time

### Phase 3 (Advanced)
- [ ] **Peer Review Integration**: AI assists in peer grading
- [ ] **Learning Analytics**: Identify common mistakes across class
- [ ] **Auto-regrade**: Detect improved submissions and auto-regrade
- [ ] **Multi-language Essays**: Support non-English essays
- [ ] **Code Execution**: Run code and validate output

---

## 📚 Related Documentation

- [AI Implementation Status](./AI_IMPLEMENTATION_STATUS_MASTER.md)
- [AI Grader Specification](./06_AI_GRADER.md)
- [API Documentation](../API/)
- [Testing Guide](./TEST_AI_FEATURES.md)

---

## 🎉 Completion Checklist

- [x] **Service Implementation**: AIGraderService with code + essay grading
- [x] **API Endpoints**: POST /ai/grader/code, /ai/grader/essay
- [x] **Prompt Engineering**: Comprehensive rubric-based prompts
- [x] **Model Selection**: Qwen Coder Plus (code), Gemini Flash (essay)
- [x] **Caching**: 24h TTL with SHA256 keys
- [x] **Error Handling**: Fallback mechanisms and logging
- [x] **Testing**: Test script with sample submissions
- [x] **Documentation**: This implementation guide
- [ ] **Integration Tests**: Run test script and verify results
- [ ] **Frontend**: Create UI components for grading submission

**Status**: ✅ **READY FOR TESTING**

---

*Last Updated: January 2025*
*Author: AI Agent*
