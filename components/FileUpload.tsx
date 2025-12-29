import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, maxFiles = 5 }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - selectedFiles.length);
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [selectedFiles, maxFiles, onFilesSelected]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [selectedFiles, onFilesSelected]);

  return (
    <div className="w-full">
      <label className="block text-[#81A1C1] text-xs font-bold uppercase tracking-wider mb-2">Upload Code Files (Max {maxFiles})</label>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer
          ${dragActive ? 'border-[#88C0D0] bg-[#3B4252]' : 'border-[#4C566A] bg-[#2E3440] hover:border-[#88C0D0] hover:bg-[#3B4252]'}
          transition-all duration-300`}
      >
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-upload-input"
          accept=".js,.ts,.tsx,.jsx,.html,.css,.json,.md,.txt"
          disabled={selectedFiles.length >= maxFiles}
        />
        <label htmlFor="file-upload-input" className="text-[#D8DEE9] text-center cursor-pointer select-none">
          {selectedFiles.length >= maxFiles ? (
            <span className="text-[#BF616A] font-bold">Capacity Reached</span>
          ) : (
            <>
              Drop code or <span className="text-[#88C0D0] font-black underline underline-offset-4">browse files</span>
            </>
          )}
          <br />
          <span className="text-[10px] text-[#4C566A] mt-2 block font-mono">JS, TS, TSX, HTML, CSS, JSON, MD</span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-[#3B4252] p-3 rounded border border-[#4C566A] text-[#D8DEE9]">
              <span className="truncate text-sm font-mono">{file.name}</span>
              <button
                onClick={() => removeFile(file)}
                className="text-[#BF616A] hover:text-[#D08770] transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;