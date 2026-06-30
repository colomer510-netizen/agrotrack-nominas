package com.agrotrack.app.domain.usecase

data class SupplyConsumptionResult(
    val bagsConsumed: Double,
    val labelsConsumed: Double,
    val isBagsCritical: Boolean,
    val isLabelsCritical: Boolean
)

class ConsumeSuppliesUseCase {

    /**
     * Calcula el consumo de bolsas y etiquetas basado en los kilos netos procesados
     * y evalúa si el stock simulado ha caído por debajo de un nivel crítico.
     * 
     * @param netKilos Kilos pelados en esta transacción.
     * @param kilosPerBag Capacidad de una bolsa de vacío (ej. 23.0 kg).
     * @param currentBagsStock Stock actual de bolsas en inventario.
     * @param currentLabelsStock Stock actual de etiquetas en inventario.
     */
    operator fun invoke(
        netKilos: Double,
        kilosPerBag: Double,
        currentBagsStock: Double,
        currentLabelsStock: Double
    ): SupplyConsumptionResult {
        require(netKilos > 0) { "Los kilos deben ser positivos" }
        require(kilosPerBag > 0) { "La capacidad de bolsa debe ser positiva" }

        // Si procesamos 5 kg y la bolsa es de 23 kg, gastamos 5/23 = 0.217 bolsas
        val bagsConsumed = netKilos / kilosPerBag
        
        // Asumimos 1 etiqueta por cada bolsa entera o fracción
        val labelsConsumed = bagsConsumed 

        val remainingBags = currentBagsStock - bagsConsumed
        val remainingLabels = currentLabelsStock - labelsConsumed

        // Umbrales críticos simulados (ej. pedir a bodega si quedan menos de 50)
        val isBagsCritical = remainingBags < 50.0
        val isLabelsCritical = remainingLabels < 50.0

        return SupplyConsumptionResult(
            bagsConsumed = bagsConsumed,
            labelsConsumed = labelsConsumed,
            isBagsCritical = isBagsCritical,
            isLabelsCritical = isLabelsCritical
        )
    }
}
