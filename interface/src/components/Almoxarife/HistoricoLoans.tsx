import { useCallback, useEffect, useMemo, useState } from "react";
import { loansApi, type Loan, type LoanStatus } from "../../services/loans";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import LoanRow from "./LoanRow";

type Filtro = "todos" | LoanStatus;

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "REQUESTED", label: "Pendentes" },
  { value: "DELIVERED", label: "Em uso" },
  { value: "RETURNED", label: "Concluídos" },
  { value: "CANCELLED", label: "Cancelados" },
];

function HistoricoLoans() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loansApi.listAll();
      setLoans(data);
    } catch (err) {
      console.error("[almox-historico] erro:", err);
      toast("Não foi possível carregar o histórico.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtrados = useMemo(() => {
    let arr = loans;
    if (filtro !== "todos") {
      arr = arr.filter((l) => l.status === filtro);
    }
    if (busca.trim() !== "") {
      const q = busca.trim().toLowerCase();
      arr = arr.filter(
        (l) =>
          l.responsibleName.toLowerCase().includes(q) ||
          String(l.employeeId).includes(q) ||
          l.items.some((i) => i.toolName.toLowerCase().includes(q))
      );
    }
    return arr;
  }, [loans, filtro, busca]);

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Histórico</h1>
          <p className="text-gray-700 text-sm">Todos os empréstimos registrados, em qualquer estado.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md focus-within:shadow-lg transition-shadow flex-1">
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
          <div className="bg-[#D9D9D9] rounded-full p-1 shadow-md flex flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ease-apple font-medium ${
                  filtro === f.value ? "bg-primary text-white shadow" : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
            <p className="text-gray-600">Nenhum registro para o filtro atual.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtrados.map((loan) => (
              <LoanRow key={loan.id} loan={loan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoricoLoans;
