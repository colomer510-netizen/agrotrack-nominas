package com.agrotrack.app.domain.usecase

class CheckMaintenanceAlertUseCase {

    /**
     * Revisa si la máquina necesita mantenimiento basándose en los kilos 
     * acumulados desde la última limpieza.
     * 
     * @param accumulatedKilosSinceLastClean Kilos procesados desde la última vez.
     * @param thresholdKilos Umbral para disparar la alerta (ej. 15.0 para pruebas, 1000.0 en prod).
     * @return true si se requiere mantenimiento, false de lo contrario.
     */
    operator fun invoke(accumulatedKilosSinceLastClean: Double, thresholdKilos: Double = 15.0): Boolean {
        return accumulatedKilosSinceLastClean >= thresholdKilos
    }
}
