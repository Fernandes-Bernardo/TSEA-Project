// src/components/Admin/CrudFerramentas.tsx
import { useState } from "react";

interface Ferramenta {
  id: number;
  nome: string;
  descricao: string;
  tipo: "insumo" | "ferramenta";
  quantidade: number;
}

interface Usuario {
  id: number;
  nome: string;
  setor: string;
  ocupacao: string;
  senha: string;
}

function CrudFerramentas() {
  const [modo, setModo] = useState<"ferramenta" | "usuario">("ferramenta");

  // Estado dos formulários
  const [novaFerramenta, setNovaFerramenta] = useState({
    nome: "",
    descricao: "",
    tipo: "ferramenta" as "insumo" | "ferramenta",
    quantidade: 0,
  });
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    setor: "",
    ocupacao: "",
    senha: "",
  });

  // Listas mockadas
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([
    { id: 1, nome: "Lâmina de serra", descricao: "Serra circular 7 pol", tipo: "ferramenta", quantidade: 67 },
    { id: 2, nome: "Eletrodo revestido", descricao: "Eletrodo 2,5mm", tipo: "insumo", quantidade: 10 },
  ]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nome: "Gabriel Soares", setor: "Construção", ocupacao: "Operador", senha: "123456" },
    { id: 2, nome: "Emily Silva", setor: "Acabamento", ocupacao: "Supervisor", senha: "654321" },
  ]);

  // Criar novo item
  const handleCriar = () => {
    if (modo === "ferramenta") {
      if (!novaFerramenta.nome || !novaFerramenta.descricao) return alert("Preencha nome e descrição");
      const nova: Ferramenta = {
        id: Date.now(),
        ...novaFerramenta,
      };
      setFerramentas([...ferramentas, nova]);
      setNovaFerramenta({ nome: "", descricao: "", tipo: "ferramenta", quantidade: 0 });
      alert("Ferramenta criada!");
    } else {
      if (!novoUsuario.nome || !novoUsuario.setor || !novoUsuario.ocupacao || !novoUsuario.senha)
        return alert("Preencha todos os campos");
      const novo: Usuario = {
        id: Date.now(),
        nome: novoUsuario.nome,
        setor: novoUsuario.setor,
        ocupacao: novoUsuario.ocupacao,
        senha: novoUsuario.senha,
      };
      setUsuarios([...usuarios, novo]);
      setNovoUsuario({ nome: "", setor: "", ocupacao: "", senha: "" });
      alert("Usuário criado!");
    }
  };

  // Deletar item (por ID)
  const handleDeletar = () => {
    if (modo === "ferramenta") {
      const idDeletar = prompt("Digite o ID da ferramenta a deletar:");
      if (idDeletar) {
        const novoArray = ferramentas.filter(f => f.id !== parseInt(idDeletar));
        if (novoArray.length === ferramentas.length) return alert("ID não encontrado");
        setFerramentas(novoArray);
        alert("Ferramenta deletada!");
      }
    } else {
      const idDeletar = prompt("Digite o ID do usuário a deletar:");
      if (idDeletar) {
        const novoArray = usuarios.filter(u => u.id !== parseInt(idDeletar));
        if (novoArray.length === usuarios.length) return alert("ID não encontrado");
        setUsuarios(novoArray);
        alert("Usuário deletado!");
      }
    }
  };

  // Importar planilha 
  const handleImportarPlanilha = () => {
    alert("Funcionalidade de importar planilha será implementada em breve.");
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        {/* Seletor de modo */}
        <div className="flex items-center gap-4">
          <div className="bg-[#D9D9D9] rounded-full p-1 shadow-md flex">
            <button
              onClick={() => setModo("ferramenta")}
              className={`px-6 py-2 rounded-full transition font-medium ${
                modo === "ferramenta" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Ferramenta
            </button>
            <button
              onClick={() => setModo("usuario")}
              className={`px-6 py-2 rounded-full transition font-medium ${
                modo === "usuario" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Usuário
            </button>
          </div>

          {/* Botão importar planilha */}
          <button
            onClick={handleImportarPlanilha}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar planilha
          </button>
        </div>

        {/* Card do formulário */}
        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary p-6 shadow-md">
          <h2 className="text-xl font-bold text-primary mb-4">
            {modo === "ferramenta" ? "Nova Ferramenta" : "Novo Usuário"}
          </h2>

          {modo === "ferramenta" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nome</label>
                <input
                  type="text"
                  value={novaFerramenta.nome}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, nome: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Descrição</label>
                <input
                  type="text"
                  value={novaFerramenta.descricao}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, descricao: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Tipo</label>
                <select
                  value={novaFerramenta.tipo}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, tipo: e.target.value as "insumo" | "ferramenta" })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="ferramenta">Ferramenta</option>
                  <option value="insumo">Insumo</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Quantidade</label>
                <input
                  type="number"
                  value={novaFerramenta.quantidade}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, quantidade: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nome</label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Setor</label>
                <input
                  type="text"
                  value={novoUsuario.setor}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, setor: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Ocupação</label>
                <input
                  type="text"
                  value={novoUsuario.ocupacao}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, ocupacao: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Senha</label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCriar}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-md"
            >
              Criar
            </button>
            <button
              onClick={handleDeletar}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium shadow-md"
            >
              Deletar
            </button>
          </div>
        </div>

        {/* Lista de itens existentes */}
        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary p-4 shadow-md">
          <h3 className="text-lg font-bold text-primary mb-2">Itens cadastrados</h3>
          {modo === "ferramenta" ? (
            <ul className="divide-y divide-highlight">
              {ferramentas.map(f => (
                <li key={f.id} className="py-2 flex justify-between">
                  <span>
                    <span className="font-bold">{f.nome}</span> - {f.descricao} ({f.tipo}) - Qtd: {f.quantidade}
                  </span>
                  <span className="text-sm text-gray-500">ID: {f.id}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-highlight">
              {usuarios.map(u => (
                <li key={u.id} className="py-2 flex justify-between">
                  <span>
                    <span className="font-bold">{u.nome}</span> - {u.setor} - {u.ocupacao}
                  </span>
                  <span className="text-sm text-gray-500">ID: {u.id}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-2">Para deletar, digite o ID mostrado ao lado.</p>
        </div>
      </div>
    </div>
  );
}

export default CrudFerramentas;