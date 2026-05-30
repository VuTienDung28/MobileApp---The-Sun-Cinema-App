using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface IVoucherRepository
    {
        /// <summary>Lấy toàn bộ danh sách voucher</summary>
        Task<IEnumerable<Voucher>> GetAllAsync();

        /// <summary>Lấy chi tiết voucher theo Id</summary>
        Task<Voucher?> GetByIdAsync(int id);

        /// <summary>Lấy chi tiết voucher theo mã code</summary>
        Task<Voucher?> GetByCodeAsync(string code);

        /// <summary>Thêm voucher mới vào DB</summary>
        Task<Voucher> AddAsync(Voucher voucher);

        /// <summary>Cập nhật thông tin voucher vào DB</summary>
        Task UpdateAsync(Voucher voucher);

        /// <summary>Xóa voucher khỏi DB</summary>
        Task DeleteAsync(Voucher voucher);

        /// <summary>Kiểm tra mã code voucher đã tồn tại chưa (dùng khi tạo / đổi mã)</summary>
        Task<bool> ExistsByCodeAsync(string code, int? excludeId = null);
    }
}
