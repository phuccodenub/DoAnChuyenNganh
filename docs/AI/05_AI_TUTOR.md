# 💬 TRỢ GIẢNG AI - CHATBOT HỖ TRỢ HỌC TẬP

**Tài liệu:** 05 - AI Tutor  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P0 (Giá trị cao nhất)

---

## 📖 TỔNG QUAN

Tính năng Trợ Giảng AI cung cấp hỗ trợ học tập thời gian thực cho sinh viên thông qua chatbot tương tác. Hệ thống có khả năng trả lời câu hỏi, giải thích khái niệm, và cung cấp gợi ý học tập được cá nhân hóa.

### Giá trị kinh doanh
- ⭐ **Hỗ trợ 24/7:** Các sinh viên có thể học bất kỳ lúc nào
- ⭐ **Giảm áp lực:** Giảm 40% câu hỏi gửi cho giáo viên
- ⭐ **Cải thiện kết quả:** +15% tỷ lệ hoàn thành khóa học
- ⭐ **Tăng tương tác:** Sinh viên tham gia +25%

### Thông số kỹ thuật
- **Mô hình chính:** Groq Llama 3 70B (< 2 giây)
- **Mô hình dự phòng:** Google Gemini Flash (1-3 giây)
- **Dữ liệu ngữ cảnh:** Lịch sử hội thoại + thông tin khóa học
- **Kiểu kết nối:** WebSocket cho phản hồi thời gian thực

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Luồng hoạt động

```
┌─────────────────────────────────────────────────────────────┐
│              SINH VIÊN HỎI CÂU HỎI                          │
│  Chat UI → Gửi message qua WebSocket                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND - MESSAGE ROUTER                        │
│  - Nhận message từ WebSocket                                │
│  - Kiểm tra cache nhanh                                     │
│  - Xác thực ngữ cảnh người dùng                             │
│  - Gửi tới AI Orchestrator                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AI ORCHESTRATOR                                 │
│  Phân loại câu hỏi → Chọn mô hình                           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Câu hỏi đơn     Câu hỏi khó    Câu hỏi code
    giản (thường)   (cần logic)    (cần kỹ thuật)
         │               │               │
         ▼               ▼               ▼
    Groq Llama 3    Google Flash    Qwen Coder
    (0.5-1.5s)      (1-3s)          (2-5s)
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GENERATE RESPONSE                               │
│  - AI model xử lý câu hỏi                                   │
│  - Tích hợp ngữ cảnh học tập sinh viên                      │
│  - Format câu trả lời thân thiện                            │
│  - Stream response từng token                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              LƯU TRỮ & GỬI LẠI                              │
│  - Lưu vào database (chat history)                          │
│  - Cache response phổ biến (1 giờ TTL)                      │
│  - Stream về client qua WebSocket                           │
│  - Ghi log cho phân tích                                    │
└─────────────────────────────────────────────────────────────┘
```

### Thành phần hệ thống

```
FRONTEND (React)
├── Chat UI Component
├── Message Display
├── Input Handler
└── Real-time Updates (WebSocket)
    │
    ▼
BACKEND (Node.js/Express)
├── WebSocket Server (Socket.IO)
├── Message Handler
├── Context Manager
├── Conversation Storage
└── AI Orchestrator
    │
    ▼
AI PROVIDERS (Tier 1 + Tier 2)
├── Groq Llama 3 (Thường)
├── Google Gemini Flash (Dự phòng)
└── Qwen Coder (Code questions)
```

---

## 💻 TRIỂN KHAI BACKEND

### API WebSocket

**File:** `backend/src/modules/ai/ai.gateway.ts`

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AITutorService } from './services/ai-tutor.service';
import { AuthService } from '@/modules/auth/auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserContext {
  userId: string;
  courseId: string;
  conversationHistory: ChatMessage[];
}

