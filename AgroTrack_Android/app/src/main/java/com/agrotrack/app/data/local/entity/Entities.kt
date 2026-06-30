package com.agrotrack.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index
import java.util.UUID

@Entity(tableName = "productor")
data class ProductorEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val nombre: String,
    val procedencia: String, // ej. "Aguacate", "La Villa"
    val esComodin: Boolean = false
)

@Entity(
    tableName = "cuota_diaria",
    foreignKeys = [
        ForeignKey(
            entity = ProductorEntity::class,
            parentColumns = ["id"],
            childColumns = ["productorId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("productorId")]
)
data class CuotaDiariaEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val productorId: String,
    val fecha: Long, // Timestamp
    val metaBolsas: Int,
    val bolsasCumplidas: Int = 0
)

@Entity(tableName = "pesaje_destajo_operarios")
data class PesajeDestajoEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val loteId: String, // Para trazabilidad (TLC)
    val operarioId: String, // Referencia al trabajador
    val timestamp: Long = System.currentTimeMillis(),
    val pesoBruto: Double,
    val tara: Double,
    val kilosNetos: Double,
    val estadoSincronizacion: String = "PENDING" // PENDING, SYNCED, ERROR
)

@Entity(tableName = "ledger_trazabilidad")
data class LedgerTrazabilidadEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val tlc: String, // Traceability Lot Code
    val eventType: String, // ej. "RECEIVING", "PACKING", "SHIPPING" (CTE)
    val timestamp: Long = System.currentTimeMillis(),
    val previousHash: String, // Para inmutabilidad tipo blockchain
    val currentHash: String,
    val kdePayload: String // JSON con Key Data Elements
)

@Entity(tableName = "bitacora_quimica")
data class BitacoraQuimicaEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val tinaId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val phNivel: Double,
    val concentracionAcido: Double, // ppm
    val temperaturaAgua: Double, // Celsius
    val operarioId: String,
    val estadoSincronizacion: String = "PENDING"
)

@Entity(tableName = "inventory_bin")
data class InventoryBinEntity(
    @PrimaryKey val binId: String,
    val dateEntered: Long,      // Timestamp de ingreso
    val expirationDate: Long,   // Timestamp de caducidad calculada
    val weightKg: Double,
    val locationZone: String
)

@Entity(tableName = "bpm_log")
data class BpmLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val operarioId: String,
    val timestamp: Long,
    val hasHairnet: Boolean,
    val hasGloves: Boolean,
    val hasCleanBoots: Boolean,
    val isApproved: Boolean // True si todo es true
)

@Entity(tableName = "supply_inventory")
data class SupplyInventoryEntity(
    @PrimaryKey val itemId: String, // Ej: "BOLSAS_VACIO", "ETIQUETAS"
    val itemName: String,
    val quantityInStock: Double, // Permite decimales para bolsas parcialmente consumidas
    val reorderThreshold: Double // Nivel crítico para alertas
)

@Entity(tableName = "waste_log")
data class WasteLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val producerId: String, // Productor o Lote
    val reason: String,     // Ej: "Daño Mecánico", "Hongos", "Maduración"
    val wasteWeightKg: Double,
    val timestamp: Long
)

@Entity(tableName = "maintenance_log")
data class MaintenanceLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val machineId: String,
    val maintenanceType: String, // "LIMPIEZA", "CALIBRACION"
    val timestamp: Long,
    val performedByOperatorId: String
)
