import { useCallback, useEffect, useMemo, useState } from "react";
import { isConsumableOnly, loansApi, type Loan } from "../../services/loans";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";
import LoanRow from "./LoanRow";

function EmprestimosAtivos() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [pendingReturn, setPendingReturn] = useState<Loan | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loansApi.listActive();
      setLoans(data);
    } catch (err) {
      console.error("[almox-ativos] erro:", err);
      toast("Não foi possível carregar os empréstimos ativos.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtrados = useMemo(() => {
    if (busca.trim() === "") return loans;
    const q = busca.trim().toLowerCase();
    return loans.filter(
      (l) =>
        l.responsibleName.toLowerCase().includes(q) ||
        String(l.employeeId).includes(q) ||
        l.items.some((i) => i.toolName.toLowerCase().includes(q))
    );
  }, [loans, busca]);

  const confirmarDevolucao = async () => {
    if (!pendingReturn) return;
    const id = pendingReturn.id;
    const nome = pendingReturn.responsibleName;
    setPendingReturn(null);
    try {
      await loansApi.returnAll(id);
      toast(`Devolução confirmada para ${nome}.`, "success");
      fetch();
    } catch (err: any) {
      console.error("[almox-ativos] devolução:", err);
      toast(err?.response?.data?.message ?? "Erro ao confirmar devolução.", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Empréstimos ativos</h1>
          <p className="text-gray-700 text-sm">
            Itens entregues aguardando devolução. Empréstimos só com consumíveis são fechados automaticamente.
          </p>
        </header>

        <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md focus-within:shadow-lg transition-shadow">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, crachá ou item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 p-1 rounded-full bg-transparent focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
            <p className="text-gray-600">Nenhum empréstimo ativo no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtrados.map((loan) => {
              const apenasConsumiveis = isConsumableOnly(loan);
              return (
                <LoanRow
                  key={loan.id}
                  loan={loan}
                  actions={
                    apenasConsumiveis ? null : (
                      <button
                        onClick={() => setPendingReturn(loan)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#1A3A3F] transition-all duration-200 ease-apple active:scale-95 text-sm font-medium shadow-sm"
                      >
                        Confirmar devolução
                      </button>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={pendingReturn !== null}
        title="Confirmar devolução"
        message={
          pendingReturn
            ? `Confirmar a devolução de todos os itens devolvíveis do empréstimo de ${pendingReturn.responsibleName}?`
            : ""
        }
        confirmLabel="Confirmar"
        onConfirm={confirmarDevolucao}
        onCancel={() => setPendingReturn(null)}
      />
    </div>
  );
}

export default EmprestimosAtivos;
