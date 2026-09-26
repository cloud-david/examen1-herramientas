import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Movements from "./pages/Movements";
import Parts from "./pages/Parts";
import Register from "./pages/Register";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import Vehicles from "./pages/Vehicles";

function RequireAuth() {
  const { token, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Cargando...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/usuarios"
                  element={
                    <RequireAdmin>
                      <Users />
                    </RequireAdmin>
                  }
                />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/vehiculos" element={<Vehicles />} />
                <Route path="/refacciones" element={<Parts />} />
                <Route path="/proveedores" element={<Suppliers />} />
                <Route path="/inventario" element={<Inventory />} />
                <Route path="/movimientos" element={<Movements />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
