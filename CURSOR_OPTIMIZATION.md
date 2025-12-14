# 🚀 Hướng dẫn tối ưu Cursor IDE để chạy nhanh hơn

## ✅ Đã thực hiện

1. **Tạo file `.cursorignore`** - Bỏ qua các file/thư mục không cần thiết khi index

## 🔧 Các cách khác để tăng tốc Cursor

### 1. Cài đặt Cursor Settings

Mở Settings (Ctrl+,) và tắt/bật các tính năng sau:

#### Tắt các tính năng không cần thiết:
- **Files: Exclude** - Thêm các pattern:
  ```
  **/node_modules/**
  **/dist/**
  **/build/**
  **/.git/**
  **/coverage/**
  **/logs/**
  **/*.log
  ```

- **Search: Exclude** - Tương tự như trên

- **Files: Watcher Exclude** - Thêm:
  ```
  **/node_modules/**
  **/dist/**
  **/build/**
  **/.vite/**
  **/.next/**
  ```

#### Giảm tần suất auto-save:
- **Files: Auto Save** - Đổi từ `afterDelay` sang `onFocusChange` hoặc `off`

#### Tắt các extension không cần:
- Vào Extensions (Ctrl+Shift+X)
- Disable các extension không sử dụng
- Đặc biệt tắt các extension nặng như:
  - GitLens (nếu không cần)
  - Prettier (nếu dùng format on save)
  - Các extension theme không dùng

### 2. Giảm số lượng tab mở

- Đóng các tab không cần thiết
- Sử dụng `Ctrl+K W` để đóng tất cả tab
- Sử dụng `Ctrl+Tab` để navigate thay vì mở nhiều tab

### 3. Tắt AI features khi không cần

- **Cursor Tab** - Tắt nếu không dùng (Settings → Cursor Tab → Disable)
- **Inline Suggestions** - Tắt nếu không cần (Settings → Editor → Inline Suggest)

### 4. Tăng Memory Allocation

Nếu có RAM nhiều, có thể tăng memory cho Cursor:

1. Tìm file `cursor.json` trong:
   - Windows: `%APPDATA%\Cursor\User\settings.json`
   - Mac: `~/Library/Application Support/Cursor/User/settings.json`
   - Linux: `~/.config/Cursor/User/settings.json`

2. Thêm vào settings:
```json
{
  "cursor.general.maxMemory": 4096,  // MB (tăng nếu có RAM nhiều)
  "cursor.general.maxFileSize": 10485760  // 10MB - bỏ qua file lớn hơn
}
```

### 5. Clear Cache

Thỉnh thoảng clear cache của Cursor:

**Windows:**
```powershell
# Clear Cursor cache
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\Cache\*"
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\CachedData\*"
```

**Mac/Linux:**
```bash
# Clear Cursor cache
rm -rf ~/Library/Application\ Support/Cursor/Cache/*
rm -rf ~/Library/Application\ Support/Cursor/CachedData/*
```

### 6. Tắt File Watchers không cần

Trong Settings, tìm `files.watcherExclude` và thêm:
```json
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.vite/**": true,
    "**/.next/**": true,
    "**/coverage/**": true,
    "**/logs/**": true
  }
}
```

### 7. Sử dụng Workspace Settings

Tạo file `.vscode/settings.json` trong project root:
```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.vite": true,
    "**/.next": true,
    "**/coverage": true,
    "**/logs": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/coverage": true,
    "**/logs": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.vite/**": true,
    "**/.next/**": true
  }
}
```

### 8. Restart Cursor thường xuyên

Nếu Cursor chạy lâu, restart lại để clear memory:
- `Ctrl+Shift+P` → `Developer: Reload Window`

### 9. Kiểm tra System Resources

- Đóng các ứng dụng nặng khác (Chrome với nhiều tab, Docker, etc.)
- Kiểm tra Task Manager để xem process nào đang chiếm nhiều RAM/CPU

### 10. Network Settings (Quan trọng cho AI features)

Trong Settings → Network, có 2 phần quan trọng:

#### HTTP Compatibility Mode
- **Khuyến nghị: Giữ ở HTTP/2** (mặc định)
  - HTTP/2 được khuyến nghị cho low-latency streaming
  - Giúp AI features (Chat, Composer, Tab) phản hồi nhanh hơn
  - Chỉ đổi nếu gặp vấn đề với corporate proxy/VPN

- **Khi nào nên đổi:**
  - Nếu AI features bị timeout hoặc không kết nối được
  - Nếu đang dùng corporate proxy/VPN và gặp lỗi
  - Thử đổi xuống HTTP/1.1 nếu HTTP/2 không hoạt động

#### Network Diagnostics
- **Chạy ngay:** Click "Run Diagnostic" để kiểm tra:
  - Kết nối đến backend AI services
  - Latency và response time
  - Phát hiện vấn đề network

- **Nếu có lỗi:**
  - Kiểm tra firewall/antivirus có chặn Cursor không
  - Kiểm tra proxy settings
  - Thử đổi HTTP Compatibility Mode
  - Kiểm tra internet connection

### 11. Update Cursor

Luôn cập nhật Cursor lên phiên bản mới nhất:
- `Help` → `Check for Updates`

## 📊 Kiểm tra Performance

Sử dụng Command Palette (`Ctrl+Shift+P`):
- `Developer: Show Running Extensions` - Xem extension nào đang chạy
- `Developer: Open Process Explorer` - Xem process nào đang tốn resource

## 🎯 Quick Wins (Làm ngay)

1. ✅ Đã tạo `.cursorignore`
2. **Chạy Network Diagnostics** (Settings → Network → Run Diagnostic)
3. Đảm bảo HTTP Compatibility Mode = HTTP/2
4. Đóng các tab không cần
5. Tắt các extension không dùng
6. Restart Cursor
7. Clear cache nếu chưa làm lâu

## ⚠️ Lưu ý

- Không tắt các tính năng cần thiết cho development
- Test sau mỗi thay đổi để đảm bảo không ảnh hưởng workflow
- Backup settings trước khi thay đổi lớn
