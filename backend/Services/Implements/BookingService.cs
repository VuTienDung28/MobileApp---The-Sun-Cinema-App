using backend.Dtos;
using backend.Exceptions;
using backend.Hubs;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.SignalR;
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

        public BookingService(
            IBookingRepository bookingRepository,
            PaymentService paymentService,
            IHubContext<SeatHub> hubContext)
        {
            _bookingRepository = bookingRepository;
            _paymentService = paymentService;
            _hubContext = hubContext;
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

            decimal totalPrice = showtime.BasePrice * request.SeatIds.Count;

            using var transaction = await _bookingRepository.BeginTransactionAsync();
            try
            {
                var booking = new Booking
                {
                    UserId = userId,
                    ShowtimeId = request.ShowtimeId,
                    BookingTime = DateTime.UtcNow,
                    TotalPrice = totalPrice,
                    Status = "Pending"
                };

                var tickets = request.SeatIds.Select(seatId => new Ticket
                {
                    SeatId = seatId,
                    Price = showtime.BasePrice
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
                    TotalPrice = totalPrice,
                    QrUrl = qrUrl
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
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
