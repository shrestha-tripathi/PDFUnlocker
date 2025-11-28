'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
}

export default function DropZone({ onFileDrop }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          onFileDrop(file);
        } else {
          alert('Please drop a PDF file');
        }
      }
    },
    [onFileDrop]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [onFileDrop]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative
        border-2 border-dashed rounded-2xl
        p-8 md:p-12 lg:p-16
        text-center
        cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload PDF file"
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className={`
            p-4 rounded-full
            transition-colors duration-200
            ${isDragActive ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-gray-700'}
          `}
        >
          {isDragActive ? (
            <FileText className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          )}
        </div>

        <div>
          <p className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">
            {isDragActive ? 'Drop your PDF here' : 'Drop your PDF here'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            or <span className="text-primary-600 dark:text-primary-400 font-medium">click to browse</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PDF</span>
          <span>Max 100MB</span>
        </div>
      </div>
    </div>
  );
}
