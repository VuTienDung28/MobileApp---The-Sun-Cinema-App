using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories.Implements
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _db;

        public BookingRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<int>> GetConflictSeatsAsync(int showtimeId, List<int> seatIds, int pendingMinutesTolerance = 10)
        {
            var toleranceTime = DateTime.UtcNow.AddMinutes(-pendingMinutesTolerance);

            return await _db.Tickets
                .Include(t => t.Booking)
                .Where(t => seatIds.Contains(t.SeatId)
                            && t.Booking.ShowtimeId == showtimeId
                            && (t.Booking.Status == "Completed" ||
                               (t.Booking.Status == "Pending" && t.Booking.BookingTime > toleranceTime)))
                .Select(t => t.SeatId)
                .ToListAsync();
        }

        public async Task<Showtime?> GetShowtimeByIdAsync(int showtimeId)
        {
            return await _db.Showtimes.FindAsync(showtimeId);
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _db.Database.BeginTransactionAsync();
        }

        public async Task<Booking> CreateBookingWithTicketsAsync(Booking booking, List<Ticket> tickets)
        {
            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            foreach (var ticket in tickets)
            {
                ticket.BookingId = booking.Id;
            }

            _db.Tickets.AddRange(tickets);
            await _db.SaveChangesAsync();

            return booking;
        }

        public async Task<Booking?> GetBookingByIdAsync(int id)
        {
            return await _db.Bookings.FindAsync(id);
        }

        public async Task UpdateBookingAsync(Booking booking)
        {
            _db.Bookings.Update(booking);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteTicketsByBookingIdAsync(int bookingId)
        {
            var tickets = await _db.Tickets.Where(t => t.BookingId == bookingId).ToListAsync();
            _db.Tickets.RemoveRange(tickets);
            await _db.SaveChangesAsync();
        }

        public async Task<string?> GetFirstUserIdAsync()
        {
            return await _db.Users.Select(u => u.Id).FirstOrDefaultAsync();
        }
    }
}
