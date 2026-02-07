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
        User::create([
            'name' => 'Director General',
            'email' => 'director@ueb.edu.ec',
            'password' => Hash::make('admin123'),
            'rol' => 'director',
            'cedula' => '0101010101',
            'telefono' => '0991111111',
        ]);

        // ADMIN (Soporte)
        User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@ueb.edu.ec',
            'password' => Hash::make('admin123'),
            'rol' => 'admin',
            'cedula' => '0202020202',
            'telefono' => '0992222222',
        ]);


        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }
}
