<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log; // Importante para ver errores en el log
use App\Models\User;
use App\Models\PuntoMapa;
// --- IMPORTACIONES NECESARIAS PARA NOTIFICACIONES ---
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\AndroidConfig;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        // 1. Contadores Generales
        $pendientes = DB::table('incidentes')->where('estado', 'pendiente')->count();
        $en_curso = DB::table('incidentes')->where('estado', 'en_curso')->count();
        $alertas = DB::table('alertas_panico')->count();
        $usuarios = DB::table('users')->count();

        // 2. Gráfico de Dona
        $porTipo = DB::table('incidentes')
            ->select('tipo', DB::raw('count(*) as total'))
            ->groupBy('tipo')
            ->get();

        // 3. Lógica de Tiempo "Trading"
        $periodo = $request->input('periodo', 'hora');
        $datosGrafico = collect([]);

        if ($periodo === 'minuto') {
            for ($i = 59; $i >= 0; $i--) {
                $dt = now()->subMinutes($i);
                $label = $dt->format('H:i');
                $inc = DB::table('incidentes')->whereBetween('created_at', [$dt->format('Y-m-d H:i:00'), $dt->format('Y-m-d H:i:59')])->count();
                $alert = DB::table('alertas_panico')->whereBetween('created_at', [$dt->format('Y-m-d H:i:00'), $dt->format('Y-m-d H:i:59')])->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        } elseif ($periodo === 'hora') {
            for ($i = 23; $i >= 0; $i--) {
                $dt = now()->subHours($i);
                $label = $dt->format('H:00');
                $inc = DB::table('incidentes')->whereBetween('created_at', [$dt->format('Y-m-d H:00:00'), $dt->format('Y-m-d H:59:59')])->count();
                $alert = DB::table('alertas_panico')->whereBetween('created_at', [$dt->format('Y-m-d H:00:00'), $dt->format('Y-m-d H:59:59')])->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        } elseif ($periodo === 'dia') {
            for ($i = 29; $i >= 0; $i--) {
                $dt = now()->subDays($i);
                $label = $dt->format('d/m');
                $inc = DB::table('incidentes')->whereDate('created_at', $dt)->count();
                $alert = DB::table('alertas_panico')->whereDate('created_at', $dt)->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        } elseif ($periodo === 'semanal') {
            for ($i = 11; $i >= 0; $i--) {
                $dt = now()->subWeeks($i);
                $start = $dt->copy()->startOfWeek();
                $end = $dt->copy()->endOfWeek();
                $label = 'Sem ' . $dt->weekOfYear;
                $inc = DB::table('incidentes')->whereBetween('created_at', [$start, $end])->count();
                $alert = DB::table('alertas_panico')->whereBetween('created_at', [$start, $end])->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        } elseif ($periodo === 'mensual') {
            for ($i = 11; $i >= 0; $i--) {
                $dt = now()->subMonths($i);
                $label = $dt->format('M Y');
                $inc = DB::table('incidentes')->whereYear('created_at', $dt->year)->whereMonth('created_at', $dt->month)->count();
                $alert = DB::table('alertas_panico')->whereYear('created_at', $dt->year)->whereMonth('created_at', $dt->month)->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        } elseif ($periodo === 'anual') {
            for ($i = 4; $i >= 0; $i--) {
                $dt = now()->subYears($i);
                $label = $dt->format('Y');
                $inc = DB::table('incidentes')->whereYear('created_at', $dt->year)->count();
                $alert = DB::table('alertas_panico')->whereYear('created_at', $dt->year)->count();
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        }

        return response()->json([
            'tarjetas' => ['pendientes' => $pendientes, 'en_curso' => $en_curso, 'alertas_total' => $alertas, 'usuarios' => $usuarios],
            'grafico_tipos' => $porTipo,
            'grafico_lineal' => $datosGrafico
        ]);
    }

    public function incidentes()
    {
        try {
            $incidentes = DB::table('incidentes')
                ->join('users', 'incidentes.user_id', '=', 'users.id')
                ->select('incidentes.*', 'users.name as estudiante_nombre', 'users.email as estudiante_email')
                ->orderBy('incidentes.created_at', 'desc')
                ->get();

            $incidentes->transform(function ($incidente) {
                if ($incidente->foto_path) {
                    $incidente->foto_path = asset('storage/' . $incidente->foto_path);
                }
                return $incidente;
            });

            return response()->json($incidentes);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error BD', 'detalle' => $e->getMessage()], 500);
        }
    }

    public function cambiarEstadoIncidente(Request $request, $id)
    {
        DB::table('incidentes')->where('id', $id)->update(['estado' => $request->estado]);
        return response()->json(['message' => 'Estado actualizado']);
    }

    // --- ALERTAS DE PÁNICO ---
    public function alertas()
    {
        $alertas = DB::table('alertas_panico')
            ->join('users', 'alertas_panico.user_id', '=', 'users.id')
            ->select('alertas_panico.*', 'users.name as estudiante_nombre', 'users.telefono', 'users.cedula')
            ->orderBy('alertas_panico.created_at', 'desc')
            ->get();

        return response()->json($alertas);
    }

    public function atenderAlerta($id)
    {
        DB::table('alertas_panico')->where('id', $id)->update(['atendida' => true]);
        return response()->json(['message' => 'Alerta marcada como atendida']);
    }

    // --- NOTICIAS Y PROTOCOLOS ---
    public function noticias()
    {
        $noticias = DB::table('noticias')
            ->join('users', 'noticias.created_by', '=', 'users.id')
            ->select('noticias.*', 'users.name as autor')
            ->orderBy('created_at', 'desc')
            ->get();

        $noticias->transform(function ($item) {
            if ($item->imagen_url) {
                $item->imagen_url = asset('storage/' . $item->imagen_url);
            }
            return $item;
        });

        return response()->json($noticias);
    }

    // --- FUNCIÓN PRINCIPAL CORREGIDA PARA ENVIAR NOTIFICACIÓN ---
    public function crearNoticia(Request $request)
    {
        // 1. Validar y subir imagen
        $path = null;
        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('noticias', 'public');
        }

        // 2. Guardar en Base de Datos y obtener el ID
        $id = DB::table('noticias')->insertGetId([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo,
            'imagen_url' => $path,
            'publicado' => true,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // 3. ENVIAR NOTIFICACIÓN PUSH A LA APP
        try {
            // Obtenemos todos los tokens registrados en la app
            $tokens = User::whereNotNull('fcm_token')->pluck('fcm_token')->all();

            if (!empty($tokens)) {
                $messaging = app('firebase.messaging');
                
                // Limpiamos el contenido HTML para que se vea bien en la notificación
                $contenidoPlano = strip_tags($request->contenido);
                
                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        'Nueva Publicación: ' . $request->titulo,
                        substr($contenidoPlano, 0, 100) . '...'
                    ))
                    // Configuración vital para que Android muestre la alerta
                    ->withAndroidConfig(AndroidConfig::fromArray([
                        'notification' => [
                            'channel_id' => 'seguridad_ueb_channel', // Debe coincidir con MainActivity.kt
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                            'sound' => 'default',
                            'priority' => 'high',
                        ],
                    ]));

                $messaging->sendMulticast($message, $tokens);
                Log::info("Notificación enviada a " . count($tokens) . " usuarios.");
            }
        } catch (\Exception $e) {
            // Si falla Firebase, registramos el error pero no detenemos la respuesta
            Log::error('Error enviando notificación desde AdminController: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Publicación exitosa y notificada']);
    }

    public function actualizarNoticia(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required|string',
            'contenido' => 'required|string',
            'tipo' => 'required|string',
            'imagen' => 'nullable|image|max:5120'
        ]);

        $noticia = DB::table('noticias')->where('id', $id)->first();

        if (!$noticia) {
            return response()->json(['message' => 'Noticia no encontrada'], 404);
        }

        $datosActualizar = [
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo,
            'updated_at' => now()
        ];

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('noticias', 'public');
            $datosActualizar['imagen_url'] = $path;
        }

        DB::table('noticias')->where('id', $id)->update($datosActualizar);

        return response()->json(['message' => 'Noticia actualizada']);
    }

    public function borrarNoticia($id)
    {
        DB::table('noticias')->where('id', $id)->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    // --- GESTIÓN DE USUARIOS ---

    public function index()
    {
        $usuarios = User::whereIn('rol', ['director', 'administrador'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($usuarios);
    }

    public function comunidad()
    {
        $usuarios = User::whereIn('rol', ['estudiante', 'docente', 'comunidad'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($usuarios);
    }

    public function storeUsuario(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'rol' => 'required|in:administrador,director,estudiante,docente',
            'cedula' => 'required|string|min:10',
            'telefono' => 'nullable|string'
        ]);

        $rolesAdministrativos = ['director', 'administrador'];
        $esNuevoAdmin = in_array($request->rol, $rolesAdministrativos);

        // Validar Cédula
        $existeCedulaEnSuGrupo = User::where('cedula', $request->cedula)
            ->where(function ($query) use ($esNuevoAdmin, $rolesAdministrativos) {
                if ($esNuevoAdmin) {
                    $query->whereIn('rol', $rolesAdministrativos);
                } else {
                    $query->whereNotIn('rol', $rolesAdministrativos);
                }
            })->exists();

        if ($existeCedulaEnSuGrupo) {
            $grupo = $esNuevoAdmin ? "Administrativo" : "Comunidad";
            return response()->json(['message' => "La cédula ya existe registrada en el grupo de $grupo."], 422);
        }

        // Validar Email
        $existeEmailEnSuGrupo = User::where('email', $request->email)
            ->where(function ($query) use ($esNuevoAdmin, $rolesAdministrativos) {
                if ($esNuevoAdmin) {
                    $query->whereIn('rol', $rolesAdministrativos);
                } else {
                    $query->whereNotIn('rol', $rolesAdministrativos);
                }
            })->exists();

        if ($existeEmailEnSuGrupo) {
            $grupo = $esNuevoAdmin ? "Administrativo" : "Comunidad";
            return response()->json(['message' => "El correo ya está en uso por otro usuario de $grupo."], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => $request->rol,
            'cedula' => $request->cedula,
            'telefono' => $request->telefono
        ]);

        return response()->json(['message' => 'Usuario creado exitosamente', 'user' => $user]);
    }

    public function updateUsuario(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'cedula' => 'required|string',
            'rol' => 'required'
        ]);

        $rolesAdministrativos = ['director', 'administrador'];
        $esAdminEditado = in_array($request->rol, $rolesAdministrativos);

        $existeCedula = User::where('cedula', $request->cedula)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($esAdminEditado, $rolesAdministrativos) {
                if ($esAdminEditado) {
                    $query->whereIn('rol', $rolesAdministrativos);
                } else {
                    $query->whereNotIn('rol', $rolesAdministrativos);
                }
            })->exists();

        if ($existeCedula) {
            return response()->json(['message' => 'La cédula ya existe en otro usuario de este grupo.'], 422);
        }

        $existeEmail = User::where('email', $request->email)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($esAdminEditado, $rolesAdministrativos) {
                if ($esAdminEditado) {
                    $query->whereIn('rol', $rolesAdministrativos);
                } else {
                    $query->whereNotIn('rol', $rolesAdministrativos);
                }
            })->exists();

        if ($existeEmail) {
            return response()->json(['message' => 'El correo ya existe en otro usuario de este grupo.'], 422);
        }

        $data = $request->only(['name', 'email', 'rol', 'cedula', 'telefono']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Usuario actualizado correctamente']);
    }

    public function destroyUsuario($id)
    {
        if (auth()->id() == $id) {
            return response()->json(['error' => 'No puedes eliminar tu propia cuenta'], 400);
        }
        User::destroy($id);
        return response()->json(['message' => 'Usuario eliminado']);
    }

    // --- GESTIÓN DE PUNTOS DEL MAPA ---
    public function listarPuntos()
    {
        try {
            return response()->json(PuntoMapa::all());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function guardarPunto(Request $request)
    {
        $request->validate([
            'titulo' => 'required',
            'latitud' => 'required',
            'longitud' => 'required',
            'tipo' => 'required'
        ]);

        PuntoMapa::create($request->all());
        return response()->json(['message' => 'Punto guardado en el mapa']);
    }

    public function borrarPunto($id)
    {
        PuntoMapa::destroy($id);
        return response()->json(['message' => 'Punto eliminado']);
    }

    public function actualizarPunto(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required',
            'latitud' => 'required',
            'longitud' => 'required',
            'tipo' => 'required'
        ]);

        $punto = PuntoMapa::findOrFail($id);
        
        $punto->update([
            'titulo' => $request->titulo,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'tipo' => $request->tipo,
            'descripcion' => $request->descripcion
        ]);

        return response()->json(['message' => 'Punto actualizado correctamente']);
    }
}