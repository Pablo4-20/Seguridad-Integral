<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // En Postgres, Laravel suele nombrar la restricción como 'users_email_unique'
            $table->dropUnique('users_email_unique');
            
            // SI alguna vez definiste la cédula como unique en la migración, descomenta esto:
            // $table->dropUnique('users_cedula_unique'); 
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};