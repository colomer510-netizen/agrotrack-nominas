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
            // Filtrar transacciones por el nombre del productor (ignorando mayúsculas/minúsculas si es posible, aunque EF lo maneja según collation)
            var transacciones = await _context.TransaccionesPesaje
                .Include(t => t.Operario)
                .Where(t => t.Operario != null && t.Operario.Productor.ToLower() == nombreProductor.ToLower())
                .ToListAsync();

            if (!transacciones.Any())
            {
                // Si no hay en DB, retornamos un mock para la demostración web
                transacciones = new List<TransaccionPesaje>
                {
                    new TransaccionPesaje { Operario = new Operario { Codigo = "S1", Nombre = "ROSMERI ESPINOZA", Productor = nombreProductor }, BolsasBase = 0, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 0 },
                    new TransaccionPesaje { Operario = new Operario { Codigo = "S3", Nombre = "MARIA MAG RODRIGUEZ", Productor = nombreProductor }, BolsasBase = 11, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 165 },
                    new TransaccionPesaje { Operario = new Operario { Codigo = "S8", Nombre = "CINDY RODRIGUEZ BALTODANO", Productor = nombreProductor }, BolsasBase = 13, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 195 },
                    new TransaccionPesaje { Operario = new Operario { Codigo = "S19", Nombre = "ROXANA ESPINOZA", Productor = nombreProductor }, BolsasBase = 28, KilosExcedentes = 0, BolsasExtra = 0, TotalGanado = 420 }
                };
            }

            // Agrupar por operario
            var agrupado = transacciones
                .GroupBy(t => t.Operario?.Codigo)
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
            string sheetName = nombreProductor.Length > 31 ? nombreProductor.Substring(0, 31) : nombreProductor;
            var worksheet = workbook.Worksheets.Add(sheetName);

            // Estilos generales
            worksheet.Style.Font.FontName = "Arial";
            worksheet.Style.Font.FontSize = 11;

            // Fila 1 y 2: Cabecera
            worksheet.Cell(1, 1).Value = $"Productor: {nombreProductor}";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 14;

            worksheet.Cell(2, 1).Value = $"Total de Bolsas del Productor: {Math.Round(totalBolsasGlobal, 2)}";
            worksheet.Cell(2, 1).Style.Font.Bold = true;

            // Fila 4: Cabeceras de la tabla
            worksheet.Cell(4, 1).Value = "Código de Persona";
            worksheet.Cell(4, 2).Value = "Nombre del Trabajador";
            worksheet.Cell(4, 3).Value = "Bolsas Peladas";
            worksheet.Cell(4, 4).Value = "Kilos Excedentes";
            worksheet.Cell(4, 5).Value = "Total a Pagar (C$)";

            var headerRange = worksheet.Range("A4:E4");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

            // Llenado de datos desde fila 5
            int row = 5;
            foreach (var item in agrupado)
            {
                worksheet.Cell(row, 1).Value = item.Codigo;
                worksheet.Cell(row, 2).Value = item.Nombre;
                worksheet.Cell(row, 3).Value = item.BolsasTotales;
                worksheet.Cell(row, 4).Value = item.KilosExcedentes;
                worksheet.Cell(row, 5).Value = item.TotalPagar;
                
                // Formato de moneda para la última columna
                worksheet.Cell(row, 5).Style.NumberFormat.Format = "C$ #,##0.00";
                
                row++;
            }

            // Autoajustar columnas
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Reporte_{nombreProductor.Replace(" ", "_")}.xlsx");
        }
    }
}
