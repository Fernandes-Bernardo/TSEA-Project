import { useState } from "react";

interface LoginCompProps {
  onLogin: (employeeId: string, senha: string) => void;
  loading?: boolean;
}

function LoginComp({ onLogin, loading = false }: LoginCompProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeId && senha) {
      onLogin(employeeId, senha);
    } else {
      alert("Preencha ambos os campos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-gray-700 font-bold mb-1">EmployeeID:</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 transition-colors duration-200 focus:outline-none focus:border-highlight"
          placeholder="Digite seu ID"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-gray-700 font-bold mb-1">Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 transition-colors duration-200 focus:outline-none focus:border-highlight"
          placeholder="Digite sua senha"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-highlight text-white py-2 rounded-md hover:bg-[#A06630] transition-all duration-200 ease-apple active:scale-[0.98] font-medium shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default LoginComp;
