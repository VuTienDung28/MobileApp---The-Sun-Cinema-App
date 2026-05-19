using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services.Interface;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VoucherController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVouchers()
        {
            var vouchers = await _voucherService.GetAllVouchersAsync();
            return Ok(vouchers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            var voucher = await _voucherService.GetVoucherByIdAsync(id);
            if (voucher == null)
            {
                return NotFound(new { message = "Voucher không tồn tại" });
            }
            return Ok(voucher);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto voucherDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newVoucher = await _voucherService.CreateVoucherAsync(voucherDto);
                return CreatedAtAction(nameof(GetVoucherById), new { id = newVoucher.Id }, newVoucher);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] CreateVoucherDto voucherDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedVoucher = await _voucherService.UpdateVoucherAsync(id, voucherDto);
                if (updatedVoucher == null)
                {
                    return NotFound(new { message = "Voucher không tồn tại" });
                }
                return Ok(updatedVoucher);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var result = await _voucherService.DeleteVoucherAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Voucher không tồn tại" });
            }
            return Ok(new { message = "Xóa voucher thành công" });
        }

        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleVoucherStatus(int id)
        {
            var updatedVoucher = await _voucherService.ToggleVoucherStatusAsync(id);
            if (updatedVoucher == null)
            {
                return NotFound(new { message = "Voucher không tồn tại" });
            }
            return Ok(updatedVoucher);
        }
    }
}
