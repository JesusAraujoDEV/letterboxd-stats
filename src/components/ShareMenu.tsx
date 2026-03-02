import { useEffect, useRef, useState } from "react";
import { Share2, Share, Copy, Download } from "lucide-react";

interface ShareMenuProps {
  isExporting?: boolean;
  onShare: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

const ShareMenu = ({
  isExporting = false,
  onShare,
  onCopy,
  onDownload,
}: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
      >
        <Share2 className="h-4 w-4" />
        {isExporting ? "Generando..." : "Compartir"}
      </button>
      {isOpen && !isExporting && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
          <button
            type="button"
            onClick={() => handleAction(onShare)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
          >
            <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
          </button>
          <button
            type="button"
            onClick={() => handleAction(onCopy)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
          >
            <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
          </button>
          <button
            type="button"
            onClick={() => handleAction(onDownload)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
          >
            <Download className="h-4 w-4 text-text-muted" /> Descargar
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
