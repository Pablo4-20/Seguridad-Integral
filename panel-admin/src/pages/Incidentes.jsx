import { useEffect, useState } from 'react';
import api from '../api/axios';

// --- ICONOS ---
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconError = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

export default function Incidentes() {
    const [incidentes, setIncidentes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroFecha, setFiltroFecha] = useState('');

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); 
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
    
    const [cambioPendiente, setCambioPendiente] = useState(null); 
    const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null); 

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const cargarIncidentes = async () => {
        try {
            const response = await api.get('/admin/incidentes');
            setIncidentes(response.data);
        } catch (error) {
            console.error("Error cargando incidentes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarIncidentes();
        const intervalo = setInterval(() => {
            cargarIncidentes();
        }, 5000);
        return () => clearInterval(intervalo);
    }, []);

    const prepararCambioEstado = (id, nuevoEstado) => {
        const actual = incidentes.find(i => i.id === id).estado;
        if (actual === nuevoEstado) return;
        setCambioPendiente({ id, nuevoEstado });
        setIsStatusModalOpen(true);
    };

    const confirmarCambioEstado = async () => {
        if (!cambioPendiente) return;
        try {
            await api.put(`/admin/incidentes/${cambioPendiente.id}`, { estado: cambioPendiente.nuevoEstado });
            showToast('Estado actualizado correctamente', 'success');
            cargarIncidentes();
        } catch (error) {
            showToast('Error al actualizar', 'error');
        } finally {
            setIsStatusModalOpen(false);
            setCambioPendiente(null);
        }
    };

    const verDetalle = (incidente) => {
        setIncidenteSeleccionado(incidente);
        setIsDetailModalOpen(true);
    };

    const incidentesFiltrados = incidentes.filter(item => {
        const coincideTexto = item.estudiante_nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
        const coincideTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
        const coincideFecha = !filtroFecha || item.created_at.startsWith(filtroFecha);
        return coincideTexto && coincideEstado && coincideTipo && coincideFecha;
    });

    if (loading && incidentes.length === 0) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ueb-blue"></div></div>;

    return (
        <div className="relative min-h-screen pb-10">
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[80] flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-bounce ${
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
                    <h1 className="text-3xl font-bold text-ueb-blue">Gestión de Incidentes</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-gray-500 text-xs font-bold">Actualización en tiempo real</p>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-bold text-sm border border-blue-200">
                    Total: {incidentesFiltrados.length} Reportes
                </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconSearch /></div>
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ueb-blue outline-none text-gray-700" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconCalendar /></div>
                    <input type="date" className="pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ueb-blue outline-none text-gray-700 cursor-pointer" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <IconFilter />
                    <select className="border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-ueb-blue outline-none bg-white cursor-pointer" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="todos">Estado: Todos</option>
                        <option value="pendiente">⚠️ Pendientes</option>
                        <option value="en_curso">⏳ En Curso</option>
                        <option value="resuelto">✅ Resueltos</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <select className="border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-ueb-blue outline-none bg-white cursor-pointer" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <option value="todos">Tipo: Todos</option>
                        <option value="Robo">Robo</option>
                        <option value="Emergencia Médica">Emergencia Médica</option>
                        <option value="Acoso">Acoso</option>
                        <option value="Infraestructura">Infraestructura</option>
                        <option value="Incendio">Incendio</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                {(busqueda || filtroEstado !== 'todos' || filtroTipo !== 'todos' || filtroFecha) && (
                    <button onClick={() => { setBusqueda(''); setFiltroEstado('todos'); setFiltroTipo('todos'); setFiltroFecha(''); }} className="text-red-500 text-sm font-bold hover:text-red-700 hover:underline px-2">Borrar Filtros</button>
                )}
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Evidencia</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Detalle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incidentesFiltrados.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.foto_path ? (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 cursor-pointer" onClick={() => verDetalle(item)}>
                                                <img src={item.foto_path} alt="Evidencia" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 text-xs">Sin Foto</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-800">{item.estudiante_nombre}</div>
                                        <div className="text-xs text-gray-500">{item.estudiante_email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] font-extrabold rounded uppercase tracking-wide border mb-1 ${
                                            item.tipo === 'Robo' ? 'bg-red-50 text-red-700 border-red-100' : 
                                            item.tipo === 'Emergencia Médica' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {item.tipo}
                                        </span>
                                        <p className="text-sm text-gray-600 line-clamp-1 max-w-xs cursor-pointer hover:text-blue-600" onClick={() => verDetalle(item)}>{item.descripcion}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="relative">
                                            <select 
                                                value={item.estado} 
                                                onChange={(e) => prepararCambioEstado(item.id, e.target.value)}
                                                className={`appearance-none w-32 pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border-2 focus:outline-none cursor-pointer transition-colors ${
                                                    item.estado === 'pendiente' ? 'border-red-200 text-red-700 bg-red-50 focus:border-red-400' : 
                                                    item.estado === 'resuelto' ? 'border-green-200 text-green-700 bg-green-50 focus:border-green-400' : 
                                                    'border-yellow-200 text-yellow-700 bg-yellow-50 focus:border-yellow-400'
                                                }`}
                                            >
                                                <option value="pendiente">PENDIENTE</option>
                                                <option value="en_curso">EN CURSO</option>
                                                <option value="resuelto">RESUELTO</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => verDetalle(item)} className="text-gray-400 hover:text-ueb-blue p-2 rounded-full hover:bg-blue-50 transition-all" title="Ver detalle completo">
                                            <IconEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {incidentesFiltrados.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-400">No se encontraron resultados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL CAMBIO ESTADO --- */}
            {isStatusModalOpen && cambioPendiente && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="mx-auto bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6"><IconWarning /></div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Cambiar Estado?</h3>
                        <p className="text-slate-500 mb-6">El incidente pasará a <strong className="uppercase text-blue-600">{cambioPendiente.nuevoEstado.replace('_', ' ')}</strong>.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmarCambioEstado} className="w-full py-3 bg-ueb-blue hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg">Sí, Actualizar</button>
                            <button onClick={() => { setIsStatusModalOpen(false); setCambioPendiente(null); }} className="w-full py-3 bg-transparent text-slate-500 font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DETALLE (CON CORRECCIÓN DE TEXTO) --- */}
            {isDetailModalOpen && incidenteSeleccionado && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">Detalle del Incidente</h2>
                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wide">ID: #{incidenteSeleccionado.id}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="bg-white text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition shadow-sm border border-gray-200">
                                <IconClose />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/3 flex flex-col gap-4">
                                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 aspect-square flex items-center justify-center relative group">
                                        {incidenteSeleccionado.foto_path ? (
                                            <>
                                                <img src={incidenteSeleccionado.foto_path} alt="Evidencia" className="w-full h-full object-cover" />
                                                <a href={incidenteSeleccionado.foto_path} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">Abrir Original ↗</a>
                                            </>
                                        ) : <span className="text-gray-400 text-xs">Sin Evidencia</span>}
                                    </div>
                                    <div className={`p-4 rounded-xl border text-center ${
                                        incidenteSeleccionado.estado === 'pendiente' ? 'bg-red-50 border-red-100 text-red-700' :
                                        incidenteSeleccionado.estado === 'en_curso' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                                        'bg-green-50 border-green-100 text-green-700'
                                    }`}>
                                        <p className="text-xs uppercase font-bold tracking-wider mb-1">Estado Actual</p>
                                        <p className="text-lg font-black">{incidenteSeleccionado.estado.replace('_', ' ').toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reportado Por</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-ueb-blue text-white flex items-center justify-center font-bold text-lg shadow-md">
                                                {incidenteSeleccionado.estudiante_nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg">{incidenteSeleccionado.estudiante_nombre}</p>
                                                <p className="text-sm text-gray-500">{incidenteSeleccionado.estudiante_email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold mb-1">TIPO</p>
                                            <p className="font-semibold text-slate-700">{incidenteSeleccionado.tipo}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold mb-1">FECHA Y HORA</p>
                                            <p className="font-semibold text-slate-700">{new Date(incidenteSeleccionado.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción Detallada</h4>
                                        {/* --- CORRECCIÓN APLICADA AQUÍ: break-words --- */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                                            {incidenteSeleccionado.descripcion}
                                        </div>
                                    </div>

                                    <a href={`https://www.google.com/maps/search/?api=1&query=${incidenteSeleccionado.latitud},${incidenteSeleccionado.longitud}`} target="_blank" rel="noreferrer" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                        📍 Ver Ubicación en Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}