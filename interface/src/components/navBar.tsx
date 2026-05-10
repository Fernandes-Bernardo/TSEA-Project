import LogoIcon from "./logoIcon";

function NavBar() {
  return (
    <nav className="bg-primary px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <LogoIcon />
        <span className="text-highlight text-xl font-bold">&gt;</span>
        <span className="text-white text-xl font-semibold">painel do setor</span>
      </div>
      
      <div className="flex items-center gap-2 text-white">
        <span>usuário</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    </nav>
  );
}

export default NavBar;