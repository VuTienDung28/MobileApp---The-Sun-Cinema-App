# 🎬 Phân Tích Logic API Quản Lý Rạp Chiếu Phim

## Kiến Trúc Tổng Quan

Dự án áp dụng pattern **3-Layer Architecture** kết hợp **Repository Pattern**:

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Controller    │  ← Nhận request, kiểm tra auth, trả response
└────────┬────────┘
         │ gọi
         ▼
┌─────────────────┐
│    Service      │  ← Business logic, validation, mapping DTO
└────────┬────────┘
         │ gọi
         ▼
┌─────────────────┐
│   Repository    │  ← Truy vấn database (EF Core)
└────────┬────────┘
         │
         ▼
     Database
```

Mỗi tầng **chỉ biết tầng ngay bên dưới** thông qua **Interface** — giúp dễ test và thay thế implementation.

---

## Phần 1 — API Quản Lý Rạp (Cinema)

### Danh sách Endpoints

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| `GET` | `/api/cinema` | Public | Lấy danh sách rạp |
| `GET` | `/api/cinema/detail/{id}` | Public | Chi tiết 1 rạp |
| `POST` | `/api/cinema` | Admin only | Tạo rạp mới |
| `PUT` | `/api/cinema/update/{id}` | Admin only | Cập nhật rạp |
| `DELETE` | `/api/cinema/delete/{id}` | Admin only | Xóa rạp |

### Luồng Xử Lý Từng Endpoint

#### `GET /api/cinema` — Danh sách rạp
```
Controller.GetAll()
  → CinemaService.GetAllAsync()
    → CinemaRepository.GetAllAsync()          // SELECT * FROM Cinemas ORDER BY Name
  → Chuyển đổi: Cinema → CinemaListItemDto   // Chỉ lấy: Id, Name, Address
  ← Trả về: ApiResponse<List<CinemaListItemDto>>
```
> **Tại sao dùng `AsNoTracking()`?** Vì chỉ đọc dữ liệu, không cần EF theo dõi thay đổi → tăng hiệu năng.

---

#### `GET /api/cinema/detail/{id}` — Chi tiết rạp
```
Controller.GetById(id)
  → CinemaService.GetByIdAsync(id)
    → CinemaRepository.GetByIdAsync(id)
       // SELECT Cinema + JOIN Rooms + JOIN Seats (eager loading)
       .Include(c => c.Rooms).ThenInclude(r => r.Seats)
    → Nếu null → throw UserFriendlyException("CINEMA_NOT_FOUND")
  → Chuyển đổi: Cinema → CinemaDetailDto
       bao gồm: List<RoomInCinemaDto> với TotalSeats = r.Seats.Count
  ← Trả về: ApiResponse<CinemaDetailDto>
```

**Điểm đáng chú ý — Eager Loading 2 cấp:**
```csharp
.Include(c => c.Rooms)
    .ThenInclude(r => r.Seats)
```
Lý do: `CinemaDetailDto` cần hiển thị số ghế mỗi phòng (`TotalSeats`),
nên phải load `Seats` cùng lúc thay vì query thêm N lần.

---

#### `POST /api/cinema` — Tạo rạp mới

```
[Authorize(Policy = "AdminOnly")]
Controller.Create(CreateCinemaDto)
  → Validate DTO: [Required] Name, Address (do Model Binding tự xử lý)
  → CinemaService.CreateAsync(dto)
    ① Check trùng tên: ExistsByNameAsync(dto.Name)
       → Nếu trùng → throw "CINEMA_NAME_EXISTS"
    ② Tạo entity: new Cinema { Name, Address }
    ③ CinemaRepository.AddAsync(cinema)
       → _db.Cinemas.Add(cinema); SaveChangesAsync()
  → Chuyển đổi: Cinema → CinemaDetailDto
  ← Trả về: 201 Created + ApiResponse<CinemaDetailDto>
