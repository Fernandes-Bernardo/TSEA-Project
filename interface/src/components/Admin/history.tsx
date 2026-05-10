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
  const historico: Registro[] = [
    { id: 1, usuario: "Gabriel Soares", ferramenta: "Lâmina de serra", dataRetirada: "10/05/2026", horaRetirada: "08:30", dataDevolucao: "10/05/2026", horaDevolucao: "17:15" },
    { id: 2, usuario: "Emily Silva", ferramenta: "Cortador de piso", dataRetirada: "09/05/2026", horaRetirada: "09:00", dataDevolucao: null, horaDevolucao: null },
    { id: 3, usuario: "Carlos Mendes", ferramenta: "Furadeira", dataRetirada: "08/05/2026", horaRetirada: "10:15", dataDevolucao: "08/05/2026", horaDevolucao: "16:00" },
    { id: 4, usuario: "Ana Paula", ferramenta: "Serra circular", dataRetirada: "07/05/2026", horaRetirada: "14:00", dataDevolucao: "09/05/2026", horaDevolucao: "11:30" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-primary">Histórico de Retiradas</h2>
        
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
              {historico.map((item) => (
                <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-200">
                  <td className="p-3 font-medium">{item.usuario}</td>
                  <td className="p-3">{item.ferramenta}</td>
                  <td className="p-3">{item.dataRetirada} {item.horaRetirada}</td>
                  <td className="p-3">{item.dataDevolucao ? `${item.dataDevolucao} ${item.horaDevolucao}` : "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.dataDevolucao ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}>
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