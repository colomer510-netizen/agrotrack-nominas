package com.agrotrack.app.presentation.cuartofrio

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agrotrack.app.ui.theme.EmeraldGreen
import com.agrotrack.app.ui.theme.WarningYellow
import com.agrotrack.app.ui.theme.ErrorRed
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

// Modelo mock para visualizar la UI mientras se conecta Room
data class MockBin(val lotCode: String, val dateEntered: LocalDate, val expirationDate: LocalDate, val weightKg: Double)

@Composable
fun CuartoFrioScreen(
    onNavigateBack: () -> Unit
) {
    // Datos simulados (Mock) para demostrar el UI FEFO
    val today = LocalDate.now()
    val bins = listOf(
        MockBin("LOT-A01", today.minusDays(5), today.minusDays(1), 500.0), // Vencido
        MockBin("LOT-A02", today.minusDays(2), today.plusDays(2), 450.0),  // Próximo a vencer
        MockBin("LOT-A03", today, today.plusDays(4), 520.0)                // Normal
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
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
                text = "Cuarto Frío (WMS)",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Inventario FEFO (Primero en Caducar, Primero en Salir)",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(bins) { bin ->
                BinCard(bin = bin, today = today)
            }
        }
    }
}

@Composable
fun BinCard(bin: MockBin, today: LocalDate) {
    val daysUntilExp = ChronoUnit.DAYS.between(today, bin.expirationDate)
    
    val (statusColor, statusText) = when {
        daysUntilExp < 0 -> Pair(ErrorRed, "VENCIDO")
        daysUntilExp in 0..2 -> Pair(WarningYellow, "PRÓXIMO")
        else -> Pair(EmeraldGreen, "ÓPTIMO")
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Indicador de color
            Box(
                modifier = Modifier
                    .width(8.dp)
                    .height(60.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(statusColor)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = bin.lotCode,
                    style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Peso: ${bin.weightKg} kg",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = statusText,
                    style = MaterialTheme.typography.labelMedium,
                    color = statusColor,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Exp: ${bin.expirationDate.format(DateTimeFormatter.ofPattern("dd MMM"))}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}
