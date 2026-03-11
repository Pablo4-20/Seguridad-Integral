<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; 
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
                // Genera la URL completa. Como Laravel respeta la extensión (.pdf o .jpg),
                // el frontend podrá detectarlo sin problemas.
                $noticia->imagen_url = url('api/imagen-noticia/' . basename($noticia->imagen_url));
            }
            return $noticia;
        });

        return response()->json($noticias);
    }

    public function store(Request $request)
    {
        // 1. Validaciones (Contenido no es required porque un PDF puede no tenerlo)
        $request->validate([
            'titulo' => 'required',
            'tipo' => 'required' 
        ]);

        // 2. MANEJO DE ARCHIVOS: Detecta si viene un PDF o una Imagen
        $path = null;
        if ($request->hasFile('archivo_pdf')) {
            $path = $request->file('archivo_pdf')->store('noticias', 'public');
        } elseif ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('noticias', 'public');
        }

        // 3. Guardar en Base de Datos
        $id = DB::table('noticias')->insertGetId([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido ?? 'Documento adjunto.',
            'tipo' => $request->tipo,
            'imagen_url' => $path, // Guardamos la ruta del PDF o Imagen aquí
            'created_by' => auth()->id(),
            'publicado' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 4. ENVIAR NOTIFICACIÓN PUSH
        try {
            $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

            if (!empty($tokens)) {
                $messaging = app('firebase.messaging');
                $contenidoPlano = strip_tags($request->contenido ?? 'Nuevo documento adjunto');

                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        '[' . ucfirst($request->tipo) . '] ' . $request->titulo,
                        substr($contenidoPlano, 0, 100) . '...'
                    ))
                    ->withData([
                        'noticia_id' => (string) $id, 
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
        $noticia = DB::table('noticias')->where('id', $id)->first();

        if (!$noticia) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        if ($noticia->imagen_url) {
            $noticia->imagen_url = url('api/imagen-noticia/' . basename($noticia->imagen_url));
        }

        return response()->json($noticia);
    }

    // --- NUEVO: MÉTODO PARA EDITAR Y ACTUALIZAR ---
    public function update(Request $request, $id)
    {
        $noticia = DB::table('noticias')->where('id', $id)->first();
        if (!$noticia) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        $data = [
            'titulo' => $request->titulo,
            'tipo' => $request->tipo,
            'updated_at' => now()
        ];

        if ($request->has('contenido')) {
            $data['contenido'] = $request->contenido;
        }

        // Si en la edición el usuario sube un nuevo archivo, lo reemplazamos
        if ($request->hasFile('archivo_pdf')) {
            $data['imagen_url'] = $request->file('archivo_pdf')->store('noticias', 'public');
        } elseif ($request->hasFile('imagen')) {
            $data['imagen_url'] = $request->file('imagen')->store('noticias', 'public');
        }

        DB::table('noticias')->where('id', $id)->update($data);

        return response()->json(['message' => 'Actualizado correctamente']);
    }

    // --- MÉTODO PARA ELIMINAR (Por si no lo tenías incluido) ---
    public function destroy($id)
    {
        DB::table('noticias')->where('id', $id)->delete();
        return response()->json(['message' => 'Eliminado correctamente']);
    }
}