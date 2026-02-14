<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. DIRECTOR (Para entrar al Panel Web)
        User::create([
            'name' => 'Director General',
            'email' => 'director@ueb.edu.ec',
            'password' => Hash::make('admin123'),
            'rol' => 'director', 
            'cedula' => '0101010101',
            'telefono' => '0991111111',
            'email_verified_at' => now(),
        ]);

        // 2. ADMINISTRADOR (Soporte)
        User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@ueb.edu.ec',
            'password' => Hash::make('admin123'),
            'rol' => 'administrador', 
            'cedula' => '0202020202',
            'telefono' => '0992222222',
            'email_verified_at' => now(),
            
        ]);

        // 3. USUARIO DE COMUNIDAD (Para entrar a la App Móvil)
        User::create([
            'name' => 'Estudiante Prueba',
            'email' => 'estudiante@ueb.edu.ec',
            'password' => Hash::make('123456'), // Contraseña conocida
            'rol' => 'comunidad',             // <--- ESTO ES LO QUE FALTABA
            'cedula' => '0505050505',
            'telefono' => '0995555555',
            'email_verified_at' => now(),
        ]);
    }
}