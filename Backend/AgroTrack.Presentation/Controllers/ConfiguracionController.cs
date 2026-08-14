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
    public class ConfiguracionController : ControllerBase
    {
        private readonly AgroTrackDbContext _context;

        public ConfiguracionController(AgroTrackDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConfiguracionGlobal>>> GetAll()
        {
            return await _context.ConfiguracionGlobal.OrderBy(c => c.Clave).ToListAsync();
        }

        [HttpGet("{clave}")]
        public async Task<ActionResult<ConfiguracionGlobal>> GetByClave(string clave)
        {
            var config = await _context.ConfiguracionGlobal
                .FirstOrDefaultAsync(c => c.Clave == clave);
            if (config == null) return NotFound();
            return config;
        }

        /// <summary>Actualización batch de configuraciones</summary>
        [HttpPut]
        public async Task<IActionResult> UpdateBatch([FromBody] List<ConfiguracionGlobal> configs)
        {
            foreach (var config in configs)
            {
                var existing = await _context.ConfiguracionGlobal
                    .FirstOrDefaultAsync(c => c.Clave == config.Clave);

                if (existing != null)
                {
                    existing.Valor = config.Valor;
                }
                else
                {
                    _context.ConfiguracionGlobal.Add(config);
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
