namespace AgroTrack.Domain.Entities
{
    public class TransaccionPesaje
    {
        public int Id { get; set; }
        public int OperarioId { get; set; }
        public int ProductorId { get; set; }
        public DateTime Fecha { get; set; }
        
        // TipoProceso: "Pelado", "Platano_Cascara", "Conteo_Unidades"
        public string TipoProceso { get; set; } = "Pelado";
        
        // ConteoBolsas: Las marcas de conteo rápido (checks/tallies)
        public int ConteoBolsas { get; set; }

        public decimal PesoBruto { get; set; }
        public decimal BolsasBase { get; set; }
        public decimal KilosExcedentes { get; set; }
        public decimal BolsasExtra { get; set; }
        public decimal TarifaAplicada { get; set; }
        public decimal TotalGanado { get; set; }

        /// <summary>Estado de la jornada: "Activo" (editable) o "Cerrado" (en historial)</summary>
        public string Estado { get; set; } = "Activo";

        /// <summary>Estado de sincronización: 0=Pendiente, 1=Sincronizado</summary>
        public int Synced { get; set; } = 0;

        // Navegación
        public Operario? Operario { get; set; }
        public Productor? Productor { get; set; }
    }
}
