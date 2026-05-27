import { useCallback, useEffect, useMemo, useState } from "react";
import { loansApi, type Loan } from "../../services/loans";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";
import LoanRow from "../Almoxarife/LoanRow";
import LoanListCard from "../Almoxarife/LoanListCard";

type FiltroTab = "ativos" | "concluidos" | "todos";

function MeusEmprestimos() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroTab>("ativos");
  const [pendingCancel, setPendingCancel] = useState<Loan | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loansApi.listMine();
      setLoans(data);
    } catch (err) {
      console.error("[meus-emprestimos] erro:", err);
      toast("Não foi possível carregar seus empréstimos.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtrados = useMemo(() => {
    return loans.filter((l) => {
      if (filtro === "ativos") return l.status === "REQUESTED" || l.status === "DELIVERED";
      if (filtro === "concluidos") return l.status === "RETURNED" || l.status === "CANCELLED";
      return true;
    });
  }, [loans, filtro]);

  const cancelar = async () => {
    if (!pendingCancel) return;
    const id = pendingCancel.id;
    setPendingCancel(null);
    try {
      await loansApi.cancel(id);
      toast("Solicitação cancelada.", "success");
      fetch();
    } catch (err: any) {
      console.error("[meus-emprestimos] cancelar:", err);
      toast(err?.response?.data?.message ?? "Erro ao cancelar.", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div className="bg-[#D9D9D9] rounded-full p-1 shadow-md flex w-fit">
          {(["ativos", "concluidos", "todos"] as FiltroTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ease-apple font-medium capitalize ${
                filtro === f ? "bg-primary text-white shadow" : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f === "ativos" ? "Ativos" : f === "concluidos" ? "Concluídos" : "Todos"}
            </button>
          ))}
        </div>

        {loading ? (
          <LoanListCard>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </LoanListCard>
        ) : filtrados.length === 0 ? (
          <EmptyState filtro={filtro} />
        ) : (
          <LoanListCard>
            {filtrados.map((loan) => (
              <LoanRow
                key={loan.id}
                loan={loan}
                actions={
                  loan.status === "REQUESTED" ? (
                    <button
                      onClick={() => setPendingCancel(loan)}
                      className="bg-highlight text-white px-4 py-2 rounded-md hover:bg-[#A06630] transition-all duration-200 ease-apple active:scale-95 text-sm font-bold shadow-sm whitespace-nowrap"
                    >
                      Cancelar pedido
                    </button>
                  ) : null
                }
              />
            ))}
          </LoanListCard>
        )}
      </div>

      <ConfirmModal
        isOpen={pendingCancel !== null}
        title="Cancelar solicitação"
        message={
          pendingCancel
            ? `Tem certeza que deseja cancelar a solicitação aberta em ${new Date(pendingCancel.requestedAt).toLocaleString("pt-BR")}?`
            : ""
        }
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={cancelar}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}

function EmptyState({ filtro }: { filtro: FiltroTab }) {
  const msg =
    filtro === "ativos"
      ? "Nenhum empréstimo em andamento."
      : filtro === "concluidos"
      ? "Nenhum empréstimo concluído ainda."
      : "Você ainda não fez nenhum empréstimo.";

  return (
    <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
        </svg>
      </div>
      <p className="text-gray-700">{msg}</p>
    </div>
  );
}

export default MeusEmprestimos;
