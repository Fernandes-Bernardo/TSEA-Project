import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Admin from "../pages/admin";
import FerramentasPendentes from "../components/Admin/pendingTasks";
import Historico from "../components/Admin/history";
import MonitoramentoSensor from "../components/Admin/sensor";
import CrudFerramentas from "../components/Admin/crud";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        path: "ferramentas-pendentes",
        element: <FerramentasPendentes />,
      },
      {
        path: "historico",
        element: <Historico />,
      },
      {
        path: "monitoramento",
        element: <MonitoramentoSensor />,
      },
      {
        path: "crud",
        element: <CrudFerramentas />,
      },
    ],
  },
]);

export default router;