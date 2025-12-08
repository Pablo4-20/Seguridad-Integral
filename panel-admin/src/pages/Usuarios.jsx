import { useState, useEffect } from 'react';
import api from '../api/axios';

// --- ICONOS ---
const IconAdd = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconError = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', rol: 'admin', cedula: '', telefono: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/admin/usuarios');
            const personal = res.data.filter(u => u.rol === 'director' || u.rol === 'admin');
            setUsuarios(personal);
        } catch (error) {
            console.error("Error al cargar usuarios");
        }
    };

    useEffect(() => { cargarUsuarios() }, []);

    const openModal = () => {
        setEditMode(false);
        setFormData({ name: '', email: '', password: '', rol: 'admin', cedula: '', telefono: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditMode(true);
        setCurrentId(user.id);
        setFormData({
            name: user.name, email: user.email, password: '', 
            rol: user.rol, cedula: user.cedula || '', telefono: user.telefono || ''
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
                await api.put(`/admin/usuarios/${currentId}`, formData);
                showToast('Perfil actualizado correctamente', 'success');
            } else {
                await api.post('/admin/usuarios', formData);
                showToast('Usuario registrado exitosamente', 'success');
            }
            closeModal();
            cargarUsuarios();
        } catch (error) {
            showToast('Error al guardar. Revisa los datos.', 'error');
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
            await api.delete(`/admin/usuarios/${userToDelete}`);
            showToast('Usuario eliminado', 'success');
            cargarUsuarios();
        } catch (error) {
            showToast('No puedes eliminar tu propia cuenta.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

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
                        <h4 className="font-bold text-sm tracking-wide">{toast.type === 'success' ? '¡LISTO!' : 'ERROR'}</h4>
                        <p className="text-sm font-medium opacity-90">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* CABECERA */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Equipo Administrativo</h1>
                    <p className="text-slate-500 mt-1">Gestión de directores y administradores del sistema.</p>
                </div>
                <button 
                    onClick={openModal}
                    className="bg-ueb-blue hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all transform hover:-translate-y-1"
                >
                    <IconAdd />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Opciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {usuarios.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold shadow-inner">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide ${
                                        user.rol === 'director' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-700"><span className="text-slate-400 text-xs mr-1">CI:</span>{user.cedula || 'N/A'}</div>
                                    <div className="text-sm text-slate-700"><span className="text-slate-400 text-xs mr-1">TEL:</span>{user.telefono || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar">
                                            <IconEdit />
                                        </button>
                                        <button onClick={() => confirmDeleteClick(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                                            <IconTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {usuarios.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                                    No hay usuarios registrados aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL ELEGANTE (FORMULARIO) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all scale-100 overflow-hidden">
                        
                        {/* Header Modal */}
                        <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editMode ? 'Editar Perfil' : 'Nuevo Usuario'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Complete la información del funcionario.</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition">
                                <IconClose />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            
                            {/* Inputs Estilizados */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                                <input 
                                    name="name" type="text" required 
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-ueb-blue focus:border-transparent transition-all outline-none text-slate-800"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rol</label>
                                    <select 
                                        name="rol" 
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-ueb-blue outline-none text-slate-800 appearance-none"
                                        value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                    >
                                        <option value="admin">Administrador</option>
                                        <option value="director">Director</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cédula</label>
                                    <input name="cedula" type="text" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-ueb-blue outline-none text-slate-800" value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                                <input name="email" type="email" required className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-ueb-blue outline-none text-slate-800" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Contraseña {editMode && <span className="text-slate-400 normal-case font-normal">(Opcional)</span>}
                                </label>
                                <input 
                                    name="password" type="password" 
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-ueb-blue outline-none text-slate-800"
                                    placeholder={editMode ? "••••••••" : "Mínimo 6 caracteres"}
                                    required={!editMode}
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-ueb-blue text-white font-bold rounded-xl hover:bg-slate-900 transition shadow-lg shadow-blue-900/30">
                                    {loading ? 'Guardando...' : 'Guardar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL ELIMINAR (CONFIRMACIÓN) --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
                        <div className="mx-auto bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <IconWarning />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">¿Estás seguro?</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente el acceso de este usuario al sistema.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDeleteConfirm}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition"
                            >
                                Sí, Eliminar Usuario
                            </button>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
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