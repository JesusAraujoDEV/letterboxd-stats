import { AlertTriangle } from "lucide-react";

interface OutdatedStatsBannerProps {
  onReupload: () => void;
}

const OutdatedStatsBanner = ({ onReupload }: OutdatedStatsBannerProps) => (
  <div
    role="status"
    className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
      <div className="flex-1 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-main">
            Tus estadísticas guardadas son de una versión anterior y no incluyen las secciones nuevas.
          </p>
          <p className="text-sm text-text-muted">
            Vuelve a subir tu archivo .zip para verlas todas.
          </p>
        </div>
        <button
          onClick={onReupload}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-orange-400"
        >
          Subir otro archivo
        </button>
      </div>
    </div>
  </div>
);

export default OutdatedStatsBanner;
