package com.agrotrack.app.domain.usecase

class CalculateNetWeightUseCase {

    /**
     * Calcula el peso neto a partir del peso bruto y la tara.
     * 
     * @param grossWeight Peso bruto registrado (ej. incluyendo caja o contenedor).
     * @param tareWeight Peso de la tara (contenedor vacío).
     * @return El peso neto calculado.
     * @throws IllegalArgumentException si el peso bruto es menor a la tara o si hay valores negativos.
     */
    operator fun invoke(grossWeight: Double, tareWeight: Double): Double {
        require(grossWeight >= 0.0) { "El peso bruto no puede ser negativo." }
        require(tareWeight >= 0.0) { "La tara no puede ser negativa." }
        require(grossWeight >= tareWeight) { "El peso bruto ($grossWeight) no puede ser menor a la tara ($tareWeight)." }
        
        return grossWeight - tareWeight
    }
}
