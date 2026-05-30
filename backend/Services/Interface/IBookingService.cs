using backend.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services.Interface
{
    public interface IBookingService
    {
        Task<HoldBookingResponseDto> HoldSeatsAsync(string? userId, HoldBookingRequest request);
        Task<string> CheckAndExpireBookingAsync(int bookingId);
    }
}
