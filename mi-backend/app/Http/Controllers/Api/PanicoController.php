<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PanicoController extends Controller
{
    // HU #9: Guardar la alerta que viene del celular
    public function store(Request $request)
    {
        // 1. Validamos que lleguen las coordenadas
        $request->validate([
            'latitud' => 'required',
            'longitud' => 'required',
        ]);

        // 2. Insertamos directamente en la Base de Datos
        // Usamos DB::table para máxima velocidad (Requisito de rendimiento < 3s)
        $id = DB::table('alertas_panico')->insertGetId([
            'user_id' => auth()->id(), // El usuario que envió el token
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'atendida' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Respondemos al celular
        return response()->json([
            'message' => 'ALERTA RECIBIDA',
            'alerta_id' => $id,
            'status' => 'SOS_SENT'
        ], 201);
    }

    // HU #4: Para que el Director vea las alertas en el Dashboard Web
    public function index()
    {
        // Traemos las alertas incluyendo el nombre del estudiante que la envió
        $alertas = DB::table('alertas_panico')
            ->join('users', 'alertas_panico.user_id', '=', 'users.id')
            ->select('alertas_panico.*', 'users.name as usuario_nombre', 'users.cedula', 'users.telefono')
            ->orderBy('alertas_panico.created_at', 'desc')
            ->get();

        return response()->json($alertas);
    }

    // HU #9: Historial de mis alertas propias
    public function misAlertas()
    {
        $alertas = DB::table('alertas_panico')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($alertas);
    }
}