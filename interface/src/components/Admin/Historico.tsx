import { useEffect, useMemo, useState } from "react";
import { transactionsApi, type Transaction } from "../../services/transactions";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

type Filtro = "todos" | "pendentes" | "devolvidos";

function Historico() {
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [registros, setRegistros] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await transactionsApi.list();
        setRegistros(data);
      } catch (err) {
        console.error("[historico] erro:", err);
        toast("Erro ao carregar histórico.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const filtrados = useMemo(() => {
    return registros.filter((item) => {
      const matchBusca =
        item.responsible.toLowerCase().includes(busca.toLowerCase()) ||
        item.toolName.toLowerCase().includes(busca.toLowerCase());
      const matchStatus =
        filtro === "todos" ||
        (filtro === "pendentes" && !item.status) ||
        (filtro === "devolvidos" && item.status);
      return matchBusca && matchStatus;
    });
  }, [registros, busca, filtro]);

  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR") : "-");

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Histórico</h1>
          <p className="text-gray-700 text-sm">Todas as retiradas e devoluções.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md flex-1 transition-shadow focus-within:shadow-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar usuário ou ferramenta..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 p-1 rounded-full bg-transparent focus:outline-none"
            />
          </div>
          <div className="bg-[#D9D9D9] rounded-full p-1 shadow-md flex">
            {(["todos", "pendentes", "devolvidos"] as Filtro[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ease-apple font-medium capitalize ${
                  filtro === f ? "bg-primary text-white shadow" : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary overflow-hidden animate-slide-up">
          <table className="w-full text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">Ferramenta</th>
                <th className="p-3">Qtd.</th>
                <th className="p-3">Retirada</th>
                <th className="p-3">Devolução</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-highlight/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                filtrados.map((item, idx) => (
                  <tr key={item.id} className={`${idx !== filtrados.length - 1 ? "border-b border-highlight" : ""} transition-colors hover:bg-black/5`}>
                    <td className="p-3 font-medium border-r border-highlight">{item.responsible}</td>
                    <td className="p-3 border-r border-highlight">{item.toolName}</td>
                    <td className="p-3 border-r border-highlight">{item.toolQuantity}</td>
                    <td className="p-3 border-r border-highlight">{fmt(item.caughtDate)}</td>
                    <td className="p-3 border-r border-highlight">{fmt(item.returnedDate)}</td>
                    <td className="p-3">
                      <span className={`font-semibold ${item.status ? "text-green-600" : "text-red-600"}`}>
                        {item.status ? "Devolvido" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-600">
                    Sem registros para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Historico;
