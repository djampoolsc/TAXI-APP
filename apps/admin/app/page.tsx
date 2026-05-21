import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    active_rides: 0,
    total_drivers: 0,
    total_passengers: 0,
    total_revenue: 0,
  });

  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const mockMetrics = {
      active_rides: 23,
      total_drivers: 145,
      total_passengers: 892,
      total_revenue: 5240.5,
    };
    setMetrics(mockMetrics);

    const mockIncidents = [
      { id: 1, type: 'panic_button', status: 'reported', created_at: new Date(), location: 'Miraflores' },
      { id: 2, type: 'emergency_call', status: 'resolved', created_at: new Date(), location: 'San Isidro' },
    ];
    setIncidents(mockIncidents);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

        body { font-family: 'IBM Plex Sans', sans-serif; }

        .glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(248, 250, 252, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .metric-card {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(248, 250, 252, 0.1);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-reported {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .status-resolved {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }
      `}</style>

      {/* Ambient effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Panel de Control
          </h1>
          <p className="text-slate-400">Monitoreo en tiempo real de operaciones Axiom</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Active Rides */}
          <div className="glass-card metric-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 text-sm font-semibold">Viajes Activos</h3>
              <span className="text-2xl">🚗</span>
            </div>
            <div className="text-4xl font-bold text-amber-400 mb-2">{metrics.active_rides}</div>
            <div className="text-xs text-slate-500">↑ 12% vs. última hora</div>
          </div>

          {/* Drivers */}
          <div className="glass-card metric-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 text-sm font-semibold">Conductores</h3>
              <span className="text-2xl">👨‍💼</span>
            </div>
            <div className="text-4xl font-bold text-purple-400 mb-2">{metrics.total_drivers}</div>
            <div className="text-xs text-slate-500">✓ 142 verificados</div>
          </div>

          {/* Passengers */}
          <div className="glass-card metric-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 text-sm font-semibold">Pasajeros</h3>
              <span className="text-2xl">👤</span>
            </div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">{metrics.total_passengers}</div>
            <div className="text-xs text-slate-500">↑ 5.2% nueva registración</div>
          </div>

          {/* Revenue */}
          <div className="glass-card metric-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 text-sm font-semibold">Ingresos Hoy</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-4xl font-bold text-green-400 mb-2">S/. {metrics.total_revenue.toLocaleString('es-PE')}</div>
            <div className="text-xs text-slate-500">Promedio: S/. 228/viaje</div>
          </div>
        </div>

        {/* Incidents Section */}
        <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-700/30 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <h2 className="text-xl font-bold text-white">Incidentes de Emergencia</h2>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/30">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-300">Tipo</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-300">Estado</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-300">Ubicación</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-300">Hora</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-300">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {incidents.map((incident: any) => (
                  <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4">
                      <span className="text-slate-300">
                        {incident.type === 'panic_button' ? '🔴 Botón Pánico' : '📞 Llamada Emergencia'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`status-badge ${
                          incident.status === 'reported' ? 'status-reported' : 'status-resolved'
                        }`}
                      >
                        {incident.status === 'reported' ? '⏳ Reportado' : '✓ Resuelto'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-slate-400">{incident.location}</td>
                    <td className="px-8 py-4 text-sm text-slate-500">
                      {incident.created_at.toLocaleTimeString('es-PE')}
                    </td>
                    <td className="px-8 py-4">
                      <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg text-sm font-medium transition-colors">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {incidents.length === 0 && (
            <div className="px-8 py-12 text-center">
              <p className="text-slate-400">✓ Sin incidentes críticos en las últimas 24 horas</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <button className="glass-card rounded-xl p-6 hover:shadow-lg transition-all group">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-white font-semibold group-hover:text-amber-400 transition">Reportes Diarios</p>
            <p className="text-slate-500 text-sm mt-2">Exportar métricas</p>
          </button>

          <button className="glass-card rounded-xl p-6 hover:shadow-lg transition-all group">
            <p className="text-3xl mb-3">🗺️</p>
            <p className="text-white font-semibold group-hover:text-amber-400 transition">Mapa en Vivo</p>
            <p className="text-slate-500 text-sm mt-2">Ver ubicación de viajes</p>
          </button>

          <button className="glass-card rounded-xl p-6 hover:shadow-lg transition-all group">
            <p className="text-3xl mb-3">⚙️</p>
            <p className="text-white font-semibold group-hover:text-amber-400 transition">Configuración</p>
            <p className="text-slate-500 text-sm mt-2">Ajustes del sistema</p>
          </button>
        </div>
      </div>
    </div>
  );
}
