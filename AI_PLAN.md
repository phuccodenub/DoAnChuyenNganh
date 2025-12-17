# ⚠️ DEPRECATION NOTICE

**This file has been replaced with comprehensive, structured documentation.**

**📂 New Location:** [`docs/AI/`](docs/AI/)

**🔗 Start Here:** [docs/AI/00_INDEX.md](docs/AI/00_INDEX.md)

---

## 📚 NEW DOCUMENTATION STRUCTURE

The AI implementation plan has been reorganized into professional, modular documents:

### Core Documents
- **[00_INDEX.md](docs/AI/00_INDEX.md)** - Navigation hub and quick start guide
- **[01_OVERVIEW.md](docs/AI/01_OVERVIEW.md)** - Complete system architecture (December 2025)
- **[02_INFRASTRUCTURE.md](docs/AI/02_INFRASTRUCTURE.md)** - Updated provider configurations
  - ProxyPal: Gemini 3 Pro Preview, Qwen 3 Coder Plus/Flash
  - MegaLLM: Claude Sonnet 4.5 ($3/M), Claude Opus 4.5 ($5/M)
  - Free APIs: Google AI Studio, Groq
- **[03_STRATEGY.md](docs/AI/03_STRATEGY.md)** - Model selection decision trees
- **[04_QUIZ_GENERATOR.md](docs/AI/04_QUIZ_GENERATOR.md)** - Complete implementation guide

### What's New
✅ Updated AI model information (December 2025)
✅ Accurate ProxyPal configuration (Gemini 3 Pro, Qwen 3 Coder Plus/Flash)
✅ MegaLLM pricing and models (Claude Sonnet 4.5, Opus 4.5)
✅ Implementation-ready code examples
✅ Cost optimization strategies
✅ Production-grade architecture

### What's Different from This File
❌ Old, patched ideas → ✅ Professional, structured documentation
❌ Outdated model names → ✅ Current models (Dec 2025)
❌ Theoretical concepts → ✅ Ready-to-implement code
❌ Single file chaos → ✅ Organized, modular structure

---

## 🚀 QUICK MIGRATION GUIDE

**If you were using this file for:**

