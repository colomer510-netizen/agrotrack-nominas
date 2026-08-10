using AgroTrack.Domain.Entities;
using AgroTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Application.Services
{
    public class CalculoNominaService
    {
        private readonly AgroTrackDbContext _context;

        public CalculoNominaService(AgroTrackDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene el peso de bolsa configurado dinámicamente desde la base de datos.
        /// </summary>
        private async Task<decimal> ObtenerPesoBolsaAsync()
        {
            var config = await _context.ConfiguracionGlobal
                .FirstOrDefaultAsync(c => c.Clave == "PESO_BOLSA");
            return decimal.TryParse(config?.Valor, out var peso) ? peso : 23.0m;
        }

        /// <summary>
        /// Obtiene la tarifa base configurada dinámicamente desde la base de datos.
        /// </summary>
        private async Task<decimal> ObtenerTarifaBaseAsync()
        {
            var config = await _context.ConfiguracionGlobal
                .FirstOrDefaultAsync(c => c.Clave == "TARIFA_BASE");
            return decimal.TryParse(config?.Valor, out var tarifa) ? tarifa : 15.0m;
        }

        /// <summary>
        /// Calcula la nómina basada en destajo y kilos excedentes.
        /// Lee PESO_BOLSA y TARIFA_BASE de la ConfiguracionGlobal.
        /// </summary>
        public async Task<TransaccionPesaje> CalcularPagoAsync(
            int bolsasCompletas,
            decimal kilosSueltos,
            int operarioId,
            int productorId)
        {
            decimal pesoBolsa = await ObtenerPesoBolsaAsync();
            decimal tarifaBase = await ObtenerTarifaBaseAsync();

            decimal kilosTotales = (bolsasCompletas * pesoBolsa) + kilosSueltos;
            decimal totalGanado = (kilosTotales / pesoBolsa) * tarifaBase;

            return new TransaccionPesaje
            {
                OperarioId = operarioId,
                ProductorId = productorId,
                Fecha = DateTime.UtcNow,
                TipoProceso = "Pelado",
                ConteoBolsas = bolsasCompletas,
                PesoBruto = kilosTotales,
                BolsasBase = bolsasCompletas,
                KilosExcedentes = kilosSueltos,
                BolsasExtra = 0,
                TarifaAplicada = tarifaBase,
                TotalGanado = Math.Round(totalGanado, 2),
                Estado = "Activo",
                Synced = 0
            };
        }

        /// <summary>
        /// Calcula la nómina síncrona con valores explícitos (para sync batch).
        /// </summary>
        public TransaccionPesaje CalcularPago(
            decimal pesoBolsa,
            decimal tarifaBase,
            int bolsasCompletas,
            decimal kilosSueltos,
            int operarioId,
            int productorId)
        {
            decimal kilosTotales = (bolsasCompletas * pesoBolsa) + kilosSueltos;
            decimal totalGanado = (kilosTotales / pesoBolsa) * tarifaBase;

            return new TransaccionPesaje
            {
                OperarioId = operarioId,
                ProductorId = productorId,
                Fecha = DateTime.UtcNow,
                TipoProceso = "Pelado",
                ConteoBolsas = bolsasCompletas,
                PesoBruto = kilosTotales,
                BolsasBase = bolsasCompletas,
                KilosExcedentes = kilosSueltos,
                BolsasExtra = 0,
                TarifaAplicada = tarifaBase,
                TotalGanado = Math.Round(totalGanado, 2),
                Estado = "Activo",
                Synced = 1
            };
        }
    }
}