```

---

#### `PUT /api/cinema/update/{id}` — Cập nhật rạp

```
[Authorize(Policy = "AdminOnly")]
Controller.Update(id, UpdateCinemaDto)
  → CinemaService.UpdateAsync(id, dto)
    ① Tìm cinema theo id → nếu null → throw "CINEMA_NOT_FOUND"
    ② Nếu Name thay đổi:
       → ExistsByNameAsync(dto.Name, excludeId: id)
          // Tìm rạp trùng tên NHƯNG bỏ qua chính rạp đang update
       → Nếu trùng → throw "CINEMA_NAME_EXISTS"
       → cinema.Name = dto.Name
    ③ Nếu Address thay đổi:
       → cinema.Address = dto.Address
    ④ CinemaRepository.UpdateAsync(cinema)
  ← Trả về: 200 OK + ApiResponse<CinemaDetailDto>
```

**Kỹ thuật `excludeId` trong kiểm tra trùng tên:**
```csharp
// Bỏ qua chính rạp hiện tại khi check trùng tên
ExistsByNameAsync(dto.Name, excludeId: id)

// SQL tương đương:
WHERE Name = @name AND Id != @excludeId
```
Nếu không có `excludeId`, khi UPDATE mà giữ nguyên tên thì sẽ bị báo lỗi trùng tên.

---

#### `DELETE /api/cinema/delete/{id}` — Xóa rạp

```
[Authorize(Policy = "AdminOnly")]
Controller.Delete(id)
  → CinemaService.DeleteAsync(id)
    ① Tìm cinema (kèm Rooms) → nếu null → throw "CINEMA_NOT_FOUND"
    ② Check: cinema.Rooms.Any()
       → Nếu có phòng → throw "CINEMA_HAS_ROOMS"
          "Không thể xóa rạp đang có phòng chiếu. Hãy xóa các phòng trước."
    ③ CinemaRepository.DeleteAsync(cinema)
  ← Trả về: 200 OK
```

**Tại sao không dùng Cascade Delete ở DB?**  
→ Vì DB đã cấu hình `Restrict`. Thay vào đó, Service chủ động kiểm tra và trả về lỗi **có nghĩa** cho client, thay vì để DB ném lỗi khó hiểu.

---

## Phần 2 — API Quản Lý Phòng Chiếu (Room)

### URL Pattern — Nested Resource

```
Route: api/cinema/{cinemaId:int}/room
```

**Đây là Nested Route** — phòng chiếu nằm bên trong rạp.  
URL truyền đạt rõ quan hệ: "phòng này thuộc rạp nào".

### Danh sách Endpoints

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| `GET` | `/api/cinema/{cinemaId}/room` | Public | Lấy danh sách phòng của rạp |
| `GET` | `/api/cinema/{cinemaId}/room/detail/{id}` | Public | Chi tiết 1 phòng |
| `POST` | `/api/cinema/{cinemaId}/room` | Admin only | Tạo phòng mới |
| `PUT` | `/api/cinema/{cinemaId}/room/update/{id}` | Admin only | Cập nhật phòng |
| `DELETE` | `/api/cinema/{cinemaId}/room/delete/{id}` | Admin only | Xóa phòng |

### Điểm Quan Trọng Trong Logic Room

#### Create Room — Kiểm tra 2 cấp
```
① Rạp có tồn tại không? (cinemaId valid)
② Tên phòng có trùng trong CÙNG RẠP không?
   ExistsByNameInCinemaAsync(cinemaId, dto.Name)
   // Cho phép: "Phòng 1" ở rạp A và "Phòng 1" ở rạp B
   // Từ chối: 2 phòng cùng tên trong cùng 1 rạp
```

#### Delete Room — Kiểm tra 2 điều kiện
```
① room.Seats.Any() → "ROOM_HAS_SEATS"
   "Hãy xóa tất cả ghế trước."
② room.Showtimes.Any() → "ROOM_HAS_SHOWTIMES"
   "Không thể xóa phòng đang có lịch chiếu phim."
