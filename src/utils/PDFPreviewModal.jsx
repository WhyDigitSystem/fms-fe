import { X, Download } from "lucide-react";

const PDFPreviewModal = ({ blobUrl, fileName = "document.pdf", onClose }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
    <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900">
      <div className="flex items-center justify-between border-b px-3 py-2 dark:border-gray-700">
        <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
          {fileName}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={blobUrl}
            download={fileName}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Download size={14} /> Download
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <iframe
        title="PDF preview"
        src={blobUrl}
        className="h-full w-full flex-1"
      />
    </div>
  </div>
);

export default PDFPreviewModal;
