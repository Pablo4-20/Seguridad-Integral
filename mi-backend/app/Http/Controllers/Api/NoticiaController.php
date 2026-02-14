<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Importante para ver errores
// --- IMPORTACIONES QUE FALTABAN ---
use App\Models\User;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\AndroidConfig;

class NoticiaController extends Controller
{
    public function index()
    {
        $noticias = DB::table('noticias')
            ->where('publicado', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $noticias->transform(function ($noticia) {
            if ($noticia->imagen_url) {
                $noticia->imagen_url = asset('storage/' . $noticia->imagen_url);
            }
            return $noticia;
        });

        return response()->json($noticias);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required',
            'contenido' => 'required',
            'tipo' => 'required' 
        ]);

        // 1. Guardar en Base de Datos
        $id = DB::table('noticias')->insertGetId([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo,
            'created_by' => auth()->id(),
            'publicado' => true, // Aseguramos que esté publicado
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 2. ENVIAR NOTIFICACIÓN PUSH
        try {
            // Obtener tokens válidos
            $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

            if (!empty($tokens)) {
                $messaging = app('firebase.messaging');
                
                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        'Nueva Publicación: ' . $request->titulo,
                        substr($request->contenido, 0, 100) . '...'
                    ))
                    // --- ESTO FALTABA: CONFIGURACIÓN DE CANAL ANDROID ---
                    ->withAndroidConfig(AndroidConfig::fromArray([
                        'notification' => [
                            'channel_id' => 'seguridad_ueb_channel', // Vital para que suene
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                            'sound' => 'default',
                        ],
                    ]));
                    // ----------------------------------------------------

                $messaging->sendMulticast($message, $tokens);
                Log::info("Notificación enviada a " . count($tokens) . " dispositivos.");
            } else {
                Log::warning("Se creó la noticia pero no hay tokens para notificar.");
            }
        } catch (\Exception $e) {
            Log::error('Error enviando notificación FCM: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Publicado y notificado', 'id' => $id]);
    }
}