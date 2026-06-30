package com.agrotrack.app.domain.usecase

import com.agrotrack.app.data.local.entity.InventoryBinEntity

class GetNextBinForDispatchUseCase {

    /**
     * Aplica la regla WMS de FEFO (First Expired, First Out) y como respaldo FIFO
     * para recomendar el siguiente Bin que debería despacharse del cuarto frío.
     *
     * @param currentStorage Lista de bines actualmente en almacenamiento ("IN_STORAGE").
     * @return El Bin recomendado a despachar, o null si el cuarto está vacío.
     */
    operator fun invoke(currentStorage: List<InventoryBinEntity>): InventoryBinEntity? {
        if (currentStorage.isEmpty()) return null

        return currentStorage
            .sortedWith(
                compareBy<InventoryBinEntity> { it.expirationDate } // FEFO prioritario
                    .thenBy { it.dateEntered } // Si caducan el mismo día, sale el que entró primero (FIFO)
            )
            .firstOrNull()
    }
}
