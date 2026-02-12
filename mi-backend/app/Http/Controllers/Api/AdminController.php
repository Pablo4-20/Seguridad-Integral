<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Importante para la seguridad de contraseñas
use App\Models\User;
use App\Models\PuntoMapa;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        // 1. Contadores Generales (Tarjetas)
        $pendientes = DB::table('incidentes')->where('estado', 'pendiente')->count();
        $en_curso = DB::table('incidentes')->where('estado', 'en_curso')->count();
        $alertas = DB::table('alertas_panico')->count();
        $usuarios = DB::table('users')->count();

        // 2. Gráfico de Dona (Tipos)
        $porTipo = DB::table('incidentes')
            ->select('tipo', DB::raw('count(*) as total'))
            ->groupBy('tipo')
            ->get();

        // 3. LÓGICA DE TIEMPO "TRADING"
        $periodo = $request->input('periodo', 'hora'); // Default: 24 horas
        $datosGrafico = collect([]);

        if ($periodo === 'minuto') {
            // Últimos 60 minutos (Minuto a minuto)
            for ($i = 59; $i >= 0; $i--) {
                $dt = now()->subMinutes($i);
                $label = $dt->format('H:i');
                
                $inc = DB::table('incidentes')->whereBetween('created_at', [$dt->format('Y-m-d H:i:00'), $dt->format('Y-m-d H:i:59')])->count();
                $alert = DB::table('alertas_panico')->whereBetween('created_at', [$dt->format('Y-m-d H:i:00'), $dt->format('Y-m-d H:i:59')])->count();
                
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }

        } elseif ($periodo === 'hora') {
            // Últimas 24 horas (Hora a hora)
            for ($i = 23; $i >= 0; $i--) {
                $dt = now()->subHours($i);
                $label = $dt->format('H:00');
                
                $inc = DB::table('incidentes')->whereBetween('created_at', [$dt->format('Y-m-d H:00:00'), $dt->format('Y-m-d H:59:59')])->count();
                $alert = DB::table('alertas_panico')->whereBetween('created_at', [$dt->format('Y-m-d H:00:00'), $dt->format('Y-m-d H:59:59')])->count();
                
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }

        } elseif ($periodo === 'dia') {
            // Últimos 30 días (Día a día)
            for ($i = 29; $i >= 0; $i--) {
                $dt = now()->subDays($i);
                $label = $dt->format('d/m');
                
                $inc = DB::table('incidentes')->whereDate('created_at', $dt)->count();
                $alert = DB::table('alertas_panico')->whereDate('created_at', $dt)->count();
                
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }

        } elseif ($periodo === 'semanal') {
            // Últimas 12 semanas
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
            // Últimos 12 meses
            for ($i = 11; $i >= 0; $i--) {
                $dt = now()->subMonths($i);
                $label = $dt->format('M Y');
                
                $inc = DB::table('incidentes')->whereYear('created_at', $dt->year)->whereMonth('created_at', $dt->month)->count();
                $alert = DB::table('alertas_panico')->whereYear('created_at', $dt->year)->whereMonth('created_at', $dt->month)->count();
                
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }

        } elseif ($periodo === 'anual') {
            // Últimos 5 años
            for ($i = 4; $i >= 0; $i--) {
                $dt = now()->subYears($i);
                $label = $dt->format('Y');
                
                $inc = DB::table('incidentes')->whereYear('created_at', $dt->year)->count();
                $alert = DB::table('alertas_panico')->whereYear('created_at', $dt->year)->count();
                
                $datosGrafico->push(['label' => $label, 'incidentes' => $inc, 'alertas' => $alert]);
            }
        }

        return response()->json([
            'tarjetas' => [
                'pendientes' => $pendientes,
                'en_curso' => $en_curso,
                'alertas_total' => $alertas,
                'usuarios' => $usuarios
            ],
            'grafico_tipos' => $porTipo,
            'grafico_lineal' => $datosGrafico
        ]);
    }

    public function incidentes()
    {
        try {
            // CONSULTA SEGURA
            $incidentes = DB::table('incidentes')
                ->join('users', 'incidentes.user_id', '=', 'users.id')
                ->select(
                    'incidentes.*', // Datos del reporte
                    'users.name as estudiante_nombre', // Nombre del alumno
                    'users.email as estudiante_email'  // Email
                )
                ->orderBy('incidentes.created_at', 'desc') 
                ->get();

            // Procesar las fotos
            $incidentes->transform(function ($incidente) {
                if ($incidente->foto_path) {
                    $incidente->foto_path = asset('storage/' . $incidente->foto_path);
                }
                return $incidente;
            });

            return response()->json($incidentes);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en base de datos',
                'detalle' => $e->getMessage()
            ], 500);
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

        // --- TRANSFORMACIÓN DE IMÁGENES ---
        $noticias->transform(function ($item) {
            if ($item->imagen_url) {
                $item->imagen_url = asset('storage/' . $item->imagen_url);
            }
            return $item;
        });

        return response()->json($noticias);
    }

    public function crearNoticia(Request $request)
    {
        // Validar y subir imagen si existe
        $path = null;
        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('noticias', 'public');
        }

        DB::table('noticias')->insert([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo, // noticia, protocolo, recomendacion
            'imagen_url' => $path,
            'publicado' => true,
            'created_by' => auth()->id(), // El director logueado
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Publicación exitosa']);
    }

    // --- ACTUALIZAR NOTICIA ---
    public function actualizarNoticia(Request $request, $id)
    {
        // 1. Validar
        $request->validate([
            'titulo' => 'required|string',
            'contenido' => 'required|string',
            'tipo' => 'required|string',
            'imagen' => 'nullable|image|max:5120' // Máx 5MB
        ]);

        // 2. Buscar la noticia
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

        // 3. Si subió nueva imagen
        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('noticias', 'public');
            $datosActualizar['imagen_url'] = $path;
        }

        // 4. Actualizar en BD
        DB::table('noticias')->where('id', $id)->update($datosActualizar);

        return response()->json(['message' => 'Noticia actualizada']);
    }

    // --- ELIMINAR NOTICIA ---
    public function borrarNoticia($id)
    {
        DB::table('noticias')->where('id', $id)->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    // --- GESTIÓN DE USUARIOS ---

    // 1. LISTAR ADMINISTRATIVOS (Director y Administrador)
    public function index()
    {
        $usuarios = User::whereIn('rol', ['director', 'administrador'])
                        ->orderBy('created_at', 'desc')
                        ->get();
        return response()->json($usuarios);
    }

    // 2. LISTAR COMUNIDAD (Usuarios de la App - Rol 'comunidad')
    public function comunidad()
    {
        // CORRECCIÓN: Usamos whereIn para incluir todos los roles de la App móvil
        $usuarios = User::whereIn('rol', ['estudiante', 'docente', 'comunidad'])
                        ->orderBy('created_at', 'desc')
                        ->get();
        
        return response()->json($usuarios);
    }

    // Crear nuevo usuario (Solo administrativos)
    public function storeUsuario(Request $request)
    {
        // 1. Validaciones de formato básico
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'rol' => 'required|in:administrador,director,estudiante,docente', // Ajusta según tus roles reales
            'cedula' => 'required|string|min:10',
            'telefono' => 'nullable|string'
        ]);

        // 2. Definir los Grupos
        $rolesAdministrativos = ['director', 'administrador'];
        
        // ¿El usuario que intentamos crear es Admin?
        $esNuevoAdmin = in_array($request->rol, $rolesAdministrativos);

        // 3. VALIDACIÓN DE DUPLICADOS (Lógica por Grupos)
        
        // A) Validar CÉDULA
        $existeCedulaEnSuGrupo = User::where('cedula', $request->cedula)
            ->where(function ($query) use ($esNuevoAdmin, $rolesAdministrativos) {
                if ($esNuevoAdmin) {
                    // Si creo un Admin, busco si YA existe otro Admin con esa cédula
                    $query->whereIn('rol', $rolesAdministrativos);
                } else {
                    // Si creo un Comunidad, busco si YA existe otro Comunidad con esa cédula
                    $query->whereNotIn('rol', $rolesAdministrativos);
                }
            })->exists();

        if ($existeCedulaEnSuGrupo) {
            $grupo = $esNuevoAdmin ? "Administrativo" : "Comunidad";
            return response()->json([
                'message' => "La cédula ya existe registrada en el grupo de $grupo."
            ], 422);
        }

        // B) Validar CORREO (Misma lógica: se permite repetir SOLO si es entre Admin y Comunidad)
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
            return response()->json([
                'message' => "El correo ya está en uso por otro usuario de $grupo."
            ], 422);
        }

        // 4. Crear el Usuario
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

    // Actualizar usuario
    public function updateUsuario(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'cedula' => 'required|string',
            'rol' => 'required'
        ]);

        // Grupos
        $rolesAdministrativos = ['director', 'administrador'];
        $esAdminEditado = in_array($request->rol, $rolesAdministrativos); // Usamos el rol que viene en el request

        // 1. Validar Cédula (Excluyendo al propio usuario)
        $existeCedula = User::where('cedula', $request->cedula)
            ->where('id', '!=', $id) // Ignorar este usuario
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

        // 2. Validar Email (Excluyendo al propio usuario)
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

        // 3. Actualizar
        $data = $request->only(['name', 'email', 'rol', 'cedula', 'telefono']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Usuario actualizado correctamente']);
    }

    // Eliminar usuario
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
            $puntos = PuntoMapa::all();
            return response()->json($puntos);
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