package com.agrotrack.app.presentation.destajo

import androidx.lifecycle.ViewModel
import com.agrotrack.app.domain.usecase.CalculatePieceworkSalaryUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

import com.agrotrack.app.domain.usecase.ProcessHygieneCheckUseCase
import com.agrotrack.app.domain.usecase.ConsumeSuppliesUseCase
import com.agrotrack.app.domain.usecase.CheckMaintenanceAlertUseCase

/**
 * Estado UI de la estación de destajo.
 */
data class DestajoUiState(
    val operarioId: String? = null,
    val operarioName: String = "Escanee su código para iniciar",
    val accumulatedKilos: Double = 0.0,
    val currentSessionEarnings: Double = 0.0,
    val isLinked: Boolean = false,
    val showBpmDialog: Boolean = false,
    val pendingWorkerId: String? = null,
    
    // Insumos simulados
    val simulatedBagsStock: Double = 60.0,
    val simulatedLabelsStock: Double = 60.0,
    val isLowSupplies: Boolean = false,
    
    // Mantenimiento
    val accumulatedKilosSinceClean: Double = 0.0,
    val requiresMaintenance: Boolean = false
)

class DestajoViewModel(
    private val calculatePieceworkSalaryUseCase: CalculatePieceworkSalaryUseCase = CalculatePieceworkSalaryUseCase(),
    private val processHygieneCheckUseCase: ProcessHygieneCheckUseCase = ProcessHygieneCheckUseCase(),
    private val consumeSuppliesUseCase: ConsumeSuppliesUseCase = ConsumeSuppliesUseCase(),
    private val checkMaintenanceAlertUseCase: CheckMaintenanceAlertUseCase = CheckMaintenanceAlertUseCase()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DestajoUiState())
    val uiState: StateFlow<DestajoUiState> = _uiState.asStateFlow()

    fun processBarcodeScan(barcode: String) {
        val cleanBarcode = barcode.trim()
        if (cleanBarcode.isEmpty()) return

        if (cleanBarcode.length > 4) {
            _uiState.update { 
                it.copy(
                    showBpmDialog = true,
                    pendingWorkerId = cleanBarcode
                )
            }
        }
    }

    fun submitBpmCheck(hasHairnet: Boolean, hasGloves: Boolean, hasCleanBoots: Boolean) {
        val workerId = _uiState.value.pendingWorkerId ?: return
        
        val (logEntity, isApproved) = processHygieneCheckUseCase(
            operarioId = workerId,
            hasHairnet = hasHairnet,
            hasGloves = hasGloves,
            hasCleanBoots = hasCleanBoots
        )
        
        if (isApproved) {
            linkWorkerToStation(workerId = workerId, workerName = "Operario $workerId")
        } else {
            _uiState.update { 
                it.copy(
                    showBpmDialog = false,
                    pendingWorkerId = null,
                    operarioName = "Rechazado: Incumple Higiene"
                )
            }
        }
    }

    fun cancelBpmCheck() {
        _uiState.update { 
            it.copy(showBpmDialog = false, pendingWorkerId = null)
        }
    }

    private fun linkWorkerToStation(workerId: String, workerName: String) {
        _uiState.update { state ->
            state.copy(
                operarioId = workerId,
                operarioName = workerName,
                isLinked = true,
                showBpmDialog = false,
                pendingWorkerId = null,
                accumulatedKilos = 0.0,
                currentSessionEarnings = 0.0
            )
        }
    }

    fun addNetWeight(netKilos: Double) {
        if (!_uiState.value.isLinked || _uiState.value.requiresMaintenance) return

        _uiState.update { state ->
            val newAccumulated = state.accumulatedKilos + netKilos
            val newEarnings = calculatePieceworkSalaryUseCase(
                totalNetKilos = newAccumulated,
                baseRatePerKilo = 0.50,
                bonusThresholdKilos = 100.0,
                premiumRatePerKilo = 0.70
            )
            
            val supplyResult = consumeSuppliesUseCase(
                netKilos = netKilos,
                kilosPerBag = 23.0,
                currentBagsStock = state.simulatedBagsStock,
                currentLabelsStock = state.simulatedLabelsStock
            )
            
            val newBagsStock = state.simulatedBagsStock - supplyResult.bagsConsumed
            val newLabelsStock = state.simulatedLabelsStock - supplyResult.labelsConsumed

            val newAccumulatedSinceClean = state.accumulatedKilosSinceClean + netKilos
            // Usamos 15kg como umbral para poder probarlo rápido
            val needsClean = checkMaintenanceAlertUseCase(newAccumulatedSinceClean, thresholdKilos = 15.0)

            state.copy(
                accumulatedKilos = newAccumulated,
                currentSessionEarnings = newEarnings,
                simulatedBagsStock = newBagsStock,
                simulatedLabelsStock = newLabelsStock,
                isLowSupplies = supplyResult.isBagsCritical || supplyResult.isLabelsCritical,
                accumulatedKilosSinceClean = newAccumulatedSinceClean,
                requiresMaintenance = needsClean
            )
        }
    }

    fun registerMaintenanceDone() {
        _uiState.update { state ->
            state.copy(
                accumulatedKilosSinceClean = 0.0,
                requiresMaintenance = false
            )
        }
    }

    fun unlinkWorker() {
        _uiState.update { 
            DestajoUiState(
                simulatedBagsStock = it.simulatedBagsStock,
                simulatedLabelsStock = it.simulatedLabelsStock,
                isLowSupplies = it.isLowSupplies,
                accumulatedKilosSinceClean = it.accumulatedKilosSinceClean,
                requiresMaintenance = it.requiresMaintenance
            ) 
        }
    }
}
