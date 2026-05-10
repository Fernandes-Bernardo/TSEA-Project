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
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        
        {/* Filtro com lupa */}
        <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-700">Filtrar...</span>
          <input
            type="text"
            placeholder=""
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="flex-1 p-2 rounded-full bg-transparent focus:outline-none"
          />
        </div>
        
        {/* Card único com fundo D9D9D9 e linhas laranja separando */}
        <div className="bg-[#D9D9D9] rounded-lg p-6 shadow-md">
          <div className="flex flex-col">
            {pendenciasFiltradas.map((pendencia, index) => (
              <div key={pendencia.id}>
                {index > 0 && (
                  <div className="border-t border-highlight my-4"></div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-primary">{pendencia.nome}</h3>
                  <p className="text-gray-700 mt-1">
                    <span className="font-bold">Item em uso:</span> {pendencia.item}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Setor:</span> {pendencia.setor}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Status:</span>{" "}
                    {pendencia.status === "em uso" ? (
                      <span className="text-green-600">Em uso</span>
                    ) : (
                      <span className="text-red-600">Não devolvido</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FerramentasPendentes;