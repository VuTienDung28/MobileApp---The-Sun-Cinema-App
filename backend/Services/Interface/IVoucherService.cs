using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services.Interface
{
    public interface IVoucherService
    {
        Task<IEnumerable<VoucherDto>> GetAllVouchersAsync();
        Task<VoucherDto?> GetVoucherByIdAsync(int id);
        Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto voucherDto);
        Task<VoucherDto?> UpdateVoucherAsync(int id, CreateVoucherDto voucherDto);
        Task<bool> DeleteVoucherAsync(int id);
        Task<VoucherDto?> ToggleVoucherStatusAsync(int id);
    }
}
