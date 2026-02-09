import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Iconos
const IconAdd = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const IconWeb = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>;
const IconMobile = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>;

export default function Usuarios({ tipo }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Configuración según el prop 'tipo'
    const esAdmin = tipo === 'admin';
    const endpoint = esAdmin ? '/admin/usuarios' : '/admin/comunidad';

    const config = esAdmin ? {
        titulo: 'Personal Administrativo',
        subtitulo: 'Gestión de Directores y Administradores', // Texto actualizado
        colorBadge: 'bg-blue-100 text-blue-800',
        iconoPlataforma: <IconWeb />,
        textoPlataforma: 'Acceso Web',
        roles: [
            { value: 'director', label: 'Director' },
            { value: 'administrador', label: 'Administrador' } // CAMBIO AQUÍ: coordinador -> administrador
        ],
        defaultRol: 'administrador' // Por defecto sugerimos administrador
    } : {
        titulo: 'Comunidad Universitaria',
        subtitulo: 'Gestión de Estudiantes y Docentes',
        colorBadge: 'bg-green-100 text-green-800',
        iconoPlataforma: <IconMobile />,
        textoPlataforma: 'Acceso App',
        roles: [
            { value: 'estudiante', label: 'Estudiante' },
            { value: 'docente', label: 'Docente' }
        ],
        defaultRol: 'estudiante'
    };

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', rol: config.defaultRol, cedula: '', telefono: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get(endpoint);
            setUsuarios(res.data);
        } catch (error) {
            console.error("Error cargando usuarios");
        }
    };

    useEffect(() => { 
        cargarUsuarios();
        setFormData(prev => ({...prev, rol: config.defaultRol}));
    }, [tipo]);

    const openModal = () => {
        setEditMode(false);
        setFormData({ name: '', email: '', password: '', rol: config.defaultRol, cedula: '', telefono: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditMode(true);
        setCurrentId(user.id);
        setFormData({
            name: user.name, 
            email: user.email, 
            password: '', 
            rol: user.rol, 
            cedula: user.cedula || '', 
            telefono: user.telefono || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode) {
                await api.put(`${endpoint}/${currentId}`, formData);
                showToast('Usuario actualizado', 'success');
            } else {
                await api.post(endpoint, formData);
                showToast('Usuario creado', 'success');
            }
            closeModal();
            cargarUsuarios();
        } catch (error) {
            showToast('Error al guardar.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteClick = (id) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`${endpoint}/${userToDelete}`);
            showToast('Usuario eliminado', 'success');
            cargarUsuarios();
        } catch (error) {
            showToast('No se pudo eliminar.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="relative min-h-screen pb-10">
            
            {/* TABS DE NAVEGACIÓN */}
            <div className="mb-6 bg-slate-200 p-1 rounded-xl inline-flex shadow-inner">
                <Link 
                    to="/usuarios/administrativos"
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        esAdmin 
                        ? 'bg-white text-ueb-blue shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Administrativos
                </Link>
                <Link 
                    to="/usuarios/comunidad"
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        !esAdmin 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Comunidad
                </Link>
            </div>

            {/* Cabecera */}
            <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 ${config.colorBadge}`}>
                        {config.iconoPlataforma}
                        <span className="uppercase tracking-wide">{config.titulo}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-slate-500 mt-1">{config.subtitulo}</p>
                </div>
                <button 
                    onClick={openModal}
                    className={`text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 ${
                        esAdmin ? 'bg-blue-900 hover:bg-blue-800' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    <IconAdd />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Plataforma</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {usuarios.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md mr-4 ${esAdmin ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                            {!esAdmin && <div className="text-[10px] text-slate-400">CI: {user.cedula}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-slate-100 text-slate-700 uppercase">
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        {config.iconoPlataforma}
                                        <span>{config.textoPlataforma}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3"><IconEdit /></button>
                                    <button onClick={() => confirmDeleteClick(user.id)} className="text-red-600 hover:text-red-900"><IconTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usuarios.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-sm">No hay usuarios registrados aquí.</div>
                )}
            </div>

            {/* Modal Formulario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center ${esAdmin ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <h3 className="text-xl font-bold text-slate-800">{editMode ? 'Editar' : 'Crear'} Usuario</h3>
                            <button onClick={closeModal}><IconClose /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <input name="name" required className="w-full px-4 py-3 border rounded-lg" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            
                            <div className="flex gap-4">
                                <select name="rol" className="w-full px-4 py-3 border rounded-lg bg-white" value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                                    {config.roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                                {!esAdmin && (
                                    <input name="cedula" className="w-full px-4 py-3 border rounded-lg" placeholder="Cédula" value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
                                )}
                            </div>

                            <input name="email" type="email" required className="w-full px-4 py-3 border rounded-lg" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            <input name="password" type="password" className="w-full px-4 py-3 border rounded-lg" placeholder={`Contraseña ${editMode ? '(Opcional)' : ''}`} required={!editMode} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            
                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 border rounded-xl hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl ${esAdmin ? 'bg-blue-900' : 'bg-green-600'}`}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold mb-4">¿Eliminar usuario?</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDeleteConfirm} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl">Sí, Eliminar</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 text-slate-500 font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl text-white font-bold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}