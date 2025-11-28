'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X } from 'lucide-react';

interface PasswordModalProps {
  fileName: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export default function PasswordModal({
  fileName,
  onSubmit,
  onCancel,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when modal opens
    inputRef.current?.focus();
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password.trim()) {
        setIsSubmitting(true);
        onSubmit(password);
      }
    },
    [password, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
            <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Password Protected
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6">
          <span className="font-medium text-gray-900 dark:text-white">{fileName}</span> is encrypted.
          Please enter the password to unlock it.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password"
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              className="flex-1 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Unlocking...' : 'Unlock PDF'}
            </button>
          </div>
        </form>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          🔒 Your password is never sent anywhere. All processing happens locally.
        </p>
      </div>
    </div>
  );
}
