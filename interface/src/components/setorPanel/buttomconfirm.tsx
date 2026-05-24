import { useEffect, useState } from "react";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { useToast } from "../ui/Toast";

interface ButtomConfirmProps {
  isOpen: boolean;
  message: string;
  onConfirm: (employeeId: number) => void;
  onCancel: () => void;
}

function ButtomConfirm({ isOpen, message, onConfirm, onCancel }: ButtomConfirmProps) {
  const { toast } = useToast();
  const [scanned, setScanned] = useState<string>("");
  const [manual, setManual] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setScanned("");
      setManual("");
    }
  }, [isOpen]);

  useBarcodeScanner({
    enabled: isOpen,
    onScan: (code) => {
      setScanned(code);
      const id = Number(code);
      if (Number.isFinite(id)) {
        onConfirm(id);
      }
    },
  });

  const handleManualConfirm = () => {
    const id = Number(manual);
    if (!Number.isFinite(id) || id <= 0) {
      toast("ID inválido.", "info");
      return;
    }
    onConfirm(id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-primary rounded-2xl shadow-2xl p-6 w-96 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">{message}</h2>

        {scanned ? (
          <p className="text-white text-sm mb-3 animate-fade-in">
            Crachá lido: <span className="font-semibold">{scanned}</span>
          </p>
        ) : (
          <p className="text-gray-200 text-sm mb-3 animate-pulse-soft">
            Aguardando leitor de código de barras...
          </p>
        )}

        <div className="mb-4">
          <label className="block text-white text-sm mb-1">Ou digite o ID manualmente:</label>
          <input
            type="number"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 text-gray-900 transition-colors focus:outline-none focus:border-highlight"
            placeholder="EmployeeID"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200 active:scale-95 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleManualConfirm}
            className="px-4 py-2 rounded-md bg-highlight text-white hover:bg-[#A06630] transition-all duration-200 active:scale-95 font-medium"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ButtomConfirm;
