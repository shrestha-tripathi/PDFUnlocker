'use client';

import { useState, useCallback, useRef } from 'react';
import { detectEncryption, EncryptionInfo } from '@/lib/pdf/detector';
import { decryptPdf } from '@/lib/pdf/decryptor';

export type AppState =
  | { status: 'idle' }
  | { status: 'file-selected'; file: File }
  | { status: 'checking-encryption'; file: File }
  | { status: 'password-required'; file: File; encryptionInfo: EncryptionInfo }
  | { status: 'processing'; file: File; progress: number }
  | { status: 'success'; file: File; decryptedBlob: Blob }
  | { status: 'error'; file: File; error: string };

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function usePdfProcessor() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const passwordRef = useRef<string>('');

  const processFile = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setState({
        status: 'error',
        file,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      });
      return;
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setState({
        status: 'error',
        file,
        error: 'Please select a valid PDF file.',
      });
      return;
    }

    setState({ status: 'checking-encryption', file });

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Check if PDF is encrypted
      const encryptionInfo = await detectEncryption(arrayBuffer);

      if (!encryptionInfo.isEncrypted) {
        // PDF is not encrypted, still process it to ensure it works
        setState({ status: 'processing', file, progress: 10 });
        
        // Just return the original file as a blob
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        setState({ status: 'success', file, decryptedBlob: blob });
        return;
      }

      if (encryptionInfo.requiresPassword) {
        // Need password from user
        setState({ status: 'password-required', file, encryptionInfo });
        return;
      }

      // Try to decrypt with empty password (common for owner-password only protection)
      await attemptDecryption(file, arrayBuffer, '');
    } catch (error) {
      console.error('PDF processing error:', error);
      setState({
        status: 'error',
        file,
        error: error instanceof Error ? error.message : 'Failed to process PDF',
      });
    }
  }, []);

  const attemptDecryption = useCallback(
    async (file: File, arrayBuffer: ArrayBuffer, password: string) => {
      setState({ status: 'processing', file, progress: 20 });

      try {
        const decryptedBlob = await decryptPdf(
          arrayBuffer,
          password,
          (progress) => {
            setState((prev) =>
              prev.status === 'processing'
                ? { ...prev, progress: 20 + progress * 0.8 }
                : prev
            );
          }
        );

        setState({ status: 'success', file, decryptedBlob });
      } catch (error) {
        console.error('Decryption error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Decryption failed';

        // Check if it's a wrong password error
        if (
          errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('incorrect')
        ) {
          setState({
            status: 'password-required',
            file,
            encryptionInfo: { isEncrypted: true, requiresPassword: true },
          });
        } else {
          setState({
            status: 'error',
            file,
            error: errorMessage,
          });
        }
      }
    },
    []
  );

  const submitPassword = useCallback(
    async (password: string) => {
      if (state.status !== 'password-required') return;

      passwordRef.current = password;
      const file = state.file;

      try {
        const arrayBuffer = await file.arrayBuffer();
        await attemptDecryption(file, arrayBuffer, password);
      } catch (error) {
        setState({
          status: 'error',
          file,
          error: 'Failed to read file',
        });
      }
    },
    [state, attemptDecryption]
  );

  const cancelPasswordPrompt = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
    passwordRef.current = '';
  }, []);

  return {
    state,
    processFile,
    submitPassword,
    cancelPasswordPrompt,
    reset,
  };
}
