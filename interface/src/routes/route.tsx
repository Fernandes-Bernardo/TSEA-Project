import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Admin from "../pages/admin";
import FerramentasPendentes from "../components/Admin/FerramentasPendentes";
import Historico from "../components/Admin/Historico";
import MonitoramentoSensor from "../components/Admin/MonitoramentoSensor";
import CrudFerramentas from "../components/Admin/CrudFerramentas";

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
        index: true,  // ← Isso faz /admin mostrar algo
        element: <FerramentasPendentes />,
      },
      {
        path: "ferramentas-pendentes",
        element: <FerramentasPendentes />,
      },
      { path: "historico",
        element: <Historico />,
      },
      {
        path: "sensor",
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