<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    // Historia de Usuario #7: Autenticación Segura
    public function login(Request $request)
    {
        // 1. Validamos que envíen email y password
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Intentamos loguear
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // 3. Si pasa, buscamos al usuario
        $user = User::where('email', $request->email)->firstOrFail();

        // 4. Generamos el Token (El "Pasaporte" para Android)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Devolvemos el token y los datos del usuario
        return response()->json([
            'message' => 'Bienvenido ' . $user->name,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nombre' => $user->name,  // <--- AQUÍ LA MAGIA: Convertimos name a nombre
                'email' => $user->email,
                'rol' => $user->rol,
            ]
        ]);
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    public function perfil()
    {
        return response()->json(auth()->user());
    }
    // Actualizar foto de perfil
   public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:10240',
        ]);

        $user = auth()->user();

        if ($request->hasFile('foto')) {
            // 1. Obtener el archivo
            $file = $request->file('foto');
            
            // 2. Generar un nombre único
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // 3. Mover DIRECTAMENTE a la carpeta public/perfiles (Sin symlinks)
            $file->move(public_path('perfiles'), $filename);
            
            // 4. Guardar la ruta relativa en la base de datos
            $user->foto_perfil = 'perfiles/' . $filename;
            
            /** @var \App\Models\User $user */
            $user->save();

            return response()->json([
                'message' => 'Foto actualizada correctamente',
                // Generamos la URL completa para responder
                'foto_url' => asset($user->foto_perfil) 
            ]);
        }

        return response()->json(['message' => 'No se recibió ningún archivo'], 400);
    }
    public function me()
    {
        $user = auth()->user();
        return response()->json([
            'id' => $user->id,
            'nombre' => $user->name,
            'email' => $user->email,
            'rol' => $user->rol,
            'foto_perfil' => $user->foto_perfil ? asset($user->foto_perfil) : null,
            'email_verified_at' => $user->email_verified_at
        ]);
    }
}