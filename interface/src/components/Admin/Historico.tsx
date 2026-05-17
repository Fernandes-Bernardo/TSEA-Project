import { useState } from "react";

interface Registro {
  id: number;
  usuario: string;
  ferramenta: string;
  dataRetirada: string;
  horaRetirada: string;
  dataDevolucao: string | null;
  horaDevolucao: string | null;
}

function Historico() {
  const [filtro, setFiltro] = useState("");

  const historico: Registro[] = [
    { id: 1, usuario: "Gabriel Soares", ferramenta: "Lâmina de serra", dataRetirada: "10/05/2026", horaRetirada: "08:30", dataDevolucao: "10/05/2026", horaDevolucao: "17:15" },
    { id: 2, usuario: "Emily Silva", ferramenta: "Cortador de piso", dataRetirada: "09/05/2026", horaRetirada: "09:00", dataDevolucao: null, horaDevolucao: null },
    { id: 3, usuario: "Carlos Mendes", ferramenta: "Furadeira", dataRetirada: "08/05/2026", horaRetirada: "10:15", dataDevolucao: "08/05/2026", horaDevolucao: "16:00" },
    { id: 4, usuario: "Ana Paula", ferramenta: "Serra circular", dataRetirada: "07/05/2026", horaRetirada: "14:00", dataDevolucao: "09/05/2026", horaDevolucao: "11:30" },
  ];

  // Filtro (aplicado nos dados)
  const historicoFiltrado = historico.filter(item =>
    item.usuario.toLowerCase().includes(filtro.toLowerCase()) ||
    item.ferramenta.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
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

        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">Ferramenta</th>
                <th className="p-3">Retirada</th>
                <th className="p-3">Devolução</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {historicoFiltrado.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx !== historicoFiltrado.length - 1 ? "border-b border-highlight" : ""}
                >
                  <td className="p-3 font-medium border-r border-highlight">{item.usuario}</td>
                  <td className="p-3 border-r border-highlight">{item.ferramenta}</td>
                  <td className="p-3 border-r border-highlight">{item.dataRetirada} {item.horaRetirada}</td>
                  <td className="p-3 border-r border-highlight">{item.dataDevolucao ? `${item.dataDevolucao} ${item.horaDevolucao}` : "-"}</td>
                  <td className="p-3">
                    <span className={`font-semibold ${item.dataDevolucao ? "text-green-600" : "text-red-600"}`}>
                      {item.dataDevolucao ? "Devolvido" : "Pendente"}
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

export default Historico;