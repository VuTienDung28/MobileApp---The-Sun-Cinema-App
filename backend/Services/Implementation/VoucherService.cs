using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interface;

namespace backend.Services.Implementation
{
    public class VoucherService : IVoucherService
    {
        private readonly AppDbContext _context;

        public VoucherService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VoucherDto>> GetAllVouchersAsync()
        {
            var vouchers = await _context.Vouchers.ToListAsync();
            await DeactivateUsedUpVouchersAsync(vouchers);
            return vouchers.Select(MapToDto);
        }

        public async Task<VoucherDto?> GetVoucherByIdAsync(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return null;

            await DeactivateUsedUpVouchersAsync(new[] { voucher });
            return MapToDto(voucher);
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto voucherDto)
        {
            var exists = await _context.Vouchers.AnyAsync(v => v.Code.ToLower() == voucherDto.Code.ToLower());
            if (exists)
            {
                throw new Exception("Mã voucher đã tồn tại");
            }

            var voucher = new Voucher
            {
                Code = voucherDto.Code.ToUpper(),
                Description = voucherDto.Description,
                DiscountType = voucherDto.DiscountType,
                DiscountValue = voucherDto.DiscountValue,
                MinOrderValue = voucherDto.MinOrderValue,
                MaxDiscount = voucherDto.MaxDiscount,
                StartDate = voucherDto.StartDate,
                EndDate = voucherDto.EndDate,
                UsageLimit = voucherDto.UsageLimit,
                UsedCount = 0,
                IsActive = true
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return MapToDto(voucher);
        }

        public async Task<VoucherDto?> UpdateVoucherAsync(int id, CreateVoucherDto voucherDto)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return null;

            if (voucher.Code.ToLower() != voucherDto.Code.ToLower())
            {
                var exists = await _context.Vouchers.AnyAsync(v => v.Code.ToLower() == voucherDto.Code.ToLower());
                if (exists)
                {
                    throw new Exception("Mã voucher đã tồn tại");
                }
            }

            voucher.Code = voucherDto.Code.ToUpper();
            voucher.Description = voucherDto.Description;
            voucher.DiscountType = voucherDto.DiscountType;
            voucher.DiscountValue = voucherDto.DiscountValue;
            voucher.MinOrderValue = voucherDto.MinOrderValue;
            voucher.MaxDiscount = voucherDto.MaxDiscount;
            voucher.StartDate = voucherDto.StartDate;
            voucher.EndDate = voucherDto.EndDate;
            voucher.UsageLimit = voucherDto.UsageLimit;
            if (voucher.UsedCount >= voucher.UsageLimit)
            {
                voucher.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return MapToDto(voucher);
        }

        public async Task<bool> DeleteVoucherAsync(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return false;

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<VoucherDto?> ToggleVoucherStatusAsync(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return null;

            voucher.IsActive = !voucher.IsActive;
            if (voucher.UsedCount >= voucher.UsageLimit)
            {
                voucher.IsActive = false;
            }
            await _context.SaveChangesAsync();
            
            return MapToDto(voucher);
        }

        private async Task DeactivateUsedUpVouchersAsync(IEnumerable<Voucher> vouchers)
        {
            var hasChanges = false;

            foreach (var voucher in vouchers)
            {
                if (voucher.IsActive && voucher.UsedCount >= voucher.UsageLimit)
                {
                    voucher.IsActive = false;
                    hasChanges = true;
                }
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }
        }

        private static VoucherDto MapToDto(Voucher voucher)
        {
            return new VoucherDto
            {
                Id = voucher.Id,
                Code = voucher.Code,
                Description = voucher.Description,
                DiscountType = voucher.DiscountType,
                DiscountValue = voucher.DiscountValue,
                MinOrderValue = voucher.MinOrderValue,
                MaxDiscount = voucher.MaxDiscount,
                StartDate = voucher.StartDate,
                EndDate = voucher.EndDate,
                UsageLimit = voucher.UsageLimit,
                UsedCount = voucher.UsedCount,
                IsActive = voucher.IsActive
            };
        }
    }
}
