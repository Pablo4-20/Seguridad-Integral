<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanicoController;
use App\Http\Controllers\Api\IncidenteController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\AdminController; 
// --- Importaciones para Diagnóstico de Firebase ---
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use App\Models\User;

// --- 1. RUTA DE PRUEBA DE CORREO (SMTP) ---
Route::get('/test-email', function () {
    try {
        Mail::raw('Hola, si lees esto, la conexión SMTP con Gmail funciona correctamente.', function ($msg) {
            $msg->to('uebhabilidades@gmail.com')
                ->subject('Prueba de Conexión Laravel');
        });
        return response()->json(['status' => 'Éxito: Correo enviado. El problema está en el AuthController.']);
    } catch (\Exception $e) {
        return response()->json(['error_critico' => $e->getMessage()], 500);
    }
});

// --- 2. RUTA DE PRUEBA DE FIREBASE (FCM) ---
// Úsala entrando a: http://tu-ip:8000/api/debug-fcm
Route::get('/debug-fcm', function () {
    try {
        // 1. Verificar archivo JSON
        $path = env('FIREBASE_CREDENTIALS');
        if (!file_exists($path)) {
            // Intento de corrección de ruta relativa
            $path = base_path($path);
        }
        if (!file_exists($path)) {
            return response()->json(['status' => 'ERROR', 'mensaje' => 'No encuentro el archivo JSON de Firebase en: ' . $path], 500);
        }

        // 2. Buscar un usuario con token
        $user = User::whereNotNull('fcm_token')->latest()->first();
        if (!$user) {
            return response()->json(['status' => 'ERROR', 'mensaje' => 'No hay usuarios con token registrado en la BD.'], 404);
        }

        // 3. Enviar notificación de prueba
        $messaging = app('firebase.messaging');
        $message = CloudMessage::withTarget('token', $user->fcm_token)
            ->withNotification(Notification::create('Test de Conexión', 'Si lees esto, Laravel se conecta bien a Firebase.'));
        
        $messaging->send($message);

        return response()->json([
            'status' => 'ÉXITO',
            'mensaje' => 'Notificación enviada a Firebase.',
            'destinatario' => $user->name,
            'token_parcial' => substr($user->fcm_token, 0, 10) . '...'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'FALLO TÉCNICO',
            'error' => $e->getMessage()
        ], 500);
    }
});

// --- 3. RUTAS PÚBLICAS (Sin Login) ---
Route::get('/mapa/puntos', [AdminController::class, 'listarPuntos']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Ruta de Verificación de Email
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// --- 4. RUTAS PROTEGIDAS (Requieren Token Bearer) ---
Route::middleware('auth:sanctum')->group(function () {

    // --- IMPORTANTE: Actualización de Token FCM ---
    // Esta ruta DEBE estar aquí adentro para saber quién es el usuario (auth()->user())
    Route::post('/perfil/fcm-token', [AuthController::class, 'updateFcmToken']);

    // --- RUTAS DE ADMINISTRADOR ---
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    
    Route::get('/admin/incidentes', [AdminController::class, 'incidentes']);
    Route::put('/admin/incidentes/{id}', [AdminController::class, 'cambiarEstadoIncidente']);
    
    Route::get('/admin/alertas', [AdminController::class, 'alertas']);
    Route::put('/admin/alertas/{id}', [AdminController::class, 'atenderAlerta']);
    
    Route::get('/admin/noticias', [AdminController::class, 'noticias']);
    Route::post('/admin/noticias', [AdminController::class, 'crearNoticia']);
    Route::match(['put', 'post'], '/admin/noticias/{id}', [AdminController::class, 'actualizarNoticia']);
    Route::delete('/admin/noticias/{id}', [AdminController::class, 'borrarNoticia']);

    // --- RUTAS DE USUARIO (Móvil) ---
    Route::get('/perfil', [AuthController::class, 'me']); 
    Route::post('/perfil/foto', [AuthController::class, 'updatePhoto']);
    Route::get('mis-alertas', [PanicoController::class, 'misAlertas']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- RECURSOS API ESTÁNDAR ---
    Route::apiResource('alertas', PanicoController::class);
    Route::apiResource('incidentes', IncidenteController::class);
    Route::apiResource('noticias', NoticiaController::class);

    // --- GESTIÓN DE USUARIOS (CRUD) ---
    
    // Lista de Administrativos
    Route::get('/admin/usuarios', [AdminController::class, 'index']); 
    
    // Lista de Comunidad
    Route::get('/admin/comunidad', [AdminController::class, 'comunidad']);

    // Acciones para Administrativos
    Route::post('/admin/usuarios', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/usuarios/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'destroyUsuario']);

    // Acciones para Comunidad
    Route::post('/admin/comunidad', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/comunidad/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/comunidad/{id}', [AdminController::class, 'destroyUsuario']);

    // --- GESTIÓN DE MAPA ---
    Route::put('/admin/mapa/{id}', [AdminController::class, 'actualizarPunto']);
    Route::post('/admin/mapa', [AdminController::class, 'guardarPunto']);
    Route::delete('/admin/mapa/{id}', [AdminController::class, 'borrarPunto']);
});