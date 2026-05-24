import { useState } from "react";
import ButtomConfirm from "./buttomconfirm";
import { toolsApi, type Tool } from "../../services/tools";
import { useToast } from "../ui/Toast";

interface MaterialCardProps {
  material: Tool;
  onRetirar: (tool: Tool, quantidade: number, employeeId: number) => void | Promise<void>;
  onDevolver: (tool: Tool, quantidade: number, employeeId: number) => void | Promise<void>;
}

function MaterialCard({ material, onRetirar, onDevolver }: MaterialCardProps) {
  const { toast } = useToast();
  const [quantidadeInput, setQuantidadeInput] = useState<number>(1);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [acaoPendente, setAcaoPendente] = useState<"retirar" | "devolver" | null>(null);
  const [imgError, setImgError] = useState(false);

  const tipoLabel = material.type === "CONSUMABLE" ? "consumível" : "ferramenta";
  const hasImage = material.imagePath && !imgError;

  const abrirModal = (acao: "retirar" | "devolver") => {
    if (acao === "retirar" && quantidadeInput > material.quantity) {
      toast(`Estoque insuficiente. Disponível: ${material.quantity}`, "info");
      return;
    }
    if (quantidadeInput <= 0) {
      toast("Quantidade deve ser maior que zero.", "info");
      return;
    }
    setAcaoPendente(acao);
    setModalAberto(true);
  };

  const confirmar = (employeeId: number) => {
    if (acaoPendente === "retirar") {
      onRetirar(material, quantidadeInput, employeeId);
    } else if (acaoPendente === "devolver") {
      onDevolver(material, quantidadeInput, employeeId);
    }
    setModalAberto(false);
    setAcaoPendente(null);
  };

  const cancelar = () => {
    setModalAberto(false);
    setAcaoPendente(null);
  };

  return (
    <>
      <div className="bg-[#D9D9D9] rounded-lg p-4 shadow-md border-2 border-primary flex items-center gap-4 w-full transition-all duration-300 ease-apple hover:shadow-xl hover:-translate-y-0.5">
        <div className="w-[151px] h-[119px] bg-gray-300 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <img
              src={toolsApi.imageUrl(material.id)}
              alt={material.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-apple hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-gray-500 text-sm text-center">
              🔧<br />
              {material.name}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-primary">{material.name}</h3>
          <p className="text-gray-700">Quantidade disp.: {material.quantity}</p>
          <p className="text-gray-700">Tipo: {tipoLabel}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm">Qtd:</span>
            <input
              type="number"
              min="1"
              value={quantidadeInput}
              onChange={(e) => setQuantidadeInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 p-1 rounded border border-gray-300 text-center transition-colors focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => abrirModal("retirar")}
              className="px-6 py-2 rounded transition-all duration-200 ease-apple font-medium w-28 bg-highlight text-white hover:bg-[#A06630] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={material.quantity === 0}
            >
              Retirar
            </button>
            <button
              onClick={() => abrirModal("devolver")}
              className="px-6 py-2 rounded transition-all duration-200 ease-apple font-medium w-28 bg-primary text-white hover:bg-[#1A3A3F] active:scale-95"
            >
              Devolver
            </button>
          </div>
        </div>
      </div>

      <ButtomConfirm
        isOpen={modalAberto}
        message="Aproxime o código do seu crachá..."
        onConfirm={confirmar}
        onCancel={cancelar}
      />
    </>
  );
}

export default MaterialCard;
