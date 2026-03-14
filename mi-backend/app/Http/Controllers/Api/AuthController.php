<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\DB;   // Necesario para password_reset_tokens
use Illuminate\Support\Facades\Mail; // Necesario para enviar correos
use Illuminate\Support\Str;          // Necesario para generar el token random
use App\Models\User;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    // --- 1. LOGIN INTELIGENTE ---
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
                'errors' => ['email' => ['El usuario o la contraseña no coinciden']]
            ], 401);
        }

        if ($user->activo == false) {
            return response()->json([
                'message' => 'Cuenta deshabilitada',
                'errors' => ['email' => ['Tu cuenta ha sido deshabilitada por administración.']]
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

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

    // --- VALIDACIONES EN TIEMPO REAL (Móvil) ---
    public function checkEmail(Request $request)
    {
        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];
        $exists = User::where('email', $request->query('email'))
                      ->whereIn('rol', $rolesComunidad)
                      ->exists();

        if ($exists) {
            return response()->json(['message' => 'El correo ya existe'], 422);
        }
        return response()->json(['message' => 'Disponible'], 200);
    }

    public function checkCedula(Request $request)
    {
        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];
        $exists = User::where('cedula', $request->query('cedula'))
                      ->whereIn('rol', $rolesComunidad)
                      ->exists();

        if ($exists) {
            return response()->json(['message' => 'La cédula ya existe'], 422);
        }
        return response()->json(['message' => 'Disponible'], 200);
    }

    public function checkTelefono(Request $request)
    {
        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];
        $exists = User::where('telefono', $request->query('telefono'))
                      ->whereIn('rol', $rolesComunidad)
                      ->exists();

        if ($exists) {
            return response()->json(['message' => 'El teléfono ya existe'], 422);
        }
        return response()->json(['message' => 'Disponible'], 200);
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

        $rolesComunidad = ['estudiante', 'docente', 'comunidad'];
        
        $existeEmail = User::where('email', $request->email)->whereIn('rol', $rolesComunidad)->exists();
        if ($existeEmail) return response()->json(['message' => 'Este correo ya tiene una cuenta de comunidad.'], 422);

        $existeCedula = User::where('cedula', $request->cedula)->whereIn('rol', $rolesComunidad)->exists();
        if ($existeCedula) return response()->json(['message' => 'Esta cédula ya tiene una cuenta de comunidad.'], 422);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => 'comunidad', 
            'cedula' => $request->cedula,
            'telefono' => $request->telefono
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registro exitoso. Se ha enviado un enlace de verificación a su correo.',
            'require_verification' => true
        ]);
    }

    // --- RECUPERACIÓN DE CONTRASEÑA ---

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string'
        ]);

        $user = User::where('cedula', $request->cedula)->first();

        if (!$user) {
            return response()->json(['message' => 'No se encontró un usuario con esa cédula.'], 404);
        }

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => $token,
                'created_at' => now()
            ]
        );

        // AQUI ESTÁ EL CAMBIO: Ahora enviamos un enlace HTTP normal (que los correos aceptan)
        $resetUrl = url('/api/reset-password-mobile') . '?token=' . $token . '&email=' . urlencode($user->email);

        $html = '
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Recuperar Contraseña</title></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #1A2B46; margin-bottom: 20px;">Recuperación de Contraseña</h2>
                <p style="color: #555; font-size: 16px;">Hola <strong>' . $user->name . '</strong>,</p>
                <p style="color: #555; font-size: 16px;">Recibimos una solicitud para restablecer tu contraseña.</p>
                <p style="color: #555; font-size: 16px; margin-bottom: 30px;">Haz clic en el siguiente botón <strong>desde tu teléfono móvil</strong>:</p>
                
                <a href="' . $resetUrl . '" style="display: inline-block; padding: 14px 28px; background-color: #e53935; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">CAMBIAR CONTRASEÑA EN LA APP</a>
            </div>
        </body>
        </html>
        ';

        Mail::html($html, function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Restablecer Contraseña - Seguridad Integral');
        });

        return response()->json(['message' => 'Se ha enviado un enlace de recuperación al correo registrado.']);
    }

    // --- NUEVO MÉTODO: Página puente que lanza la App ---
    public function redirectResetMobile(Request $request)
    {
        $token = $request->query('token');
        $email = $request->query('email');

        if (!$token || !$email) {
            return response('Enlace inválido o incompleto.', 400);
        }

        // Construimos el enlace real que entiende Android
        $deepLink = "seguridadintegral://reset-password/" . $token . "?email=" . urlencode($email);

        $html = '
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Abriendo la Aplicación...</title>
            <meta http-equiv="refresh" content="2;url=' . $deepLink . '" />
            <style>
                body { font-family: Arial, sans-serif; background-color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
                .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 90%; }
                h1 { color: #1e293b; font-size: 22px; }
                p { color: #64748b; font-size: 15px; margin-bottom: 25px; line-height: 1.5; }
                .btn { display: inline-block; background-color: #e53935; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Abriendo Seguridad Integral...</h1>
                <p>Serás redirigido a la aplicación para cambiar tu contraseña.</p>
                <p style="font-size: 13px; color: #94a3b8;">Si la aplicación no se abre automáticamente, presiona el botón de abajo.</p>
                <br>
                <a href="' . $deepLink . '" class="btn">Abrir Aplicación</a>
            </div>

            <script>
                setTimeout(() => {
                    window.location.href = "' . $deepLink . '";
                }, 500);
            </script>
        </body>
        </html>
        ';

        return response($html)->header('Content-Type', 'text/html');
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8'
        ]);

        // Verificar si el token es válido
        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'El enlace es inválido o ha expirado.'], 400);
        }

        // Actualizar la contraseña
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        // Eliminar el token usado
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    // --- MÉTODOS DE PERFIL Y VERIFICACIÓN ---

    public function verify($id, Request $request)
    {
        $user = User::findOrFail($id);

        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Enlace inválido o expirado.'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $html = '
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cuenta Verificada</title>
            <meta http-equiv="refresh" content="5;url=seguridadintegral://login" />
            <style>
                body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px 30px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 90%; }
                .icon { font-size: 60px; margin-bottom: 20px; }
                h1 { color: #1e293b; font-size: 24px; margin-bottom: 10px; }
                p { color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 25px; }
                .btn { display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; transition: background-color 0.3s; width: 100%; box-sizing: border-box; }
                .btn:hover { background-color: #1d4ed8; }
                .countdown-text { font-size: 14px; color: #94a3b8; margin-top: 20px; }
                .countdown-number { font-weight: bold; color: #ef4444; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="icon">✅</div>
                <h1>¡Verificación Exitosa!</h1>
                <p>Tu correo ha sido verificado correctamente. Ya puedes acceder a todas las funciones del sistema.</p>
                <a href="seguridadintegral://login" class="btn">Abrir la Aplicación</a>
                <p class="countdown-text">Serás redirigido automáticamente en <span id="timer" class="countdown-number">5</span> segundos...</p>
            </div>
            <script>
                let timeLeft = 5;
                const timerElement = document.getElementById("timer");
                const countdown = setInterval(() => {
                    timeLeft--;
                    timerElement.textContent = timeLeft;
                    if (timeLeft <= 0) {
                        clearInterval(countdown);
                        window.location.href = "seguridadintegral://login";
                    }
                }, 1000);
            </script>
        </body>
        </html>
        ';

        return response($html)->header('Content-Type', 'text/html');
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

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
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:10240', 
        ]);

        $user = auth()->user();

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('perfiles'), $filename);
            $user->foto_perfil = 'perfiles/' . $filename;
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