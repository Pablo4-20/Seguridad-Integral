import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import L from 'leaflet';

// --- ICONOS ---
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconError = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;

// --- ICONOS DE MAPA ---
const GreenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const BlueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

export default function MapaGestor() {
    const [puntos, setPuntos] = useState([]);
    const [nuevoPunto, setNuevoPunto] = useState(null);
    const [formData, setFormData] = useState({ titulo: '', tipo: 'seguro', descripcion: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // --- ESTADOS DE EDICIÓN ---
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- ESTADOS DE SELECCIÓN Y PAGINACIÓN ---
    const [selectedPointId, setSelectedPointId] = useState(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const centroUEB = [-1.5710143143738293, -79.00727750000001]; 
    const mapRef = useRef();

    // Cálculos de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPuntos = puntos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(puntos.length / itemsPerPage);

    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const cargarPuntos = async () => {
        try {
            const res = await api.get('/mapa/puntos');
            setPuntos(res.data);
        } catch (error) {
            console.error("Error cargando mapa");
        }
    };

    useEffect(() => { cargarPuntos() }, []);

    // Auto-Scroll
    useEffect(() => {
        if (selectedPointId) {
            const index = puntos.findIndex(p => p.id === selectedPointId);
            if (index !== -1) {
                const targetPage = Math.ceil((index + 1) / itemsPerPage);
                if (targetPage !== currentPage) setCurrentPage(targetPage);
                setTimeout(() => {
                    const element = document.getElementById(`punto-${selectedPointId}`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        }
    }, [selectedPointId, puntos]);

    function ClickHandler() {
        useMapEvents({
            click(e) {
                // Al hacer clic en mapa vacío, iniciamos creación
                iniciarCreacion(e.latlng);
            },
        });
        return null;
    }

    // --- FUNCIONES DE EDICIÓN ---
    
    const iniciarCreacion = (latlng) => {
        setIsEditing(false);
        setEditId(null);
        setNuevoPunto(latlng);
        setFormData({ titulo: '', tipo: 'seguro', descripcion: '' });
        setSelectedPointId(null);
    };

    const iniciarEdicion = (punto) => {
        setIsEditing(true);
        setEditId(punto.id);
        // Ponemos el marcador azul en la posición original para que lo mueva si quiere
        setNuevoPunto({ lat: parseFloat(punto.latitud), lng: parseFloat(punto.longitud) });
        setFormData({ titulo: punto.titulo, tipo: punto.tipo, descripcion: punto.descripcion || '' });
        
        // Seleccionar y centrar
        setSelectedPointId(punto.id);
        if(mapRef.current) mapRef.current.flyTo([punto.latitud, punto.longitud], 18);
    };

    const cancelarAccion = () => {
        setNuevoPunto(null);
        setIsEditing(false);
        setEditId(null);
        setFormData({ titulo: '', tipo: 'seguro', descripcion: '' });
    };

    const handleMarkerClick = (punto) => {
        setSelectedPointId(punto.id);
        // Si no estamos editando, solo seleccionamos. Si estamos editando otro, cambiamos.
        if (isEditing && editId !== punto.id) {
            cancelarAccion();
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!nuevoPunto) return;
        try {
            const payload = {
                ...formData,
                latitud: nuevoPunto.lat,
                longitud: nuevoPunto.lng
            };

            if (isEditing) {
                await api.put(`/admin/mapa/${editId}`, payload);
                showToast('Punto actualizado', 'success');
            } else {
                await api.post('/admin/mapa', payload);
                showToast('Punto creado', 'success');
            }
            
            cancelarAccion();
            cargarPuntos();
        } catch (error) {
            showToast('Error al guardar', 'error');
        }
    };

    // Borrado
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [puntoToDelete, setPuntoToDelete] = useState(null);

    const handleBorrarClick = (id) => {
        setPuntoToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmarBorrado = async () => {
        if (!puntoToDelete) return;
        try {
            await api.delete(`/admin/mapa/${puntoToDelete}`);
            showToast('Punto eliminado', 'success');
            if (currentPuntos.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
            cargarPuntos();
        } catch (error) { showToast('Error al eliminar', 'error'); } 
        finally { setIsDeleteModalOpen(false); setPuntoToDelete(null); }
    };

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            
            {toast.show && (
                <div className={`absolute top-4 right-4 z-[9999] px-6 py-4 rounded-xl shadow-xl text-white font-bold animate-bounce ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.message}
                </div>
            )}

            {/* COLUMNA 1: CONTROLES Y LISTA */}
            <div className="bg-white p-4 rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col h-full">
                
                <div className="flex-none">
                    <h3 className="font-bold text-lg mb-4 text-ueb-blue">
                        {isEditing ? '✏️ Editando Punto' : '1. Gestión de Puntos'}
                    </h3>
                    
                    {/* FORMULARIO (Sirve para Crear y Editar) */}
                    {nuevoPunto ? (
                        <form onSubmit={handleGuardar} className={`space-y-3 mb-6 border-b pb-4 p-3 rounded-lg animate-fade-in ${isEditing ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="text-xs text-gray-500">
                                <strong>Coord:</strong> {nuevoPunto.lat.toFixed(4)}, {nuevoPunto.lng.toFixed(4)}
                            </div>
                            
                            <input 
                                type="text" placeholder="Nombre" required 
                                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-ueb-blue outline-none" 
                                value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} 
                            />
                            
                            <select 
                                className="w-full border p-2 rounded text-sm bg-white outline-none" 
                                value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                            >
                                <option value="seguro">🟢 Punto Seguro</option>
                                <option value="peligro">🔴 Zona Peligro</option>
                            </select>

                            <div className="flex gap-2">
                                <button type="submit" className={`flex-1 text-white py-1.5 rounded text-sm font-bold ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button type="button" onClick={cancelarAccion} className="flex-1 bg-gray-200 text-gray-600 py-1.5 rounded text-sm font-bold hover:bg-gray-300">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded mb-4 border border-blue-100 flex items-center gap-2">
                            <span>👆</span> Toca el mapa para agregar.
                        </div>
                    )}
                </div>

                {/* LISTA DE ITEMS */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <ul className="space-y-2">
                            {currentPuntos.map(p => (
                                <li 
                                    key={p.id} 
                                    id={`punto-${p.id}`}
                                    onClick={() => {
                                        setSelectedPointId(p.id);
                                        if(mapRef.current) mapRef.current.flyTo([p.latitud, p.longitud], 18);
                                    }}
                                    className={`
                                        flex justify-between items-center p-2.5 rounded border cursor-pointer transition-colors duration-200
                                        ${selectedPointId === p.id 
                                            ? 'bg-blue-50 border-ueb-blue' 
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="overflow-hidden">
                                        <div className={`font-bold text-sm truncate ${selectedPointId === p.id ? 'text-ueb-blue' : 'text-gray-800'}`}>
                                            {p.titulo}
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase ${p.tipo === 'seguro' ? 'text-green-600' : 'text-red-600'}`}>
                                            {p.tipo}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                        {/* BOTÓN EDITAR */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); iniciarEdicion(p); }} 
                                            className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-full transition"
                                            title="Editar"
                                        >
                                            <IconEdit />
                                        </button>
                                        
                                        {/* BOTÓN BORRAR */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleBorrarClick(p.id); }} 
                                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition"
                                            title="Eliminar"
                                        >
                                            <IconTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {puntos.length === 0 && <li className="text-xs text-gray-400 italic text-center mt-4">No hay puntos.</li>}
                        </ul>
                    </div>

                    {/* PAGINACIÓN */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-4 pt-2 border-t border-gray-100">
                            <button onClick={prevPage} disabled={currentPage === 1} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"><IconChevronLeft /></button>
                            <span className="text-xs font-bold text-gray-600">{currentPage} / {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition"><IconChevronRight /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMNA 2: MAPA */}
            <div className="lg:col-span-2 rounded-lg overflow-hidden border-2 border-gray-300 relative shadow-md z-0">
                <MapContainer center={centroUEB} zoom={18} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickHandler />
                    
                    {/* Marcador Azul (Creación/Edición) - DRAGGABLE */}
                    {nuevoPunto && (
                        <Marker 
                            position={nuevoPunto} 
                            icon={BlueIcon} 
                            draggable={true} // Permite moverlo
                            eventHandlers={{
                                dragend: (e) => setNuevoPunto(e.target.getLatLng())
                            }}
                        >
                           <Popup>📍 Arrástrame para ajustar</Popup>
                        </Marker>
                    )}

                    {/* Puntos Guardados */}
                    {puntos.map(p => (
                        // Si estamos editando este punto, lo ocultamos del mapa principal para que no se duplique con el azul
                        (isEditing && p.id === editId) ? null : (
                            <Marker 
                                key={p.id} 
                                position={[p.latitud, p.longitud]} 
                                icon={p.tipo === 'seguro' ? GreenIcon : RedIcon}
                                eventHandlers={{ click: () => handleMarkerClick(p) }}
                            >
                                <Popup>
                                    <strong className="text-ueb-blue">{p.titulo}</strong> <br />
                                    {p.tipo === 'seguro' ? '✅ Zona Segura' : '🚫 Peligro'}
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>

            {/* MODAL BORRAR */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar Punto?</h3>
                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={confirmarBorrado} className="w-full py-2 bg-red-600 text-white font-bold rounded-lg">Sí, Eliminar</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-2 text-slate-500 font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}