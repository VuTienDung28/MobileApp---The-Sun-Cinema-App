using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class SeatHub : Hub
    {
        // Khi client mở một suất chiếu, họ sẽ join vào group mang tên ID suất chiếu đó
        public async Task JoinShowtimeGroup(string showtimeId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Showtime_{showtimeId}");
        }

        // Khi client rời màn hình chọn ghế
        public async Task LeaveShowtimeGroup(string showtimeId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Showtime_{showtimeId}");
        }
    }
}
