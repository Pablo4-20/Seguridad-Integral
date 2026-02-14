<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // Importante para verificar contraseñas manualmente
use App\Models\User;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    // --- 1. LOGIN INTELIGENTE (Soporta doble identidad) ---

public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // 1. Buscar al usuario por email
    $user = User::where('email', $request->email)->first();

    // 2. Verificar si existe y si la contraseña es correcta
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Credenciales incorrectas',
            'errors' => ['email' => ['El usuario o la contraseña no coinciden']]
        ], 401);
    }

    // 3. (Opcional) Verificar roles específicos si es necesario
    // if ($user->rol === 'rol_bloqueado') { ... }

    // 4. Generar Token
    $token = $user->createToken('auth_token')->plainTextToken;

    // 5. Devolver respuesta exitosa
    return response()->json([
        'message' => 'Bienvenido ' . $user->name,
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'id' => $user->id,
            'nombre' => $user->name,
            'email' => $user->email,
            'rol' => $user->rol,
            'foto_perfil' => $user->foto_perfil ? asset($user->foto_perfil) : null
        ]
    ]);
}

    // --- 2. REGISTRO (Para la App Móvil) ---
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'cedula' => 'required|string',
            'telefono' => 'nullable|string'
        ]);

        // Validaciones personalizadas de duplicados (Comunidad)
        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];
        
        $existeEmail = User::where('email', $request->email)->whereIn('rol', $rolesComunidad)->exists();
        if ($existeEmail) return response()->json(['message' => 'Este correo ya tiene una cuenta de comunidad.'], 422);

        $existeCedula = User::where('cedula', $request->cedula)->whereIn('rol', $rolesComunidad)->exists();
        if ($existeCedula) return response()->json(['message' => 'Esta cédula ya tiene una cuenta de comunidad.'], 422);

        // Crear usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => 'comunidad', 
            'cedula' => $request->cedula,
            'telefono' => $request->telefono
        ]);

        // --- DISPARAR EVENTO DE REGISTRO (ENVÍA EL CORREO) ---
        event(new Registered($user));

        // --- YA NO DEVOLVEMOS EL TOKEN ---
        return response()->json([
            'message' => 'Registro exitoso. Se ha enviado un enlace de verificación a su correo.',
            'require_verification' => true
        ]);
    }

    public function verify($id, Request $request)
    {
        $user = User::findOrFail($id);

        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Enlace inválido o expirado.'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Retornamos un HTML simple o redireccionamos a una web de "Éxito"
        return response("<h1>Correo verificado exitosamente.</h1><p>Ahora puede iniciar sesión en la aplicación móvil.</p>");
    }

    // --- 3. CERRAR SESIÓN ---
    public function logout()
    {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    // --- 4. OBTENER PERFIL (Me) ---
    public function me()
    {
        $user = auth()->user();
        return response()->json([
            'id' => $user->id,
            'nombre' => $user->name,
            'email' => $user->email,
            'rol' => $user->rol,
            'cedula' => $user->cedula,
            'telefono' => $user->telefono,
            'foto_perfil' => $user->foto_perfil ? asset($user->foto_perfil) : null,
            // 'email_verified_at' => $user->email_verified_at
        ]);
    }

    // --- 5. ACTUALIZAR FOTO DE PERFIL ---
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:10240', // Máximo 10MB
        ]);

        $user = auth()->user();

        if ($request->hasFile('foto')) {
            // 1. Obtener el archivo
            $file = $request->file('foto');
            
            // 2. Generar un nombre único
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // 3. Mover DIRECTAMENTE a la carpeta public/perfiles
            $file->move(public_path('perfiles'), $filename);
            
            // 4. Guardar la ruta relativa en la base de datos
            $user->foto_perfil = 'perfiles/' . $filename;
            
            // Guardar cambios
            $user->save();

            return response()->json([
                'message' => 'Foto actualizada correctamente',
                'foto_url' => asset($user->foto_perfil) 
            ]);
        }

        return response()->json(['message' => 'No se recibió ningún archivo'], 400);
    }
    public function updateFcmToken(Request $request)
{
    $request->validate([
        'fcm_token' => 'required|string',
    ]);

    $user = auth()->user();
    $user->update(['fcm_token' => $request->fcm_token]);

    return response()->json(['message' => 'Token FCM actualizado correctamente']);
}

}