import { useCallback, useEffect, useMemo, useState } from "react";
import { loansApi, type Loan } from "../../services/loans";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import SuccessModal from "../ui/SuccessModal";
import ButtomConfirm from "../setorPanel/buttomconfirm";
import LoanRow from "./LoanRow";
import LoanListCard from "./LoanListCard";

function PedidosPendentes() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [delivering, setDelivering] = useState<Loan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loansApi.listPending();
      setLoans(data);
    } catch (err) {
      console.error("[almox-pendentes] erro:", err);
      toast("Não foi possível carregar os pedidos.", "error");
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

  const confirmarEntrega = async (scannedEmployeeId: number) => {
    if (!delivering || submitting) return;
    const target = delivering;
    setSubmitting(true);
    try {
      if (scannedEmployeeId !== target.employeeId) {
        toast(
          `O crachá lido (${scannedEmployeeId}) não corresponde ao funcionário do pedido (${target.employeeId}).`,
          "error"
        );
        return;
      }
      await loansApi.deliver(target.id, scannedEmployeeId);
      setDelivering(null);
      setFeedback({
        open: true,
        message: `Entrega registrada para ${target.responsibleName}.`,
      });
      fetch();
    } catch (err: any) {
      console.error("[almox-pendentes] entregar:", err);
      toast(err?.response?.data?.message ?? "Erro ao confirmar entrega.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md focus-within:shadow-lg transition-shadow">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 p-1 rounded-full bg-transparent focus:outline-none"
          />
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
          <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
            <p className="text-gray-600">Nenhum pedido aguardando entrega.</p>
          </div>
        ) : (
          <LoanListCard>
            {filtrados.map((loan) => (
              <LoanRow
                key={loan.id}
                loan={loan}
                actions={
                  <button
                    onClick={() => setDelivering(loan)}
                    className="bg-highlight text-white px-4 py-2 rounded-md hover:bg-[#A06630] transition-all duration-200 ease-apple active:scale-95 text-sm font-bold shadow-sm whitespace-nowrap"
                  >
                    Confirmar entrega
                  </button>
                }
              />
            ))}
          </LoanListCard>
        )}
      </div>

      <ButtomConfirm
        isOpen={delivering !== null}
        message={
          delivering
            ? `Escaneie o crachá de ${delivering.responsibleName} para confirmar a entrega.`
            : ""
        }
        onConfirm={confirmarEntrega}
        onCancel={() => setDelivering(null)}
      />

      <SuccessModal
        isOpen={feedback.open}
        message={feedback.message}
        onClose={() => setFeedback({ open: false, message: "" })}
      />
    </div>
  );
}

export default PedidosPendentes;
