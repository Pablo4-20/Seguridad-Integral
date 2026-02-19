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
            'name' => 'Pablo Holguin',
            'email' => 'pablo.holguin@ueb.edu.ec',
            'password' => Hash::make('123456'), // Contraseña conocida
            'rol' => 'comunidad',             // <--- ESTO ES LO QUE FALTABA
            'cedula' => '1752504926',
            'telefono' => '0980791149',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Kelvin Holguin',
            'email' => 'kelvin.holguin@ueb.edu.ec',
            'password' => Hash::make('123456'), // Contraseña conocida
            'rol' => 'comunidad',             // <--- ESTO ES LO QUE FALTABA
            'cedula' => '1752504801',
            'telefono' => '0995555555',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Katia Torres',
            'email' => 'katia.torres@ueb.edu.ec',
            'password' => Hash::make('123456'), // Contraseña conocida
            'rol' => 'comunidad',             // <--- ESTO ES LO QUE FALTABA
            'cedula' => '1752504802',
            'telefono' => '0996666666',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Nataly Silva',
            'email' => 'nataly.silva@ueb.edu.ec',
            'password' => Hash::make('123456'), // Contraseña conocida
            'rol' => 'comunidad',             // <--- ESTO ES LO QUE FALTABA
            'cedula' => '1752504803',
            'telefono' => '0997777777',
            'email_verified_at' => now(),
        ]);
    }
}