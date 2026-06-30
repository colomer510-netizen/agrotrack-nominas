package com.agrotrack.app.domain.usecase

import androidx.room.withTransaction
// Mocks for compilation simulation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// Estas interfaces estarían definidas en el proyecto
interface AppDatabase {
    suspend fun <R> withTransaction(block: suspend () -> R): R
}

interface CuotaDiariaDao {
    suspend fun getCuotaById(id: String): CuotaDiariaEntity?
    suspend fun updateMeta(id: String, nuevaMeta: Int)
}

data class CuotaDiariaEntity(
    val id: String,
    val productorId: String,
    val metaBolsas: Int,
    val bolsasCumplidas: Int
)

class ReassignQuotaUseCase(
    private val database: AppDatabase,
    private val cuotaDao: CuotaDiariaDao
) {
    /**
     * Transfiere una cantidad específica de bolsas de un productor (origen) a otro (destino).
     * Se ejecuta en una sola transacción en Room para garantizar la integridad ACID de la base local offline-first.
     */
    suspend operator fun invoke(
        origenCuotaId: String,
        destinoCuotaId: String,
        bolsasATransferir: Int
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            database.withTransaction {
                val origen = cuotaDao.getCuotaById(origenCuotaId) 
                    ?: throw IllegalArgumentException("Cuota origen no encontrada")
                val destino = cuotaDao.getCuotaById(destinoCuotaId)
                    ?: throw IllegalArgumentException("Cuota destino no encontrada")

                // Validamos que el origen tenga suficientes bolsas en su meta para transferir.
                if (origen.metaBolsas < bolsasATransferir) {
                    throw IllegalArgumentException("El origen no tiene suficientes bolsas en su meta para transferir")
                }

                val nuevaMetaOrigen = origen.metaBolsas - bolsasATransferir
                val nuevaMetaDestino = destino.metaBolsas + bolsasATransferir

                cuotaDao.updateMeta(origenCuotaId, nuevaMetaOrigen)
                cuotaDao.updateMeta(destinoCuotaId, nuevaMetaDestino)
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
