import { useState } from "react";

interface Pendencia {
  id: number;
  nome: string;
  item: string;
  status: "em uso" | "não devolvido";
  setor: string;
}

function FerramentasPendentes() {
  const [filtro, setFiltro] = useState("");
  
  const pendencias: Pendencia[] = [
    { id: 1, nome: "Gabriel Soares", item: "Lâmina de serra", status: "em uso", setor: "Construção" },
    { id: 2, nome: "Emily Silva", item: "Cortador de piso", status: "não devolvido", setor: "Acabamento" },
    { id: 3, nome: "Carlos Mendes", item: "Furadeira", status: "em uso", setor: "Estrutura" },
    { id: 4, nome: "Ana Paula", item: "Serra circular", status: "não devolvido", setor: "Marcenaria" },
  ];

  const pendenciasFiltradas = pendencias.filter(p => 
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.item.toLowerCase().includes(filtro.toLowerCase()) ||
    p.setor.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-primary">Ferramentas Pendentes</h2>
        
        {/* Filtro */}
        <div className="bg-[#D9D9D9] rounded-lg p-4 border-2 border-primary">
          <input
            type="text"
            placeholder="Filtrar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-primary"
          />
        </div>
        
        {/* Lista de pendências */}
        <div className="flex flex-col gap-4">
          {pendenciasFiltradas.map((pendencia) => (
            <div key={pendencia.id} className="bg-[#D9D9D9] rounded-lg p-4 border-l-4 border-highlight shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-primary">{pendencia.nome}</h3>
                  <p className="text-gray-700">Item em uso: {pendencia.item}</p>
                  <p className="text-gray-700">Setor: {pendencia.setor}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pendencia.status === "em uso" 
                      ? "bg-green-200 text-green-800" 
                      : "bg-red-200 text-red-800"
                  }`}>
                    {pendencia.status === "em uso" ? "✅ Em uso" : "⚠️ Não devolvido"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FerramentasPendentes;