using backend.Models;
using Microsoft.EntityFrameworkCore.Storage;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repositories.Interface
{
    public interface IBookingRepository
    {
        Task<List<int>> GetConflictSeatsAsync(int showtimeId, List<int> seatIds, int pendingMinutesTolerance = 10);
        Task<Showtime?> GetShowtimeByIdAsync(int showtimeId);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<Booking> CreateBookingWithTicketsAsync(Booking booking, List<Ticket> tickets);
        Task<Booking?> GetBookingByIdAsync(int id);
        Task UpdateBookingAsync(Booking booking);
        Task DeleteTicketsByBookingIdAsync(int bookingId);
        Task<string?> GetFirstUserIdAsync();
    }
}
