import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Admin from "../pages/admin";
import Almoxarife from "../pages/almoxarife";
import Historico from "../components/Admin/Historico";
import MonitoramentoSensor from "../components/Admin/MonitoramentoSensor";
import CrudFerramentas from "../components/Admin/CrudFerramentas";
import CatalogoAdmin from "../components/Admin/CatalogoAdmin";
import SetorPanel from "../components/setorPanel/setorPanel";
import MeusEmprestimos from "../components/user/MeusEmprestimos";
import PedidosPendentes from "../components/Almoxarife/PedidosPendentes";
import EmprestimosAtivos from "../components/Almoxarife/EmprestimosAtivos";
import HistoricoLoans from "../components/Almoxarife/HistoricoLoans";
import Login from "../pages/login";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["ROLE_USER"]}>
        <Home />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SetorPanel /> },
      { path: "meus-emprestimos", element: <MeusEmprestimos /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={["ROLE_ADMIN"]}>
        <Admin />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CatalogoAdmin /> },
      { path: "catalogo", element: <CatalogoAdmin /> },
      { path: "historico", element: <Historico /> },
      { path: "sensor", element: <MonitoramentoSensor /> },
      { path: "crud", element: <CrudFerramentas /> },
    ],
  },
  {
    path: "/almoxarife",
    element: (
      <ProtectedRoute roles={["ROLE_ALMOXARIFE"]}>
        <Almoxarife />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PedidosPendentes /> },
      { path: "pedidos", element: <PedidosPendentes /> },
      { path: "ativos", element: <EmprestimosAtivos /> },
      { path: "historico", element: <HistoricoLoans /> },
      { path: "catalogo", element: <CatalogoAdmin /> },
    ],
  },
]);

export default router;
