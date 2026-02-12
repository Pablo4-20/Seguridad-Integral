import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
);

// --- ICONOS ---
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const IconTime = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-1.755-6.964C19.55 8.594 17.055 6 13.5 6c-2.83 0-5.262 1.67-6.47 4.027A4.125 4.125 0 0 0 5.25 18.57c1.19.53 2.547.802 3.95.802 1.52 0 2.978-.315 4.3-.887L15 19.129Z" /></svg>;

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filtro de tiempo
    const [periodo, setPeriodo] = useState('hora');

    const cargarEstadisticas = async () => {
        try {
            const res = await api.get(`/admin/stats?periodo=${periodo}`);
            setData(res.data);
        } catch (error) {
            console.error("Error cargando estadísticas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEstadisticas();
        const intervalo = setInterval(cargarEstadisticas, 5000);
        return () => clearInterval(intervalo);
    }, [periodo]);

    if (loading || !data) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-ueb-blue"></div>
                <p className="text-slate-400 font-medium animate-pulse">Cargando panel...</p>
            </div>
        </div>
    );

    // --- CONFIG GRÁFICOS ---
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
            tooltip: { backgroundColor: '#1e293b', padding: 12, titleFont: { size: 13 }, bodyFont: { size: 12 }, cornerRadius: 8, displayColors: true }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
            y: { grid: { color: '#f1f5f9', borderDash: [5, 5] }, ticks: { color: '#94a3b8', font: { size: 10 }, beginAtZero: true } }
        },
        elements: { line: { tension: 0, borderWidth: 2 }, point: { radius: 0, hitRadius: 10, hoverRadius: 6 } }
    };

    const lineData = {
        labels: data.grafico_lineal.map(d => d.label),
        datasets: [
            {
                label: 'Incidentes',
                data: data.grafico_lineal.map(d => d.incidentes),
                borderColor: '#3b82f6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                    return gradient;
                },
                fill: true,
            },
            {
                label: 'Alertas Pánico',
                data: data.grafico_lineal.map(d => d.alertas),
                borderColor: '#ef4444',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
                    return gradient;
                },
                fill: true,
            },
        ],
    };

    const doughnutData = {
        labels: data.grafico_tipos.map(d => d.tipo),
        datasets: [{
            data: data.grafico_tipos.map(d => d.total),
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'],
            borderWidth: 0, hoverOffset: 4
        }],
    };

    const FilterButton = ({ label, value }) => (
        <button onClick={() => setPeriodo(value)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${periodo === value ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
            {label}
        </button>
    );

    return (
        <div className="min-h-screen pb-10 px-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vista General</p>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel de Control</h1>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">En Vivo</span>
                </div>
            </div>

            {/* --- TARJETAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <CardStat 
                    title="Pendientes" 
                    value={data.tarjetas.pendientes} 
                    trend="Requiere atención" 
                    color="red" 
                    icon={<IconWarning />} 
                    link="/incidentes" 
                />
                <CardStat 
                    title="En Revisión" 
                    value={data.tarjetas.en_curso} 
                    trend="Procesando" 
                    color="yellow" 
                    icon={<IconTime />} 
                    link="/incidentes" 
                />
                <CardStat 
                    title="Total Alertas" 
                    value={data.tarjetas.alertas_total} 
                    trend="Histórico" 
                    color="orange" 
                    icon={<IconAlert />} 
                    link="/alertas" 
                />
                {/* --- CORRECCIÓN AQUÍ --- */}
                <CardStat 
                    title="Usuarios" 
                    value={data.tarjetas.usuarios} 
                    trend="Comunidad activa" 
                    color="blue" 
                    icon={<IconUsers />} 
                    link="/usuarios/comunidad" 
                />
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* GRÁFICO DE LÍNEAS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Análisis de Seguridad</h3>
                            <p className="text-xs text-slate-400">Evolución temporal de eventos</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 gap-1">
                            <FilterButton label="1H" value="minuto" />
                            <FilterButton label="24H" value="hora" />
                            <FilterButton label="30D" value="dia" />
                            <FilterButton label="Sem" value="semanal" />
                            <FilterButton label="Mes" value="mensual" />
                            <FilterButton label="Año" value="anual" />
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                {/* DONA */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Tipos de Incidentes</h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-slate-700">{data.grafico_tipos.reduce((a, b) => a + b.total, 0)}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        </div>
                        <div className="w-full h-full max-w-[180px] max-h-[180px] relative z-10">
                            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-medium text-slate-500">
                        {data.grafico_tipos.map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[index % 6] }}></span>
                                <span className="truncate flex-1">{item.tipo}</span>
                                <span className="font-bold text-slate-700">{item.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTE DE TARJETA ---
function CardStat({ title, value, trend, color, icon, link }) {
    const styles = {
        red: { border: 'border-l-red-500', bgIcon: 'bg-red-50', textIcon: 'text-red-600', textTrend: 'text-red-600' },
        yellow: { border: 'border-l-yellow-500', bgIcon: 'bg-yellow-50', textIcon: 'text-yellow-600', textTrend: 'text-yellow-600' },
        orange: { border: 'border-l-orange-500', bgIcon: 'bg-orange-50', textIcon: 'text-orange-600', textTrend: 'text-orange-600' },
        blue: { border: 'border-l-blue-500', bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', textTrend: 'text-blue-600' },
    };
    
    const theme = styles[color];

    return (
        <Link 
            to={link} 
            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 ${theme.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{title}</p>
                    <h3 className="text-4xl font-extrabold text-slate-800 group-hover:scale-105 transition-transform origin-left">
                        {value}
                    </h3>
                    <p className={`text-xs font-medium mt-2 ${theme.textTrend}`}>
                        {trend}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${theme.bgIcon} ${theme.textIcon}`}>
                    {icon}
                </div>
            </div>
        </Link>
    );
}