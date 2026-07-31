namespace AgroTrack.Domain.Entities
{
    public class Operario
    {
        public int Id { get; set; }
        
        // El código interno pintado en la tabla (ej. "S 1", "SL 4")
        public string CodigoInterno { get; set; } = string.Empty;
        
        // Procedencia para agruparlos (ej. "SANCHEZ 1", "SANCHEZ 2")
        public string Procedencia { get; set; } = string.Empty;
        
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Productor { get; set; } = string.Empty;
        
        public ICollection<TransaccionPesaje> Transacciones { get; set; } = new List<TransaccionPesaje>();
    }
}
