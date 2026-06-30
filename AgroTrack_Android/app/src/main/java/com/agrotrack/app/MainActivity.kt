package com.agrotrack.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.agrotrack.app.presentation.dashboard.DashboardScreen
import com.agrotrack.app.ui.theme.AgroTrackTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgroTrackTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(navController = navController, startDestination = "dashboard") {
                        composable("dashboard") {
                            DashboardScreen(
                                onNavigateToAcopio = { navController.navigate("acopio") },
                                onNavigateToDestajo = { navController.navigate("destajo") },
                                onNavigateToCalidad = { navController.navigate("calidad") }
                            )
                        }
                        composable("acopio") {
                            com.agrotrack.app.presentation.acopio.AcopioScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable("destajo") {
                            com.agrotrack.app.presentation.destajo.DestajoScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable("calidad") {
                            com.agrotrack.app.presentation.cuartofrio.CuartoFrioScreen(
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
