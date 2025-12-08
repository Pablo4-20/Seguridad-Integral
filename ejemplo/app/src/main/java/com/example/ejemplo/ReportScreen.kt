package com.example.ejemplo

import android.Manifest
import android.location.Geocoder
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import coil.compose.rememberAsyncImagePainter
import com.example.ejemplo.components.NoInternetScreen // <--- IMPORTANTE
import com.example.ejemplo.utils.NetworkUtils
import com.example.ejemplo.utils.VibrationUtils
import com.example.ejemplo.data.RetrofitClient
import com.example.ejemplo.data.SessionManager
import com.example.ejemplo.data.SettingsManager // Importante para leer la config
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var isConnected by remember { mutableStateOf(NetworkUtils.isNetworkAvailable(context)) }

    if (!isConnected) {
        NoInternetScreen(
            onRetry = { isConnected = NetworkUtils.isNetworkAvailable(context) },
            onBack = { onBack() } // Usamos la navegación para volver al menú
        )
        return
    }
    val scope = rememberCoroutineScope()

    // Servicios
    val locationService = remember { LocationService(context) }
    val settingsManager = remember { SettingsManager(context) } // Gestor de configuración

    // Manejo del botón atrás físico
    BackHandler { onBack() }

    // Colores
    val DarkBlue = Color(0xFF1A2B46)
    val BorderColor = Color(0xFFB0BEC5)

    // Estados del Formulario
    var tipoSeleccionado by remember { mutableStateOf("Seleccionar Evento") }
    var latitud by remember { mutableStateOf("") }
    var longitud by remember { mutableStateOf("") }
    var direccion by remember { mutableStateOf("") }
    var descripcion by remember { mutableStateOf("") }

    // Estados de Foto
    var fotoUri by remember { mutableStateOf<Uri?>(null) }
    var fotoFile by remember { mutableStateOf<File?>(null) }

    var isExpanded by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    val tiposIncidentes = listOf("Robo", "Emergencia Médica", "Acoso", "Infraestructura", "Incendio", "Otro")

    // --- CÁMARA ---
    fun crearArchivoImagen(): File {
        val nombreArchivo = "JPEG_${System.currentTimeMillis()}_"
        val directorio = context.cacheDir
        return File.createTempFile(nombreArchivo, ".jpg", directorio).apply {
            fotoFile = this
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { success ->
        if (success) {
            Toast.makeText(context, "Foto guardada", Toast.LENGTH_SHORT).show()
        }
    }

    val permissionLauncherCamera = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            try {
                val file = crearArchivoImagen()
                val uri = FileProvider.getUriForFile(context, "${context.packageName}.provider", file)
                fotoUri = uri
                cameraLauncher.launch(uri)
            } catch (e: Exception) {
                Toast.makeText(context, "Error al abrir cámara", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, "Permiso denegado", Toast.LENGTH_SHORT).show()
        }
    }

    // --- GPS ---
    fun obtenerDireccion(lat: Double, lng: Double) {
        scope.launch(Dispatchers.IO) {
            try {
                val geocoder = Geocoder(context, Locale.getDefault())
                val direcciones = geocoder.getFromLocation(lat, lng, 1)
                if (!direcciones.isNullOrEmpty()) {
                    val address = direcciones[0]
                    val calle = address.thoroughfare ?: "Ubicación"
                    val numero = address.featureName ?: ""
                    withContext(Dispatchers.Main) { direccion = "$calle $numero" }
                }
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    val permissionLauncherGPS = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
            Toast.makeText(context, "Obteniendo GPS...", Toast.LENGTH_SHORT).show()
            scope.launch {
                val coords = locationService.getUserLocation()
                if (coords != null) {
                    latitud = coords.first
                    longitud = coords.second
                    obtenerDireccion(latitud.toDouble(), longitud.toDouble())
                    Toast.makeText(context, "Ubicación fijada", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nuevo Reporte", fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Volver", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkBlue, titleContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // 1. ASUNTO
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Asunto:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Box(modifier = Modifier.weight(1f)) {
                    OutlinedButton(
                        onClick = { isExpanded = true },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderColor)
                    ) {
                        Text(text = tipoSeleccionado, color = if(tipoSeleccionado=="Seleccionar Evento") Color.Gray else Color.Black)
                    }
                    DropdownMenu(expanded = isExpanded, onDismissRequest = { isExpanded = false }, modifier = Modifier.background(Color.White)) {
                        tiposIncidentes.forEach { tipo -> DropdownMenuItem(text = { Text(tipo) }, onClick = { tipoSeleccionado = tipo; isExpanded = false }) }
                    }
                }
                Spacer(modifier = Modifier.width(8.dp))
                Icon(Icons.Default.Warning, null, tint = Color(0xFFFFA000), modifier = Modifier.size(32.dp))
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 2. UBICACIÓN
            Text("Ubicación del reporte:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Coordenadas:", fontSize = 14.sp)
                Spacer(modifier = Modifier.width(8.dp))
                OutlinedTextField(
                    value = if (latitud.isNotEmpty()) "$latitud, $longitud" else "",
                    onValueChange = {}, placeholder = { Text("latitud, longitud", color = Color.LightGray) }, readOnly = true,
                    modifier = Modifier.weight(1f), textStyle = TextStyle(fontSize = 12.sp), shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(unfocusedBorderColor = BorderColor, focusedBorderColor = DarkBlue)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable {
                    permissionLauncherGPS.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                }) {
                    Icon(Icons.Default.LocationOn, "Ubicar", tint = Color(0xFFD32F2F))
                    Text("Ubicar", color = Color(0xFFD32F2F), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Dirección:      ", fontSize = 14.sp)
                Spacer(modifier = Modifier.width(8.dp))
                OutlinedTextField(
                    value = direccion, onValueChange = { direccion = it }, placeholder = { Text("dirección automática", color = Color.LightGray) },
                    modifier = Modifier.fillMaxWidth(), textStyle = TextStyle(fontSize = 14.sp), shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(unfocusedBorderColor = BorderColor, focusedBorderColor = DarkBlue)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 3. DETALLES
            Text("Detalles del reporte:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.Face, null, modifier = Modifier.size(60.dp).padding(top = 12.dp), tint = Color(0xFFF06292))
                Spacer(modifier = Modifier.width(16.dp))
                OutlinedTextField(
                    value = descripcion, onValueChange = { descripcion = it }, placeholder = { Text("Describa el reporte.", color = Color.LightGray) },
                    modifier = Modifier.weight(1f).height(120.dp), maxLines = 6, shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(unfocusedBorderColor = BorderColor, focusedBorderColor = DarkBlue)
                )
            }

            // 4. FOTO
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (fotoUri != null) {
                    Box(modifier = Modifier.size(60.dp).border(1.dp, BorderColor, RoundedCornerShape(8.dp)).clip(RoundedCornerShape(8.dp))) {
                        Image(painter = rememberAsyncImagePainter(fotoUri), contentDescription = "Foto", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                }
                FilledIconButton(
                    onClick = { permissionLauncherCamera.launch(Manifest.permission.CAMERA) },
                    modifier = Modifier.size(56.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = Color(0xFFD32F2F))
                ) {
                    Icon(Icons.Default.CameraAlt, "Foto", tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 5. BOTÓN ENVIAR (ACTUALIZADO CON VIBRACIÓN)
            Button(
                onClick = {
                    if (latitud.isEmpty()) {
                        Toast.makeText(context, "Presiona 'Ubicar' primero", Toast.LENGTH_SHORT).show()
                    } else if (tipoSeleccionado == "Seleccionar Evento") {
                        Toast.makeText(context, "Selecciona un asunto", Toast.LENGTH_SHORT).show()
                    } else {
                        isLoading = true
                        scope.launch {
                            try {
                                val session = SessionManager(context)
                                val token = session.fetchAuthToken()
                                if (token != null) {
                                    // Preparar partes
                                    val tipoPart = tipoSeleccionado.toRequestBody("text/plain".toMediaTypeOrNull())
                                    val descCompleta = "Dirección: $direccion \n\n $descripcion"
                                    val descPart = descCompleta.toRequestBody("text/plain".toMediaTypeOrNull())
                                    val latPart = latitud.toRequestBody("text/plain".toMediaTypeOrNull())
                                    val lngPart = longitud.toRequestBody("text/plain".toMediaTypeOrNull())

                                    var fotoPart: MultipartBody.Part? = null
                                    fotoFile?.let { file ->
                                        val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                                        fotoPart = MultipartBody.Part.createFormData("foto", file.name, requestFile)
                                    }

                                    // Enviar
                                    val response = RetrofitClient.api.enviarReporte(
                                        "Bearer $token", tipoPart, descPart, latPart, lngPart, fotoPart
                                    )

                                    // Mensaje de Éxito
                                    Toast.makeText(context, "Reporte #${response.id} enviado", Toast.LENGTH_LONG).show()

                                    // --- LÓGICA DE VIBRACIÓN ---
                                    if (settingsManager.leerVibReporte()) {
                                        VibrationUtils.vibrar(context, 200) // Vibración corta de éxito
                                    }

                                    onBack()
                                } else {
                                    Toast.makeText(context, "Sesión expirada", Toast.LENGTH_SHORT).show()
                                }
                            } catch (e: Exception) {
                                e.printStackTrace()
                                Toast.makeText(context, "Error al enviar: ${e.message}", Toast.LENGTH_SHORT).show()
                            } finally { isLoading = false }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFA000)),
                shape = RoundedCornerShape(25.dp),
                enabled = !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                else {
                    Icon(Icons.Default.Send, null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("ENVIAR REPORTE", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}