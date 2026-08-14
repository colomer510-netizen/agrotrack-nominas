// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using AgroTrack.Domain.Entities;
using AgroTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly AgroTrackDbContext _context;

        public ReportesController(AgroTrackDbContext context)
        {
            _context = context;
        }

        [HttpGet("productor/{nombreProductor}/excel")]
        public async Task<IActionResult> ExportarProductorExcel(string nombreProductor)
        {
            // Filtrar transacciones por el nombre del productor
            var transacciones = await _context.TransaccionesPesaje
                .Include(t => t.Operario)
                .Include(t => t.Productor)
                .Where(t => t.Productor != null && t.Productor.Nombre.ToLower() == nombreProductor.ToLower())
                .ToListAsync();

            if (!transacciones.Any())
            {
                // Si no hay en DB, retornamos un mock para la demostración web
                transacciones = new List<TransaccionPesaje>
                {
                    new TransaccionPesaje { Operario = new Operario { CodigoInterno = "S1", Nombre = "ROSMERI ESPINOZA" }, Productor = new Productor { Nombre = nombreProductor }, BolsasBase = 0, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 0 },
                    new TransaccionPesaje { Operario = new Operario { CodigoInterno = "S3", Nombre = "MARIA MAG RODRIGUEZ" }, Productor = new Productor { Nombre = nombreProductor }, BolsasBase = 11, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 165 },
                    new TransaccionPesaje { Operario = new Operario { CodigoInterno = "S8", Nombre = "CINDY RODRIGUEZ BALTODANO" }, Productor = new Productor { Nombre = nombreProductor }, BolsasBase = 13, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 195 },
                    new TransaccionPesaje { Operario = new Operario { CodigoInterno = "S19", Nombre = "ROXANA ESPINOZA" }, Productor = new Productor { Nombre = nombreProductor }, BolsasBase = 28, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 420 }
                };
            }

            // Agrupar por operario
            var agrupado = transacciones
                .GroupBy(t => t.Operario?.CodigoInterno)
                .Select(g => new
                {
                    Codigo = g.Key,
                    Nombre = g.First().Operario?.Nombre,
                    BolsasTotales = g.Sum(x => x.BolsasBase + x.BolsasExtra),
                    KilosExcedentes = g.Sum(x => x.KilosExcedentes),
                    TotalPagar = g.Sum(x => x.TotalGanado)
                })
                .ToList();

            var totalBolsasGlobal = agrupado.Sum(x => x.BolsasTotales);

            using var workbook = new XLWorkbook();
            // Nombre de la hoja (validando longitud por limitación de Excel de 31 caracteres)
