import { useEffect, useRef } from "react";

interface Options {
  enabled?: boolean;
  minLength?: number;
  maxInterKeyDelay?: number;
  onScan: (code: string) => void;
}

export function useBarcodeScanner({
  enabled = true,
  minLength = 3,
  maxInterKeyDelay = 50,
  onScan,
}: Options) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (elapsed > maxInterKeyDelay && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        const code = bufferRef.current;
        bufferRef.current = "";
        if (code.length >= minLength) {
          e.preventDefault();
          onScan(code);
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled, minLength, maxInterKeyDelay, onScan]);
}
