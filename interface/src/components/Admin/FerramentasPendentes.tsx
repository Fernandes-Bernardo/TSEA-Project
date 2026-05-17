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
        
       
        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary overflow-hidden shadow-md">
          <table className="w-full text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">Item em uso</th>
                <th className="p-3">Setor</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendenciasFiltradas.map((pendencia, idx) => (
                <tr key={pendencia.id} className={idx !== pendenciasFiltradas.length - 1 ? "border-b border-highlight" : ""}>
                  <td className="p-3 font-medium border-r border-highlight">{pendencia.nome}</td>
                  <td className="p-3 border-r border-highlight">{pendencia.item}</td>
                  <td className="p-3 border-r border-highlight">{pendencia.setor}</td>
                  <td className="p-3">
                    <span className={`font-semibold ${
                      pendencia.status === "em uso" ? "text-green-600" : "text-red-600"
                    }`}>
                      {pendencia.status === "em uso" ? "Em uso" : "Não devolvido"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FerramentasPendentes;