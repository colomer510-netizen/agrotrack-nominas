namespace AgroTrack.Domain.Entities
{
    /// <summary>
    /// Registro inmutable del Ledger de Trazabilidad (FSMA 204).
    /// Patrón Append-Only: estos registros NUNCA se modifican ni eliminan.
    /// </summary>
    public class LedgerTrazabilidad
    {
        /// <summary>Identificador único inmutable (UUID)</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Traceability Lot Code — Código de lote para trazabilidad FDA</summary>
        public string TLC { get; set; } = string.Empty;

        /// <summary>
        /// Tipo de Evento Crítico de Seguimiento (CTE):
        /// "Recepcion", "Transformacion", "Empaque", "Envio", "Rechazo"
        /// </summary>
        public string EventoTipo { get; set; } = string.Empty;

        /// <summary>Key Data Elements almacenados como JSON para flexibilidad</summary>
        public string KDEs { get; set; } = "{}";

        /// <summary>Descripción legible del evento</summary>
        public string Descripcion { get; set; } = string.Empty;

        /// <summary>Usuario/operario que registró el evento</summary>
        public string RegistradoPor { get; set; } = string.Empty;

        /// <summary>Timestamp UTC inmutable del momento del registro</summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Relaciones opcionales para vincular con transacciones existentes
        public int? TransaccionPesajeId { get; set; }
        public TransaccionPesaje? TransaccionPesaje { get; set; }

        public int? ContenedorExportacionId { get; set; }
        public ContenedorExportacion? ContenedorExportacion { get; set; }
    }
}
