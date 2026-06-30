package com.agrotrack.app.presentation.destajo

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.agrotrack.app.ui.theme.EmeraldGreen
import com.agrotrack.app.ui.theme.WarningYellow

@Composable
fun DestajoScreen(
    onNavigateBack: () -> Unit,
    viewModel: DestajoViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header con botón de volver y estado del operario
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(onClick = onNavigateBack, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Text("← Volver", color = MaterialTheme.colorScheme.onSurface)
            }
            Text(
                text = "Estación 1",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Tarjeta de Identificación del Operario
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = uiState.operarioName,
                    style = MaterialTheme.typography.titleLarge.copy(fontSize = 28.sp),
                    color = if (uiState.isLinked) EmeraldGreen else WarningYellow,
                    textAlign = TextAlign.Center
                )
                if (uiState.isLinked) {
                    Text(
                        text = "ID: ${uiState.operarioId}",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }

        if (uiState.isLowSupplies) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
            ) {
                Text(
                    text = "⚠️ ALERTA: Nivel bajo de Insumos (Quedan < 50 bolsas)",
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(16.dp),
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Display de Báscula (Kilos)
        Text(
            text = "KILOS PELADOS",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
        )
        Text(
            text = String.format("%.2f", uiState.accumulatedKilos) + " Kg",
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 72.sp, fontWeight = FontWeight.Black),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(vertical = 16.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Display de Pago Acumulado
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(EmeraldGreen.copy(alpha = 0.1f))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "GANANCIA DEL TURNO",
                    style = MaterialTheme.typography.labelMedium,
                    color = EmeraldGreen
                )
                Text(
                    text = "$ " + String.format("%.2f", uiState.currentSessionEarnings),
                    style = MaterialTheme.typography.titleLarge.copy(fontSize = 48.sp),
                    color = EmeraldGreen
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Controles de Simulación (Para pruebas sin hardware)
        Divider(color = MaterialTheme.colorScheme.surface, modifier = Modifier.padding(vertical = 16.dp))
        Text("Panel de Simulación (Temporal)", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Button(
                onClick = { viewModel.processBarcodeScan("10992") },
                enabled = !uiState.isLinked
            ) {
                Text("Escanear Gafete")
            }
            Button(
                onClick = { viewModel.addNetWeight(5.2) },
                enabled = uiState.isLinked,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
            ) {
                Text("Pesar +5.2 Kg")
            }
        }
        if (uiState.isLinked) {
            TextButton(onClick = { viewModel.unlinkWorker() }, modifier = Modifier.padding(top = 8.dp)) {
                Text("Desvincular Operario", color = Color.Red)
            }
        }

        if (uiState.showBpmDialog) {
            BpmCheckDialog(
                onApprove = { hairnet, gloves, boots ->
                    viewModel.submitBpmCheck(hairnet, gloves, boots)
                },
                onCancel = { viewModel.cancelBpmCheck() }
            )
        }

        if (uiState.requiresMaintenance) {
            AlertDialog(
                onDismissRequest = { /* Bloqueante, no se puede cerrar tocando fuera */ },
                title = { 
                    Text("⚠️ MANTENIMIENTO OBLIGATORIO", color = MaterialTheme.colorScheme.error)
                },
                text = {
                    Text("Se ha alcanzado el límite de kilos. Limpie la balanza y calibre antes de continuar pesando.")
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.registerMaintenanceDone() },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                    ) {
                        Text("Confirmar Limpieza/Calibración")
                    }
                }
            )
        }
    }
}

@Composable
fun BpmCheckDialog(
    onApprove: (Boolean, Boolean, Boolean) -> Unit,
    onCancel: () -> Unit
) {
    var hasHairnet by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    var hasGloves by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    var hasBoots by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onCancel,
        title = { Text("Control de Higiene (BPM)") },
        text = {
            Column {
                Text("Verifique los siguientes elementos antes de permitir el ingreso a la línea:", style = MaterialTheme.typography.bodyLarge)
                Spacer(modifier = Modifier.height(16.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = hasHairnet, onCheckedChange = { hasHairnet = it })
                    Text("Redecilla (Cabello cubierto)")
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = hasGloves, onCheckedChange = { hasGloves = it })
                    Text("Guantes limpios")
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = hasBoots, onCheckedChange = { hasBoots = it })
                    Text("Botas higienizadas")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onApprove(hasHairnet, hasGloves, hasBoots) },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
            ) {
                Text("Validar e Iniciar")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text("Cancelar", color = Color.Gray)
            }
        }
    )
}
