import { useEffect } from "react";
import { toolsApi, type Tool } from "../../services/tools";

export interface CartLine {
  tool: Tool;
  quantidade: number;
}

interface Props {
  isOpen: boolean;
  lines: CartLine[];
  submitting: boolean;
  onClose: () => void;
  onUpdate: (toolId: string, quantidade: number) => void;
  onRemove: (toolId: string) => void;
  onClear: () => void;
  onConfirm: () => void;
}

function CartDrawer({ isOpen, lines, submitting, onClose, onUpdate, onRemove, onClear, onConfirm }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalItens = lines.reduce((acc, l) => acc + l.quantidade, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <aside className="ml-auto relative h-full w-full max-w-md bg-[#D9D9D9] shadow-2xl flex flex-col animate-slide-in-right">
        <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Seu pedido</h2>
            <p className="text-xs opacity-80">
              {totalItens === 0
                ? "Nenhum item adicionado"
                : `${totalItens} item(s) no pedido`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/80 hover:text-white transition-colors p-1 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {lines.length === 0 ? (
            <EmptyCart />
          ) : (
            lines.map((line) => (
              <CartLineRow
                key={line.tool.id}
                line={line}
                onUpdate={(qtd) => onUpdate(line.tool.id, qtd)}
                onRemove={() => onRemove(line.tool.id)}
              />
            ))
          )}
        </div>

        <footer className="p-4 border-t border-primary/30 bg-[#D9D9D9] flex flex-col gap-2">
          <div className="flex justify-between gap-2">
            <button
              onClick={onClear}
              disabled={lines.length === 0 || submitting}
              className="flex-1 px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Limpar
            </button>
            <button
              onClick={onConfirm}
              disabled={lines.length === 0 || submitting}
              className="flex-1 px-3 py-2 rounded-lg bg-highlight text-white hover:bg-[#A06630] transition-all ease-apple active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? "Enviando..." : "Finalizar pedido"}
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Ao finalizar, será solicitada a leitura do crachá.
          </p>
        </footer>
      </aside>
    </div>
  );
}

function CartLineRow({
  line,
  onUpdate,
  onRemove,
}: {
  line: CartLine;
  onUpdate: (qtd: number) => void;
  onRemove: () => void;
}) {
  const { tool, quantidade } = line;
  const max = tool.quantity;
  const tipo = tool.type === "CONSUMABLE" ? "Consumível" : "Ferramenta";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-3 flex gap-3 animate-fade-in">
      <div className="w-14 h-14 bg-gray-200 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
        {tool.imagePath ? (
          <img
            src={toolsApi.imageUrl(tool.id)}
            alt={tool.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-primary truncate text-sm">{tool.name}</h4>
          <button
            onClick={onRemove}
            aria-label="Remover do pedido"
            className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">{tipo}</p>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => onUpdate(Math.max(1, quantidade - 1))}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors active:scale-95 text-lg font-bold leading-none"
            aria-label="Diminuir"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={quantidade}
            onChange={(e) =>
              onUpdate(Math.max(1, Math.min(max, parseInt(e.target.value) || 1)))
            }
            className="w-14 p-1 text-center rounded border border-gray-300 focus:outline-none focus:border-primary text-sm"
          />
          <button
            onClick={() => onUpdate(Math.min(max, quantidade + 1))}
            disabled={quantidade >= max}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors active:scale-95 text-lg font-bold leading-none disabled:opacity-40"
            aria-label="Aumentar"
          >
            +
          </button>
          <span className="text-xs text-gray-500 ml-auto">disp. {max}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-12 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </div>
      <h3 className="font-bold text-primary mb-1">Pedido vazio</h3>
      <p className="text-sm text-gray-600">Adicione itens do catálogo para começar.</p>
    </div>
  );
}

export default CartDrawer;
