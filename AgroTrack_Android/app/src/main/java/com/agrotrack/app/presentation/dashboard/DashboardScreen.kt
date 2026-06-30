package com.agrotrack.app.presentation.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import androidx.compose.runtime.*
import com.agrotrack.app.ui.theme.EmeraldGreen
import com.agrotrack.app.domain.usecase.CalculatePlantPaceUseCase

@Composable
fun DashboardScreen(
    onNavigateToAcopio: () -> Unit,
    onNavigateToDestajo: () -> Unit,
    onNavigateToCalidad: () -> Unit
) {
    var simulatedTotalKilos by remember { mutableStateOf(3500.0) }
    var simulatedElapsedHours by remember { mutableStateOf(4.0) } // A mitad de turno
    val calculatePaceUseCase = remember { CalculatePlantPaceUseCase() }
    
    val paceResult = calculatePaceUseCase(
        totalKilosProcessed = simulatedTotalKilos,
        elapsedHours = simulatedElapsedHours,
        targetKilosPerHour = 800.0
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp)
    ) {
        Text(
            text = "AgroTrack",
            style = MaterialTheme.typography.titleLarge.copy(fontSize = 32.sp),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 8.dp, top = 24.dp)
        )
        Text(
            text = "Bienvenido, Seleccione un módulo para iniciar",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // --- WIDGET RITMO DE PLANTA ---
        Card(
            modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (paceResult.isPaceGood) EmeraldGreen.copy(alpha = 0.2f) 
                                 else MaterialTheme.colorScheme.errorContainer
            )
        ) {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Ritmo de Producción", style = MaterialTheme.typography.titleMedium)
                    Text("Meta: 800 Kg/hr", style = MaterialTheme.typography.bodyMedium)
                }
                Text(
                    text = String.format("%.0f Kg/hr", paceResult.kilosPerHour),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = if (paceResult.isPaceGood) EmeraldGreen else MaterialTheme.colorScheme.error
                )
            }
        }
        // ------------------------------

        val modifierCard = Modifier
            .fillMaxWidth()
            .weight(1f)
            .padding(vertical = 8.dp)

        DashboardCard(
            title = "Módulo de Acopio",
            subtitle = "Estimaciones y Pesos",
            icon = "🍌",
            modifier = modifierCard,
            onClick = onNavigateToAcopio
        )

        DashboardCard(
            title = "Estación de Destajo",
            subtitle = "Vinculación y Pagos",
            icon = "⚖️",
            modifier = modifierCard,
            onClick = onNavigateToDestajo
        )

        DashboardCard(
            title = "Control de Calidad",
            subtitle = "WMS, FEFO y Bitácoras",
            icon = "❄️",
            modifier = modifierCard,
            onClick = onNavigateToCalidad
        )
    }
}

@Composable
fun DashboardCard(
    title: String,
    subtitle: String,
    icon: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = icon,
                fontSize = 40.sp,
                modifier = Modifier.padding(end = 24.dp)
            )
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }
    }
}
