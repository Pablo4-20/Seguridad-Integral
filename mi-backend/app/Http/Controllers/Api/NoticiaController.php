<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Para usar Log::error
// --- IMPORTACIONES CLAVE PARA FIREBASE ---
use App\Models\User;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\AndroidConfig;

class NoticiaController extends Controller
{
    // HU #10: Listar noticias para la App
    public function index()
    {
        $noticias = DB::table('noticias')
            ->where('publicado', true) // Solo las activas
            ->orderBy('created_at', 'desc') // Las más nuevas primero
            ->get();

        // Agregamos la URL completa de la imagen si existe
        $noticias->transform(function ($noticia) {
            if ($noticia->imagen_url) {
                $noticia->imagen_url = asset('storage/' . $noticia->imagen_url);
            }
            return $noticia;
        });

        return response()->json($noticias);
    }

    // HU #5: Crear noticia (Panel Admin) y Notificar
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string',
            'contenido' => 'required|string',
            'tipo' => 'required|string' 
        ]);

        // 1. Guardar en Base de Datos
        $id = DB::table('noticias')->insertGetId([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo,
            'created_by' => auth()->id(),
            'publicado' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 2. ENVIAR NOTIFICACIÓN PUSH A TODOS
        try {
            // Obtener tokens de usuarios que tengan la sesión iniciada en la App
            $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

            if (!empty($tokens)) {
                $messaging = app('firebase.messaging');
                
                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        'Nueva Publicación: ' . $request->titulo,
                        substr($request->contenido, 0, 100) . '...'
                    ))
                    // --- CONFIGURACIÓN PARA ANDROID (IMPORTANTE) ---
                    ->withAndroidConfig(AndroidConfig::fromArray([
                        'notification' => [
                            'channel_id' => 'seguridad_ueb_channel', // Debe coincidir con MainActivity.kt
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK', 
                            'sound' => 'default',
                            'priority' => 'high',
                        ],
                    ]));
                    // -----------------------------------------------

                // Enviar a todos los dispositivos
                $messaging->sendMulticast($message, $tokens);
            }
        } catch (\Exception $e) {
            // Si falla Firebase, registramos el error pero no detenemos la respuesta
            Log::error('Error enviando notificación FCM: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Publicado y notificado', 'id' => $id]);
    }
    
    // Método auxiliar para actualizar (si lo necesitas)
    public function update(Request $request, $id)
    {
         // ... lógica de actualización si la requieres ...
         return response()->json(['message' => 'Noticia actualizada']);
    }

    // Método auxiliar para borrar
    public function destroy($id)
    {
        DB::table('noticias')->where('id', $id)->delete();
        return response()->json(['message' => 'Noticia eliminada']);
    }
}