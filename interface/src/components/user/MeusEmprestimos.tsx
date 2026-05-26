import { useCallback, useEffect, useMemo, useState } from "react";
import { loansApi, statusLabel, type Loan, type LoanStatus } from "../../services/loans";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";

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
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Meus empréstimos</h1>
          <p className="text-gray-700 text-sm">Acompanhe suas solicitações em andamento e o histórico.</p>
        </header>

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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <EmptyState filtro={filtro} />
        ) : (
          <div className="space-y-4">
            {filtrados.map((loan, idx) => (
              <div key={loan.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
                <LoanCard loan={loan} onCancel={() => setPendingCancel(loan)} />
              </div>
            ))}
          </div>
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

function LoanCard({ loan, onCancel }: { loan: Loan; onCancel: () => void }) {
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("pt-BR") : "-");
  const cor = statusColor(loan.status);

  return (
    <article className="bg-[#D9D9D9] rounded-xl border-2 border-primary p-4 shadow-md transition-all duration-300 ease-apple hover:shadow-lg">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <h3 className="font-bold text-primary text-lg">
            Pedido #{loan.id.slice(0, 8)}
          </h3>
          <p className="text-xs text-gray-600">
            Solicitado em {fmt(loan.requestedAt)}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${cor}`}>
          {statusLabel(loan.status)}
        </span>
      </header>

      <ul className="text-sm text-gray-800 space-y-1 mb-2">
        {loan.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <span>
              <span className="font-semibold">{item.quantity}×</span> {item.toolName}{" "}
              <span className="text-xs text-gray-500">
                ({item.toolType === "CONSUMABLE" ? "Consumível" : "Ferramenta"})
              </span>
            </span>
            {loan.status === "DELIVERED" && item.toolType !== "CONSUMABLE" && (
              <span className="text-xs text-gray-600">
                {item.returnedQuantity}/{item.quantity} devolvido(s)
              </span>
            )}
          </li>
        ))}
      </ul>

      {(loan.deliveredAt || loan.returnedAt) && (
        <div className="text-xs text-gray-600 mt-2 space-y-0.5">
          {loan.deliveredAt && <p>Entregue em {fmt(loan.deliveredAt)}</p>}
          {loan.returnedAt && <p>Concluído em {fmt(loan.returnedAt)}</p>}
        </div>
      )}

      {loan.status === "REQUESTED" && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onCancel}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors active:scale-95"
          >
            Cancelar solicitação
          </button>
        </div>
      )}
    </article>
  );
}

function statusColor(status: LoanStatus): string {
  switch (status) {
    case "REQUESTED":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-blue-100 text-blue-700";
    case "RETURNED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-gray-200 text-gray-600";
  }
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
