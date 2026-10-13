import React, { useState } from "react";
import axios from "axios";
import { X, Upload, Download, File, Trash2, Loader2 } from "lucide-react";
import { useToast } from "../components/Toast/ToastContext";

const CommonBulkUpload = ({
  open,
  handleClose,
  dialogTitle = "Upload File",
  uploadText = "Upload file",
  downloadText = "Sample File",
  onSubmit,
  sampleFileDownload,
  handleFileUpload,
  apiUrl,
  screen,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validExtensions = [".xls", ".xlsx"];
      const fileName = file.name.toLowerCase();
      const isValidFile = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValidFile) {
        addToast("Please upload a valid Excel file (.xls, .xlsx)", "error");
        return;
      }

      setSelectedFile(file);
      if (handleFileUpload) {
        handleFileUpload(event);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      addToast("Please select a file first", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status) {
        const successMsg =
          response.data.paramObjectsMap?.paramObjectsMap?.message ||
          `${screen} uploaded successfully`;
        const successfulUploads =
          response.data.paramObjectsMap?.successfulUploads || 0;

        addToast(`${successMsg} (${successfulUploads} records)`, "success");
      } else {
        const errorMsg =
          response.data.paramObjectsMap?.errorMessage ||
          `${screen} upload failed`;
        addToast(errorMsg, "error");
      }

      handleClose();
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Upload error:", error);
      addToast(error.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {dialogTitle}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <File className="h-12 w-12 text-blue-500 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 text-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Drag and drop your file here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Supported formats: .xls, .xlsx
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />

          {/* Sample File Download */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Need a template?
            </p>
            <a
              href={sampleFileDownload}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              {downloadText}
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {uploadText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonBulkUpload;
