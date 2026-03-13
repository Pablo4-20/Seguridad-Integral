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
    
    // Nuevos estados para controlar las ventanas modales
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { 
                email, 
                password,
                origen: 'web' 
            });
            
            const rol = response.data.user.rol;
            
            if (rol !== 'admin' && rol !== 'administrador' && rol !== 'director') {
                setError('Acceso denegado: No tienes permisos administrativos.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            navigate('/dashboard', { replace: true });

        } catch (err) {
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
            {/* Fondo decorativo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            {/* Tarjeta del Formulario */}
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

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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
            </div>

            {/* Footer con enlaces */}
            <footer className="absolute bottom-0 w-full bg-slate-800/80 py-4 text-center z-20 border-t border-slate-700 backdrop-blur-sm">
                <p className="text-sm text-gray-300 font-medium">
                    Universidad Estatal de Bolívar - Sistema de Seguridad Integral &copy; 2026
                </p>
                <div className="mt-2 text-xs flex justify-center gap-4 text-gray-400">
                    <button 
                        type="button"
                        onClick={() => setShowTeamModal(true)} 
                        className="hover:text-blue-400 hover:underline transition-colors focus:outline-none"
                    >
                        Equipo de Desarrollo
                    </button>
                    <span>|</span>
                    <button 
                        type="button"
                        onClick={() => setShowTermsModal(true)} 
                        className="hover:text-blue-400 hover:underline transition-colors focus:outline-none"
                    >
                        Términos y Condiciones
                    </button>
                </div>
            </footer>

            {/* MODAL: Equipo de Desarrollo */}
            {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        {/* Botón X para cerrar */}
                        <button 
                            onClick={() => setShowTeamModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Equipo de Desarrollo</h3>
                        
                        <div className="text-sm text-gray-600 space-y-4 mb-6">
                           
                            <div>
                                <p className="font-semibold text-gray-800">Desarrolladores de Software:</p>
                                <ul className="list-disc list-inside pl-2 mt-1 space-y-2">
                                    <li>
                                        <strong>Pablo Holguin</strong> - <span className="text-gray-500">Fullstack Developer</span>
                                        <a 
                                            href="https://github.com/Pablo4-20" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-block align-middle ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                                            title="GitHub de Pablo Holguin"
                                        >
                                            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Nataly Silva</strong> - <span className="text-gray-500">Backend & Base de Datos</span>
                                        <a 
                                            href="https://github.com/tu-usuario-nataly" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-block align-middle ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                                            title="GitHub de Nataly Silva"
                                        >
                                            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                
                                </ul>
                            </div>
                           
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                                <p className="text-xs text-blue-800">
                                    <strong>Contacto de Soporte:</strong><br/>
                                    david17holguin@gmail.com                 | +593 980791149 | 
                                    natalydomenicasilvavillagran18@gmail.com | +593 988555031 | 
                                </p>
                            </div>
                            
                            <p className="mt-4 italic text-xs text-gray-400 text-center">
                                Sistema de Seguridad Integral v1.0 <br/>
                                Desarrollado en la Universidad Estatal de Bolívar.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => setShowTeamModal(false)}
                            className="w-full py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL: Términos y Condiciones */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                         {/* Botón X para cerrar */}
                         <button 
                            onClick={() => setShowTermsModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Términos y Condiciones</h3>
                        <div className="text-sm text-gray-600 space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <p><strong>1. Uso del Sistema:</strong> Este sistema es de uso exclusivo para el personal autorizado de la Universidad Estatal de Bolívar.</p>
                            <p><strong>2. Confidencialidad:</strong> Toda la información manejada dentro de este panel es de carácter estrictamente confidencial. La divulgación no autorizada será penalizada </p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="font-semibold text-gray-800 mb-2">2.1 Restricciones:</p>
                                <p className="mb-2">Queda estrictamente prohibido:</p>
                                <div className="pl-2 space-y-2">
                                    <p><strong>a)</strong> Compartir, copiar o distribuir el código fuente sin autorización.</p>
                                    <p><strong>b)</strong> La presentación o comercialización del sistema como una creación ajena al equipo de desarrollo original.</p>
                                    <p><strong>c)</strong> Cualquier modificación o derivación del sistema sin la autorización expresa y por escrito de los autores.</p>
                                </div>
                            </div>
                            <p><strong>3. Responsabilidad:</strong> El usuario es responsable de todas las acciones realizadas bajo sus credenciales de acceso. No comparta su contraseña con terceros.</p>
                            <p><strong>4. Monitoreo:</strong> Las actividades dentro de este sistema pueden ser monitoreadas y registradas por motivos de seguridad y auditoría integral.</p>
                            {/* Puedes agregar más texto aquí, el contenedor tiene un scroll si el texto es muy largo */}
                        </div>
                        
                        <button 
                            onClick={() => setShowTermsModal(false)}
                            className="w-full py-2.5 bg-ueb-blue text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Aceptar y Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}