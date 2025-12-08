package com.example.ejemplo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.example.ejemplo.data.SessionManager
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.Constraints
import java.util.concurrent.TimeUnit
import androidx.work.*



class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val workRequest = PeriodicWorkRequestBuilder<NotificationWorker>(15, TimeUnit.MINUTES)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED) // Solo si hay internet
                    .build()
            )
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "NoticiasBackgroundWork",
            ExistingPeriodicWorkPolicy.KEEP, // Si ya existe, no lo reinicia
            workRequest
        )
        val session = SessionManager(this)

        setContent {
            // Controla qué pantalla se muestra
            var currentScreen by remember {
                mutableStateOf(if (session.fetchAuthToken() != null) "home" else "login")
            }

            // Controla en qué pestaña del menú inferior inicia el Home (0=Inicio, 3=Config)
            var homeStartTab by remember { mutableIntStateOf(0) }

            when (currentScreen) {
                // 1. PANTALLA LOGIN
                "login" -> {
                    LoginScreen(
                        onLoginSuccess = { token, name ->
                            session.saveAuthToken(token, name)
                            homeStartTab = 0
                            currentScreen = "home"
                        }
                    )
                }

                // 2. PANTALLA PRINCIPAL (HOME)
                "home" -> {
                    HomeScreen(
                        initialTab = homeStartTab,
                        onLogout = {
                            session.clearSession()
                            currentScreen = "login"
                        },
                        onNavigateToReport = {
                            homeStartTab = 0
                            currentScreen = "reporte"
                        },
                        onNavigateToHistory = {
                            homeStartTab = 3
                            currentScreen = "historial"
                        },
                        onNavigateToAlerts = {
                            homeStartTab = 3
                            currentScreen = "mis_alertas"
                        },
                        onNavigateToSettings = {
                            homeStartTab = 3
                            currentScreen = "configuracion"
                        },
                        onNavigateToSupport = {
                            homeStartTab = 3
                            currentScreen = "soporte"
                        },
                        // AQUI ESTABA EL ERROR: FALTABA ESTA LÍNEA
                        onNavigateToProfile = {
                            homeStartTab = 3 // Mantenemos seleccionada la pestaña de config
                            currentScreen = "user_profile"
                        }
                    )
                }

                // 3. PANTALLAS SECUNDARIAS
                "reporte" -> {
                    ReportScreen(onBack = { currentScreen = "home" })
                }

                "historial" -> {
                    MyReportsScreen(onBack = { currentScreen = "home" })
                }

                "mis_alertas" -> {
                    MyAlertsScreen(onBack = { currentScreen = "home" })
                }

                "soporte" -> {
                    SupportScreen(onBack = { currentScreen = "home" })
                }

                "configuracion" -> {
                    SettingsScreen(onBack = { currentScreen = "home" })
                }

                "user_profile" -> {
                    UserProfileScreen(onBack = { currentScreen = "home" })
                }
            }
        }
    }

    private fun iniciarMonitoreoBackground() {
        // Restricciones: Solo si hay internet
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        // Tarea periódica: Cada 15 minutos (mínimo de Android)
        val workRequest = PeriodicWorkRequestBuilder<NotificationWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build()

        // Encolar tarea (KEEP asegura que no se duplique si ya existe)
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "MonitoreoNoticias",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }
}