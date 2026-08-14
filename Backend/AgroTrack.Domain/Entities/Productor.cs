// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

namespace AgroTrack.Domain.Entities
{
    /// <summary>
    /// Representa un productor/finca que provee plátano a la planta.
    /// Cada transacción de pesaje se vincula a un productor.
    /// </summary>
    public class Productor
    {
        public int Id { get; set; }

        /// <summary>Código único del productor (ej. "PROD-1", "CAR-1")</summary>
        public string Codigo { get; set; } = string.Empty;

        /// <summary>Nombre del productor o finca (ej. "Finca El Carmen")</summary>
        public string Nombre { get; set; } = string.Empty;

        // Navegación: Un productor tiene muchas transacciones de pesaje
        public ICollection<TransaccionPesaje> Transacciones { get; set; } = new List<TransaccionPesaje>();
    }
}
