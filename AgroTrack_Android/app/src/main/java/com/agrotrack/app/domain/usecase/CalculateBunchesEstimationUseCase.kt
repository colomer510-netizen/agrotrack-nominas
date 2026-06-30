package com.agrotrack.app.domain.usecase

import kotlin.math.ceil

class CalculateBunchesEstimationUseCase {

    /**
     * Calcula la cantidad estimada de racimos a cortar en base a la meta de bolsas.
     * 
     * @param targetBags La cantidad de bolsas que se tiene como meta.
     * @param bunchesPerBag El factor de conversión de cuántos racimos rinden para una bolsa.
     *                      Por defecto es 2.5, pero puede ser inyectado desde configuración.
     * @return El número entero de racimos a cortar (redondeado hacia arriba para asegurar no quedar cortos).
     */
    operator fun invoke(targetBags: Int, bunchesPerBag: Double = 2.5): Int {
        require(targetBags >= 0) { "La meta de bolsas no puede ser negativa." }
        require(bunchesPerBag > 0) { "El factor de racimos por bolsa debe ser mayor a cero." }
        
        val estimatedBunches = targetBags * bunchesPerBag
        return ceil(estimatedBunches).toInt()
    }
}
