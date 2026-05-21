import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RequestRidePage from './pages/rides/RequestRidePage';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Design System: Axiom Perú - Glassmorphism */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

          body {
            font-family: 'IBM Plex Sans', sans-serif;
          }

          .glass-card {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(248, 250, 252, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .glass-input {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(248, 250, 252, 0.1);
            color: #f8fafc;
          }

          .glass-input:focus {
            border-color: #F59E0B;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          }

          .btn-primary {
            background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            color: #0f172a;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(245, 158, 11, 0.3);
          }

          .btn-secondary {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.5);
            color: #c4b5fd;
            transition: all 0.3s ease;
          }

          .btn-secondary:hover {
            background: rgba(139, 92, 246, 0.2);
            border-color: #8b5cf6;
          }
        `}</style>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/rides"
            element={
              <ProtectedRoute>
                <RequestRidePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/rides" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

