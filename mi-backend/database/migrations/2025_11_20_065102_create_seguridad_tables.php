<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. TABLA INCIDENTES (Requisito: Historia de Usuario #8)
        Schema::create('incidentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Usuario que reporta
            $table->string('tipo'); // Robo, Médico, etc.
            $table->text('descripcion');
            $table->string('latitud')->nullable(); // GPS Latitud
            $table->string('longitud')->nullable(); // GPS Longitud
            $table->string('foto_path')->nullable(); // Evidencia (Opcional)
            $table->string('estado')->default('pendiente'); // Estado del reporte
            $table->timestamps();
        });

        // 2. TABLA ALERTAS DE PÁNICO (Requisito: Historia de Usuario #9)
        Schema::create('alertas_panico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('latitud');
            $table->string('longitud');
            $table->boolean('atendida')->default(false);
            $table->timestamps();
        });

        // 3. TABLA NOTICIAS (Requisito: Historia de Usuario #5)
        Schema::create('noticias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('contenido');
            $table->string('tipo'); // Noticia o Protocolo
            $table->string('imagen_url')->nullable();
            $table->boolean('publicado')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('noticias');
        Schema::dropIfExists('alertas_panico');
        Schema::dropIfExists('incidentes');
    }
};