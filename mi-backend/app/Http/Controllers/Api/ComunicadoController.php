<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comunicado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ComunicadoController extends Controller
{
    // Listar comunicados (puedes filtrar por categoría si lo deseas)
    public function index(Request $request)
    {
        $query = Comunicado::query();
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // Subir un nuevo comunicado PDF
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'categoria' => 'required|in:plan_estudiantil,protocolos_seguridad,recomendaciones,mochila_emergencia,alertas_avisos',
            'archivo_pdf' => 'required|mimes:pdf|max:10240', // Máximo 10MB
        ]);

        $path = $request->file('archivo_pdf')->store('comunicados', 'public');

        $comunicado = Comunicado::create([
            'titulo' => $request->titulo,
            'categoria' => $request->categoria,
            'archivo_pdf' => '/storage/' . $path,
        ]);

        return response()->json(['message' => 'Comunicado subido con éxito', 'comunicado' => $comunicado], 201);
    }

    // Actualizar comunicado (y reemplazar el PDF si se envía uno nuevo)
    public function update(Request $request, $id)
    {
        $comunicado = Comunicado::findOrFail($id);

        $request->validate([
            'titulo' => 'required|string|max:255',
            'categoria' => 'required|in:plan_estudiantil,protocolos_seguridad,recomendaciones,mochila_emergencia,alertas_avisos',
            'archivo_pdf' => 'nullable|mimes:pdf|max:10240',
        ]);

        $comunicado->titulo = $request->titulo;
        $comunicado->categoria = $request->categoria;

        if ($request->hasFile('archivo_pdf')) {
            // Eliminar archivo anterior si existe
            $oldPath = str_replace('/storage/', '', $comunicado->archivo_pdf);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Guardar nuevo archivo
            $path = $request->file('archivo_pdf')->store('comunicados', 'public');
            $comunicado->archivo_pdf = '/storage/' . $path;
        }

        $comunicado->save();

        return response()->json(['message' => 'Comunicado actualizado', 'comunicado' => $comunicado]);
    }

    // Eliminar comunicado y su archivo
    public function destroy($id)
    {
        $comunicado = Comunicado::findOrFail($id);
        
        $path = str_replace('/storage/', '', $comunicado->archivo_pdf);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $comunicado->delete();

        return response()->json(['message' => 'Comunicado eliminado']);
    }
}