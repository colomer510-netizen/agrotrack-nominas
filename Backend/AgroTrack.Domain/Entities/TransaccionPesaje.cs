namespace AgroTrack.Domain.Entities
{
    public class TransaccionPesaje
    {
        public int Id { get; set; }
        public int OperarioId { get; set; }
        public DateTime Fecha { get; set; }
        
        // TipoProceso: "Platano_Cascara", "Platano_Pelado", "Conteo_Unidades"
        public string TipoProceso { get; set; } = "Platano_Pelado";
        
        // ConteoBolsas: Para registrar las marcas de conteo rápido (ej. los checks o tallies)
        public int ConteoBolsas { get; set; }

        public decimal PesoBruto { get; set; }
        public decimal BolsasBase { get; set; }
        public decimal KilosExcedentes { get; set; }
        public decimal BolsasExtra { get; set; }
        public decimal TarifaAplicada { get; set; }
        public decimal TotalGanado { get; set; }

        public Operario? Operario { get; set; }
    }
}
