package com.agrotrack.app.domain.usecase

data class PlantPaceResult(
    val kilosPerHour: Double,
    val isPaceGood: Boolean
)

class CalculatePlantPaceUseCase {

    /**
     * Calcula la velocidad de procesamiento de la planta.
     * 
     * @param totalKilosProcessed Total de kilos procesados hasta el momento.
     * @param elapsedHours Horas transcurridas del turno (ej. 4.5 horas).
     * @param targetKilosPerHour La meta de kilos por hora (ej. 800 Kg/hr).
     * @return El ritmo actual y si supera o iguala la meta.
     */
    operator fun invoke(
        totalKilosProcessed: Double,
        elapsedHours: Double,
        targetKilosPerHour: Double = 800.0
    ): PlantPaceResult {
        if (elapsedHours <= 0) return PlantPaceResult(0.0, false)

        val currentPace = totalKilosProcessed / elapsedHours
        val isPaceGood = currentPace >= targetKilosPerHour

        return PlantPaceResult(
            kilosPerHour = currentPace,
            isPaceGood = isPaceGood
        )
    }
}
