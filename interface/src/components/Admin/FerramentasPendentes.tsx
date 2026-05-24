import { useEffect, useState } from "react";
import { transactionsApi, type Transaction } from "../../services/transactions";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";

function FerramentasPendentes() {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState("");
  const [pendencias, setPendencias] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReturn, setPendingReturn] = useState<Transaction | null>(null);

  const fetchPendencias = async () => {
    setLoading(true);
    try {
      const data = await transactionsApi.listPending();
      setPendencias(data);
    } catch (err) {
      console.error("[pendentes] erro:", err);
      toast("Erro ao carregar pendências.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendencias();
  }, []);

  const executarDevolucao = async () => {
    if (!pendingReturn) return;
    const id = pendingReturn.id;
    setPendingReturn(null);
    try {
      await transactionsApi.confirmReturn(id);
      toast("Devolução confirmada.", "success");
      fetchPendencias();
    } catch (err: any) {
      console.error("[pendentes] erro confirmar:", err);
      toast(err?.response?.data?.message ?? "Erro ao confirmar devolução.", "error");
    }
  };

  const filtradas = pendencias.filter(
    (p) =>
      p.responsible.toLowerCase().includes(filtro.toLowerCase()) ||
      p.toolName.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Ferramentas pendentes</h1>
          <p className="text-gray-700 text-sm">Retiradas ainda não devolvidas.</p>
        </header>

        <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md transition-shadow focus-within:shadow-lg">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar por usuário ou item..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="flex-1 p-2 rounded-full bg-transparent focus:outline-none"
          />
        </div>

        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary overflow-hidden shadow-md animate-slide-up">
          <table className="w-full text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">Item em uso</th>
                <th className="p-3">Qtd.</th>
                <th className="p-3">Retirada</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-highlight/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                filtradas.map((p, idx) => (
                  <tr key={p.id} className={idx !== filtradas.length - 1 ? "border-b border-highlight transition-colors hover:bg-black/5" : "transition-colors hover:bg-black/5"}>
                    <td className="p-3 font-medium border-r border-highlight">{p.responsible}</td>
                    <td className="p-3 border-r border-highlight">{p.toolName}</td>
                    <td className="p-3 border-r border-highlight">{p.toolQuantity}</td>
                    <td className="p-3 border-r border-highlight">{new Date(p.caughtDate).toLocaleString("pt-BR")}</td>
                    <td className="p-3 border-r border-highlight">
                      <span className="font-semibold text-red-600">Em uso</span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setPendingReturn(p)}
                        className="bg-primary text-white px-3 py-1 rounded hover:bg-[#1A3A3F] transition-all duration-200 active:scale-95 text-sm"
                      >
                        Confirmar devolução
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && filtradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-600">
                    Sem pendências.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={pendingReturn !== null}
        title="Confirmar devolução"
        message={
          pendingReturn
            ? `Confirmar a devolução de ${pendingReturn.toolQuantity}x ${pendingReturn.toolName} por ${pendingReturn.responsible}?`
            : ""
        }
        confirmLabel="Confirmar"
        onConfirm={executarDevolucao}
        onCancel={() => setPendingReturn(null)}
      />
    </div>
  );
}

export default FerramentasPendentes;
