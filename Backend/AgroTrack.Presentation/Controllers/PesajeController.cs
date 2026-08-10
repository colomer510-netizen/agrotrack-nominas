using AgroTrack.Domain.Entities;
using AgroTrack.Infrastructure.Data;
using AgroTrack.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PesajeController : ControllerBase
    {
        private readonly AgroTrackDbContext _context;
        private readonly CalculoNominaService _nominaService;

        public PesajeController(AgroTrackDbContext context, CalculoNominaService nominaService)
        {
            _context = context;
            _nominaService = nominaService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransaccionPesaje>>> GetAll(
            [FromQuery] int? productorId,
            [FromQuery] string? fecha,
            [FromQuery] string? estado)
        {
            var query = _context.TransaccionesPesaje
                .Include(t => t.Operario)
                .Include(t => t.Productor)
                .AsQueryable();

            if (productorId.HasValue)
                query = query.Where(t => t.ProductorId == productorId.Value);
            
            if (!string.IsNullOrWhiteSpace(fecha) && DateTime.TryParse(fecha, out var fechaParsed))
                query = query.Where(t => t.Fecha.Date == fechaParsed.Date);
            
            if (!string.IsNullOrWhiteSpace(estado))
                query = query.Where(t => t.Estado == estado);

            return await query.OrderByDescending(t => t.Fecha).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TransaccionPesaje>> Create([FromBody] PesajeRequest request)
        {
            var transaccion = await _nominaService.CalcularPagoAsync(
                request.BolsasCompletas,
                request.KilosSueltos,
                request.OperarioId,
                request.ProductorId
            );

            _context.TransaccionesPesaje.Add(transaccion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = transaccion.Id }, transaccion);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TransaccionPesaje transaccion)
        {
            if (id != transaccion.Id) return BadRequest("ID mismatch");

            var existing = await _context.TransaccionesPesaje.FindAsync(id);
            if (existing == null) return NotFound();
            if (existing.Estado == "Cerrado") 
                return Conflict(new { error = "No se puede modificar una transacción cerrada." });

            _context.Entry(existing).CurrentValues.SetValues(transaccion);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var transaccion = await _context.TransaccionesPesaje.FindAsync(id);
            if (transaccion == null) return NotFound();
            if (transaccion.Estado == "Cerrado")
                return Conflict(new { error = "No se puede eliminar una transacción cerrada." });

            _context.TransaccionesPesaje.Remove(transaccion);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Cierre masivo de jornada por productor</summary>
        [HttpPost("cerrar-jornada")]
        public async Task<IActionResult> CerrarJornada([FromBody] CerrarJornadaRequest request)
        {
            var transacciones = await _context.TransaccionesPesaje
                .Where(t => t.ProductorId == request.ProductorId && t.Estado == "Activo")
                .ToListAsync();

            if (!transacciones.Any())
                return NotFound(new { error = "No hay transacciones activas para este productor." });

            foreach (var t in transacciones)
            {
                t.Estado = "Cerrado";
            }

            await _context.SaveChangesAsync();
            return Ok(new { cerradas = transacciones.Count });
        }

        /// <summary>Endpoint de sincronización batch desde el frontend</summary>
        [HttpPost("sync")]
        public async Task<ActionResult<SyncResponse>> Sync([FromBody] List<TransaccionPesaje> transacciones)
        {
            int creadas = 0;
            int actualizadas = 0;
            var errores = new List<string>();

            foreach (var t in transacciones)
            {
                try
                {
                    t.Synced = 1;
                    
                    if (t.Id == 0)
                    {
                        _context.TransaccionesPesaje.Add(t);
                        creadas++;
                    }
                    else
                    {
                        var existing = await _context.TransaccionesPesaje.FindAsync(t.Id);
                        if (existing != null)
                        {
                            _context.Entry(existing).CurrentValues.SetValues(t);
                            actualizadas++;
                        }
                        else
                        {
                            _context.TransaccionesPesaje.Add(t);
                            creadas++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    errores.Add($"Error en transacción ID={t.Id}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new SyncResponse
            {
                Creadas = creadas,
                Actualizadas = actualizadas,
                Errores = errores
            });
        }
    }

    // ── DTOs ──
    public class PesajeRequest
    {
        public int OperarioId { get; set; }
        public int ProductorId { get; set; }
        public int BolsasCompletas { get; set; }
        public decimal KilosSueltos { get; set; }
    }

    public class CerrarJornadaRequest
    {
        public int ProductorId { get; set; }
    }

    public class SyncResponse
    {
        public int Creadas { get; set; }
        public int Actualizadas { get; set; }
        public List<string> Errores { get; set; } = new();
    }
}
