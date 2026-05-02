using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class CinemaRepository : ICinemaRepository
    {
        private readonly AppDbContext _db;

        public CinemaRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET ALL
        // =============================================
        public async Task<IEnumerable<Cinema>> GetAllAsync()
        {
            return await _db.Cinemas
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<Cinema?> GetByIdAsync(int id)
        {
            return await _db.Cinemas
                .Include(c => c.Rooms)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        // =============================================
        // ADD
        // =============================================
        public async Task<Cinema> AddAsync(Cinema cinema)
        {
            _db.Cinemas.Add(cinema);
            await _db.SaveChangesAsync();
            return cinema;
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task UpdateAsync(Cinema cinema)
        {
            _db.Cinemas.Update(cinema);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(Cinema cinema)
        {
            _db.Cinemas.Remove(cinema);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // EXISTS BY NAME
        // excludeId: bỏ qua rạp hiện tại khi Update
        // =============================================
        public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null)
        {
            return await _db.Cinemas.AnyAsync(c =>
                c.Name == name && (excludeId == null || c.Id != excludeId));
        }
    }
}
