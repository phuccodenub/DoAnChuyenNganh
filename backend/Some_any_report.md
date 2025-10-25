PHÂN LOẠI CHI TIẾT THEO MỨC ĐỘ RỦI RO
🚨 NHÓM 1: any CẦN REFACTOR NGAY (HIGH RISK)
1.1 Repository Layer - Database Operations
Vấn đề: Sequelize options có type definition cụ thể
Giải pháp: Sử dụng FindOptions<UserAttributes> hoặc SearchOptions từ common types
1.2 Controller Layer - Request/Response Handling
Vấn đề: Express types đã có sẵn
Giải pháp: Sử dụng Request, Response, NextFunction từ Express
1.3 Service Layer - Business Logic
Vấn đề: UserInstance type đã được định nghĩa chi tiết
Giải pháp: Sử dụng UserInstance từ model.types.ts
1.4 Validation Layer - Input Processing
Vấn đề: Request query có structure cụ thể
Giải pháp: Sử dụng ParsedQs từ Express hoặc custom DTOs
⚠️ NHÓM 2: any CÓ THỂ GIỮ LẠI (MEDIUM RISK)
2.1 Error Handling & Utilities
Lý do giữ lại: Error details thường có structure động, khó predict
Giải pháp tương lai: Sử dụng Record<string, unknown> thay vì any
2.2 Cache & Configuration
Lý do giữ lại: Cache value có thể là bất kỳ data type nào
Giải pháp tương lai: Generic type <T> với constraints
2.3 File Upload & External Data
Lý do giữ lại: Multer middleware có typing phức tạp
Giải pháp tương lai: Custom middleware types