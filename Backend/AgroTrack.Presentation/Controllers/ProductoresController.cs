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
    public class ProductoresController : ControllerBase
    {
        private readonly AgroTrackDbContext _context;

        public ProductoresController(AgroTrackDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Productor>>> GetAll()
        {
            return await _context.Productores.OrderBy(p => p.Nombre).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Productor>> GetById(int id)
        {
            var productor = await _context.Productores.FindAsync(id);
            if (productor == null) return NotFound();
            return productor;
        }

        [HttpPost]
        public async Task<ActionResult<Productor>> Create(Productor productor)
        {
            _context.Productores.Add(productor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = productor.Id }, productor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Productor productor)
        {
            if (id != productor.Id) return BadRequest("ID mismatch");

            _context.Entry(productor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Validación referencial: no eliminar si tiene transacciones
            var tieneTransacciones = await _context.TransaccionesPesaje
                .AnyAsync(t => t.ProductorId == id);
            
            if (tieneTransacciones)
            {
                return Conflict(new { 
                    error = "No se puede eliminar este productor porque tiene transacciones de pesaje vinculadas." 
                });
            }

            var productor = await _context.Productores.FindAsync(id);
            if (productor == null) return NotFound();

            _context.Productores.Remove(productor);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
