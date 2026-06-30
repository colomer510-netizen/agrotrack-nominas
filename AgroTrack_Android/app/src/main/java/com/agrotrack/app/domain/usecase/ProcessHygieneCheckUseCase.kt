package com.agrotrack.app.domain.usecase

import com.agrotrack.app.data.local.entity.BpmLogEntity

class ProcessHygieneCheckUseCase {

    /**
     * Procesa la revisión de higiene del operario.
     * Genera la entidad que debe guardarse en la base de datos (auditoría).
     * 
     * @return un Pair, el primer valor es la entidad a guardar y el segundo
     * es un booleano indicando si el operario aprobó la revisión.
     */
    operator fun invoke(
        operarioId: String,
        hasHairnet: Boolean,
        hasGloves: Boolean,
        hasCleanBoots: Boolean
    ): Pair<BpmLogEntity, Boolean> {
        
        val isApproved = hasHairnet && hasGloves && hasCleanBoots
        
        val logEntity = BpmLogEntity(
            operarioId = operarioId,
            timestamp = System.currentTimeMillis(),
            hasHairnet = hasHairnet,
            hasGloves = hasGloves,
            hasCleanBoots = hasCleanBoots,
            isApproved = isApproved
        )
        
        return Pair(logEntity, isApproved)
    }
}