1. **ProxyPal Setup** → Read [02_INFRASTRUCTURE.md](docs/AI/02_INFRASTRUCTURE.md#1-proxypal---local-ai-gateway)
2. **Model Selection** → Read [03_STRATEGY.md](docs/AI/03_STRATEGY.md)
3. **Quiz Generator** → Read [04_QUIZ_GENERATOR.md](docs/AI/04_QUIZ_GENERATOR.md)
4. **Cost Planning** → Read [01_OVERVIEW.md](docs/AI/01_OVERVIEW.md#-cost-projections)
5. **Implementation** → Start with [00_INDEX.md](docs/AI/00_INDEX.md)

---

## 📋 ARCHIVED CONTENT BELOW

*(Original content preserved for reference - DO NOT USE FOR IMPLEMENTATION)*

---

PHẦN 1: TẬN DỤNG SỨC MẠNH TÍNH TOÁN (Heavy Lifting)

Nhóm này "ăn" rất nhiều token và cần context window lớn. Dùng API trả phí sẽ rất đau ví, dùng ProxyPal là chuẩn bài.



1. Content Repurposing (Tái cấu trúc nội dung) - Ứng dụng: Cao nhất

Cách dùng với ProxyPal: Bạn có thể ném nguyên 1 video bài giảng 2 tiếng hoặc file sách PDF 500 trang vào.

Cấu hình: Chọn model Gemini 1.5 Pro (qua ProxyPal) vì nó có cửa sổ ngữ cảnh (Context Window) lên tới 1 triệu - 2 triệu token. Không model nào khác làm tốt hơn việc này.

Kịch bản Dev: Team upload video -> Server gọi ProxyPal local -> Gemini "nhai" hết video -> Trả về tóm tắt, flashcard.

2. Quiz Generator (Tự động tạo bài kiểm tra) - Ứng dụng: Cao

Cách dùng: Tương tự như trên, cần đọc hiểu sâu tài liệu.

Cấu hình: Dùng ProxyPal để gọi Claude 3.5 Sonnet (nếu bạn có Claude Pro) hoặc GPT-4o. Claude 3.5 Sonnet hiện tại tư duy logic để tạo đề thi đang được đánh giá là tốt nhất (ít bị hallucination hơn GPT).

3. AI Grader & Feedback (Chấm bài) - Ứng dụng: Trung bình

Cách dùng: Khi test tính năng chấm bài code/tự luận.

Lợi ích: Bạn có thể ung dung ném những bài code dài cả nghìn dòng vào để test khả năng review code của AI mà không sợ tốn tiền.

PHẦN 2: TẬN DỤNG SỰ ĐA DẠNG MODEL (Multi-Model Capability)

Nhóm này tận dụng khả năng hỗ trợ nhiều provider của ProxyPal để thực hiện các workflow phức tạp.



4. Debate Workflow (Tranh biện) - Ứng dụng: Xuất sắc

Đây là nơi ProxyPal tỏa sáng rực rỡ nhất trong dự án của bạn.



Vấn đề: Để chạy Debate, bạn cần gọi 2 model khác nhau (ví dụ: GPT-4o đấu với Claude 3.5 Sonnet). Nếu dùng API, bạn phải nạp tiền 2 nơi.

Cách dùng với ProxyPal:

ProxyPal cho phép bạn config nhiều provider cùng lúc.

Trong code backend (Java/Python), bạn viết hàm callAI(provider, prompt).

Luồng Dev:

Bước 1: callAI('openai', 'Đưa ra quan điểm A...') -> ProxyPal trỏ sang ChatGPT.

Bước 2: callAI('anthropic', 'Phản biện quan điểm A...') -> ProxyPal trỏ sang Claude.

Bước 3: callAI('google', 'Tổng hợp kết quả...') -> ProxyPal trỏ sang Gemini.

Kết quả: Bạn test được tính năng Debate siêu xịn mà không tốn 1 xu API nào.

5. AI Reviewer (Lớp kiểm duyệt) - Ứng dụng: Cao

Cách dùng: Sử dụng model "khắt khe" nhất để review.

Cấu hình: Mặc định cho Generator dùng model thường (ví dụ GPT-4o-mini qua API hoặc GPT-4o qua ProxyPal), nhưng Reviewer bắt buộc dùng Gemini 1.5 Pro (qua ProxyPal) vì nó có khả năng đọc hiểu ngữ cảnh rộng để soi lỗi logic cực tốt.

PHẦN 3: TẬN DỤNG ĐỂ TEST LOGIC (R&D)

Nhóm này bình thường cần độ trễ thấp (Real-time), nhưng trong môi trường Dev, ta chấp nhận chậm một chút để test logic RAG.



6. AI Tutor (Trợ giảng ảo) & 7. Error Analysis

Thực tế: Tính năng Chatbot thường cần phản hồi < 2s. ProxyPal đi vòng (Man-in-the-middle) có thể mất 3-5s.

Trong Dev: Chúng ta không quan tâm độ trễ. Chúng ta quan tâm Chất lượng câu trả lời RAG.

Cách dùng: Dùng ProxyPal để tinh chỉnh (fine-tune) prompt cho Chatbot. Bạn có thể thử nghiệm xem: "Với câu hỏi này, GPT-4o trả lời hay hơn hay Claude trả lời hay hơn?" -> Từ đó chọn ra model tốt nhất để sau này mua API cho Production.

PHẦN 4: Ý TƯỞNG MULTIPLE KEYS & PROXYPAL

Bạn hỏi về ý tưởng "Multiple Keys" (Load Balancing). Trong ngữ cảnh dùng ProxyPal, khái niệm này sẽ biến đổi một chút:



API Key truyền thống: Bạn xoay vòng Key A, Key B của Google.

Với ProxyPal: Bạn xoay vòng Tài khoản (Accounts).

Ví dụ: Team có 3 người, mỗi người có 1 tài khoản Google/OpenAI.

ProxyPal trên máy dev của bạn có thể config để luân phiên (hoặc dự phòng) các tài khoản này (tùy vào cách ProxyPal hỗ trợ multi-account hoặc bạn chạy nhiều instance ProxyPal).

Tuy nhiên: Vì team chỉ có 3 người, tôi khuyên đừng làm phức tạp hóa vấn đề Load Balancing ở giai đoạn này. Hãy để mỗi dev tự dùng ProxyPal của mình. Code chỉ cần hỗ trợ việc đổi Base URL là đủ.

Chào bạn, thông tin bạn cung cấp về giới hạn của ProxyPal (chỉ có Gemini và Qwen) và các nguồn API Free (Google AI Studio, Groq, SiliconFlow) là cực kỳ quan trọng. Nó giúp chúng ta vẽ lại bản đồ chiến lược chính xác và thực tế hơn.

Đừng lo lắng việc thiếu Claude hay OpenAI. Combo Gemini (Logic/Context) + Qwen (Code/Technical) + Llama (Speed) là quá đủ để cân team rồi.

Đây là bảng quy hoạch "Hybrid AI Architecture" tối ưu nhất cho LMS của bạn, kết hợp giữa sức mạnh cục bộ (ProxyPal) và tốc độ đám mây (Cloud API):

BẢNG PHÂN BỔ MÔ HÌNH & HẠ TẦNG (MATRIX)



CHI TIẾT TRIỂN KHAI CHO 2 TÍNH NĂNG "ĐINH"

Dưới đây là cách bạn phối hợp các model này trong thực tế code:



1. Triển khai Debate Workflow (Không có Claude/OpenAI)

Bạn lo lắng thiếu model để debate? Đừng lo. Cặp đôi Gemini và Qwen là sự bù trừ hoàn hảo.



Kịch bản: Sinh viên nộp bài tập Code Java Spring Boot.

Bước 1 (Agent A - Gemini Pro via ProxyPal): Đóng vai "Giảng viên lý thuyết".

Prompt: "Nhận xét code này về mặt Clean Code, đặt tên biến, tuân thủ nguyên lý SOLID."

Gemini: Sẽ soi rất kỹ về tư duy thiết kế, comment code.

Bước 2 (Agent B - Qwen Coder via ProxyPal): Đóng vai "Senior Developer thực chiến".

Prompt: "Nhận xét code này về hiệu năng (Performance), bảo mật (Security) và khả năng gây lỗi runtime."

Qwen: Sẽ soi lỗi logic, memory leak, SQL Injection (Qwen Coder cực giỏi khoản này).

Bước 3 (Synthesizer - Gemini Pro): Tổng hợp lại.

"Dựa trên nhận xét của Giảng viên và Senior Dev, hãy chấm điểm và đưa ra lời khuyên cuối cùng cho sinh viên."

-> Kết quả: Bài nhận xét cực kỳ toàn diện, vừa có lý thuyết vừa có thực tế.



2. Triển khai AI Tutor (RAG) với Groq & Fallback

Vì Groq miễn phí nên đôi khi sẽ bị rate limit. Bạn cần cơ chế "Backup" thông minh.



Logic Code (Java Spring Boot):

LỜI KHUYÊN VỀ CODE (DESIGN PATTERN)

Để dự án của bạn linh hoạt giữa ProxyPal, Google API và Groq, bạn hãy áp dụng Strategy Pattern.



Tạo một interface chung: AiProviderService.

Tạo các class implement:

ProxyPalGeminiService (Gọi localhost:8317 - Model Gemini)

ProxyPalQwenService (Gọi localhost:8317 - Model Qwen)

GoogleStudioService (Gọi API Google - Model Flash)

GroqService (Gọi API Groq - Model Llama)

Tạo một AiRouter (Bộ điều hướng):

Hàm createQuiz() -> Gọi ProxyPalGeminiService.

Hàm chatSupport() -> Gọi GroqService.

Hàm debateCode() -> Gọi cả ProxyPalGeminiService và ProxyPalQwenService.

Tổng kết:

Bạn đang có trong tay Gemini Pro (Logic khủng), Qwen Coder (Code khủng) và Llama 3 (Tốc độ khủng). Đây là bộ ba "Dream Team" cho Dev mà không tốn một xu nào. Việc thiếu OpenAI hay Claude không ảnh hưởng nhiều đến chất lượng dự án LMS của bạn đâu.



Bây giờ là phần cuối cùng : Tổng hợp tất cả những gì chúng ta có để viết ra ý tưởng chi tiết, đầy đủ, tốt nhất cho các tính năng AI mà tôi đã chọn với sự góp ý của bạn.

Đồng thời bổ sung là tôi có megallm, một nơi cung cấp cho tôi rất nhiều model mạnh nhưng chỉ có 75$ credit. Nhưng tôi có 2 tài khoản vậy nên coi như không ít, đề phòng trường hợp rất ít phải sử dụng nhưng cần model mạnh và suy nghĩ tối ưu chính xác.

I. CHIẾN LƯỢC CỐT LÕI: "THE 3-TIER ARCHITECTURE"
Chúng ta sẽ phân loại AI theo 3 tầng để tối ưu chi phí và hiệu năng:

Tier 1: The Sprinters (Tốc độ & Miễn phí)

Nguồn: Groq (Llama 3), Google AI Studio (Gemini Flash).

Nhiệm vụ: Chatbot, xử lý dữ liệu nền số lượng lớn, gợi ý nhanh.

Tier 2: The Workhorses (Tư duy sâu & Local)

Nguồn: ProxyPal (Gemini 1.5 Pro, Qwen 2.5 Coder).

Nhiệm vụ: Tạo nội dung, chấm code, tranh biện (Debate), xử lý file nặng.

Tier 3: The Judge (Tinh hoa & Tốn tiền)

Nguồn: MegaLLM (Claude 3.5 Sonnet / Opus).

Nhiệm vụ: "Trọng tài" khi Tier 2 tranh cãi, chấm phúc khảo, hoặc tạo các bài thi Final Exam quan trọng.

II. TRIỂN KHAI CHI TIẾT 6 TÍNH NĂNG + DEBATE WORKFLOW
Dưới đây là luồng xử lý (Flow) tối ưu cho từng tính năng:

1. Tính năng: Quiz Generator (Tạo đề thi tự động)
Quy trình:

Ingestion: Giáo viên upload tài liệu (PDF/Video) -> ProxyPal (Gemini 1.5 Pro) đọc và trích xuất kiến thức (nhờ context window 1M token).

Generation: ProxyPal (Gemini 1.5 Pro) tạo bộ câu hỏi nháp (Draft).

Verification (Lớp 1): ProxyPal (Qwen 2.5 Coder) rà soát logic (đặc biệt là các câu hỏi về Code/Toán).

Final Polish (Tier 3 - Chỉ bật cho bài thi quan trọng): Gửi bộ câu hỏi đã lọc lên MegaLLM (Claude 3.5 Sonnet) để trau chuốt ngôn từ và đảm bảo không có lỗ hổng tư duy.

Giá trị: Tiết kiệm credit MegaLLM, chỉ dùng nó để "dát vàng" sản phẩm cuối.

2. Tính năng: AI Tutor (Trợ giảng ảo - Chatbot)
Quy trình:

User hỏi: "Giải thích giúp em đoạn code này".

Router: Kiểm tra độ phức tạp.

Tier 1 (Mặc định): Gọi Groq (Llama 3). Phản hồi < 1s.

Tier 2 (Fallback): Nếu câu hỏi quá khó hoặc cần đọc file đính kèm -> Gọi Google Flash API.

Lưu ý: Không dùng ProxyPal hay MegaLLM ở đây để tránh độ trễ và tốn tiền vô ích.

3. Tính năng: Debate Workflow & AI Reviewer (Siêu tính năng)
Đây là "bộ não" của hệ thống.

Tình huống: Cần tạo một bài tập dự án (Project Assignment) phức tạp.

Agent A (Lý thuyết): ProxyPal (Gemini 1.5 Pro) đề xuất cấu trúc dự án chuẩn kiến trúc (Clean Architecture).

Agent B (Thực tế): ProxyPal (Qwen 2.5 Coder) phản biện: "Cấu trúc này quá cồng kềnh cho sinh viên năm 2, nên bỏ bớt pattern này...".

Agent C (Tổng hợp): Gemini Pro tổng hợp lại ý kiến.

The Judge (Trọng tài - MegaLLM): Chỉ kích hoạt khi độ lệch pha giữa A và B quá lớn (Conflict).

Gửi cả 2 luận điểm lên MegaLLM (Claude 3.5 Sonnet): "Gemini bảo A, Qwen bảo B. Ai đúng? Hãy đưa ra quyết định cuối cùng". Claude 3.5 Sonnet nổi tiếng là model khách quan và logic nhất hiện nay.

4. Tính năng: AI Grader (Chấm bài)
Bài Code:

Dùng ProxyPal (Qwen 2.5 Coder). Đây là model mã nguồn mở tốt nhất cho code, chấm cực kỹ các lỗi bảo mật/hiệu năng.

Bài Tự luận (Essay):

Dùng Google Flash API (để xử lý nhanh hàng loạt).

Tính năng "Khiếu nại" (Appeal):

Nếu sinh viên bấm nút "Em không phục điểm này" -> Hệ thống gửi bài làm đó lên MegaLLM (Claude 3.5 Sonnet) để chấm lại lần 2 (Phúc khảo). Đây là tính năng "Premium" cực xịn.

5. Tính năng: Adaptive Learning & Error Analysis
Quy trình: Chạy Background Job hàng đêm.

Model: Google Flash API.

Task: Quét toàn bộ log điểm số, tìm pattern lỗi sai -> Gợi ý bài học tiếp theo. Flash là đủ thông minh và miễn phí cho việc này.

6. Tính năng: Content Repurposing
Quy trình: Xử lý Video/Sách.

Model: ProxyPal (Gemini 1.5 Pro).

Lý do: Không ai địch lại Gemini ở khoản context window (1-2 triệu token). MegaLLM (Claude) chỉ có 200k token, không đủ nhét cả cuốn sách vào.

AI INFRASTRUCTURE & RESOURCES DOCUMENTATION
Project: LMS Education Platform | Environment: Development / Local MVP

Tài liệu này mô tả chi tiết các công cụ và tài nguyên AI được sử dụng để xây dựng tính năng thông minh cho dự án. Kiến trúc được thiết kế theo tiêu chí: Tối ưu chi phí (Cost-Effective) và Tận dụng sức mạnh cục bộ (Local Power).

1. 🛠️ PROXYPAL - "THE HEAVY LIFTER" (Trợ thủ đắc lực)
1.1. Giới thiệu
ProxyPal là một ứng dụng Desktop hoạt động như một Local Reverse Proxy (cơ chế Man-in-the-Middle). Nó cho phép dự án kết nối với các mô hình AI cao cấp (High-end models) thông qua tài khoản cá nhân (Personal Subscription) thay vì phải trả phí API doanh nghiệp đắt đỏ.

1.2. Cơ chế hoạt động
Dự án (Backend Spring Boot/Script) gửi request đến http://localhost:8317/v1 (thay vì server của Google/OpenAI).

ProxyPal chặn request, tự động nhúng Authentication Token (từ tài khoản đã đăng nhập trên máy Dev) vào Header.

Request được forward đến Server chính hãng (Google/Alibaba Cloud).

Kết quả trả về được ProxyPal hứng và đẩy lại cho dự án.

1.3. Tài nguyên khả dụng (Trong dự án này)
Dù ProxyPal hỗ trợ nhiều hãng, nhưng hiện tại chúng ta chỉ định sử dụng các model sau:

Google Gemini:

Model: gemini-1.5-pro-latest

Sức mạnh: Context Window khổng lồ (1M - 2M tokens).

Ứng dụng: Đọc sách PDF, xem Video dài, Phân tích dữ liệu lớn.

Qwen (Alibaba):

Model: qwen-2.5-coder (hoặc qwen-3-coder).

Sức mạnh: Chuyên gia lập trình (Coding Specialist). Khả năng logic code vượt trội.

Ứng dụng: Review code, Chấm bài tập lập trình, Tối ưu SQL.

1.4. Lưu ý khi sử dụng
⚠️ Local Only: Tool phải chạy trên máy của Developer.

⚠️ Không Real-time: Độ trễ cao hơn gọi API trực tiếp (do đi vòng), không phù hợp cho Chatbot trực tiếp với End-User.

✅ Chi phí: 0$ (Tận dụng Free Tier/Pro account cá nhân).

2. 💎 MEGALLM - "THE JUDGE" (Trọng tài tối cao)
2.1. Giới thiệu
MegaLLM là một nền tảng cung cấp API Gateway, cho phép truy cập vào các mô hình AI độc quyền khó tiếp cận hoặc đắt đỏ. Trong dự án này, MegaLLM đóng vai trò là nguồn cung cấp sức mạnh của Anthropic Claude - mảnh ghép còn thiếu mà ProxyPal không hỗ trợ.

2.2. Tài nguyên khả dụng
Credit: Tổng ngân sách $150 (chia đều cho 2 tài khoản). Đây là tài nguyên hữu hạn, cần dùng tiết kiệm.

Models:

Claude 3.5 Sonnet: Mô hình cân bằng tốt nhất thế giới hiện nay về tư duy logic và viết lách tự nhiên.

Claude 3 Opus: Mô hình mạnh nhất (và đắt nhất) cho các tác vụ suy luận cực khó.

2.3. Chiến lược sử dụng
Chỉ gọi MegaLLM trong các trường hợp "Critical" (Quan trọng):

Arbitration (Phân xử): Khi Gemini và Qwen đưa ra kết quả trái ngược nhau trong quy trình Debate.

Final Approval: Duyệt đề thi cuối kỳ hoặc nội dung học thuật quan trọng cần độ chính xác 100%.

Appeals: Chấm phúc khảo khi sinh viên khiếu nại điểm số.

3. ⚡ FREE CLOUD APIs - "THE SPRINTERS" (Vận động viên nước rút)
Để hệ thống phản hồi nhanh và chạy ổn định 24/7 (kể cả khi tắt máy Dev), chúng ta sử dụng các nguồn API miễn phí sau:

3.1. Groq Cloud
Model: Llama-3-70b-versatile

Đặc điểm: Tốc độ phản hồi siêu nhanh (gần như tức thì).

Ứng dụng: Chatbot hỗ trợ học tập (AI Tutor), Trả lời câu hỏi ngắn.

3.2. Google AI Studio
Model: gemini-1.5-flash

Đặc điểm: Miễn phí, ổn định, xử lý nhanh.

Ứng dụng: Các tác vụ chạy ngầm (Background jobs) như phân tích log lỗi, chấm bài tự luận quy mô lớn.

3. Công nghệ đề xuất (Tech Stack)
Để xây dựng hệ thống này từ con số 0, tôi khuyên bạn nên tìm hiểu các framework sau:

LangChain hoặc LangGraph: Đây là framework tốt nhất hiện nay để xây dựng quy trình Multi-Agent (Graph-based workflow), giúp bạn quản lý vòng lặp giữa Generator và Critic (Ý tưởng 3).