```

---

## Phần 3 — API Quản Lý Sơ Đồ Ghế (Seat) ⭐

**Đây là phần phức tạp và thú vị nhất.**

### URL Pattern — Nested 2 cấp

```
Route: api/cinema/{cinemaId:int}/room/{roomId:int}/seat
```

### Danh sách Endpoints

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| `GET` | `.../seat/layout` | Public | Lấy sơ đồ ghế của phòng |
| `POST` | `.../seat/generate` | Admin only | Tự động sinh ghế theo cấu hình |
| `DELETE` | `.../seat/clear` | Admin only | Xóa toàn bộ ghế (để cấu hình lại) |

---

### `GET .../seat/layout` — Lấy Sơ Đồ Ghế

```
→ SeatRepository.GetByRoomIdAsync(roomId)
   // ORDER BY RowName ASC, ColumnIndex ASC
   // Ghế được trả về có thứ tự: A1, A2, A3..., B1, B2...
→ TotalColumns = Max(ColumnIndex) trong tất cả ghế
← Trả về: RoomSeatLayoutDto {
     RoomId, RoomName,
     TotalColumns,   // Frontend dùng để tạo grid có đúng số cột
     Seats: [{ Id, RowName, SeatNumber, ColumnIndex, Type }]
  }
```

**Frontend nhận layout và dựng sơ đồ ghế như sau:**
```
TotalColumns = 11 (ví dụ: 9 ghế + 2 lối đi)
Grid = mảng 2D kích thước [TotalRows × TotalColumns]

Với mỗi Seat:
  grid[row][seat.ColumnIndex] = seat  → đặt ghế đúng vị trí vật lý
  Ô không có ghế (lối đi) → hiển thị trống
```

---

### `POST .../seat/generate` — Generate Sơ Đồ Ghế ⭐ Logic Quan Trọng

**Đây là tính năng tạo toàn bộ ghế tự động chỉ từ 1 request cấu hình.**

#### Request Body Ví Dụ
```json
{
  "totalColumns": 11,
  "aisleAtColumns": [4, 8],
  "rows": [
    { "rowName": "A", "type": "Standard" },
    { "rowName": "B", "type": "Standard" },
    { "rowName": "C", "type": "VIP" },
    { "rowName": "D", "type": "Couple" }
  ]
}
```

#### Kết quả Layout Trong Đầu

```
Col:  1    2    3   [4]   5    6    7   [8]   9   10   11
      ─── lối đi ở cột 4 ───        ─── lối đi ở cột 8 ───

A:   A1   A2   A3   [ ]  A4   A5   A6   [ ]  A7   A8   A9   (Standard)
B:   B1   B2   B3   [ ]  B4   B5   B6   [ ]  B7   B8   B9   (Standard)
C:   C1   C2   C3   [ ]  C4   C5   C6   [ ]  C7   C8   C9   (VIP)
D:   D1   D2   D3   [ ]  D4   D5   D6   [ ]  D7   D8   D9   (Couple)
```

#### Luồng Xử Lý Chi Tiết

```
SeatService.GenerateSeatsAsync(roomId, dto)

① Kiểm tra phòng tồn tại

② Bảo vệ: HasBookedTicketsInRoomAsync(roomId)
   → Nếu đã có vé đặt → throw "ROOM_HAS_BOOKED_TICKETS"
   // Không cho phép thay đổi sơ đồ khi đã có giao dịch

③ Validate tên hàng không trùng
   ["A", "B", "A"] → Lỗi: "Tên hàng bị trùng: A"

④ Validate AisleAtColumns nằm trong [1, TotalColumns]
   TotalColumns=11, aisle=[4, 15] → Lỗi: "cột 15 nằm ngoài phạm vi"

⑤ Xóa ghế cũ: DeleteAllByRoomIdAsync(roomId)

⑥ Tính cột thực sự có ghế:
   aisleSet = {4, 8}
   seatColumns = [1, 2, 3, 5, 6, 7, 9, 10, 11]  // bỏ cột lối đi

