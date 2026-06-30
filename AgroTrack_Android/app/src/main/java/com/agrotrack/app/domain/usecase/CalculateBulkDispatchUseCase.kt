package com.agrotrack.app.domain.usecase

/**
 * Entidad de dominio simple para devolver los resultados del despacho.
 */
data class DispatchCalculationResult(
    val fullBagsCount: Int,
    val remainderKilos: Double
)

class CalculateBulkDispatchUseCase {

    /**
     * Calcula cuántos sacos llenos se pueden armar y cuántos kilos sobran
     * para un pedido grande a granel.
     *
     * @param totalKilosRequested La cantidad total de kilos que el cliente pidió (ej. 1000kg).
     * @param kilosPerBag La capacidad de cada bolsa grande o bin (ej. 23kg).
     * @return [DispatchCalculationResult] con bolsas completas y kilos sobrantes.
     */
    operator fun invoke(totalKilosRequested: Double, kilosPerBag: Double): DispatchCalculationResult {
        require(totalKilosRequested > 0) { "El pedido debe ser mayor a cero." }
        require(kilosPerBag > 0) { "La capacidad por bolsa debe ser mayor a cero." }

        val fullBags = (totalKilosRequested / kilosPerBag).toInt()
        // Calcula el excedente usando la función módulo o resta
        val remainderKilos = totalKilosRequested - (fullBags * kilosPerBag)

        // Redondeamos el sobrante a 2 decimales para evitar problemas de coma flotante
        val roundedRemainder = Math.round(remainderKilos * 100.0) / 100.0

        return DispatchCalculationResult(
            fullBagsCount = fullBags,
            remainderKilos = roundedRemainder
        )
    }
}
