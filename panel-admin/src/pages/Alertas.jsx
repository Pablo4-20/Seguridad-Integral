import { useEffect, useState } from 'react';
import api from '../api/axios';

// --- ICONOS ---
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconError = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;

export default function Alertas() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);

    // ESTADOS DE FILTRO
    const [busqueda, setBusqueda] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, pendiente, atendida

    // ESTADO MODALES Y TOAST
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

    // Función para mostrar notificación
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // Cargar datos
    const cargarAlertas = async () => {
        try {
            const response = await api.get('/admin/alertas');
            setAlertas(response.data);
        } catch (error) {
            console.error("Error al cargar alertas");
        } finally {
            setLoading(false);
        }
    };

    // Prepara el modal de confirmación
    const confirmarAtencion = (id) => {
        setAlertaSeleccionada(id);
        setIsModalOpen(true);
    };

    // Ejecuta la acción
    const atenderAlerta = async () => {
        try {
            await api.put(`/admin/alertas/${alertaSeleccionada}`);
            showToast('Emergencia marcada como atendida', 'success');
            cargarAlertas(); // Recargar la tabla
        } catch (error) {
            showToast('Error al actualizar el estado', 'error');
        } finally {
            setIsModalOpen(false);
            setAlertaSeleccionada(null);
        }
    };

    useEffect(() => {
        cargarAlertas();
        const intervalo = setInterval(cargarAlertas, 10000); // Auto-refresh cada 10s
        return () => clearInterval(intervalo);
    }, []);

    // --- LÓGICA DE FILTRADO ---
    const alertasFiltradas = alertas.filter(item => {
        const coincideTexto = item.estudiante_nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideFecha = !filtroFecha || item.created_at.startsWith(filtroFecha);
        const coincideEstado = 
            filtroEstado === 'todos' ||
            (filtroEstado === 'atendida' && item.atendida) ||
            (filtroEstado === 'pendiente' && !item.atendida);

        return coincideTexto && coincideFecha && coincideEstado;
    });

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div></div>;

    return (
        <div className="relative min-h-screen pb-10">
            
            {/* TOAST FLOTANTE */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[60] flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-bounce ${
                    toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                } text-white`}>
                    <div className="p-1 bg-white bg-opacity-20 rounded-full">
                        {toast.type === 'success' ? <IconCheck /> : <IconError />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{toast.type === 'success' ? '¡LISTO!' : 'ERROR'}</h4>
                        <p className="text-sm opacity-90">{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-red-700">🚨 Monitoreo de Pánico</h1>
                    <p className="text-gray-500 mt-1">Gestión de emergencias en tiempo real.</p>
                </div>
                <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg font-bold text-sm border border-red-200">
                    Total: {alertasFiltradas.length} Alertas
                </div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                {/* Buscador */}
                <div className="flex-1 min-w-[200px] relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconSearch />
                    </div>
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-700"
                        placeholder="Buscar estudiante..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Filtro Fecha */}
                <div className="flex items-center gap-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconCalendar />
                    </div>
                    <input 
                        type="date" 
                        className="pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700 cursor-pointer"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                </div>

                {/* Filtro Estado */}
                <div className="flex items-center gap-2">
                    <IconFilter />
                    <select 
                        className="border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-red-500 outline-none bg-white cursor-pointer"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="todos">Estado: Todos</option>
                        <option value="pendiente">⚠️ Pendientes</option>
                        <option value="atendida">✅ Atendidas</option>
                    </select>
                </div>

                {/* Botón Limpiar */}
                {(busqueda || filtroFecha || filtroEstado !== 'todos') && (
                    <button 
                        onClick={() => { setBusqueda(''); setFiltroFecha(''); setFiltroEstado('todos'); }}
                        className="text-gray-500 text-sm font-bold hover:text-red-600 hover:underline px-2"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* --- TABLA --- */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-red-900 uppercase tracking-wider">Estudiante</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-red-900 uppercase tracking-wider">Fecha / Hora</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-red-900 uppercase tracking-wider">Ubicación GPS</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-red-900 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-red-900 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {alertasFiltradas.map((item) => (
                            <tr key={item.id} className={!item.atendida ? "bg-red-50 animate-pulse" : "hover:bg-gray-50 transition-colors"}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{item.estudiante_nombre}</div>
                                    <div className="text-xs text-gray-500 flex flex-col">
                                        <span>Tel: {item.telefono || 'N/A'}</span>
                                        <span>CI: {item.cedula || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(item.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${item.latitud},${item.longitud}`}
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition shadow-sm"
                                    >
                                        <span>📍</span> Ver Mapa
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {item.atendida ? (
                                        <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                                            ATENDIDA
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-xs font-bold text-red-700 bg-white border-2 border-red-500 rounded-full shadow-sm animate-bounce">
                                            ¡PENDIENTE!
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!item.atendida && (
                                        <button 
                                            onClick={() => confirmarAtencion(item.id)}
                                            className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-green-700 transition transform hover:scale-105"
                                        >
                                            ✅ Atender
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        
                        {alertasFiltradas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl opacity-30">🛡️</span>
                                        <span className="text-lg font-medium">No se encontraron alertas</span>
                                        <p className="text-sm text-gray-400">Ajusta los filtros para ver más resultados.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL DE CONFIRMACIÓN --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
                        <div className="mx-auto bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <IconWarning />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Atender Emergencia?</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Se marcará esta alerta como resuelta. Asegúrate de haber coordinado la ayuda necesaria.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={atenderAlerta}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition"
                            >
                                Sí, Marcar Atendida
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-3 bg-transparent text-slate-500 font-bold hover:text-slate-700 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}