package com.agrotrack.app.domain.usecase

class CalculatePieceworkSalaryUseCase {

    /**
     * Calcula el pago a destajo basado en los kilos netos pelados.
     * Soporta esquema de bonificación (Tarifa Diferencial) si se supera un umbral de kilos.
     *
     * @param totalNetKilos Cantidad total de kilos netos procesados por el operario.
     * @param baseRatePerKilo Tarifa plana base a pagar por cada kilo.
     * @param bonusThresholdKilos Cantidad de kilos a partir de los cuales aplica la tarifa premium.
     * @param premiumRatePerKilo Tarifa superior que se paga por cada kilo extra sobre el umbral.
     * @return El pago total calculado.
     */
    operator fun invoke(
        totalNetKilos: Double,
        baseRatePerKilo: Double = 0.50, // Ej. $0.50 por kilo base
        bonusThresholdKilos: Double? = null,
        premiumRatePerKilo: Double? = null
    ): Double {
        require(totalNetKilos >= 0) { "Los kilos no pueden ser negativos" }
        require(baseRatePerKilo >= 0) { "La tarifa no puede ser negativa" }

        // Si no hay reglas de bonos configuradas, es tarifa plana pura
        if (bonusThresholdKilos == null || premiumRatePerKilo == null || totalNetKilos <= bonusThresholdKilos) {
            return totalNetKilos * baseRatePerKilo
        }

        // Cálculo diferencial: 
        // Paga los primeros 'bonusThresholdKilos' a la tarifa base
        val basePay = bonusThresholdKilos * baseRatePerKilo
        
        // Paga el excedente a la tarifa premium
        val surplusKilos = totalNetKilos - bonusThresholdKilos
        val premiumPay = surplusKilos * premiumRatePerKilo

        return basePay + premiumPay
    }
}
