import { useCallback, useEffect, useMemo, useState } from "react";
import MaterialCard from "./materialCard";
import CartDrawer, { type CartLine } from "./CartDrawer";
import ButtomConfirm from "./buttomconfirm";
import { toolsApi, type Tool } from "../../services/tools";
import { loansApi } from "../../services/loans";
import { getCurrentUser } from "../../services/auth";
import SuccessModal from "../ui/SuccessModal";
import { MaterialCardSkeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

function SetorPanel() {
  const { toast } = useToast();
  const me = getCurrentUser();
  const [materiais, setMateriais] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
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

  const visiveis = useMemo(() => {
    if (busca.trim() === "") return materiais;
    const q = busca.trim().toLowerCase();
    return materiais.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }, [materiais, busca]);

  const totalItens = cart.reduce((acc, l) => acc + l.quantidade, 0);

  const addToCart = (tool: Tool, quantidade: number) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.tool.id === tool.id);
      if (existing) {
        const novaQtd = Math.min(existing.quantidade + quantidade, tool.quantity);
        if (novaQtd === existing.quantidade) {
          toast(`Quantidade máxima de ${tool.name} já no pedido.`, "info");
          return prev;
        }
        return prev.map((l) =>
          l.tool.id === tool.id ? { ...l, quantidade: novaQtd } : l
        );
      }
      return [...prev, { tool, quantidade }];
    });
    toast(`${quantidade}× ${tool.name} adicionado(s) ao pedido.`, "success");
  };

  const updateCartLine = (toolId: string, quantidade: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.tool.id === toolId ? { ...l, quantidade } : l))
        .filter((l) => l.quantidade > 0)
    );
  };

  const removeCartLine = (toolId: string) => {
    setCart((prev) => prev.filter((l) => l.tool.id !== toolId));
  };

  const clearCart = () => setCart([]);

  const finalizarPedido = () => {
    if (cart.length === 0) {
      toast("Adicione pelo menos um item ao pedido.", "info");
      return;
    }
    setScanOpen(true);
  };

  const enviarSolicitacao = async (scannedEmployeeId: number) => {
    if (!me) {
      toast("Sessão expirada. Faça login novamente.", "error");
      return;
    }
    if (scannedEmployeeId !== me.employeeId) {
      toast("O crachá lido não corresponde ao seu cadastro.", "error");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await loansApi.create({
        employeeId: me.employeeId,
        items: cart.map((l) => ({ toolId: l.tool.id, quantity: l.quantidade })),
      });
      setScanOpen(false);
      setCartOpen(false);
      clearCart();
      setFeedback({
        open: true,
        message: "Solicitação enviada! O almoxarife será notificado.",
      });
      fetchTools();
    } catch (err: any) {
      console.error("[setor] erro criar loan:", err);
      const msg = err?.response?.data?.message ?? "Não foi possível enviar a solicitação.";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-end">
          <button
            onClick={() => setCartOpen(true)}
            className="bg-highlight text-white px-5 py-2 rounded-md shadow-md hover:bg-[#A06630] transition-all duration-200 ease-apple active:scale-95 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            Pedido
            {totalItens > 0 && (
              <span className="bg-highlight text-white rounded-full px-2 py-0.5 text-xs font-bold animate-scale-in">
                {totalItens}
              </span>
            )}
          </button>
        </header>

        <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md focus-within:shadow-lg transition-shadow">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar material..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 p-1 rounded-full bg-transparent focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <MaterialCardSkeleton key={i} />
            ))}
          </div>
        ) : visiveis.length === 0 ? (
          <EmptyMateriais />
        ) : (
          visiveis.map((material, idx) => (
            <div
              key={material.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="animate-slide-up"
            >
              <MaterialCard material={material} onAddToCart={addToCart} />
            </div>
          ))
        )}
      </div>

      <CartDrawer
        isOpen={cartOpen}
        lines={cart}
        submitting={submitting}
        onClose={() => setCartOpen(false)}
        onUpdate={updateCartLine}
        onRemove={removeCartLine}
        onClear={clearCart}
        onConfirm={finalizarPedido}
      />

      <ButtomConfirm
        isOpen={scanOpen}
        message="Aproxime o seu crachá para confirmar o pedido..."
        onConfirm={enviarSolicitacao}
        onCancel={() => setScanOpen(false)}
      />

      <SuccessModal
        isOpen={feedback.open}
        message={feedback.message}
        onClose={() => setFeedback({ open: false, message: "" })}
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
      <p className="text-gray-600 text-sm">Ajuste a busca ou aguarde o catálogo ser atualizado.</p>
    </div>
  );
}

export default SetorPanel;
