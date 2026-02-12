<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // Importante para verificar contraseñas manualmente
use App\Models\User;

class AuthController extends Controller
{
    // --- 1. LOGIN INTELIGENTE (Soporta doble identidad) ---
    public function login(Request $request)
    {
        // Validar datos de entrada
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Buscamos TODOS los usuarios con ese correo (puede haber 1 o 2)
        $usuarios = User::where('email', $request->email)->get();

        $userEncontrado = null;

        foreach ($usuarios as $user) {
            // Verificamos si la contraseña coincide
            if (Hash::check($request->password, $user->password)) {
                
                // Si aún no hemos seleccionado ninguno, tomamos este
                if (!$userEncontrado) {
                    $userEncontrado = $user;
                } else {
                    // SI YA TENEMOS UNO SELECCIONADO, APLICAMOS LA REGLA DE PRIORIDAD:
                    // Si el usuario seleccionado es Administrativo (Director/Admin)
                    // y el nuevo que encontramos es Comunidad (Estudiante/Docente),
                    // NOS QUEDAMOS CON EL DE COMUNIDAD (porque la App es para ellos).
                    
                    $esAdminActual = in_array($userEncontrado->rol, ['director', 'administrador']);
                    $esComunidadNuevo = !in_array($user->rol, ['director', 'administrador']);

                    if ($esAdminActual && $esComunidadNuevo) {
                        $userEncontrado = $user;
                    }
                }
            }
        }

        // Si después del ciclo no encontramos usuario o la contraseña falló
        if (!$userEncontrado) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Generamos el Token (Pasaporte para la App)
        $token = $userEncontrado->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Bienvenido ' . $userEncontrado->name,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $userEncontrado->id,
                'nombre' => $userEncontrado->name,
                'email' => $userEncontrado->email,
                'rol' => $userEncontrado->rol,
                'foto_perfil' => $userEncontrado->foto_perfil ? asset($userEncontrado->foto_perfil) : null
            ]
        ]);
    }

    // --- 2. REGISTRO (Para la App Móvil) ---
    public function register(Request $request)
    {
        // 1. Validación básica (Sin 'unique' para permitir la doble identidad)
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'cedula' => 'required|string',
            'telefono' => 'nullable|string'
        ]);

        // 2. Validar que NO exista ya en el grupo Comunidad
        // Buscamos si existe alguien con ese email o cédula que SEA 'estudiante', 'docente' o 'comunidad'
        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];

        $existeEmail = User::where('email', $request->email)
                           ->whereIn('rol', $rolesComunidad)
                           ->exists();

        if ($existeEmail) {
            return response()->json(['message' => 'Este correo ya tiene una cuenta de comunidad.'], 422);
        }

        $existeCedula = User::where('cedula', $request->cedula)
                            ->whereIn('rol', $rolesComunidad)
                            ->exists();

        if ($existeCedula) {
            return response()->json(['message' => 'Esta cédula ya tiene una cuenta de comunidad.'], 422);
        }

        // 3. Crear el usuario con rol 'comunidad'
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => 'comunidad', // <--- AQUÍ ESTÁ EL CAMBIO (Antes decía 'estudiante')
            'cedula' => $request->cedula,
            'telefono' => $request->telefono
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
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
}