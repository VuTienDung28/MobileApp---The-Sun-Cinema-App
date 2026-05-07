using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services.Interface
{
    public interface ISeatService
    {
        /// <summary>
        /// Lấy sơ đồ ghế của một phòng chiếu.
        /// Trả về RoomSeatLayoutDto gồm TotalColumns và danh sách ghế để frontend dựng grid.
        /// </summary>
        Task<RoomSeatLayoutDto> GetLayoutByRoomIdAsync(int roomId);

        /// <summary>
        /// Generate (tạo hàng loạt) ghế cho một phòng chiếu theo cấu hình.
        /// Nếu phòng đã có ghế và chưa có vé nào được đặt → xóa hết rồi tạo lại.
        /// Nếu đã có vé được đặt → từ chối (throw exception).
        /// </summary>
        Task<RoomSeatLayoutDto> GenerateSeatsAsync(int roomId, GenerateSeatsDto dto);

        /// <summary>
        /// Xóa toàn bộ ghế của một phòng (Admin only).
        /// Từ chối nếu đã có vé được đặt.
        /// </summary>
        Task ClearSeatsAsync(int roomId);
    }
}
