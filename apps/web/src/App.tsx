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
      <div className="app-shell">
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

