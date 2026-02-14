<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail; // <--- AGREGA ESTA IMPORTACIÓN IMPORTANTE
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanicoController;
use App\Http\Controllers\Api\IncidenteController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\AdminController; 

// --- RUTA DE PRUEBA DE CORREO (SOLO PARA DIAGNÓSTICO) ---
// Esta ruta nos dirá exactamente por qué falla Gmail
Route::get('/test-email', function () {
    try {
        Mail::raw('Hola, si lees esto, la conexión SMTP con Gmail funciona correctamente.', function ($msg) {
            $msg->to('uebhabilidades@gmail.com') // Se envía a tu propio correo
                ->subject('Prueba de Conexión Laravel');
        });
        return response()->json(['status' => 'Éxito: Correo enviado. El problema está en el AuthController.']);
    } catch (\Exception $e) {
        // Aquí veremos el error real (contraseña mal, puerto bloqueado, etc.)
        return response()->json(['error_critico' => $e->getMessage()], 500);
    }
});

// --- RUTA PÚBLICA (Login) ---
Route::get('/mapa/puntos', [AdminController::class, 'listarPuntos']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// --- RUTA DE VERIFICACIÓN DE EMAIL ---
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

    Route::post('/perfil/fcm-token', [AuthController::class, 'updateFcmToken']);
// --- RUTAS PROTEGIDAS (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // --- RUTAS DE ADMINISTRADOR (Dashboard, Noticias, Alertas) ---
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    
    Route::get('/admin/incidentes', [AdminController::class, 'incidentes']);
    Route::put('/admin/incidentes/{id}', [AdminController::class, 'cambiarEstadoIncidente']);
    
    Route::get('/admin/alertas', [AdminController::class, 'alertas']);
    Route::put('/admin/alertas/{id}', [AdminController::class, 'atenderAlerta']);
    
    Route::get('/admin/noticias', [AdminController::class, 'noticias']);
    Route::post('/admin/noticias', [AdminController::class, 'crearNoticia']);
    Route::match(['put', 'post'], '/admin/noticias/{id}', [AdminController::class, 'actualizarNoticia']);
    Route::delete('/admin/noticias/{id}', [AdminController::class, 'borrarNoticia']);

    // --- RUTAS DE USUARIO (Perfil, App Móvil) ---
    Route::get('/perfil', [AuthController::class, 'me']); 
    Route::post('/perfil/foto', [AuthController::class, 'updatePhoto']);
    Route::get('mis-alertas', [PanicoController::class, 'misAlertas']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // API Resources estándar 
    Route::apiResource('alertas', PanicoController::class);
    Route::apiResource('incidentes', IncidenteController::class);
    Route::apiResource('noticias', NoticiaController::class);

    // --- GESTIÓN DE USUARIOS ---
    
    // 1. Ruta para ADMINISTRATIVOS
    Route::get('/admin/usuarios', [AdminController::class, 'index']); 
    
    // 2. Ruta para COMUNIDAD 
    Route::get('/admin/comunidad', [AdminController::class, 'comunidad']);

    // CRUD de usuarios 
    Route::post('/admin/usuarios', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/usuarios/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'destroyUsuario']);

    // CRUD de usuarios de la comunidad
    Route::post('/admin/comunidad', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/comunidad/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/comunidad/{id}', [AdminController::class, 'destroyUsuario']);

    // --- GESTIÓN DE PUNTOS DEL MAPA ---
    Route::put('/admin/mapa/{id}', [AdminController::class, 'actualizarPunto']);
    Route::post('/admin/mapa', [AdminController::class, 'guardarPunto']);
    Route::delete('/admin/mapa/{id}', [AdminController::class, 'borrarPunto']);
});