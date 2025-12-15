# Hướng dẫn Git Workflow - Xử lý Pull với Uncommitted Changes

## 📋 Tổng quan tình huống

Bạn có nhiều thay đổi chưa commit:
1. **Xóa file markdown**: Nhiều file `.md` đã bị xóa
2. **Chức năng assignment mới**: Các tính năng nộp bài, chấm bài, hủy nộp
3. **Tái cấu trúc Docker**: Thay đổi trong `docker-compose.dev.yml` và các file docker

Teammate đã push nhiều thay đổi lên remote. Bạn cần:
- Commit các thay đổi của mình
- Pull code từ remote
- Giải quyết conflicts (nếu có)
- Push code lên

---

## 🔍 Bước 1: Kiểm tra trạng thái hiện tại

```powershell
git status
```

Xem danh sách các file:
- **Deleted**: Files markdown đã xóa
- **Modified**: Files đã sửa (docker, frontend, backend)
- **Untracked**: Files mới tạo

---

## ✅ Bước 2: Commit các thay đổi của bạn

### 2.1. Stage tất cả thay đổi
```powershell
git add -A
```

Hoặc stage từng loại riêng biệt:
```powershell
# Stage file xóa
git add -u

# Stage file mới và sửa
git add .
```

### 2.2. Kiểm tra lại những gì sẽ commit
```powershell
git status
```

### 2.3. Commit với message rõ ràng
```powershell
git commit -m "feat: implement assignment submission features + docker restructure

- Add student assignment submission with file upload
- Add instructor grading modal with improved UI
- Add cancel submission feature
- Restructure docker-compose.dev.yml with backend .env
- Fix max_score display issues (remove 100 fallback)
- Clean up markdown documentation files
"
```

**Lưu ý**: Nếu commit message dài, bạn có thể dùng:
```powershell
git commit
```
Sẽ mở editor để bạn viết message chi tiết hơn.

---

## 🔄 Bước 3: Pull code từ remote

### 3.1. Fetch để xem thay đổi từ remote
```powershell
git fetch origin
```

### 3.2. Xem những commit teammate đã push
```powershell
git log origin/main --oneline -10
```

### 3.3. Pull với rebase (khuyến nghị)
```powershell
git pull --rebase origin main
```

**Tại sao dùng `--rebase`?**
- Giữ history sạch, tuyến tính
- Tránh merge commits không cần thiết
- Các commit của bạn sẽ được "replay" lên trên commit mới nhất

**Hoặc** pull thường (merge):
```powershell
git pull origin main
```

---

## ⚠️ Bước 4: Giải quyết conflicts (nếu có)

### 4.1. Kiểm tra conflicts
Nếu có conflict, Git sẽ báo:
```
CONFLICT (content): Merge conflict in <file>
```

Xem danh sách files conflict:
```powershell
git status
```

### 4.2. Các loại conflicts thường gặp

#### A. Conflict trong Docker files
File: `docker-compose.dev.yml`

**Chiến lược**: 
- **GIỮ LẠI** thay đổi của bạn (`env_file: ./backend/.env`)
- **MERGE** các service mới mà teammate thêm

```yaml
<<<<<<< HEAD (Your changes)
  backend:
    env_file: ./backend/.env
    ...
=======
  backend:
    environment:
      - NODE_ENV=development
    ...
>>>>>>> origin/main (Teammate's changes)
```

**Cách sửa**:
1. Mở file trong VS Code
2. VS Code sẽ highlight conflicts với các nút: "Accept Current", "Accept Incoming", "Accept Both"
3. Chọn **"Accept Both"** hoặc **"Accept Current"** (giữ env_file của bạn)
4. Review và chỉnh sửa thủ công nếu cần

#### B. Conflict trong Backend code
Files: `backend/src/modules/assignment/*`

**Chiến lược**:
- Teammate có thể thêm API mới
- Bạn đã sửa logic chấm bài, max_score
- **MERGE cẩn thận**: Giữ cả 2 nếu không xung đột logic

