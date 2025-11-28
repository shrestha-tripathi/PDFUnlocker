'use client';

import { useState, useCallback } from 'react';
import DropZone from '@/components/DropZone';
import PasswordModal from '@/components/PasswordModal';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import PrivacyBadge from '@/components/PrivacyBadge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePdfProcessor, AppState } from '@/lib/hooks/usePdfProcessor';
import { Shield, Zap, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const {
    state,
    processFile,
    submitPassword,
    reset,
    cancelPasswordPrompt,
  } = usePdfProcessor();

  const handleFileDrop = useCallback(
    (file: File) => {
      processFile(file);
    },
    [processFile]
  );

  const handlePasswordSubmit = useCallback(
    (password: string) => {
      submitPassword(password);
    },
    [submitPassword]
  );

  const showDropZone = state.status === 'idle' || state.status === 'error';
  const showProcessing = 
    state.status === 'checking-encryption' || 
    state.status === 'processing';
  const showSuccess = state.status === 'success';
  const showPasswordModal = state.status === 'password-required';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Remove PDF Passwords
            <span className="text-primary-600 dark:text-primary-400"> Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Free, fast, and completely private. Your files never leave your device.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 max-w-3xl mx-auto">
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
            title="100% Private"
            description="Files processed locally in your browser"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
            title="Lightning Fast"
            description="No upload or download delays"
          />
          <FeatureCard
            icon={<WifiOff className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
            title="Works Offline"
            description="Install as an app for offline use"
          />
        </div>

        {/* Main Action Area */}
        <div className="max-w-2xl mx-auto">
          {showDropZone && (
            <div className="animate-fade-in">
              <DropZone onFileDrop={handleFileDrop} />
              {state.status === 'error' && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                  <p className="text-red-700 dark:text-red-400 text-center">
                    {state.error}
                  </p>
                  <button
                    onClick={reset}
                    className="mt-2 mx-auto block text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline text-sm"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {showProcessing && (
            <ProcessingStatus
              status={state.status}
              progress={'progress' in state ? state.progress : 0}
              fileName={'file' in state ? state.file.name : ''}
            />
          )}

          {showSuccess && (
            <div className="animate-fade-in">
              <DownloadButton
                blob={state.decryptedBlob}
                originalFileName={'file' in state ? state.file.name : 'document.pdf'}
                onReset={reset}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          fileName={'file' in state ? state.file.name : ''}
          onSubmit={handlePasswordSubmit}
          onCancel={cancelPasswordPrompt}
        />
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex-shrink-0 p-2 bg-primary-100 dark:bg-gray-700 rounded-lg border border-primary-200 dark:border-gray-600">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
