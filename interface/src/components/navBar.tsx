import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "./logoIcon";
import { getCurrentUser, logout } from "../services/auth";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/admin");
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminLinks = [
    { path: "/admin/catalogo", nome: "Catálogo" },
    { path: "/admin/ferramentas-pendentes", nome: "Ferramentas Pendentes" },
    { path: "/admin/historico", nome: "Histórico" },
    { path: "/admin/sensor", nome: "Monitoramento de sensor" },
    { path: "/admin/crud", nome: "Criar/Deletar" },
  ];

  if (isAdmin) {
    return (
      <nav className="bg-primary px-6 py-4 shadow-md animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <LogoIcon />
            <div className="flex gap-8">
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-white hover:text-gray-300 transition-all duration-200 pb-1 ${
                    location.pathname === link.path ? "border-b-2 border-highlight" : ""
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
              <span>Administrador {user ? `(${user.employeeId})` : ""}</span>
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

  return (
    <nav className="bg-primary px-6 py-4 shadow-md animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="text-white text-xl font-semibold">painel do setor</span>
          <span className="text-highlight text-xl font-bold">&gt;</span>
        </div>

        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Usuário {user ? `(${user.employeeId})` : ""}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-highlight px-3 py-1 rounded text-sm hover:bg-[#A06630] transition"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
