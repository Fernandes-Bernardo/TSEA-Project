import { Link, useLocation } from "react-router-dom";
import LogoIcon from "./logoIcon";

function NavBar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  
  // Links do admin (só aparecem se estiver na área admin)
  const adminLinks = [
    { path: "/admin/ferramentas-pendentes", nome: "Ferramentas Pendentes" },
    { path: "/admin/historico", nome: "Histórico" },
    { path: "/admin/sensor", nome: "Monitoramento de sensor" },
    { path: "/admin/crud", nome: "Criar/Deletar" },
  ];

  // Se for admin, mostra tudo na mesma linha
  if (isAdmin) {
    return (
      <nav className="bg-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <LogoIcon />
            <div className="flex gap-8">
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-white hover:text-gray-300 transition pb-1 ${
                    location.pathname === link.path ? "border-b-2 border-highlight" : ""
                  }`}
                >
                  {link.nome}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Administrador</span>
          </div>
        </div>
      </nav>
    );
  }

  // Usuário comum
  return (
    <nav className="bg-primary px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="text-white text-xl font-semibold">painel do setor</span>
          <span className="text-highlight text-xl font-bold">&gt;</span>
        </div>
        
        <div className="flex items-center gap-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Usuário</span>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;