using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class VoucherRepository : IVoucherRepository
    {
        private readonly AppDbContext _db;

        public VoucherRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET ALL
        // =============================================
        public async Task<IEnumerable<Voucher>> GetAllAsync()
        {
            return await _db.Vouchers
                .AsNoTracking()
                .OrderByDescending(v => v.Id)
                .ToListAsync();
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<Voucher?> GetByIdAsync(int id)
        {
            return await _db.Vouchers.FindAsync(id);
        }

        // =============================================
        // GET BY CODE
        // =============================================
        public async Task<Voucher?> GetByCodeAsync(string code)
        {
            return await _db.Vouchers
                .FirstOrDefaultAsync(v => v.Code.ToLower() == code.ToLower());
        }

        // =============================================
        // ADD
        // =============================================
        public async Task<Voucher> AddAsync(Voucher voucher)
        {
            _db.Vouchers.Add(voucher);
            await _db.SaveChangesAsync();
            return voucher;
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task UpdateAsync(Voucher voucher)
        {
            _db.Vouchers.Update(voucher);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(Voucher voucher)
        {
            _db.Vouchers.Remove(voucher);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // EXISTS BY CODE
        // excludeId: bỏ qua voucher hiện tại khi Update
        // =============================================
        public async Task<bool> ExistsByCodeAsync(string code, int? excludeId = null)
        {
            return await _db.Vouchers.AnyAsync(v =>
                v.Code.ToLower() == code.ToLower() && (excludeId == null || v.Id != excludeId));
        }
    }
}