#### C. Conflict trong Frontend components
Files: `frontend/src/pages/*`

**Chiến lược**:
- Teammate có thể sửa UI của các trang khác
- Bạn đã sửa Assignment pages
- **Ưu tiên giữ** code của bạn cho Assignment pages
- **Merge** các trang khác mà teammate sửa

### 4.3. Giải quyết từng file

**Mẫu workflow**:
```powershell
# 1. Mở file conflict trong VS Code
code <file-path>

# 2. Chọn resolve conflict trong VS Code UI
# Hoặc chỉnh sửa thủ công

# 3. Stage file đã resolve
git add <file-path>

# 4. Lặp lại cho tất cả conflicts
```

### 4.4. Hoàn tất resolve
Sau khi resolve tất cả:

**Nếu dùng rebase**:
```powershell
git rebase --continue
```

**Nếu dùng merge**:
```powershell
git commit -m "merge: resolve conflicts with teammate changes"
```

---

## 🧪 Bước 5: Test sau khi merge

### 5.1. Chạy backend
```powershell
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

### 5.2. Chạy frontend
```powershell
cd frontend
npm run dev
```

### 5.3. Test các tính năng
- ✅ Login thành công
- ✅ Student có thể nộp bài
- ✅ Instructor có thể chấm bài
- ✅ Modal chấm bài hiển thị đầy đủ, rộng rãi
- ✅ Điểm hiển thị đúng (không fallback về 100)

---

## 🚀 Bước 6: Push lên remote

### 6.1. Push code
```powershell
git push origin main
```

### 6.2. Nếu bị rejected (teammate đã push thêm)
```powershell
# Pull lại và resolve conflicts nếu có
git pull --rebase origin main

# Push với force (CHỈ nếu chắc chắn)
git push --force-with-lease origin main
```

**⚠️ Cảnh báo**: Chỉ dùng `--force-with-lease` nếu bạn chắc chắn không làm mất code của teammate!

---

## 🔧 Các lệnh hữu ích

### Xem diff trước khi commit
```powershell
git diff
```

### Xem files đã thay đổi
```powershell
git diff --name-only
```

### Hủy staging (nếu add nhầm)
```powershell
git reset HEAD <file>
```

### Xem history
```powershell
git log --oneline --graph --all
```

### Tạo backup trước khi pull
```powershell
git branch backup-before-pull
```

### Nếu pull sai và muốn quay lại
```powershell
# Quay về commit trước đó
git reset --hard HEAD~1

# Hoặc quay về branch backup
git reset --hard backup-before-pull
```

---

## 📝 Checklist cuối cùng

Trước khi push:
- [ ] Tất cả conflicts đã được resolve
- [ ] Code compile thành công (no errors)
- [ ] Backend container chạy OK
- [ ] Frontend chạy OK
- [ ] Test các tính năng chính (login, submit, grade)
- [ ] Không có file lạ trong `git status`
- [ ] Commit message rõ ràng

---

## 🆘 Troubleshooting

### Lỗi: "Your local changes would be overwritten"
```powershell
# Option 1: Stash changes
git stash
git pull
git stash pop

# Option 2: Commit trước
git commit -am "WIP: save work before pull"
git pull
```

### Lỗi: "Divergent branches"
```powershell
# Set default pull strategy
git config pull.rebase true

# Hoặc
git pull --rebase origin main
```

### Lỗi: Rebase conflict quá nhiều, muốn hủy
```powershell
git rebase --abort
git pull origin main  # Dùng merge thay vì rebase
```

---

## 💡 Best Practices

1. **Commit thường xuyên**: Chia nhỏ thành các commits logic
2. **Pull trước khi bắt đầu làm việc mới**: Luôn có code mới nhất
3. **Communicate với team**: Báo trước khi sửa files quan trọng
4. **Backup trước khi pull**: Tạo branch backup nếu không chắc
5. **Test kỹ sau merge**: Đảm bảo không làm hỏng code

---

**Chúc may mắn! 🎉**
