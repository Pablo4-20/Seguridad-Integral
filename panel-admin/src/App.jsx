import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Incidentes from './pages/Incidentes';
import Alertas from './pages/Alertas';
import Noticias from './pages/Noticias';
import Usuarios from './pages/Usuarios';
import MainLayout from './layouts/MainLayout';

// Verifica que haya sesión iniciada
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/" />;
};

// --- Verifica que sea DIRECTOR ---
const DirectorRoute = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Si es director, pasa. Si es admin/gestor, lo rebota al dashboard.
    return user.rol === 'director' ? <Outlet /> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/incidentes" element={<Incidentes />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/noticias" element={<Noticias />} />

                {/* RUTA PROTEGIDA SOLO PARA DIRECTORES */}
                <Route element={<DirectorRoute />}>
                    {/* El componente Usuarios recibe la prop 'tipo' para saber qué cargar */}
                    <Route path="/usuarios/administrativos" element={<Usuarios tipo="admin" />} />
                    <Route path="/usuarios/comunidad" element={<Usuarios tipo="comunidad" />} />
                </Route>

            </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;