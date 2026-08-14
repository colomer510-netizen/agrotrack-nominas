// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

using AgroTrack.Domain.Entities;
using AgroTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OperariosController : ControllerBase
    {
        private readonly AgroTrackDbContext _context;

        public OperariosController(AgroTrackDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Operario>>> GetAll([FromQuery] string? procedencia)
        {
            var query = _context.Operarios.AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(procedencia))
            {
                query = query.Where(o => o.Procedencia.ToLower() == procedencia.ToLower());
            }

            return await query.OrderBy(o => o.Nombre).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Operario>> GetById(int id)
        {
            var operario = await _context.Operarios.FindAsync(id);
            if (operario == null) return NotFound();
            return operario;
        }

        [HttpPost]
        public async Task<ActionResult<Operario>> Create(Operario operario)
        {
            _context.Operarios.Add(operario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = operario.Id }, operario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Operario operario)
        {
            if (id != operario.Id) return BadRequest("ID mismatch");

            _context.Entry(operario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tieneTransacciones = await _context.TransaccionesPesaje
                .AnyAsync(t => t.OperarioId == id);
            
            if (tieneTransacciones)
            {
                return Conflict(new { 
                    error = "No se puede eliminar este trabajador porque tiene registros de pesaje vinculados." 
                });
            }

            var operario = await _context.Operarios.FindAsync(id);
            if (operario == null) return NotFound();

            _context.Operarios.Remove(operario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
