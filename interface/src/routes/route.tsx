import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Admin from "../pages/admin";
import FerramentasPendentes from "../components/Admin/FerramentasPendentes";
import Historico from "../components/Admin/Historico";
import MonitoramentoSensor from "../components/Admin/MonitoramentoSensor";
import CrudFerramentas from "../components/Admin/CrudFerramentas";
import CatalogoAdmin from "../components/Admin/CatalogoAdmin";
import Login from "../pages/login";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <Admin />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CatalogoAdmin /> },
      { path: "catalogo", element: <CatalogoAdmin /> },
      { path: "ferramentas-pendentes", element: <FerramentasPendentes /> },
      { path: "historico", element: <Historico /> },
      { path: "sensor", element: <MonitoramentoSensor /> },
      { path: "crud", element: <CrudFerramentas /> },
    ],
  },
]);

export default router;
