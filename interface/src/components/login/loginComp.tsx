import { useState } from "react";

interface LoginCompProps {
  onLogin: (employeeId: string, senha: string) => void;
}

function LoginComp({ onLogin }: LoginCompProps) {
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
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-highlight"
          placeholder="Digite seu ID"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-bold mb-1">Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:border-highlight"
          placeholder="Digite sua senha"
        />
      </div>
      <button
        type="submit"
        className="bg-highlight text-white py-2 rounded-md hover:bg-[#A06630] transition font-medium shadow-md mt-2"
      >
        Entrar
      </button>
    </form>
  );
}

export default LoginComp;