@WebSocketGateway({
  namespace: '/ai/chat',
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
})
export class AIChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private userSessions: Map<string, UserContext> = new Map();
  private activeConnections: Map<string, Socket> = new Map();

  constructor(
    private aiTutorService: AITutorService,
    private authService: AuthService
  ) {}

  /**
   * Xử lý khi client kết nối
   */
  async handleConnection(client: Socket) {
    try {
      // Xác thực người dùng
      const token = client.handshake.auth.token;
      const user = await this.authService.verifyToken(token);

      if (!user) {
        client.disconnect();
        return;
      }

      // Lưu kết nối
      this.activeConnections.set(user.id, client);
      
      // Tải lịch sử hội thoại
      const courseId = client.handshake.query.courseId as string;
      const conversationHistory = 
        await this.aiTutorService.loadConversationHistory(user.id, courseId);

      this.userSessions.set(user.id, {
        userId: user.id,
        courseId,
        conversationHistory: conversationHistory || []
      });

      console.log(`[AI Chat] User ${user.id} connected`);
      client.emit('connected', { message: 'Kết nối thành công' });

    } catch (error) {
      console.error('[AI Chat] Connection error:', error);
      client.disconnect();
    }
  }

  /**
   * Xử lý khi client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.activeConnections.entries())
      .find(([_, socket]) => socket === client)?.[0];

    if (userId) {
      this.activeConnections.delete(userId);
      this.userSessions.delete(userId);
      console.log(`[AI Chat] User ${userId} disconnected`);
    }
  }

  /**
   * Xử lý tin nhắn từ client
   * Event: 'message'
   */
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { text: string; courseId?: string }
  ) {
    try {
      const userId = Array.from(this.activeConnections.entries())
        .find(([_, socket]) => socket === client)?.[0];

      if (!userId) {
        throw new WsException('Người dùng không được xác thực');
      }

      const userContext = this.userSessions.get(userId);
      if (!userContext) {
        throw new WsException('Phiên không tồn tại');
      }

      // Cập nhật courseId nếu có
      if (payload.courseId) {
        userContext.courseId = payload.courseId;
      }

      // Gửi trạng thái đang xử lý
      client.emit('status', { state: 'typing' });

      // Gọi AI service để tạo phản hồi
      const response = await this.aiTutorService.chat(
        {
          message: payload.text,
          userId,
          courseId: userContext.courseId,
          conversationHistory: userContext.conversationHistory
        },
        (chunk) => {
          // Stream từng phần của response
          client.emit('response_chunk', { chunk });
        }
      );

      // Cập nhật lịch sử hội thoại
      userContext.conversationHistory.push({
        role: 'user',
        content: payload.text,
        timestamp: new Date()
      });

      userContext.conversationHistory.push({
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      });

      // Gửi phản hồi cuối cùng
      client.emit('message_response', {
        text: response.text,
        metadata: {
          model: response.model,
          latency: response.latency,
          processedAt: new Date()
        }
      });

      // Lưu vào database
      await this.aiTutorService.saveChatMessage(
        userId,
        userContext.courseId,
        payload.text,
        response.text,
        response.model
      );

      client.emit('status', { state: 'idle' });

    } catch (error) {
      console.error('[AI Chat] Message error:', error);
      client.emit('error', {
        message: 'Lỗi xử lý câu hỏi. Vui lòng thử lại.'
      });
    }
  }

  /**
   * Lấy lịch sử hội thoại
   * Event: 'get_history'
   */
  @SubscribeMessage('get_history')
  async handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { limit?: number }
  ) {
    try {
      const userId = Array.from(this.activeConnections.entries())
        .find(([_, socket]) => socket === client)?.[0];

      if (!userId) {
        throw new WsException('Người dùng không được xác thực');
      }

      const userContext = this.userSessions.get(userId);
      const history = await this.aiTutorService.getConversationHistory(
        userId,
        userContext?.courseId,
        payload.limit || 20
      );

      client.emit('history', { messages: history });

    } catch (error) {
      client.emit('error', { message: 'Lỗi lấy lịch sử' });
    }
  }

  /**
   * Xóa lịch sử hội thoại
   * Event: 'clear_history'
   */
  @SubscribeMessage('clear_history')
  async handleClearHistory(@ConnectedSocket() client: Socket) {
    try {
      const userId = Array.from(this.activeConnections.entries())
        .find(([_, socket]) => socket === client)?.[0];

      if (!userId) {
        throw new WsException('Người dùng không được xác thực');
      }

      const userContext = this.userSessions.get(userId);
      await this.aiTutorService.clearConversationHistory(
        userId,
        userContext?.courseId
      );

      userContext!.conversationHistory = [];
      client.emit('history_cleared', { message: 'Lịch sử đã xóa' });

    } catch (error) {
      client.emit('error', { message: 'Lỗi xóa lịch sử' });
    }
  }
}
```

### AI Tutor Service

**File:** `backend/src/modules/ai/services/ai-tutor.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AIOrchestrator } from './ai-orchestrator';
import { GroqService } from './providers/groq.service';
import { GoogleAIService } from './providers/google-ai.service';
import { ProxyPalService } from './providers/proxypal.service';
import { ChatHistory } from '@/database/models/ChatHistory';
import Redis from 'ioredis';

