<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class IncidenteController extends Controller
{
    // HU #8: Guardar nuevo reporte
    public function store(Request $request)
    {
        // 1. Validamos los datos
        $request->validate([
            'tipo' => 'required|string', // Robo, Médico, etc.
            'descripcion' => 'required|string',
            'latitud' => 'nullable|string',
            'longitud' => 'nullable|string',
            'foto' => 'nullable|image|max:5120' // Máximo 5MB
        ]);

        $fotoPath = null;

        // 2. Si enviaron foto, la guardamos en la carpeta 'public/incidentes'
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('incidentes', 'public');
        }

        // 3. Guardamos en Base de Datos
        $id = DB::table('incidentes')->insertGetId([
            'user_id' => auth()->id(),
            'tipo' => $request->tipo,
            'descripcion' => $request->descripcion,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'foto_path' => $fotoPath,
            'estado' => 'pendiente', // Por defecto
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reporte enviado correctamente',
            'id' => $id
        ], 201);
    }

    // HU #8: Ver mis propios reportes (Historial)
    public function index()
    {
        $misReportes = DB::table('incidentes')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($misReportes);
    }
}