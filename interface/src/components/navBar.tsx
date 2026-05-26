import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "./logoIcon";
import { getCurrentUser, logout } from "../services/auth";

interface NavLinkDef {
  path: string;
  nome: string;
}

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminLinks: NavLinkDef[] = [
    { path: "/admin/catalogo", nome: "Catálogo" },
    { path: "/admin/historico", nome: "Histórico" },
    { path: "/admin/sensor", nome: "Monitoramento de sensor" },
    { path: "/admin/crud", nome: "Criar/Deletar" },
  ];

  const almoxarifeLinks: NavLinkDef[] = [
    { path: "/almoxarife/pedidos", nome: "Pedidos pendentes" },
    { path: "/almoxarife/ativos", nome: "Empréstimos ativos" },
    { path: "/almoxarife/historico", nome: "Histórico" },
    { path: "/almoxarife/catalogo", nome: "Catálogo" },
  ];

  const userLinks: NavLinkDef[] = [
    { path: "/", nome: "Catálogo" },
    { path: "/meus-emprestimos", nome: "Meus empréstimos" },
  ];

  let links: NavLinkDef[];
  let perfilLabel: string;

  switch (user?.role) {
    case "ROLE_ADMIN":
      links = adminLinks;
      perfilLabel = "Administrador";
      break;
    case "ROLE_ALMOXARIFE":
      links = almoxarifeLinks;
      perfilLabel = "Almoxarife";
      break;
    default:
      links = userLinks;
      perfilLabel = "Usuário";
      break;
  }

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="bg-primary px-6 py-4 shadow-md animate-slide-down">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-8 flex-wrap">
          <LogoIcon />
          <div className="flex gap-6 flex-wrap">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white hover:text-gray-300 transition-all duration-200 pb-1 ${
                  isActive(link.path) ? "border-b-2 border-highlight" : ""
                }`}
              >
                {link.nome}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>
              {perfilLabel} {user ? `(${user.employeeId})` : ""}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-highlight px-3 py-1 rounded text-sm hover:bg-[#A06630] transition-all duration-200 active:scale-95"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