interface ChatRequest {
  message: string;
  userId: string;
  courseId: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  text: string;
  model: string;
  latency: number;
}

@Injectable()
export class AITutorService {
  private orchestrator: AIOrchestrator;
  private groq: GroqService;
  private google: GoogleAIService;
  private proxypal: ProxyPalService;
  private redis: Redis;

  constructor() {
    this.orchestrator = new AIOrchestrator();
    this.groq = new GroqService();
    this.google = new GoogleAIService();
    this.proxypal = new ProxyPalService();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 2
    });
  }

  /**
   * Gửi tin nhắn và nhận phản hồi từ AI
   */
  async chat(
    request: ChatRequest,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    // Step 1: Phân loại câu hỏi
    const classification = this.classifyQuestion(request.message);
    console.log(`[AI Tutor] Question type: ${classification.type}`);

    // Step 2: Chọn mô hình phù hợp
    const modelSelection = this.selectModel(classification);
    console.log(`[AI Tutor] Selected model: ${modelSelection.provider}`);

    // Step 3: Xây dựng prompt với ngữ cảnh
    const prompt = this.buildPrompt(request, classification);

    // Step 4: Gọi AI service
    let response: string;
    if (modelSelection.provider === 'groq') {
      response = await this.groq.generateContent({
        prompt,
        stream: true,
        onChunk
      });
    } else if (modelSelection.provider === 'google') {
      response = await this.google.generateContent({
        prompt,
        stream: true,
        onChunk
      });
    } else if (modelSelection.provider === 'proxypal') {
      response = await this.proxypal.generateContent({
        model: modelSelection.model,
        prompt,
        stream: true,
        onChunk
      });
    }

    const latency = Date.now() - startTime;

    return {
      text: response,
      model: modelSelection.model,
      latency
    };
  }

  /**
   * Phân loại loại câu hỏi
   */
  private classifyQuestion(message: string): Classification {
    const lowerMessage = message.toLowerCase();

    // Câu hỏi về code
    if (this.containsCodeKeywords(lowerMessage)) {
      return {
        type: 'code',
        complexity: 'high',
        requiresCode: true
      };
    }

    // Câu hỏi có math/toán
    if (this.containsMathKeywords(lowerMessage)) {
      return {
        type: 'math',
        complexity: 'medium',
        requiresExplanation: true
      };
    }

    // Câu hỏi khó hoặc dài
    if (message.length > 200 || this.hasComplexStructure(message)) {
      return {
        type: 'complex',
        complexity: 'high',
        requiresDeepThinking: true
      };
    }

    // Câu hỏi đơn giản
    return {
      type: 'simple',
      complexity: 'low',
      requiresSpeed: true
    };
  }

  /**
   * Chọn mô hình phù hợp
   */
  private selectModel(classification: Classification): ModelSelection {
    // Câu hỏi code: Dùng Qwen Coder từ ProxyPal
    if (classification.type === 'code') {
      return {
        provider: 'proxypal',
        model: 'qwen3-coder-plus',
        rationale: 'Chuyên gia về code'
      };
    }

    // Câu hỏi phức tạp: Dùng Google Flash (context lớn)
    if (classification.complexity === 'high' && classification.type !== 'code') {
      return {
        provider: 'google',
        model: 'gemini-1.5-flash',
        rationale: 'Xử lý câu hỏi phức tạp'
      };
    }

    // Câu hỏi đơn giản: Dùng Groq (cực nhanh)
    return {
      provider: 'groq',
      model: 'llama-3-70b-8192',
      rationale: 'Cần tốc độ cao'
    };
  }

  /**
   * Xây dựng prompt với ngữ cảnh
   */
  private buildPrompt(
    request: ChatRequest,
    classification: Classification
  ): string {
    const recentHistory = request.conversationHistory.slice(-5); // 5 tin nhắn gần nhất

    const systemPrompt = `Bạn là một trợ giảng thông minh, thân thiện và hữu ích cho sinh viên.
    
Hướng dẫn:
- Trả lời rõ ràng và dễ hiểu
- Cung cấp ví dụ khi cần thiết
- Khuyến khích sinh viên tư duy độc lập
- Nếu câu hỏi khó, hãy chia thành bước nhỏ
- Luôn thân thiện và tích cực
${classification.type === 'code' ? '- Cung cấp code examples với giải thích' : ''}
${classification.type === 'math' ? '- Hiển thị các bước giải chi tiết' : ''}
`;

    const conversationContext = recentHistory
      .map(msg => `${msg.role === 'user' ? 'Sinh viên' : 'Trợ giảng'}: ${msg.content}`)
      .join('\n');

    return `${systemPrompt}

Lịch sử hội thoại:
${conversationContext}

Sinh viên: ${request.message}

Trợ giảng:`;
  }

  /**
   * Lưu tin nhắn chat vào database
   */
  async saveChatMessage(
    userId: string,
    courseId: string,
    userMessage: string,
    aiResponse: string,
    model: string
  ): Promise<void> {
    try {
      await ChatHistory.create({
        userId,
        courseId,
        userMessage,
        aiResponse,
        model,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('[AI Tutor] Error saving chat:', error);
    }
  }

  /**
   * Tải lịch sử hội thoại
   */
  async loadConversationHistory(
    userId: string,
    courseId: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    // Kiểm tra cache trước
    const cacheKey = `chat:history:${userId}:${courseId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Lấy từ database
    const messages = await ChatHistory.findAll({
      where: { userId, courseId },
      order: [['createdAt', 'ASC']],
      limit,
      raw: true
    });

    const history = messages.flatMap(msg => [
      { role: 'user', content: msg.userMessage },
      { role: 'assistant', content: msg.aiResponse }
    ]);

    // Lưu cache 1 giờ
    await this.redis.setex(cacheKey, 3600, JSON.stringify(history));

    return history;
  }

  /**
   * Lấy lịch sử hội thoại
   */
  async getConversationHistory(
    userId: string,
    courseId: string,
    limit: number = 20
  ) {
    return await this.loadConversationHistory(userId, courseId, limit);
  }

  /**
   * Xóa lịch sử hội thoại
   */
  async clearConversationHistory(userId: string, courseId: string): Promise<void> {
    await ChatHistory.destroy({
      where: { userId, courseId }
    });

    // Xóa cache
    const cacheKey = `chat:history:${userId}:${courseId}`;
    await this.redis.del(cacheKey);
  }

  private containsCodeKeywords(text: string): boolean {
    const keywords = ['code', 'function', 'class', 'variable', 'loop', 'array', 'object', 'api'];
    return keywords.some(kw => text.includes(kw));
  }

  private containsMathKeywords(text: string): boolean {
    const keywords = ['tính', 'công thức', 'phương trình', 'số', 'toán', 'giải'];
    return keywords.some(kw => text.includes(kw));
  }

  private hasComplexStructure(text: string): boolean {
    return text.split(' ').length > 50 || text.split('\n').length > 3;
  }
}
```

---

## 🎨 TRIỂN KHAI FRONTEND

### Chat Component

**File:** `frontend/src/features/student/components/AIChatPanel.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Message, ChatBubble } from '@/components/chat';
import { Spinner } from '@/components/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface AIChatPanelProps {
  courseId: string;
  visible: boolean;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  courseId,
  visible
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const socket = useSocket('ai/chat', {
    query: { courseId }
  });

  useEffect(() => {
    if (!socket) return;

    // Nhận lịch sử hội thoại
    socket.on('history', (data: { messages: ChatMessage[] }) => {
      setMessages(data.messages);
    });

    // Nhận từng phần của response
    socket.on('response_chunk', (data: { chunk: string }) => {
      setIsStreaming(true);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += data.chunk;
        }
        return updated;
      });
    });

    // Nhận phản hồi cuối cùng
    socket.on('message_response', (data: any) => {
      setIsStreaming(false);
      setLoading(false);
      setInput('');
    });

    // Lấy lịch sử khi kết nối
    socket.emit('get_history', { limit: 20 });

    return () => {
      socket.off('history');
      socket.off('response_chunk');
      socket.off('message_response');
    };
  }, [socket]);

  useEffect(() => {
    // Auto scroll xuống cuối
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);

    socket?.emit('message', {
      text: input,
      courseId
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!visible) return null;

  return (
    <div className="ai-chat-panel bg-white rounded-lg shadow-lg">
      <div className="chat-header bg-blue-600 text-white p-4">
        <h3 className="font-bold">🤖 Trợ Giảng AI</h3>
        <p className="text-sm opacity-90">Hỏi bất kỳ câu hỏi nào về khóa học</p>
      </div>

      <div className="chat-messages flex-1 overflow-y-auto p-4 h-96">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Bắt đầu cuộc hội thoại bằng cách đặt câu hỏi</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isUser={msg.role === 'user'}
              timestamp={msg.timestamp}
              model={msg.model}
            />
          ))
        )}

        {loading && isStreaming && (
          <div className="flex items-center gap-2 text-gray-500">
            <Spinner size="sm" />
            <span>Trợ giảng đang suy nghĩ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input border-t p-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu hỏi của bạn..."
          rows={3}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          className="btn btn-primary px-6 h-full"
        >
          {loading ? <Spinner size="sm" /> : 'Gửi'}
        </button>
      </div>
    </div>
  );
};
```

---

## ⚙️ CẤU HÌNH

**File:** `backend/.env`

```bash
# AI Tutor Configuration
AI_TUTOR_DEFAULT_MODEL=llama-3-70b-8192
AI_TUTOR_ENABLE_STREAMING=true
AI_TUTOR_RESPONSE_TIMEOUT=30000
AI_TUTOR_CACHE_TTL=3600

# Chat History
CHAT_HISTORY_RETENTION_DAYS=90
CHAT_HISTORY_MAX_MESSAGES=1000

# WebSocket
WEBSOCKET_PING_INTERVAL=30000
WEBSOCKET_PING_TIMEOUT=5000
```

---

## 🧪 KIỂM THỬ

```typescript
describe('AI Tutor Service', () => {
  it('should respond to simple question using Groq', async () => {
    const response = await aiTutorService.chat({
      message: 'React là gì?',
      userId: 'test-user',
      courseId: 'test-course',
      conversationHistory: []
    });

    expect(response.model).toBe('llama-3-70b-8192');
    expect(response.latency).toBeLessThan(2000);
    expect(response.text.length).toBeGreaterThan(0);
  });

  it('should respond to code question using Qwen', async () => {
    const response = await aiTutorService.chat({
      message: 'Viết function để tính tổng array?',
      userId: 'test-user',
      courseId: 'test-course',
      conversationHistory: []
    });

    expect(response.model).toContain('qwen');
    expect(response.text).toContain('function');
  });
});
```

---

## 📚 LIÊN QUAN

- **Trước:** [04_QUIZ_GENERATOR.md](04_QUIZ_GENERATOR.md)
- **Tiếp:** [06_AI_GRADER.md](06_AI_GRADER.md)
- **Kiến trúc:** [01_OVERVIEW.md](01_OVERVIEW.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
