import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import logoUgr from '../assets/ugr.png';

// --- ICONOS ---
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>;
const IconAlerts = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>;
const IconNews = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-1.755-6.964C19.55 8.594 17.055 6 13.5 6c-2.83 0-5.262 1.67-6.47 4.027A4.125 4.125 0 0 0 5.25 18.57c1.19.53 2.547.802 3.95.802 1.52 0 2.978-.315 4.3-.887L15 19.129Z" /></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>;
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>;
const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { nombre: 'Admin', rol: '' };
    });
    const [collapsed, setCollapsed] = useState(false); 
    const [userMenuOpen, setUserMenuOpen] = useState(false); 
    const [settingsModalOpen, setSettingsModalOpen] = useState(false); 
    const [settingsTab, setSettingsTab] = useState('perfil'); 
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    
    // --- ALERTAS Y NOTIFICACIONES ---
    const [alertNotification, setAlertNotification] = useState(null); 
    const prevAlertCount = useRef(0);
    const prevIncidentCount = useRef(0); // Referencia para incidentes
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio('/alert.mp3');
    }, []);

    // --- SISTEMA DE MONITOREO (POLLING) ---
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                const response = await api.get('/admin/stats');
                const stats = response.data.tarjetas;

                // 1. ALERTA DE PÁNICO
                const currentAlerts = stats.alertas_total;
                if (prevAlertCount.current === 0 && currentAlerts > 0) {
                    prevAlertCount.current = currentAlerts;
                } else if (currentAlerts > prevAlertCount.current) {
                    triggerNotification('panic', "¡NUEVA ALERTA DE PÁNICO DETECTADA!");
                    prevAlertCount.current = currentAlerts;
                }

                // 2. NUEVO REPORTE (Corrección del nombre de variable)
                // En el backend se llama 'pendientes', no 'incidentes_pendientes'
                const currentIncidents = stats.pendientes; 
                
                if (prevIncidentCount.current === 0 && currentIncidents > 0) {
                    prevIncidentCount.current = currentIncidents;
                } else if (currentIncidents > prevIncidentCount.current) {
                    triggerNotification('report', "Nuevo Incidente Reportado");
                    prevIncidentCount.current = currentIncidents;
                } else if (currentIncidents < prevIncidentCount.current) {
                    // Si bajó (se atendió uno), actualizamos la referencia
                    prevIncidentCount.current = currentIncidents;
                }

            } catch (error) {
                console.error("Error conectando al monitor");
            }
        };

        checkUpdates();
        const interval = setInterval(checkUpdates, 3000); 
        return () => clearInterval(interval);
    }, []);

    const triggerNotification = (type, message) => {
        setAlertNotification({ type, message });
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Click requerido para audio"));
        }
        setTimeout(() => setAlertNotification(null), 8000);
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogoutClick = () => {
        setUserMenuOpen(false);
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        setIsLogoutModalOpen(false);
    };

    const linkClass = (path) => `
        flex items-center gap-4 py-3 px-4 rounded-lg transition-all duration-300
        ${location.pathname === path 
            ? "bg-ueb-blue text-white shadow-lg dark:bg-blue-600" 
            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}
        ${collapsed ? "justify-center" : ""}
    `;

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
            
            {/* --- NOTIFICACIÓN FLOTANTE DINÁMICA --- */}
            {alertNotification && (
                <div className={`fixed top-5 right-5 z-[150] w-full max-w-md bg-white dark:bg-slate-800 border-l-8 rounded-lg shadow-2xl transform transition-all duration-500 ease-out animate-bounce flex overflow-hidden ${
                    alertNotification.type === 'panic' ? 'border-red-600' : 'border-blue-600'
                }`}>
                    <div className="p-4 flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-full animate-pulse flex-shrink-0 ${
                            alertNotification.type === 'panic' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {alertNotification.type === 'panic' ? <IconAlerts /> : <IconFile />}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-lg uppercase tracking-wide ${
                                alertNotification.type === 'panic' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                                {alertNotification.type === 'panic' ? '¡EMERGENCIA!' : 'NUEVO REPORTE'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                                {alertNotification.message}
                            </p>
                            
                            <div className="mt-3 flex gap-3">
                                <Link 
                                    to={alertNotification.type === 'panic' ? "/alertas" : "/incidentes"} 
                                    onClick={() => setAlertNotification(null)}
                                    className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition shadow-md ${
                                        alertNotification.type === 'panic' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    VER DETALLES
                                </Link>
                                <button 
                                    onClick={() => setAlertNotification(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition dark:bg-slate-700 dark:text-slate-300"
                                >
                                    CERRAR
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setAlertNotification(null)} className="text-slate-400 hover:text-slate-600"><IconClose /></button>
                    </div>
                </div>
            )}

            {/* SIDEBAR (Igual que antes) */}
           <aside className={`bg-white dark:bg-slate-800 shadow-2xl flex flex-col transition-all duration-300 z-20 ${collapsed ? 'w-20' : 'w-72'}`}>
                
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
                    {!collapsed ? (
                        <div className="flex items-center gap-3">
                            {/* AQUÍ ESTÁ TU ICONO */}
                            <img 
                                src={logoUgr} 
                                alt="Logo" 
                                className="h-10 w-auto object-contain" // Ajusta h-10 según el tamaño que quieras
                            />
                            <h1 className="text-xl font-extrabold text-ueb-blue dark:text-white tracking-tight">
                                Seguridad-<span className="text-red-600">UEB</span>
                            </h1>
                        </div>
                    ) : (
                        // Opcional: Mostrar solo el logo cuando está colapsado
                        <div className="w-full flex justify-center">
                             <img src={logoUgr} alt="Logo" className="h-8 w-auto" />
                        </div>
                    )}

                    <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition">
                        <IconMenu />
                    </button>
                </div>

               <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <Link to="/dashboard" className={linkClass('/dashboard')} title="Dashboard">
                        <IconDashboard />
                        {!collapsed && <span className="font-medium">Panel Principal</span>}
                    </Link>
                    <Link to="/incidentes" className={linkClass('/incidentes')} title="Incidentes">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                        {!collapsed && <span className="font-medium">Incidentes</span>}
                    </Link>
                    <Link to="/alertas" className={linkClass('/alertas')} title="Alertas de Pánico">
                        <IconAlerts />
                        {!collapsed && <span className="font-medium">Alertas Pánico</span>}
                    </Link>
                    <Link to="/noticias" className={linkClass('/noticias')} title="Noticias">
                        <IconNews />
                        {!collapsed && <span className="font-medium">Comunicación</span>}
                    </Link>

                    {/* SECCIÓN USUARIOS SEPARADA */}
                    {user.rol === 'director' && (
                        <>
                            {!collapsed && <div className="px-4 mt-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Gestión Usuarios</div>}
                            
                            <Link to="/usuarios/administrativos" className={linkClass('/usuarios/administrativos')} title="Personal Administrativo">
                                <IconSettings /> {/* Puedes cambiar el icono */}
                                {!collapsed && <span className="font-medium">Administrativos</span>}
                            </Link>
                            
                            <Link to="/usuarios/comunidad" className={linkClass('/usuarios/comunidad')} title="Comunidad Universitaria">
                                <IconUsers />
                                {!collapsed && <span className="font-medium">Comunidad</span>}
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 relative">
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.nombre}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate uppercase">{user.rol}</p>
                            </div>
                        )}
                    </button>

                    {userMenuOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-600 overflow-hidden animate-fade-in-up z-50 w-56">
                            <div className="p-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase">Mi Cuenta</p>
                            </div>
                            <button onClick={() => { setSettingsModalOpen(true); setUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-ueb-blue flex items-center gap-2 transition">
                                <IconSettings /> Configuración
                            </button>
                            <button onClick={handleLogoutClick} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition">
                                <IconLogout /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 relative z-10">
                <Outlet />
            </main>

            {/* MODAL LOGOUT */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
                        <div className="mx-auto bg-red-50 dark:bg-red-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <IconWarning />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cerrar Sesión</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            ¿Estás seguro de que deseas salir del sistema?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition">Sí, Salir</button>
                            <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-3 bg-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-white transition">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIGURACIÓN (Igual que antes) */}
            {settingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Configuración</h2>
                            <button onClick={() => setSettingsModalOpen(false)} className="text-slate-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><IconClose /></button>
                        </div>
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button onClick={() => setSettingsTab('perfil')} className={`flex-1 py-3 text-sm font-bold ${settingsTab === 'perfil' ? 'text-ueb-blue border-b-2 border-ueb-blue dark:text-blue-400' : 'text-slate-400'}`}>Perfil</button>
                            <button onClick={() => setSettingsTab('sistema')} className={`flex-1 py-3 text-sm font-bold ${settingsTab === 'sistema' ? 'text-ueb-blue border-b-2 border-ueb-blue dark:text-blue-400' : 'text-slate-400'}`}>Sistema</button>
                        </div>
                        <div className="p-6 h-80 overflow-y-auto">
                            {settingsTab === 'perfil' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-white">{user.nombre.charAt(0).toUpperCase()}</div>
                                        <div><h3 className="font-bold text-slate-800 dark:text-white">{user.nombre}</h3><p className="text-sm text-slate-500 dark:text-slate-400 uppercase">{user.rol}</p></div>
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nombre</label><input type="text" value={user.nombre} readOnly className="w-full border rounded p-2 bg-slate-50 dark:bg-slate-900 dark:text-white" /></div>
                                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Correo</label><input type="text" value="admin@ueb.edu.ec" readOnly className="w-full border rounded p-2 bg-slate-50 dark:bg-slate-900 dark:text-white" /></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Apariencia</h4>
                                        <div className="flex gap-4">
                                            <button onClick={() => setDarkMode(false)} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${!darkMode ? 'border-ueb-blue bg-blue-50 text-ueb-blue' : 'border-slate-200 text-slate-400'}`}><IconSun /> <span className="text-xs font-bold">Claro</span></button>
                                            <button onClick={() => setDarkMode(true)} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${darkMode ? 'border-ueb-blue bg-slate-700 text-white' : 'border-slate-200 text-slate-400'}`}><IconMoon /> <span className="text-xs font-bold">Oscuro</span></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 flex justify-end"><button onClick={() => setSettingsModalOpen(false)} className="px-4 py-2 bg-ueb-blue text-white font-bold rounded-lg">Listo</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}