import { useEffect, useCallback } from "react";

interface UseGlobalPasteOptions {
  onPaste?: (text: string) => void;
  enabled?: boolean;
}

export function useGlobalPaste({ onPaste, enabled = true }: UseGlobalPasteOptions = {}) {
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!enabled) return;
      
      const isPaste = (e.ctrlKey || e.metaKey) && e.key === "v";
      
      if (!isPaste) return;
      
      e.preventDefault();
      
      try {
        const text = await navigator.clipboard.readText();
        onPaste?.(text);
      } catch (err) {
        console.error("Failed to read clipboard:", err);
      }
    },
    [onPaste, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
