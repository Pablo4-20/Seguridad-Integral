package com.example.ejemplo.data

// Lo que enviamos al servidor
data class LoginRequest(
    val email: String,
    val password: String
)

// Lo que el servidor nos responde (según lo que programamos en Laravel)
data class LoginResponse(
    val message: String,
    val access_token: String,
    val user: Usuario // Reutilizamos tu clase Usuario existente
)