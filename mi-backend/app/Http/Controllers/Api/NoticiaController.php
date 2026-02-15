<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 
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
    $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

    if (!empty($tokens)) {
        $messaging = app('firebase.messaging');
        $contenidoPlano = strip_tags($request->contenido);

        $message = CloudMessage::new()
            ->withNotification(Notification::create(
                '[' . ucfirst($request->tipo) . '] ' . $request->titulo, // Tip: Ponemos la categoría en el título visual
                substr($contenidoPlano, 0, 100) . '...'
            ))
            // AGREGAMOS ESTO: Datos ocultos para la navegación
            ->withData([
                'noticia_id' => (string) $id, // Importante convertir a string
                'tipo' => $request->tipo,
            ])
            ->withAndroidConfig(AndroidConfig::fromArray([
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'seguridad_ueb_channel',
                    'sound' => 'default',
                ],
            ]));

        $messaging->sendMulticast($message, $tokens);
        Log::info("Notificación enviada con datos de navegación.");
    }
} catch (\Exception $e) {
    Log::error('Error FCM: ' . $e->getMessage());
}

        return response()->json(['message' => 'Publicado y notificado', 'id' => $id]);
    }
    public function show($id)
{
    $noticia = \Illuminate\Support\Facades\DB::table('noticias')->where('id', $id)->first();

    if (!$noticia) {
        return response()->json(['message' => 'No encontrada'], 404);
    }

    // Ajustar url de imagen si existe
    if ($noticia->imagen_url) {
        $noticia->imagen_url = asset('storage/' . $noticia->imagen_url);
    }

    return response()->json($noticia);
}
}