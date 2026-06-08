import { useState } from "react";
import { isLowStock, isOutOfStock, levelSecurityColor, levelSecurityLabel, toolsApi, type Tool } from "../../services/tools";

interface MaterialCardProps {
  material: Tool;
  onAddToCart: (tool: Tool, quantidade: number) => void;
}

function MaterialCard({ material, onAddToCart }: MaterialCardProps) {
  const [quantidadeInput, setQuantidadeInput] = useState<number>(1);
  const [imgError, setImgError] = useState(false);

  const tipoLabel = material.type === "CONSUMABLE" ? "Consumível" : "Ferramenta";
  const hasImage = material.imagePath && !imgError;
  const semEstoque = isOutOfStock(material);
  const estoqueBaixo = isLowStock(material);

  const adicionar = () => {
    if (quantidadeInput <= 0 || quantidadeInput > material.quantity) return;
    onAddToCart(material, quantidadeInput);
  };

  return (
    <div className="px-5 py-4 flex items-center gap-4 w-full transition-colors duration-200 hover:bg-black/5">
      <div className="w-[151px] h-[119px] bg-gray-300 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img
            src={toolsApi.imageUrl(material.id)}
            alt={material.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-apple hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <ToolPlaceholder />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-primary">{material.name}</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-white font-medium">
            {tipoLabel}
          </span>
          {material.levelSecurity && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${levelSecurityColor(material.levelSecurity)}`}>
              Nível {levelSecurityLabel(material.levelSecurity)}
            </span>
          )}
        </div>
        <p className="text-gray-700 text-sm">{material.description}</p>
        <p
          className={`text-sm font-semibold mt-1 ${
            semEstoque ? "text-red-600" : estoqueBaixo ? "text-orange-600" : "text-gray-700"
          }`}
        >
          {semEstoque
            ? "Sem estoque"
            : estoqueBaixo
            ? `Estoque baixo (${material.quantity})`
            : `${material.quantity} em estoque`}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-sm">Qtd:</span>
          <input
            type="number"
            min="1"
            max={material.quantity || 1}
            value={quantidadeInput}
            onChange={(e) => setQuantidadeInput(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 p-1 rounded border border-gray-300 text-center transition-colors focus:outline-none focus:border-primary"
            disabled={semEstoque}
          />
        </div>
        <button
          onClick={adicionar}
          disabled={semEstoque || quantidadeInput > material.quantity}
          className="px-6 py-2 rounded transition-all duration-200 ease-apple font-medium w-40 bg-highlight text-white hover:bg-[#A06630] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Adicionar ao pedido
        </button>
      </div>
    </div>
  );
}

function ToolPlaceholder() {
  return (
    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

export default MaterialCard;
