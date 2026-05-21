import { useState, useEffect } from 'react';
import { ridesService } from '../../services/api';
import { useAuthStore, useRideStore } from '../../store';

export default function RequestRidePage() {
  const [origin, setOrigin] = useState({ latitude: -12.0464, longitude: -77.0428 });
  const [destination, setDestination] = useState({ latitude: 0, longitude: 0 });
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'search' | 'pricing' | 'found'>('search');

  const user = useAuthStore((state) => state.user);
  const setActiveRide = useRideStore((state) => state.setActiveRide);

  const mockFareCalculation = (dist: number) => {
    return (2.0 + dist * 1.5 + 5 * 0.25).toFixed(2);
  };

  const handleRequestRide = async () => {
    if (!destination.latitude || !destination.longitude) {
      setError('Por favor selecciona un destino');
      return;
    }

    setLoading(true);
    setStep('pricing');

    try {
      const response = await ridesService.request(user.id, origin, destination);
      setActiveRide(response.data.ride);
      setError('');
      setTimeout(() => setStep('found'), 800);
    } catch (err: any) {
      setError('No se pudo solicitar el viaje');
      setStep('search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Ambient effects */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🚗 Solicitar Viaje
          </h1>
          <p className="text-slate-400">Elige tu destino y comienza ahora</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="glass-card rounded-xl p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-8 border border-slate-700/50">
          {step === 'search' && (
            <div className="space-y-6">
              {/* Origin */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  📍 Origen
                </label>
                <div className="glass-input px-4 py-4 rounded-lg border border-slate-600/30 text-slate-300">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📍</span>
                    <div>
                      <p className="text-sm text-slate-400">Tu ubicación actual</p>
                      <p className="font-mono text-sm">{origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  🎯 Destino
                </label>
                <input
                  type="text"
                  placeholder="Ingresa dirección o lugar..."
                  className="glass-input w-full px-4 py-4 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition"
                  onChange={(e) => {
                    if (e.target.value) {
                      setDestination({ latitude: -12.0556, longitude: -77.0496 });
                      setFare(parseFloat(mockFareCalculation(2.5)));
                      setStep('pricing');
                    }
                  }}
                />
              </div>

              {/* CTA Button */}
              <button
                onClick={handleRequestRide}
                disabled={!destination.latitude || loading}
                className="btn-primary w-full py-4 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold mt-8 transition"
              >
                Solicitar Viaje Ahora
              </button>
            </div>
          )}

          {step === 'pricing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">💰</div>
                <h2 className="text-2xl font-bold text-white">Tarifa Estimada</h2>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300">Tarifa Total</span>
                  <span className="text-4xl font-bold text-amber-400">S/. {fare}</span>
                </div>

                <div className="space-y-2 text-sm text-slate-400 border-t border-slate-600/30 pt-4">
                  <div className="flex justify-between">
                    <span>Tarifa base</span>
                    <span>S/. 2.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distancia (2.5 km)</span>
                    <span>S/. 3.75</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo (5 min)</span>
                    <span>S/. 1.25</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setStep('search')}
                  className="btn-secondary px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleRequestRide}
                  disabled={loading}
                  className="btn-primary px-6 py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Buscando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {step === 'found' && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white">¡Viaje Solicitado!</h2>
              <p className="text-slate-400">Buscando el conductor más cercano...</p>

              {/* Loading Animation */}
              <div className="flex justify-center gap-2 mt-8">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>

              <p className="text-slate-500 text-sm mt-8">Tiempo estimado: 2-4 minutos</p>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        {step === 'search' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-lg p-4 border border-slate-700/50">
              <p className="text-2xl mb-2">🛡️</p>
              <p className="text-sm text-slate-300">Seguridad garantizada</p>
            </div>
            <div className="glass-card rounded-lg p-4 border border-slate-700/50">
              <p className="text-2xl mb-2">💳</p>
              <p className="text-sm text-slate-300">Múltiples formas de pago</p>
            </div>
            <div className="glass-card rounded-lg p-4 border border-slate-700/50">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-sm text-slate-300">Conductores verificados</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
