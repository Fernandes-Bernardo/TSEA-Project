import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
  variant?: "success" | "info";
}

function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
  autoCloseMs = 1800,
  variant = "success",
}: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [isOpen, autoCloseMs, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = variant === "success";
  const ringColor = isSuccess ? "ring-green-400/40" : "ring-highlight/40";
  const iconBg = isSuccess ? "bg-green-500" : "bg-highlight";
  const heading = title ?? (isSuccess ? "Sucesso!" : "Aviso");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-primary text-white rounded-2xl shadow-2xl ring-1 ${ringColor} px-8 py-7 w-80 flex flex-col items-center gap-3 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shadow-lg animate-check-pop`}
        >
          {isSuccess ? (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-bold tracking-tight">{heading}</h3>
        <p className="text-sm text-gray-200 text-center leading-snug">{message}</p>
      </div>
    </div>
  );
}

export default SuccessModal;
