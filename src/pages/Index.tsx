import { useState } from "react";
import { Clapperboard } from "lucide-react";
import FileUploadZone from "@/components/FileUploadZone";
import Dashboard from "@/components/Dashboard";
import type { MovieStats } from "@/types/stats";

const Index = () => {
  const [stats, setStats] = useState<MovieStats | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-heading font-bold text-foreground">
            CineStats
          </h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-1">
            beta
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-4 py-10">
        {!stats ? (
          <div className="flex flex-col items-center gap-8 pt-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-bold text-foreground">
                Tus estadísticas de cine
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Sube tu archivo de exportación de Letterboxd para visualizar tus
                hábitos cinematográficos.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-card/60 p-4 text-left shadow-sm">
                <h3 className="text-sm font-semibold text-foreground">
                  ¿Dónde descargo mi .zip?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
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
                <p className="text-sm text-muted-foreground mt-2">
                  Haz clic en el botón
                  {" "}
                  <span className="font-medium text-foreground">
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
              <h2 className="text-2xl font-heading font-bold text-foreground">
                Tu Resumen
              </h2>
              <button
                onClick={() => setStats(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
