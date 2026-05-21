import { useState } from 'react';
import { Button, Card, Input, MainLayout, Header } from '../../components';

export default function RequestRidePage() {
  const [step, setStep] = useState<'search' | 'confirm' | 'loading'>('search');
  const [origin, setOrigin] = useState({ latitude: -12.0464, longitude: -77.0428 });
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState(6.0);

  const handleRequestRide = () => {
    setStep('loading');
    setTimeout(() => {
      setStep('confirm');
    }, 2000);
  };

  return (
    <MainLayout
      header={
        <Header
          title="Solicitar Viaje"
          subtitle="Encuentra tu conductor ideal"
          action={
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-bold">
                👤
              </div>
            </div>
          }
        />
      }
    >
      <div className="max-w-2xl mx-auto py-8">
        {step === 'search' && (
          <Card variant="elevated" padding="lg" className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">¿A dónde quieres ir?</h1>
              <p className="text-slate-400">Encuentra el viaje perfecto para ti</p>
            </div>

            {/* Current Location */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                📍 Ubicación Actual
              </label>
              <Card variant="glass" padding="md" className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 font-medium">Lima, Perú</p>
                  <p className="text-xs text-slate-500 font-mono">
                    {origin.latitude.toFixed(4)}, {origin.longitude.toFixed(4)}
                  </p>
                </div>
                <span className="text-2xl">📍</span>
              </Card>
            </div>

            {/* Destination */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                🎯 Destino
              </label>
              <Input
                type="text"
                placeholder="Ingresa tu destino..."
                value={destination}
                onChange={(e) => {
                  if (e.target.value) {
                    setDestination(e.target.value);
                  }
                }}
                icon="📍"
              />
            </div>

            {/* Request Button */}
            <Button
              onClick={handleRequestRide}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!destination}
            >
              Solicitar Viaje Ahora
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <Card variant="glass" padding="md" className="text-center">
                <p className="text-2xl mb-2">🛡️</p>
                <p className="text-xs text-slate-300">Seguridad Garantizada</p>
              </Card>
              <Card variant="glass" padding="md" className="text-center">
                <p className="text-2xl mb-2">💳</p>
                <p className="text-xs text-slate-300">Múltiples Pagos</p>
              </Card>
              <Card variant="glass" padding="md" className="text-center">
                <p className="text-2xl mb-2">⭐</p>
                <p className="text-xs text-slate-300">Conductores Verificados</p>
              </Card>
            </div>
          </Card>
        )}

        {step === 'confirm' && (
          <Card variant="elevated" padding="lg" className="space-y-8">
            {/* Success Message */}
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h2 className="text-2xl font-bold text-white">¡Viaje Solicitado!</h2>
              <p className="text-slate-400">Buscando el conductor más cercano...</p>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Fare Estimate */}
            <Card variant="glass" padding="lg" className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300">Tarifa Total Estimada</span>
                <span className="text-4xl font-bold text-amber-400">S/. {fare.toFixed(2)}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-400 border-t border-slate-700/30 pt-4">
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
            </Card>

            {/* Estimated Time */}
            <p className="text-center text-slate-500 text-sm">Tiempo estimado: 2-4 minutos</p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setStep('search')}
                variant="secondary"
                size="md"
              >
                ← Volver
              </Button>
              <Button variant="primary" size="md" fullWidth>
                Rastrear Conductor →
              </Button>
            </div>
          </Card>
        )}

        {step === 'loading' && (
          <Card variant="elevated" padding="lg" className="space-y-8 text-center">
            <div className="text-6xl animate-spin">🔄</div>
            <h2 className="text-2xl font-bold text-white">Procesando tu solicitud...</h2>
            <p className="text-slate-400">Por favor espera mientras buscamos los mejores conductores</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
