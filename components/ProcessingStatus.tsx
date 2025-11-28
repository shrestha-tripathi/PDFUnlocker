'use client';

import { Loader2, FileText } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'checking-encryption' | 'processing';
  progress: number;
  fileName: string;
}

export default function ProcessingStatus({
  status,
  progress,
  fileName,
}: ProcessingStatusProps) {
  const statusMessage =
    status === 'checking-encryption'
      ? 'Analyzing PDF...'
      : progress < 50
      ? 'Decrypting...'
      : progress < 90
      ? 'Rebuilding PDF...'
      : 'Finalizing...';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm animate-fade-in">
      <div className="flex flex-col items-center text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full">
            <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <Loader2 className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
        </div>

        {/* File name */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate max-w-full">
          {fileName}
        </p>

        {/* Status message */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {statusMessage}
        </h3>

        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
        </div>

        {/* Privacy reminder */}
        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          🔒 Processing locally - your file stays on your device
        </p>
      </div>
    </div>
  );
}
