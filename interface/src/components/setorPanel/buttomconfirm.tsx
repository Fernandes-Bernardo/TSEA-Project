interface ButtomConfirmProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ButtomConfirm({ isOpen, message, onConfirm, onCancel }: ButtomConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-lg p-6 w-96"> 
        <h2 className="text-xl font-bold text-white mb-4">{message}</h2> 
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-highlight text-white hover:bg-[#A06630] transition font-medium"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ButtomConfirm;