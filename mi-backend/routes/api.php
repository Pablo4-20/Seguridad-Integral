<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanicoController;
use App\Http\Controllers\Api\IncidenteController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\AdminController; // <--- AGREGA ESTA LÍNEA

// --- RUTA PÚBLICA (Login) ---
// Cumple Historia de Usuario #1 (Web) y #7 (Móvil)

// Ruta pública para obtener los puntos del mapa
Route::get('/mapa/puntos', [AdminController::class, 'listarPuntos']);

// Ruta pública para el login
Route::post('/login', [AuthController::class, 'login']);


// --- RUTAS PROTEGIDAS (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {

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
// --- RUTAS DE USUARIO ---
    Route::get('/perfil', [AuthController::class, 'me']);
    Route::post('/perfil/foto', [AuthController::class, 'updatePhoto']);
    Route::get('mis-alertas', [PanicoController::class, 'misAlertas']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/perfil', [AuthController::class, 'perfil']);

    // Rutas para las demás funciones (se crean automáticas: get, post, put, delete)
    Route::apiResource('alertas', PanicoController::class);
    Route::apiResource('incidentes', IncidenteController::class);
    Route::apiResource('noticias', NoticiaController::class);
    Route::apiResource('usuarios', UsuarioController::class);

    // GESTIÓN DE USUARIOS
    Route::get('/admin/usuarios', [AdminController::class, 'indexUsuarios']);
    Route::post('/admin/usuarios', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/usuarios/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'destroyUsuario']);

    // GESTIÓN DE PUNTOS DEL MAPA
Route::put('/admin/mapa/{id}', [AdminController::class, 'actualizarPunto']);
    Route::post('/admin/mapa', [AdminController::class, 'guardarPunto']);
    Route::delete('/admin/mapa/{id}', [AdminController::class, 'borrarPunto']);
    
});