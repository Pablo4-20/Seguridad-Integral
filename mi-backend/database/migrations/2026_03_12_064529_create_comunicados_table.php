<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comunicados', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('archivo_pdf'); // Guardará la ruta del archivo
            $table->enum('categoria', [
                'plan_estudiantil',
                'protocolos_seguridad',
                'recomendaciones',
                'mochila_emergencia',
                'alertas_avisos'
            ]);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comunicados');
    }
};
