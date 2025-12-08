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
            'tipo' => 'required' // noticia, protocolo, recomendacion
        ]);

        $id = DB::table('noticias')->insertGetId([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'tipo' => $request->tipo,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Publicado', 'id' => $id]);
    }
}