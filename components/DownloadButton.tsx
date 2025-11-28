'use client';

import { useCallback } from 'react';
import { CheckCircle, Download, RotateCcw } from 'lucide-react';

interface DownloadButtonProps {
  blob: Blob;
  originalFileName: string;
  onReset: () => void;
}

export default function DownloadButton({
  blob,
  originalFileName,
  onReset,
}: DownloadButtonProps) {
  const getUnlockedFileName = (name: string): string => {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) {
      return `${name}_unlocked.pdf`;
    }
    const baseName = name.substring(0, lastDot);
    return `${baseName}_unlocked.pdf`;
  };

  const handleDownload = useCallback(() => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getUnlockedFileName(originalFileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [blob, originalFileName]);

  const fileSizeKB = Math.round(blob.size / 1024);
  const fileSizeDisplay =
    fileSizeKB > 1024
      ? `${(fileSizeKB / 1024).toFixed(1)} MB`
      : `${fileSizeKB} KB`;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-success-100 dark:bg-gray-700 rounded-full border border-success-200 dark:border-success-600">
          <CheckCircle className="w-10 h-10 text-success-600 dark:text-success-400" />
        </div>
      </div>

      {/* Success Message */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        PDF Unlocked Successfully!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your PDF is ready to download. Password protection has been removed.
      </p>

      {/* File Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {getUnlockedFileName(originalFileName)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{fileSizeDisplay}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-success-600 hover:bg-success-700 dark:bg-success-600 dark:hover:bg-success-500 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Unlock Another
        </button>
      </div>

      {/* Privacy reminder */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        🔒 Your original file was never uploaded anywhere
      </p>
    </div>
  );
}
