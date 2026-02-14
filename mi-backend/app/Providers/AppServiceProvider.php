<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail; // <--- Importante
use Illuminate\Notifications\Messages\MailMessage; // <--- Importante

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // --- PERSONALIZACIÓN DEL CORREO DE VERIFICACIÓN ---
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verifica tu cuenta - Seguridad Integral') // Asunto del correo
                ->greeting('¡Hola ' . $notifiable->name . '!') // Saludo con el nombre del usuario
                ->line('Gracias por registrarte en la App de Seguridad Integral.')
                ->line('Por favor, haz clic en el siguiente botón para confirmar que este es tu correo institucional:')
                ->action('Verificar mi Cuenta', $url) // Texto del botón y el enlace mágico
                ->line('Si tú no creaste esta cuenta, no es necesario realizar ninguna acción.')
                ->salutation('Atentamente, el Equipo de Seguridad.'); // Despedida
        });
    }
}