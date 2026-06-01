using backend.Data;
using backend.Dtos;
using backend.Exceptions;
using backend.Hubs;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services.Implements
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly PaymentService _paymentService;
        private readonly IHubContext<SeatHub> _hubContext;
        private readonly AppDbContext _db;

        public BookingService(
            IBookingRepository bookingRepository,
            PaymentService paymentService,
            IHubContext<SeatHub> hubContext,
            AppDbContext db)
        {
            _bookingRepository = bookingRepository;
            _paymentService = paymentService;
            _hubContext = hubContext;
            _db = db;
        }

        public async Task<HoldBookingResponseDto> HoldSeatsAsync(string? userId, HoldBookingRequest request)
        {
            if (string.IsNullOrEmpty(userId))
            {
                userId = await _bookingRepository.GetFirstUserIdAsync();
                if (string.IsNullOrEmpty(userId))
                    throw new UserFriendlyException("User không hợp lệ.", "INVALID_USER");
            }

            if (request.SeatIds == null || !request.SeatIds.Any())
                throw new UserFriendlyException("Chưa chọn ghế.", "NO_SEATS_SELECTED");

            var showtime = await _bookingRepository.GetShowtimeByIdAsync(request.ShowtimeId)
                ?? throw new UserFriendlyException("Không tìm thấy suất chiếu.", "SHOWTIME_NOT_FOUND");

            // Kiểm tra conflict ghế
            var conflictSeats = await _bookingRepository.GetConflictSeatsAsync(request.ShowtimeId, request.SeatIds);
            if (conflictSeats.Any())
            {
                // Truyền ConflictSeats thông qua Exception Data hoặc tạo custom Exception cho Conflict
                var ex = new UserFriendlyException("Ghế đã bị bán hoặc đang được người khác giữ.", "SEAT_CONFLICT");
                ex.Data["ConflictSeats"] = conflictSeats;
                throw ex;
            }

            var seats = await _bookingRepository.GetSeatsByIdsAsync(request.SeatIds);
            decimal seatsPrice = 0;
            
            foreach (var seat in seats)
            {
                decimal currentPrice = showtime.BasePrice;
                string type = seat.Type?.Trim().ToLower() ?? "";
                
                if (type == "vip")
                {
                    currentPrice += 20000;
                }
                else if (type == "couple" || type == "sweetbox" || type == "sweet box")
                {
                    currentPrice = (currentPrice + 20000) * 2 + 20000;
                }
                
                seatsPrice += currentPrice;
            }

            decimal foodTotal = Math.Max(request.FoodTotal, 0);
            decimal baseTotal = seatsPrice + foodTotal;
            var (voucher, discountAmount) = await ResolveVoucherDiscountAsync(request.VoucherCode, baseTotal);
            decimal totalPrice = Math.Round(Math.Max(baseTotal - discountAmount, 0), 0, MidpointRounding.AwayFromZero);

            using var transaction = await _bookingRepository.BeginTransactionAsync();
            try
            {
                var booking = new Booking
                {
                    UserId = userId,
                    ShowtimeId = request.ShowtimeId,
                    MovieTitle = showtime.Movie?.Title ?? "",
                    MoviePosterUrl = showtime.Movie?.ThumbnailPosterUrl ?? "",
                    MovieDuration = showtime.Movie?.Duration ?? 0,
                    MovieAgeRating = showtime.Movie?.AgeRestriction ?? "",
                    MovieGenres = showtime.Movie?.MovieGenre ?? "",
                    CinemaName = showtime.Room?.Cinema?.Name ?? "",
                    CinemaAddress = showtime.Room?.Cinema?.Address ?? "",
                    RoomName = showtime.Room?.Name ?? "",
                    ComboNames = foodTotal > 0 ? "Food & drink" : "",
                    ShowtimeStart = showtime.StartTime,
                    VoucherId = voucher?.Id,
                    BookingTime = DateTime.UtcNow,
                    TotalPrice = totalPrice,
                    Status = "Pending"
                };

                var tickets = seats.Select(seat => 
                {
                    decimal price = showtime.BasePrice;
                    string type = seat.Type?.Trim().ToLower() ?? "";
                    
                    if (type == "vip")
                    {
                        price += 20000;
                    }
                    else if (type == "couple" || type == "sweetbox" || type == "sweet box")
                    {
                        price = (price + 20000) * 2 + 20000;
                    }

                    string ticketCode = "TIX-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

                    return new Ticket
                    {
                        SeatId = seat.Id,
                        SeatName = $"{seat.RowName}{seat.SeatNumber}",
                        SeatType = seat.Type ?? "Standard",
                        Price = price,
                        TicketCode = ticketCode,
                        QrCodeUrl = null // Can be populated later by payment callback
                    };
                }).ToList();

                await _bookingRepository.CreateBookingWithTicketsAsync(booking, tickets);
                await transaction.CommitAsync();

                // Gọi Gateway tạo QR Code
                var qrUrl = await _paymentService.CreateOrderAndGetQrAsync(booking.Id.ToString(), (long)totalPrice);

                // Gửi event qua SignalR
                await _hubContext.Clients.Group($"Showtime_{request.ShowtimeId}").SendAsync("SeatLocked");

                return new HoldBookingResponseDto
                {
                    BookingId = booking.Id,
                    SeatTotal = seatsPrice,
                    FoodTotal = foodTotal,
                    DiscountAmount = discountAmount,
                    TotalPrice = totalPrice,
                    VoucherId = voucher?.Id,
                    VoucherCode = voucher?.Code,
                    QrUrl = qrUrl
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<(Voucher? Voucher, decimal DiscountAmount)> ResolveVoucherDiscountAsync(string? voucherCode, decimal orderTotal)
        {
            var normalizedCode = voucherCode?.Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(normalizedCode))
            {
                return (null, 0);
            }

            var voucher = await _db.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == normalizedCode);
            if (voucher == null)
            {
                throw new UserFriendlyException("Ma voucher khong ton tai.", "VOUCHER_NOT_FOUND");
            }

            var now = DateTime.UtcNow;
            if (!voucher.IsActive)
            {
                throw new UserFriendlyException("Voucher dang tam tat.", "VOUCHER_INACTIVE");
            }

            if (voucher.StartDate > now || voucher.EndDate < now)
            {
                throw new UserFriendlyException("Voucher chua den han hoac da het han.", "VOUCHER_EXPIRED");
            }

            if (voucher.UsedCount >= voucher.UsageLimit)
            {
                throw new UserFriendlyException("Voucher da het luot su dung.", "VOUCHER_USED_UP");
            }

            if (orderTotal < voucher.MinOrderValue)
            {
                throw new UserFriendlyException("Don hang chua dat gia tri toi thieu de dung voucher.", "VOUCHER_MIN_ORDER");
            }

            decimal discountAmount;
            switch ((voucher.DiscountType ?? string.Empty).Trim().ToLowerInvariant())
            {
                case "percentage":
                    discountAmount = orderTotal * voucher.DiscountValue / 100;
                    if (voucher.MaxDiscount.HasValue && voucher.MaxDiscount.Value > 0)
                    {
                        discountAmount = Math.Min(discountAmount, voucher.MaxDiscount.Value);
                    }
                    break;
                case "fixed":
                    discountAmount = voucher.DiscountValue;
                    break;
                default:
                    throw new UserFriendlyException("Loai voucher khong hop le.", "VOUCHER_INVALID_TYPE");
            }

            return (voucher, Math.Round(Math.Min(discountAmount, orderTotal), 0, MidpointRounding.AwayFromZero));
        }

        public async Task<string> CheckAndExpireBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetBookingByIdAsync(bookingId)
                ?? throw new UserFriendlyException("Không tìm thấy đơn hàng.", "BOOKING_NOT_FOUND");

            if (booking.Status == "Pending" && booking.BookingTime <= DateTime.UtcNow.AddMinutes(-10))
            {
                booking.Status = "Expired";
                await _bookingRepository.UpdateBookingAsync(booking);
                await _bookingRepository.DeleteTicketsByBookingIdAsync(booking.Id);
            }

            return booking.Status;
        }
    }
}
