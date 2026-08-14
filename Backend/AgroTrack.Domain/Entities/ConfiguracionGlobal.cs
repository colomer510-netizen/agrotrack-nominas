// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

namespace AgroTrack.Domain.Entities
{
    /// <summary>
    /// Almacena parámetros globales del sistema como pares Clave-Valor.
    /// Ejemplos: PESO_BOLSA=23.0, TARIFA_BASE=15.0, MONEDA=C$
    /// </summary>
    public class ConfiguracionGlobal
    {
        public int Id { get; set; }

        /// <summary>Clave única de configuración (ej. "PESO_BOLSA", "TARIFA_BASE", "MONEDA")</summary>
        public string Clave { get; set; } = string.Empty;

        /// <summary>Valor almacenado como string para flexibilidad (parsear según uso)</summary>
        public string Valor { get; set; } = string.Empty;
    }
}
