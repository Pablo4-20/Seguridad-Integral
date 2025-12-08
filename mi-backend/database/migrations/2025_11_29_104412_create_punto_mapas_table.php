<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('puntos_mapas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('descripcion')->nullable();
            $table->string('latitud');
            $table->string('longitud');
            $table->string('tipo'); // 'seguro' (Verde) o 'peligro' (Rojo)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('punto_mapas');
    }
};
