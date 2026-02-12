import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// --- ICONOS ---
const IconAdd = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const IconWeb = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>;
const IconMobile = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const IconEyeSlash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;

// --- FUNCIONES DE VALIDACIÓN ---

const validarCedulaEcuatoriana = (cedula) => {
    if (!cedula || cedula.length !== 10) return false;
    
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    const digitoTres = parseInt(cedula.substring(2, 3));
    if (digitoTres >= 6) return false; 

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let total = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
        if (valor > 9) valor -= 9;
        total += valor;
    }

    const verificador = total % 10 === 0 ? 0 : 10 - (total % 10);
    return verificador === parseInt(cedula.charAt(9));
};

export default function Usuarios({ tipo }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showPassword, setShowPassword] = useState(false);

    const esAdmin = tipo === 'admin';
    const endpoint = esAdmin ? '/admin/usuarios' : '/admin/comunidad';

    const config = esAdmin ? {
        titulo: 'Personal Administrativo',
        subtitulo: 'Gestión de Directores y Administradores',
        colorBadge: 'bg-blue-100 text-blue-800',
        iconoPlataforma: <IconWeb />,
        textoPlataforma: 'Acceso Web',
        roles: [
            { value: 'director', label: 'Director' },
            { value: 'administrador', label: 'Administrador' }
        ],
        defaultRol: 'administrador'
    } : {
        titulo: 'Comunidad Universitaria',
        subtitulo: 'Gestión de Estudiantes y Docentes',
        colorBadge: 'bg-green-100 text-green-800',
        iconoPlataforma: <IconMobile />,
        textoPlataforma: 'Acceso App',
        roles: [
            { value: 'estudiante', label: 'Estudiante' },
            { value: 'docente', label: 'Docente' },
            { value: 'comunidad', label: 'Comunidad' }
        ],
        defaultRol: 'estudiante'
    };

    const [formData, setFormData] = useState({
        nombres: '', apellidos: '', email: '', password: '', rol: config.defaultRol, cedula: '', telefono: ''
    });

    const [errors, setErrors] = useState({});

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
        setErrors({});
    }, [tipo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let error = null;

        if (name === 'cedula') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10); 
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            
            if (numericValue.length < 10) {
                error = "Faltan dígitos (10 requeridos)";
            } else if (!validarCedulaEcuatoriana(numericValue)) {
                error = "Cédula inválida (Verifique dígitos)";
            }
            
            setErrors(prev => ({ ...prev, [name]: error }));
            return; 
        }

        if (name === 'password') {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (value && !passwordRegex.test(value)) {
                error = "Mín. 8 caracteres, 1 mayúscula y 1 número.";
            }
        }

        if (name === 'email') {
             const emailRegex = /^[a-zA-Z0-9._%+-]+@(ueb\.edu\.ec|mailes\.ueb\.edu\.ec)$/;
             if (value && !emailRegex.test(value)) {
                 error = "Solo correos @ueb.edu.ec o @mailes.ueb.edu.ec";
             }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const openModal = () => {
        setEditMode(false);
        setFormData({ nombres: '', apellidos: '', email: '', password: '', rol: config.defaultRol, cedula: '', telefono: '' });
        setErrors({});
        setShowPassword(false); 
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditMode(true);
        setCurrentId(user.id);
        setErrors({});
        setShowPassword(false);
        
        let n = '', a = '';
        if(user.name) {
             const parts = user.name.trim().split(' ');
             if(parts.length >= 2) {
                 n = parts[0];
                 a = parts.slice(1).join(' ');
             } else {
                 n = user.name;
             }
        }

        setFormData({
            nombres: n,
            apellidos: a, 
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

    const validateSubmit = () => {
        const currentErrors = {};
        
        if (!formData.nombres.trim()) currentErrors.nombres = "Requerido";
        if (!formData.apellidos.trim()) currentErrors.apellidos = "Requerido";
        
        if (!formData.cedula) currentErrors.cedula = "Requerido";
        else if (!validarCedulaEcuatoriana(formData.cedula)) currentErrors.cedula = "Cédula Inválida";

        const emailRegex = /^[a-zA-Z0-9._%+-]+@(ueb\.edu\.ec|mailes\.ueb\.edu\.ec)$/;
        if (!formData.email) currentErrors.email = "Requerido";
        else if (!emailRegex.test(formData.email)) currentErrors.email = "Correo Institucional Inválido";

        if (!editMode || formData.password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (!formData.password) { if(!editMode) currentErrors.password = "Requerido"; }
            else if (!passwordRegex.test(formData.password)) currentErrors.password = "Contraseña insegura";
        }

        setErrors(currentErrors);
        return Object.keys(currentErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateSubmit()) {
            showToast('Corrija los errores marcados en rojo', 'error');
            return;
        }

        setLoading(true);
        const dataToSend = {
            ...formData,
            name: `${formData.nombres.trim()} ${formData.apellidos.trim()}`
        };

        try {
            if (editMode) {
                await api.put(`${endpoint}/${currentId}`, dataToSend);
                showToast('Usuario actualizado', 'success');
            } else {
                await api.post(endpoint, dataToSend);
                showToast('Usuario creado', 'success');
            }
            closeModal();
            cargarUsuarios();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                 showToast(error.response.data.message, 'error');
            } else {
                showToast('Error al guardar. Verifique los datos.', 'error');
            }
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

    const getInputClass = (fieldName) => {
        const base = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ";
        if (errors[fieldName]) return base + "border-red-500 ring-red-100 bg-red-50";
        if (formData[fieldName] && !errors[fieldName] && fieldName !== 'nombres' && fieldName !== 'apellidos') return base + "border-emerald-500 ring-emerald-100 bg-emerald-50"; 
        return base + "border-slate-200 focus:ring-blue-100";
    };

    return (
        <div className="relative min-h-screen pb-10">
            {/* TABS */}
            <div className="mb-6 bg-slate-200 p-1 rounded-xl inline-flex shadow-inner">
                <Link to="/usuarios/administrativos" className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${esAdmin ? 'bg-white text-ueb-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Administrativos</Link>
                <Link to="/usuarios/comunidad" className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!esAdmin ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Comunidad</Link>
            </div>

            {/* Cabecera */}
            <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 ${config.colorBadge}`}>
                        {config.iconoPlataforma}
                        <span className="uppercase tracking-wide">{config.titulo}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestión de Usuarios</h1>
                </div>
                {esAdmin && (
                    <button onClick={openModal} className="text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 bg-blue-900 hover:bg-blue-800">
                        <IconAdd /> <span>Nuevo Usuario</span>
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nombre Completo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Cédula</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {usuarios.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md mr-4 ${esAdmin ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.cedula || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-slate-100 text-slate-700 uppercase">{user.rol}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3"><IconEdit /></button>
                                    <button onClick={() => confirmDeleteClick(user.id)} className="text-red-600 hover:text-red-900"><IconTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usuarios.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No hay usuarios registrados aquí.</div>}
            </div>

            {/* Modal Formulario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto">
                        <div className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center ${esAdmin ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <h3 className="text-xl font-bold text-slate-800">{editMode ? 'Editar' : 'Crear'} Usuario</h3>
                            <button onClick={closeModal}><IconClose /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombres</label>
                                    <input name="nombres" className={getInputClass('nombres')} placeholder="Ej: Juan Andrés" value={formData.nombres} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Apellidos</label>
                                    <input name="apellidos" className={getInputClass('apellidos')} placeholder="Ej: Pérez Lopez" value={formData.apellidos} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Cédula y Rol (LÓGICA ACTUALIZADA AQUÍ) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Cédula</label>
                                        {!errors.cedula && formData.cedula?.length === 10 && <span className="text-xs text-emerald-600 flex items-center font-bold"><IconCheck/> Válida</span>}
                                    </div>
                                    <input name="cedula" maxLength={10} className={getInputClass('cedula')} placeholder="10 dígitos" value={formData.cedula} onChange={handleInputChange} />
                                    {errors.cedula && <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors.cedula}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Rol</label>
                                    
                                    {/* CONDICIONAL: SI ES COMUNIDAD Y ESTÁ EDITANDO, MUESTRA TEXTO BLOQUEADO */}
                                    {(!esAdmin && editMode) ? (
                                        <div className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-bold uppercase cursor-not-allowed">
                                            {formData.rol}
                                        </div>
                                    ) : (
                                        // SI NO, MUESTRA EL SELECTOR NORMAL
                                        <select 
                                            name="rol" 
                                            className="w-full px-4 py-3 border rounded-lg bg-white border-slate-200 text-slate-700" 
                                            value={formData.rol} 
                                            onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                        >
                                            {config.roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Correo Institucional</label>
                                <input name="email" type="email" className={getInputClass('email')} placeholder="usuario@ueb.edu.ec" value={formData.email} onChange={handleInputChange} />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña {editMode && <span className="text-slate-400 font-normal">(Opcional)</span>}</label>
                                <div className="relative">
                                    <input 
                                        name="password" 
                                        type={showPassword ? "text" : "password"} 
                                        className={`${getInputClass('password')} pr-10`} 
                                        placeholder="********" 
                                        value={formData.password} 
                                        onChange={handleInputChange} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <IconEyeSlash /> : <IconEye />}
                                    </button>
                                </div>
                                
                                {errors.password ? (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>
                                ) : (
                                    !editMode && !formData.password && <p className="text-slate-400 text-[10px] mt-1">Mínimo 8 caracteres, una mayúscula y un número.</p>
                                )}
                            </div>
                            
                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold">Cancelar</button>
                                <button type="submit" disabled={loading} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${esAdmin ? 'bg-blue-900 hover:bg-blue-800' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {loading ? 'Guardando...' : 'Guardar Usuario'}
                                </button>
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
                <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl text-white font-bold shadow-2xl z-[80] animate-bounce-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}