⑦ Sinh ghế theo vòng lặp:
   foreach (row in dto.Rows):
     seatNumber = 1
     foreach (colIndex in seatColumns):
       seats.Add(new Seat {
         RowName    = row.RowName,   // "A"
         SeatNumber = seatNumber++,  // 1, 2, 3...9  (liên tục, bỏ qua lối đi)
         ColumnIndex = colIndex,     // 1, 2, 3, 5, 6, 7, 9, 10, 11 (vị trí vật lý)
         Type = row.Type
       })

⑧ Bulk insert: SeatRepository.AddRangeAsync(seats)
   // EF Core batch insert — hiệu quả hơn insert từng cái

← Trả về: RoomSeatLayoutDto với tất cả ghế vừa tạo
```

---

### `DELETE .../seat/clear` — Xóa Toàn Bộ Ghế

```
① Kiểm tra phòng tồn tại
② Kiểm tra HasBookedTicketsInRoomAsync(roomId)
   → Nếu đã có vé → throw "ROOM_HAS_BOOKED_TICKETS"
③ DeleteAllByRoomIdAsync(roomId)
   → Lấy toàn bộ Seat của phòng → RemoveRange → SaveChanges
```

---

## Cơ Chế Xử Lý Lỗi — Pattern Nhất Quán

### `UserFriendlyException` — Lỗi Nghiệp Vụ

```csharp
throw new UserFriendlyException("Không tìm thấy rạp.", "CINEMA_NOT_FOUND");
//                               ↑ Message tiếng Việt    ↑ ErrorCode cho client
```

- Lỗi nghiệp vụ → `catch (UserFriendlyException)` → `400 BadRequest`
- Lỗi hệ thống → `catch (Exception)` → `500 InternalServerError`

### `ApiResponse<T>` — Wrapper Chuẩn

```json
// Thành công
{
  "success": true,
  "code": "CREATE_CINEMA_SUCCESS",
  "message": "Tạo rạp chiếu phim thành công",
  "data": { "id": 1, "name": "Sun Cinema Q1", ... }
}

// Thất bại
{
  "success": false,
  "code": "CINEMA_NAME_EXISTS",
  "message": "Tên rạp chiếu phim đã tồn tại.",
  "data": null
}
```

---

## Phân Quyền — `[Authorize(Policy = "AdminOnly")]`

| Loại API | Quyền truy cập |
|---|---|
| `GET` — đọc danh sách, chi tiết | **Public** — ai cũng xem được |
| `POST`, `PUT`, `DELETE` — ghi, sửa, xóa | **Admin Only** — phải có JWT token với role Admin |

---

## Tóm Tắt Các Điểm Thiết Kế Nổi Bật

| # | Điểm thiết kế | Lý do |
|---|---|---|
| 1 | **Nested URL** (`/cinema/{id}/room/{id}/seat`) | Truyền đạt rõ quan hệ phân cấp trong URL |
| 2 | **`AsNoTracking()`** trên query đọc | Tăng hiệu năng, bỏ overhead tracking EF Core |
| 3 | **`excludeId`** khi check trùng tên | Tránh false positive khi UPDATE giữ nguyên tên |
| 4 | **Guard clause trước khi xóa** | Xóa từ dưới lên (Seat → Room → Cinema), tránh vi phạm FK |
| 5 | **Generate ghế bằng thuật toán** | Admin chỉ cần nhập config, backend tự tính SeatNumber + ColumnIndex |
| 6 | **`HasBookedTicketsInRoomAsync`** | Bảo vệ tính toàn vẹn: không cho thay đổi sơ đồ ghế khi đã có giao dịch |
| 7 | **`AddRangeAsync` bulk insert** | Tạo hàng chục ghế 1 lần, EF Core batch vào 1 transaction |
| 8 | **2 DTO riêng** (`ListItemDto` vs `DetailDto`) | List cần nhẹ (ít field), Detail cần đầy đủ → tối ưu băng thông |
