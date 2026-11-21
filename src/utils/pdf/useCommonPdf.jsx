import { useCallback, useRef, useState } from "react";
import PDFPreviewModal from "../PDFPreviewModal"; // adjust: your existing utils/PDFPreviewModal
import { downloadCommonPDF, generateCommonPDF } from "./commonPdf";
import { getStoredLogo } from "./pdfUtils";

/* ---------------------------------------------------------------------
 * const pdf = useCommonPdf(brand?)
 *
 *   pdf.preview(config, data, brand?)   -> generates + opens PDFPreviewModal
 *   pdf.download(config, data, brand?)  -> saves the file directly
 *   pdf.modal                           -> render this once in your screen
 *
 * Logo defaults to localStorage "eFitLogo" (base64) when not supplied.
 * ------------------------------------------------------------------- */
export const useCommonPdf = (defaultBrand = {}) => {
  const [result, setResult] = useState(null);
  const brandRef = useRef(defaultBrand);
  brandRef.current = defaultBrand;

  const mergeBrand = (brand) => {
    const merged = { ...brandRef.current, ...brand };
    if (!merged.logo) merged.logo = getStoredLogo("eFitLogo");
    return merged;
  };

  const close = useCallback(() => {
    setResult((prev) => {
      if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl);
      return null;
    });
  }, []);

  const preview = useCallback((config, data, brand) => {
    const res = generateCommonPDF({ config, data, brand: mergeBrand(brand) });
    setResult((prev) => {
      if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl);
      return res;
    });
    return res;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = useCallback(
    (config, data, brand) =>
      downloadCommonPDF({ config, data, brand: mergeBrand(brand) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const modal = result?.blobUrl ? (
    <PDFPreviewModal
      blobUrl={result.blobUrl}
      fileName={result.fileName}
      onClose={close}
    />
  ) : null;

  return { preview, download, close, modal };
};

export default useCommonPdf;
