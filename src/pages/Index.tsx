import { useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import FileUploadZone from "@/components/FileUploadZone";
import Dashboard from "@/components/Dashboard";
import type { MovieStats } from "@/types/stats";
import { useMovies } from "@/context/MoviesContext";

const Index = () => {
  const [stats, setStats] = useState<MovieStats | null>(null);
  const { setAllMovies } = useMovies();

  useEffect(() => {
    const stored = localStorage.getItem("letterboxdStats");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as MovieStats;
      setStats(parsed);
    } catch {
      localStorage.removeItem("letterboxdStats");
    }
  }, []);

  useEffect(() => {
    setAllMovies(stats?.allMovies ?? []);
  }, [setAllMovies, stats]);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background-card/95 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-heading font-bold text-primary">
            StatsBoxd
          </h1>
          <span className="ml-1 rounded-full bg-background px-2 py-0.5 text-xs text-text-muted border border-border">
            beta
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-4 py-10">
        {!stats ? (
          <div className="flex flex-col items-center gap-8 pt-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-bold text-text-main">
                Tus estadísticas de cine
              </h2>
              <p className="text-text-muted max-w-md mx-auto">
                Sube tu archivo de exportación de Letterboxd para visualizar tus
                hábitos cinematográficos.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-background-card p-4 text-left shadow-sm">
                <h3 className="text-sm font-semibold text-text-main">
                  ¿Dónde descargo mi .zip?
                </h3>
                <p className="text-sm text-text-muted mt-2">
                  Puedes descargar tu archivo de datos desde
                  {" "}
                  <a
                    href="https://letterboxd.com/settings/data/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    letterboxd.com/settings/data/
                  </a>
                  .
                </p>
                <p className="text-sm text-text-muted mt-2">
                  Haz clic en el botón
                  {" "}
                  <span className="font-medium text-text-main">
                    Export your data
                  </span>
                  , descarga el archivo y luego arrástralo aquí abajo.
                </p>
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <img
                    src="/images/instruction.png"
                    alt="Instrucciones para exportar en Letterboxd"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <FileUploadZone onUploadSuccess={setStats} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold text-text-main">
                Tu Resumen
              </h2>
              <button
                onClick={() => {
                  localStorage.removeItem("letterboxdStats");
                  setStats(null);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-primary-hover"
              >
                Subir otro archivo
              </button>
            </div>
            <Dashboard data={stats} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
