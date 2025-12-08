package com.example.ejemplo

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.ejemplo.components.NoInternetScreen // <--- IMPORTANTE
import com.example.ejemplo.utils.NetworkUtils      // <--- IMPORTANTE
import com.example.ejemplo.utils.VibrationUtils
import com.example.ejemplo.data.AlertaRequest
import com.example.ejemplo.data.Noticia
import com.example.ejemplo.data.RetrofitClient
import com.example.ejemplo.data.SessionManager
import com.example.ejemplo.data.SettingsManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    initialTab: Int = 0,
    onLogout: () -> Unit,
    onNavigateToReport: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToAlerts: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToSupport: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val DarkBlue = Color(0xFF1A2B46)
    val context = LocalContext.current

    // Gestores
    val settingsManager = remember { SettingsManager(context) }
    val notificationHelper = remember { NotificationHelper(context) }

    // Estados de Navegación
    var selectedTab by remember { mutableIntStateOf(initialTab) }
    var activeCategory by remember { mutableStateOf<String?>(null) }
    var noticiaSeleccionada by remember { mutableStateOf<Noticia?>(null) }
    var showExitDialog by remember { mutableStateOf(false) }

    // Solicitud de Permiso (Android 13+)
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { }

    // Pedir permiso al inicio
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    // --- MONITOREO INTELIGENTE (POR ID) ---
    LaunchedEffect(Unit) {
        while(true) {
            try {
                // Solo intentar si hay red para no saturar logs
                if (NetworkUtils.isNetworkAvailable(context)) {
                    val session = SessionManager(context)
                    val token = session.fetchAuthToken()

                    if (token != null) {
                        val noticias = RetrofitClient.api.obtenerNoticias("Bearer $token")

                        if (noticias.isNotEmpty()) {
                            val ultimaNoticiaServer = noticias.first()
                            val ultimoIdGuardado = settingsManager.leerUltimoIdNoticia()

                            if (ultimoIdGuardado == 0) {
                                settingsManager.guardarUltimoIdNoticia(ultimaNoticiaServer.id)
                            }
                            else if (ultimaNoticiaServer.id > ultimoIdGuardado) {
                                settingsManager.guardarUltimoIdNoticia(ultimaNoticiaServer.id)
                                if (settingsManager.leerNotificaciones()) {
                                    notificationHelper.mostrarNotificacion(
                                        "Nueva Publicación",
                                        ultimaNoticiaServer.titulo
                                    )
                                }
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            delay(10000)
        }
    }

    BackHandler(enabled = true) {
        when {
            noticiaSeleccionada != null -> noticiaSeleccionada = null
            activeCategory != null -> activeCategory = null
            selectedTab != 0 -> selectedTab = 0
            else -> showExitDialog = true
        }
    }

    if (noticiaSeleccionada != null) {
        NoticiaDetailScreen(noticia = noticiaSeleccionada!!, onBack = { noticiaSeleccionada = null })
        return
    }
    if (activeCategory == "ruta_evacuacion") {
        EvacuationScreen(onBack = { activeCategory = null })
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val titulo = when {
                        activeCategory != null -> when(activeCategory) {
                            "protocolo" -> "Protocolos"
                            "noticia" -> "Plan Estudiantil"
                            "mochila" -> "Mochila de Emergencia"
                            "ruta_evacuacion" -> "Rutas de Evacuación"
                            else -> "Información"
                        }
                        selectedTab == 1 -> "Recomendaciones"
                        selectedTab == 2 -> "Alertas"
                        selectedTab == 3 -> "Configuración"
                        else -> "Inicio"
                    }
                    Text(titulo, color = Color.White, fontWeight = FontWeight.Bold)
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkBlue)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, null) },
                    label = { Text("Inicio", fontSize = 10.sp) },
                    selected = selectedTab == 0 && activeCategory == null,
                    onClick = { selectedTab = 0; activeCategory = null }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.WorkspacePremium, null) },
                    label = { Text("Recom.", fontSize = 10.sp) },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1; activeCategory = null }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Warning, null) },
                    label = { Text("Alertas", fontSize = 10.sp) },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2; activeCategory = null }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Settings, null) },
                    label = { Text("Config.", fontSize = 10.sp) },
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3; activeCategory = null }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize().background(Color(0xFFF5F5F5))) {

            if (activeCategory != null) {
                NewsListContent(
                    filtro = activeCategory!!,
                    onBack = { activeCategory = null },
                    onNoticiaClick = { noticiaSeleccionada = it }
                )
            } else {
                when(selectedTab) {
                    0 -> DashboardContent(
                        onNavigateToReport = onNavigateToReport,
                        onOpenCategory = { cat -> activeCategory = cat },
                        onSwitchTab = { tab -> selectedTab = tab },
                        settingsManager = settingsManager
                    )
                    1 -> NewsListContent(
                        filtro = "recomendacion",
                        onBack = { selectedTab = 0 },
                        onNoticiaClick = { noticiaSeleccionada = it }
                    )
                    2 -> NewsListContent(
                        filtro = "notificacion",
                        onBack = { selectedTab = 0 },
                        onNoticiaClick = { noticiaSeleccionada = it }
                    )
                    3 -> ProfileScreen(
                        onLogout = onLogout,
                        onNavigateToHistory = onNavigateToHistory,
                        onNavigateToAlerts = onNavigateToAlerts,
                        onNavigateToSettings = onNavigateToSettings,
                        onNavigateToSupport = onNavigateToSupport,
                        onNavigateToProfile = onNavigateToProfile
                    )
                }
            }

            if (showExitDialog) {
                AlertDialog(
                    onDismissRequest = { showExitDialog = false },
                    title = { Text("¿Salir de la aplicación?") },
                    text = { Text("¿Deseas cerrar la aplicación de Seguridad UEB?") },
                    confirmButton = {
                        Button(onClick = { (context as? Activity)?.finish() }, colors = ButtonDefaults.buttonColors(containerColor = Color.Red)) {
                            Text("Salir")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showExitDialog = false }) {
                            Text("Cancelar")
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun DashboardContent(
    onNavigateToReport: () -> Unit,
    onOpenCategory: (String) -> Unit,
    onSwitchTab: (Int) -> Unit,
    settingsManager: SettingsManager
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val locationService = remember { LocationService(context) }

    // Generador de tono (fuera de la función para poder detenerlo)
    val toneGenerator = remember { ToneGenerator(AudioManager.STREAM_ALARM, 100) }

    var isSendingAlert by remember { mutableStateOf(false) }

    // --- FUNCIÓN DE ENVÍO DE PÁNICO ---
    fun realizarEnvio() {
        // 1. VALIDACIÓN CRÍTICA DE RED
        if (!NetworkUtils.isNetworkAvailable(context)) {
            Toast.makeText(context, "⚠️ Sin conexión: Alerta no enviada.", Toast.LENGTH_LONG).show()
            VibrationUtils.vibrar(context, 500) // Vibración corta de error
            return // <--- SE DETIENE AQUÍ, NO SUENA LA SIRENA
        }

        // 2. SI HAY RED -> INICIA PROCESO
        isSendingAlert = true

        // Iniciar Sonido (si está activado en config)
        if (settingsManager.leerSonido()) {
            toneGenerator.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK)
        }

        // Iniciar Vibración (si está activada)
        if (settingsManager.leerVibAlerta()) {
            VibrationUtils.vibrar(context, 1000)
        }

        scope.launch {
            try {
                // Obtener ubicación
                val coords = locationService.getUserLocation()

                // Si no hay coords, usar las de la UEB por defecto para no fallar
                val lat = coords?.first ?: "-1.6028"
                val lng = coords?.second ?: "-79.0069"

                val session = SessionManager(context)
                val token = session.fetchAuthToken()

                if (token != null) {
                    RetrofitClient.api.enviarAlerta("Bearer $token", AlertaRequest(lat, lng))
                    Toast.makeText(context, "🚨 ¡AYUDA ENVIADA!", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(context, "Error de sesión", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(context, "Error al enviar", Toast.LENGTH_SHORT).show()
            } finally {
                // 3. LIMPIEZA OBLIGATORIA
                // Apagar sonido pase lo que pase (éxito o error del servidor)
                if (settingsManager.leerSonido()) {
                    toneGenerator.stopTone()
                }
                isSendingAlert = false
            }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { if (it.values.all { g -> g }) realizarEnvio() }

    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(modifier = Modifier.fillMaxWidth().height(150.dp).background(Color(0xFF4DB6AC)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.Apartment, null, modifier = Modifier.size(80.dp), tint = Color.White)
        }
        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardCard(
                title = if(isSendingAlert) "ENVIANDO..." else "EMERGENCIA",
                icon = Icons.Default.NotificationsActive,
                iconColor = if(isSendingAlert) Color.Gray else Color.Red,
                modifier = Modifier.weight(1f)
            ) {
                if(!isSendingAlert) {
                    // Verificar permisos antes de enviar
                    permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                }
            }

            DashboardCard("Reportar", Icons.Default.ReportProblem, Color(0xFFFFA000), Modifier.weight(1f)) { onNavigateToReport() }
        }

        SectionHeader("ZONAS DE AMENAZAS Y RUTAS")
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardCard("Protocolos", Icons.Default.Assignment, Color(0xFF1A2B46), Modifier.weight(1f)) {
                onOpenCategory("protocolo")
            }
            DashboardCard("Rutas de\nEvacuación", Icons.Default.Map, Color(0xFF00897B), Modifier.weight(1f)) {
                onOpenCategory("ruta_evacuacion")
            }
        }

        SectionHeader("PLAN ESTUDIANTIL")
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardCard("Plan\nEstudiantil", Icons.Default.School, Color.Black, Modifier.weight(1f)) {
                onOpenCategory("noticia")
            }
            DashboardCard("Mochila de\nEmergencia", Icons.Default.Backpack, Color(0xFFFFD700), Modifier.weight(1f)) {
                onOpenCategory("mochila")
            }
        }

        SectionHeader("NAVEGACIÓN RÁPIDA")
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardCard("Recomendaciones", Icons.Default.WorkspacePremium, Color(0xFF1976D2), Modifier.weight(1f)) {
                onSwitchTab(1)
            }
            DashboardCard("Alertas", Icons.Default.Warning, Color.Red, Modifier.weight(1f)) {
                onSwitchTab(2)
            }
        }
        Spacer(modifier = Modifier.height(20.dp))
    }
}

// Componentes Visuales...
@Composable
fun SectionHeader(text: String) {
    Text(text, fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).fillMaxWidth())
}

@Composable
fun DashboardCard(title: String, icon: ImageVector, iconColor: Color, modifier: Modifier, onClick: () -> Unit) {
    Card(modifier = modifier.height(120.dp).clickable { onClick() }, colors = CardDefaults.cardColors(containerColor = Color.White), elevation = CardDefaults.cardElevation(4.dp)) {
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Icon(icon, null, tint = iconColor, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 12.sp, textAlign = TextAlign.Center)
        }
    }
}