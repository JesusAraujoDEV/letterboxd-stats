import { useState, type RefObject } from "react";
import * as htmlToImage from "html-to-image";

export type ExportAction = "share" | "copy" | "download";

const toPng = (ref: RefObject<HTMLDivElement>) =>
  htmlToImage.toPng(ref.current as HTMLDivElement, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#0d1117",
  });

const shareBlob = async (file: File) => {
  const canShareFiles =
    typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare?.({ files: [file] });
  if (!navigator.share || !canShareFiles) return false;
  await navigator.share({ files: [file], title: "Statsboxd" });
  return true;
};

const copyBlob = async (blob: Blob) => {
  if (!navigator.clipboard || !("ClipboardItem" in window)) return false;
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  return true;
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const useImageExport = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportImage = async (ref: RefObject<HTMLDivElement>, action: ExportAction, filename: string) => {
    if (!ref.current) {
      setToastMessage("No se pudo generar la imagen.");
      return;
    }

    try {
      setIsExporting(true);
      const dataUrl = await toPng(ref);
      const blob = await (await fetch(dataUrl)).blob();

      if (action === "share") {
        const file = new File([blob], `${filename}.png`, { type: "image/png" });
        if (await shareBlob(file)) {
          setToastMessage("Imagen compartida.");
          return;
        }
      }

      if (action === "copy") {
        if (await copyBlob(blob)) {
          setToastMessage("Imagen copiada al portapapeles.");
          return;
        }
        setToastMessage("No se pudo copiar la imagen.");
        return;
      }

      downloadDataUrl(dataUrl, filename);
      setToastMessage("Imagen descargada.");
    } catch (error) {
      setToastMessage("No se pudo exportar la imagen.");
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, toastMessage, exportImage };
};
