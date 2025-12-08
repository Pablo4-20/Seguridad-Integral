import { useState, useEffect } from 'react';
import api from '../api/axios';
import MapaGestor from '../components/MapaGestor';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// --- ICONOS ---
const IconNews = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" /></svg>;
const IconAdd = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconImage = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconError = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const IconMap = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>;
const IconPublish = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-ueb-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;

// --- DATOS DE CATEGORÍAS ---
const categories = [
    { id: 'noticia', label: 'Plan Estudiantil', icon: '📘', description: 'Noticias y comunicados generales.' },
    { id: 'protocolo', label: 'Protocolo de Seguridad', icon: '🛡️', description: 'Pasos a seguir en emergencias.' },
    { id: 'recomendacion', label: 'Recomendación', icon: '💡', description: 'Consejos preventivos.' },
    { id: 'mochila', label: 'Mochila de Emergencia', icon: '🎒', description: 'Listado de items esenciales.' },
    { id: 'notificacion', label: 'Alerta / Aviso', icon: '⚠️', description: 'Mensajes urgentes.' },
];

export default function Noticias() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('nueva'); 
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Filtro de Categoría
    const [filtroCategoria, setFiltroCategoria] = useState('todas');

    // Estados de Modales y Edición
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    
    // Estado de Edición
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Estados del Formulario
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [tipo, setTipo] = useState('noticia');
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    
    // Estado para el Dropdown Personalizado
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Configuración Editor
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'color', 'background', 'align'
    ];

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const cargarNoticias = async () => {
        try {
            const res = await api.get('/admin/noticias');
            setNoticias(res.data);
        } catch (error) {
            console.error("Error cargando noticias");
        }
    };

    useEffect(() => { cargarNoticias() }, []);

    const noticiasFiltradas = noticias.filter(item => 
        filtroCategoria === 'todas' || item.tipo === filtroCategoria
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // --- FUNCIONES DE LIMPIEZA Y EDICIÓN ---
    
    // Solo limpia los datos, NO cambia la pestaña
    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setTitulo('');
        setContenido('');
        setImagen(null);
        setPreview(null);
    };

    // Acción del botón "Cancelar" dentro del formulario
    const handleCancelEdit = () => {
        resetForm();
        setActiveTab('lista'); // Aquí sí queremos volver a la lista
    };

    // Acción del botón "Editar" en la tarjeta
    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        
        // Llenar formulario
        setTitulo(item.titulo);
        setContenido(item.contenido);
        setTipo(item.tipo);
        setPreview(item.imagen_url); 
        setImagen(null); 

        setActiveTab('nueva'); // Ir al formulario
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        setIsPublishModalOpen(true);
    };

    const handleConfirmPublish = async () => {
        setLoading(true);
        setIsPublishModalOpen(false);

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        formData.append('tipo', tipo);
        
        if (imagen) {
            formData.append('imagen', imagen);
        }

        if (isEditing) {
            formData.append('_method', 'PUT');
        }

        try {
            const url = isEditing ? `/admin/noticias/${editId}` : '/admin/noticias';
            
            await api.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            showToast(isEditing ? 'Publicación actualizada correctamente' : 'Publicación creada exitosamente', 'success');
            
            resetForm(); // Limpiamos formulario
            cargarNoticias();
            setActiveTab('lista'); // Volvemos a la lista
        } catch (error) {
            showToast('Error al guardar. Intenta de nuevo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/admin/noticias/${itemToDelete}`);
            showToast('Publicación eliminada', 'success');
            cargarNoticias();
        } catch (error) {
            showToast('Error al eliminar', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const getBadgeColor = (type) => {
        switch(type) {
            case 'protocolo': return 'bg-red-100 text-red-700 border-red-200';
            case 'recomendacion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'notificacion': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'mochila': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'ruta_evacuacion': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getFriendlyName = (type) => {
        const cat = categories.find(c => c.id === type);
        return cat ? cat.label : type.toUpperCase();
    };

    return (
        <div className="relative min-h-screen pb-10">
            {/* TOAST */}
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

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-ueb-blue">Gestión de Contenidos</h1>
                <p className="text-gray-600 mt-2">Publica noticias, protocolos y alertas para la App Móvil.</p>
            </div>

            {/* TABS CORREGIDOS */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit mb-8">
                <button 
                    onClick={() => { resetForm(); setActiveTab('nueva'); }} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'nueva' ? 'bg-ueb-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <IconAdd /> {isEditing ? 'Editando Publicación' : 'Nueva Publicación'}
                </button>
                <button 
                    onClick={() => { resetForm(); setActiveTab('lista'); }} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'lista' ? 'bg-ueb-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <IconNews /> Publicaciones Activas
                </button>
                <button 
                    onClick={() => { resetForm(); setActiveTab('mapa'); }} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'mapa' ? 'bg-ueb-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <IconMap /> Rutas y Puntos
                </button>
            </div>

            {/* --- VISTA 1: FORMULARIO --- */}
            {activeTab === 'nueva' && (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible">
                    <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-700">{isEditing ? 'Editar Contenido' : 'Redactar Contenido'}</h2>
                        {isEditing && (
                            <button onClick={handleCancelEdit} className="text-xs text-red-500 font-bold hover:underline">
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handlePreSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-ueb-blue outline-none text-gray-800" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                            </div>
                            
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría</label>
                                <button 
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-ueb-blue focus:border-transparent flex items-center justify-between transition-all hover:border-gray-300"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-xl">{categories.find(c => c.id === tipo)?.icon}</span>
                                        <span className="font-medium text-gray-700 truncate">{categories.find(c => c.id === tipo)?.label}</span>
                                    </span>
                                    <IconChevronDown />
                                </button>

                                {isCategoryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)}></div>
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fade-in-up max-h-80 overflow-y-auto">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => { setTipo(cat.id); setIsCategoryOpen(false); }}
                                                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${tipo === cat.id ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <span className="text-2xl mt-0.5">{cat.icon}</span>
                                                    <div>
                                                        <p className={`font-bold text-sm ${tipo === cat.id ? 'text-ueb-blue' : 'text-gray-800'}`}>{cat.label}</p>
                                                        <p className="text-xs text-gray-400">{cat.description}</p>
                                                    </div>
                                                    {tipo === cat.id && <div className="ml-auto text-ueb-blue"><IconCheck /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-48">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Imagen (Opcional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-[calc(100%-1.5rem)] rounded-xl border-2 border-dashed border-gray-300 hover:border-ueb-blue hover:bg-blue-50 transition cursor-pointer text-gray-400 group">
                                    <IconImage />
                                    <span className="mt-2 text-sm font-medium group-hover:text-ueb-blue">
                                        {isEditing && preview ? 'Cambiar imagen' : 'Subir imagen'}
                                    </span>
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="h-48 relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vista Previa</label>
                                <div className="w-full h-[calc(100%-1.5rem)] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
                                    {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">Sin imagen</span>}
                                </div>
                                {preview && <button type="button" onClick={() => {setImagen(null); setPreview(null)}} className="absolute top-8 right-2 bg-white/80 hover:bg-white text-red-500 p-1 rounded-full shadow-sm transition" title="Quitar"><IconTrash /></button>}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contenido Detallado</label>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <ReactQuill theme="snow" value={contenido} onChange={setContenido} modules={modules} formats={formats} className="h-60 mb-10" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            {isEditing && (
                                <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                            )}
                            <button type="submit" disabled={loading} className={`text-white font-bold py-3 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2 ${isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-ueb-blue hover:bg-slate-900'}`}>
                                {loading ? (isEditing ? 'Actualizando...' : 'Publicando...') : <>{isEditing ? <IconCheck /> : <IconPublish />} {isEditing ? 'Actualizar' : 'Publicar'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- VISTA 2: LISTA --- */}
            {activeTab === 'lista' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <IconFilter />
                            <span className="font-bold text-sm">Filtrar por categoría:</span>
                        </div>
                        <select className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-ueb-blue outline-none bg-white cursor-pointer flex-1 md:flex-none md:w-64" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                            <option value="todas">Todas las categorías</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>)}
                        </select>
                        {filtroCategoria !== 'todas' && <button onClick={() => setFiltroCategoria('todas')} className="text-red-500 text-sm font-bold hover:underline">Borrar filtro</button>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {noticiasFiltradas.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400 text-lg font-medium">{filtroCategoria !== 'todas' ? 'No hay publicaciones en esta categoría.' : 'No hay publicaciones activas.'}</p>
                                {filtroCategoria === 'todas' && <button onClick={() => setActiveTab('nueva')} className="mt-2 text-ueb-blue font-bold hover:underline">Crear la primera</button>}
                            </div>
                        ) : (
                            noticiasFiltradas.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="h-40 w-full bg-gray-100 relative group">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('flex', 'items-center', 'justify-center'); e.target.parentNode.innerHTML = '<span class="text-4xl opacity-30">🖼️</span>'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><IconImage /></div>
                                        )}
                                        <div className="absolute top-3 right-3"><span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border shadow-sm tracking-wide ${getBadgeColor(item.tipo)}`}>{getFriendlyName(item.tipo)}</span></div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2"><span className="text-xs font-medium text-gray-400">📅 {new Date(item.created_at).toLocaleDateString()}</span></div>
                                        <h3 className="text-base font-bold text-slate-800 mb-2 leading-tight line-clamp-2">{item.titulo}</h3>
                                        <div className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 prose prose-sm" dangerouslySetInnerHTML={{ __html: item.contenido }} />
                                        
                                        <div className="pt-3 border-t border-gray-50 flex justify-end gap-2">
                                            {/* BOTÓN EDITAR */}
                                            <button 
                                                onClick={() => handleEditClick(item)} 
                                                className="text-indigo-500 hover:text-indigo-700 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <IconEdit />
                                            </button>
                                            {/* BOTÓN ELIMINAR */}
                                            <button 
                                                onClick={() => handleDeleteClick(item.id)} 
                                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <IconTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* --- VISTA 3: MAPA --- */}
            {activeTab === 'mapa' && (
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-4">
                    <div className="mb-4 px-2"><h2 className="text-lg font-bold text-gray-700">Gestión de Rutas y Puntos</h2><p className="text-sm text-gray-500">Haz clic en el mapa para agregar puntos de encuentro o zonas de peligro.</p></div>
                    <MapaGestor />
                </div>
            )}

            {/* MODALES */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
                        <div className="mx-auto bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6"><IconPublish /></div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{isEditing ? '¿Actualizar?' : '¿Publicar?'}</h3>
                        <div className="flex flex-col gap-3 mt-6">
                            <button onClick={handleConfirmPublish} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg ${isEditing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-ueb-blue hover:bg-blue-900'}`}>Sí, {isEditing ? 'Actualizar' : 'Publicar'}</button>
                            <button onClick={() => setIsPublishModalOpen(false)} className="w-full py-3 bg-transparent text-slate-500 font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar?</h3>
                        <div className="flex flex-col gap-3 mt-6">
                            <button onClick={handleConfirmDelete} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg">Sí, Eliminar</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 bg-transparent text-slate-500 font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}