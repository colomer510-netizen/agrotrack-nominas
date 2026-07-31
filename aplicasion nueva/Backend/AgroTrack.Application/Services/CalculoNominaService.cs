using AgroTrack.Domain.Entities;

namespace AgroTrack.Application.Services
{
    public class CalculoNominaService
    {
        private const decimal PESO_BOLSA_BASE = 23.0m;
        
        /// <summary>
        /// Calcula la nómina basada en destajo y kilos excedentes.
        /// MONEDA: Córdobas Nicaragüenses (C$)
        /// </summary>
        public TransaccionPesaje CalcularPago(decimal pesoRegistrado, decimal tarifaBaseCordobas, int operarioId)
        {
            decimal bolsasBase = Math.Floor(pesoRegistrado / PESO_BOLSA_BASE);
            decimal kilosExcedentes = pesoRegistrado % PESO_BOLSA_BASE;
            
            // Lógica de destajo: Los kilos extra se dividen entre 23 para la "Bolsa Equivalente"
            decimal bolsasExtra = kilosExcedentes / PESO_BOLSA_BASE;
            decimal totalBolsas = bolsasBase + bolsasExtra;
            
            decimal totalGanado = totalBolsas * tarifaBaseCordobas;

            return new TransaccionPesaje
            {
                OperarioId = operarioId,
                Fecha = DateTime.UtcNow,
                PesoBruto = pesoRegistrado,
                BolsasBase = bolsasBase,
                KilosExcedentes = kilosExcedentes,
                BolsasExtra = bolsasExtra,
                TarifaAplicada = tarifaBaseCordobas,
                TotalGanado = Math.Round(totalGanado, 2)
            };
        }
    }
}
