import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store';
import { Button } from '../../components';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    user_type: 'passenger',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.phone,
        formData.user_type as 'passenger' | 'driver'
      );
      setToken(response.data.token);
      navigate(formData.user_type === 'driver' ? '/driver/dashboard' : '/rides');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-white flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Container */}
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
              <defs>
                <style>{`
                  .logo-orange { fill: #FF6B00; }
                  .logo-white { fill: #FFFFFF; }
                `}</style>
              </defs>
              <g transform="translate(120,80)">
                <path className="logo-orange" d="M-40,40 L0,-60 L40,40 L20,40 L0,-10 L-20,40 Z"/>
                <path className="logo-white" d="M-45,35 C-10,10 10,10 45,35 L40,45 C10,20 -10,20 -40,45 Z"/>
              </g>
              <text x="120" y="170" className="logo-orange" style={{fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textAnchor: 'middle', fontSize: '36px'}}>AXIOM</text>
              <text x="120" y="200" className="logo-orange" style={{fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textAnchor: 'middle', fontSize: '20px'}}>PERÚ</text>
            </svg>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xl">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear Cuenta</h2>
            <p className="text-sm text-gray-600">Únete a miles de usuarios</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 backdrop-blur-sm rounded-xl p-4 flex gap-3 animate-shake">
              <span className="text-red-600 text-lg flex-shrink-0">✕</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-200"
                />
                <span className="absolute right-3 top-3 text-gray-400">✉️</span>
              </div>
            </div>

            {/* Phone Input */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Teléfono
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-200"
                />
                <span className="absolute right-3 top-3 text-gray-400">📱</span>
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* User Type Select */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Tipo de Usuario
              </label>
              <select
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="passenger" className="bg-white">👤 Pasajero</option>
                <option value="driver" className="bg-white">🚗 Conductor</option>
              </select>
              <svg className="absolute right-4 top-12 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-7 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl"
            >
              {loading ? '' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-xs text-gray-500 px-2">O regístrate con</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
              <span>🔵</span> Google
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
              <span>📱</span> Apple
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
            >
              Inicia sesión
            </button>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Al registrarte aceptas nuestros{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 transition-colors">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="#" className="text-amber-600 hover:text-amber-700 transition-colors">
            Política de Privacidad
          </a>
        </p>

      </div>
    </div>
  );
}
