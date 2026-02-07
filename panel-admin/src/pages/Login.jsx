import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

import logoUgr from '../assets/ugr.png';

// Iconos para inputs
const IconEmail = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Enviamos origen: 'web' para validar permisos administrativos en el backend
            const response = await api.post('/login', { 
                email, 
                password,
                origen: 'web' 
            });
            
            const rol = response.data.user.rol;
            
            // Doble verificación (Frontend + Backend)
            if (rol !== 'admin' && rol !== 'director') {
                setError('Acceso denegado: No tienes permisos administrativos.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');

        } catch (err) {
            // Manejo de errores específicos del backend
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Credenciales incorrectas. Inténtalo de nuevo.');
                } else if (err.response.status === 403) {
                    setError(err.response.data.message || 'Acceso denegado.');
                } else {
                    setError('Error del servidor. Intenta más tarde.');
                }
            } else {
                setError('Error de conexión. Verifica tu red.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Fondo decorativo (Círculos difuminados) */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-gray-100">
                
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <img 
                            src={logoUgr} 
                            alt="Logo UGR" 
                            className="h-24 w-auto object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Bienvenido</h2>
                    <p className="text-sm text-gray-500 mt-2">Ingresa tus credenciales para acceder al panel.</p>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {/* Input Correo */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-ueb-blue transition-colors">
                            <IconEmail />
                        </div>
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ueb-blue focus:border-transparent outline-none text-gray-700 transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                            placeholder="correo@ueb.edu.ec"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Input Contraseña */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-ueb-blue transition-colors">
                            <IconLock />
                        </div>
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ueb-blue focus:border-transparent outline-none text-gray-700 transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Botón */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3.5 bg-ueb-blue text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transform active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Iniciando...
                            </>
                        ) : (
                            'INICIAR SESIÓN'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                       Universidad Estatal de Bolívar - Sistema de Seguridad Integral &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}