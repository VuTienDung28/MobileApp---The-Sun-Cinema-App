using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services.Interface
{
    public interface IRoomService
    {
        /// <summary>Lấy danh sách phòng chiếu của một rạp</summary>
        Task<IEnumerable<RoomDetailDto>> GetByCinemaIdAsync(int cinemaId);

        /// <summary>Lấy chi tiết một phòng chiếu theo Id</summary>
        Task<RoomDetailDto> GetByIdAsync(int id);

        /// <summary>Tạo phòng chiếu mới trong một rạp</summary>
        Task<RoomDetailDto> CreateAsync(int cinemaId, CreateRoomDto dto);

        /// <summary>Cập nhật tên phòng chiếu</summary>
        Task<RoomDetailDto> UpdateAsync(int id, UpdateRoomDto dto);

        /// <summary>Xóa phòng chiếu (từ chối nếu đang có ghế hoặc suất chiếu)</summary>
        Task DeleteAsync(int id);
    }
}
