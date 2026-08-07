namespace AgroTrack.Domain.Entities
{
    public class ContenedorExportacion
    {
        public int Id { get; set; }
        public string NumeroContenedor { get; set; } = string.Empty;
        public string Destino { get; set; } = string.Empty;
        public DateTime FechaSalida { get; set; }
        
        // Relación simplificada para el ejemplo
        public ICollection<TransaccionPesaje> TransaccionesIncluidas { get; set; } = new List<TransaccionPesaje>();
    }
}
