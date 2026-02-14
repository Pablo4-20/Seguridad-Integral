<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NoticiaController extends Controller
{
    // HU #10: Listar noticias y protocolos para la App
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

    // HU #5: Crear noticia (Para el futuro panel admin)
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
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 2. ENVIAR NOTIFICACIÓN PUSH
        try {
            // Obtener tokens de usuarios (que no sean nulos)
            $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

            if (!empty($tokens)) {
                $messaging = app('firebase.messaging');
                
                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        'Nueva Publicación: ' . $request->titulo, // Título
                        substr($request->contenido, 0, 100) . '...' // Cuerpo (resumido)
                    ));

                // Enviar a todos los dispositivos encontrados
                $messaging->sendMulticast($message, $tokens);
            }
        } catch (\Exception $e) {
            // Si falla Firebase, no detenemos la respuesta, solo lo registramos en logs
            \Log::error('Error enviando notificación FCM: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Publicado y notificado', 'id' => $id]);
    }

}