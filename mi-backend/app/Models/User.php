<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // <--- 1. IMPORTANTE: Asegúrate de que esta línea esté
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // <--- 2. IMPORTANTE: Agrega HasApiTokens aquí dentro
    use HasApiTokens, HasFactory, Notifiable; 

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',      // Agregamos estos campos que creamos en la migración
        'cedula',
        'telefono',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}