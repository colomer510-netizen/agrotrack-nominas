package com.agrotrack.app.presentation.acopio

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agrotrack.app.domain.usecase.CalculateBunchesEstimationUseCase
import com.agrotrack.app.ui.theme.EmeraldGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AcopioScreen(
    onNavigateBack: () -> Unit
) {
    var targetBags by remember { mutableStateOf("") }
    var estimatedBunches by remember { mutableStateOf<Int?>(null) }
    
    val calculateUseCase = remember { CalculateBunchesEstimationUseCase() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onNavigateBack, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Text("← Volver", color = MaterialTheme.colorScheme.onSurface)
            }
            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = "Módulo de Acopio",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary
            )
        }

        Spacer(modifier = Modifier.height(48.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "¿Cuántas bolsas se deben producir hoy?",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = targetBags,
                    onValueChange = { targetBags = it },
                    label = { Text("Meta de Bolsas (Ej: 1000)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedBorderColor = EmeraldGreen,
                        focusedLabelColor = EmeraldGreen
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        val bags = targetBags.toIntOrNull()
                        if (bags != null && bags > 0) {
                            estimatedBunches = calculateUseCase(bags)
                        } else {
                            estimatedBunches = 0
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen)
                ) {
                    Text("Calcular Estimación", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        if (estimatedBunches != null && estimatedBunches!! > 0) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f))
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "RACIMOS A CORTAR",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "$estimatedBunches",
                        style = MaterialTheme.typography.titleLarge.copy(fontSize = 72.sp, fontWeight = FontWeight.Black),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "(Usando factor 2.5 racimos/bolsa)",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // --- SECCIÓN: Trazabilidad de Mermas ---
        var totalReceived by remember { mutableStateOf("1000") } // Simulamos que recibimos 1000 kg
        var totalWaste by remember { mutableStateOf("0") }
        var showWasteDialog by remember { mutableStateOf(false) }
        val calculateYieldUseCase = remember { com.agrotrack.app.domain.usecase.CalculateYieldUseCase() }

        val currentYield = calculateYieldUseCase(
            totalReceivedKg = totalReceived.toDoubleOrNull() ?: 0.0,
            totalWasteKg = totalWaste.toDoubleOrNull() ?: 0.0
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Trazabilidad de Mermas",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Recibido")
                        Text("${totalReceived} kg", fontWeight = FontWeight.Bold)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Merma")
                        Text("${totalWaste} kg", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Rendimiento")
                        Text(
                            String.format("%.1f%%", currentYield), 
                            fontWeight = FontWeight.Black, 
                            color = if (currentYield >= 90) EmeraldGreen else MaterialTheme.colorScheme.error
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = { showWasteDialog = true },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Registrar Merma / Descarte")
                }
            }
        }

        if (showWasteDialog) {
            var wasteInput by remember { mutableStateOf("") }
            
            AlertDialog(
                onDismissRequest = { showWasteDialog = false },
                title = { Text("Registrar Merma") },
                text = {
                    Column {
                        Text("Ingrese los kilos a descartar y el motivo:")
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedTextField(
                            value = wasteInput,
                            onValueChange = { wasteInput = it },
                            label = { Text("Kilos (Ej. 15)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                        // Aquí iría un DropdownMenu para elegir "Hongos", "Daño mecánico", etc.
                    }
                },
                confirmButton = {
                    Button(onClick = { 
                        val newWaste = wasteInput.toDoubleOrNull() ?: 0.0
                        val current = totalWaste.toDoubleOrNull() ?: 0.0
                        totalWaste = (current + newWaste).toString()
                        showWasteDialog = false 
                    }) {
                        Text("Guardar")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showWasteDialog = false }) {
                        Text("Cancelar")
                    }
                }
            )
        }
    }
}
