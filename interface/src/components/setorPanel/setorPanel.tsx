import { useCallback, useEffect, useState } from "react";
import MaterialCard from "./materialCard";
import { toolsApi, type Tool } from "../../services/tools";
import { transactionsApi } from "../../services/transactions";
import SuccessModal from "../ui/SuccessModal";
import { MaterialCardSkeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

interface FeedbackState {
  open: boolean;
  message: string;
  variant: "success" | "info";
}

function SetorPanel() {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: "",
    variant: "success",
  });

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await toolsApi.list();
      setMateriais(data);
    } catch (err) {
      console.error("[setor] erro ao listar tools:", err);
      toast("Não foi possível carregar os materiais.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleRetirar = async (tool: Tool, quantidade: number, employeeId: number) => {
    try {
      await transactionsApi.create({
        employeeId,
        toolName: tool.name,
        toolQuantity: quantidade,
      });
      setFeedback({
        open: true,
        message: `${quantidade} unidade(s) de ${tool.name} retirada(s) com sucesso!`,
        variant: "success",
      });
      fetchTools();
    } catch (err: any) {
      console.error("[setor] erro retirar:", err);
      const msg = err?.response?.data?.message ?? "Não foi possível concluir a retirada.";
      toast(msg, "error");
    }
  };

  const handleDevolver = async (tool: Tool, _quantidade: number, employeeId: number) => {
    try {
      const trans = await transactionsApi.getByEmployee(employeeId);
      const pendente = trans
        .filter((t) => !t.status && t.toolId === tool.id)
        .sort((a, b) => new Date(b.caughtDate).getTime() - new Date(a.caughtDate).getTime())[0];
      if (!pendente) {
        toast("Nenhuma retirada pendente deste material.", "info");
        return;
      }
      await transactionsApi.confirmReturn(pendente.id);
      setFeedback({
        open: true,
        message: `${pendente.toolQuantity} unidade(s) de ${tool.name} devolvida(s)!`,
        variant: "success",
      });
      fetchTools();
    } catch (err: any) {
      console.error("[setor] erro devolver:", err);
      const msg = err?.response?.data?.message ?? "Não foi possível concluir a devolução.";
      toast(msg, "error");
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <MaterialCardSkeleton key={i} />
            ))}
          </div>
        ) : materiais.length === 0 ? (
          <EmptyMateriais />
        ) : (
          materiais.map((material, idx) => (
            <div
              key={material.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="animate-slide-up"
            >
              <MaterialCard
                material={material}
                onRetirar={handleRetirar}
                onDevolver={handleDevolver}
              />
            </div>
          ))
        )}
      </div>

      <SuccessModal
        isOpen={feedback.open}
        message={feedback.message}
        variant={feedback.variant}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      />
    </div>
  );
}

function EmptyMateriais() {
  return (
    <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-primary">Nenhum material disponível</h3>
      <p className="text-gray-600 text-sm">O catálogo está vazio no momento.</p>
    </div>
  );
}

export default SetorPanel;
