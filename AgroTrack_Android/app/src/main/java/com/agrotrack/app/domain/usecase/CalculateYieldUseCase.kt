package com.agrotrack.app.domain.usecase

class CalculateYieldUseCase {

    /**
     * Calcula el porcentaje de rendimiento de un lote.
     * 
     * @param totalReceivedKg Total de kilos de fruta recibidos en acopio.
     * @param totalWasteKg Total de kilos descartados (merma).
     * @return El porcentaje de rendimiento (ej. 92.5 para 92.5%).
     *         Retorna 0.0 si los datos son inválidos o received <= 0.
     */
    operator fun invoke(totalReceivedKg: Double, totalWasteKg: Double): Double {
        if (totalReceivedKg <= 0.0) return 0.0
        if (totalWasteKg < 0.0) return 0.0
        
        // Si el desperdicio es mayor a lo recibido (error de usuario), devuelve 0
        if (totalWasteKg > totalReceivedKg) return 0.0

        val goodKg = totalReceivedKg - totalWasteKg
        return (goodKg / totalReceivedKg) * 100.0
    }
}
