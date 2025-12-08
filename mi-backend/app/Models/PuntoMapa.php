<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PuntoMapa extends Model
{
    use HasFactory;

    // Definimos el nombre de la tabla explícitamente para evitar errores
    protected $table = 'puntos_mapas';

    // Permitimos que estos campos se guarden
    protected $fillable = [
        'titulo',
        'descripcion',
        'latitud',
        'longitud',
        'tipo'
    ];
}