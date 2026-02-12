<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PanicoController;
use App\Http\Controllers\Api\IncidenteController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\AdminController; 

// --- RUTA PÚBLICA (Login) ---
Route::get('/mapa/puntos', [AdminController::class, 'listarPuntos']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

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
    Route::get('/perfil', [AuthController::class, 'me']); // O 'perfil', asegura que coincida con tu AuthController
    Route::post('/perfil/foto', [AuthController::class, 'updatePhoto']);
    Route::get('mis-alertas', [PanicoController::class, 'misAlertas']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // API Resources estándar (si los usas para otras cosas)
    Route::apiResource('alertas', PanicoController::class);
    Route::apiResource('incidentes', IncidenteController::class);
    Route::apiResource('noticias', NoticiaController::class);
    // Route::apiResource('usuarios', UsuarioController::class); // Comentado para usar la gestión personalizada abajo

    // --- GESTIÓN DE USUARIOS (CORREGIDO) ---
    
    // 1. Ruta para ADMINISTRATIVOS (Director/Administrador) -> Llama a 'index'
    Route::get('/admin/usuarios', [AdminController::class, 'index']); 
    
    // 2. Ruta para COMUNIDAD (App móvil) -> Llama a 'comunidad'
    Route::get('/admin/comunidad', [AdminController::class, 'comunidad']);

    // CRUD de usuarios (Crear, Editar, Eliminar)
    Route::post('/admin/usuarios', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/usuarios/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'destroyUsuario']);

    //CRUD de usuarios de la comunidad (App móvil)
    Route::post('/admin/comunidad', [AdminController::class, 'storeUsuario']);
    Route::put('/admin/comunidad/{id}', [AdminController::class, 'updateUsuario']);
    Route::delete('/admin/comunidad/{id}', [AdminController::class, 'destroyUsuario']);

    // --- GESTIÓN DE PUNTOS DEL MAPA ---
    Route::put('/admin/mapa/{id}', [AdminController::class, 'actualizarPunto']);
    Route::post('/admin/mapa', [AdminController::class, 'guardarPunto']);
    Route::delete('/admin/mapa/{id}', [AdminController::class, 'borrarPunto']);
    
});