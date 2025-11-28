/**
 * PDF Decryption Module
 * 
 * This module handles the decryption of password-protected PDF files.
 * It uses pdf.js for reading and pdf-lib for writing unencrypted PDFs.
 */

export type ProgressCallback = (progress: number) => void;

/**
 * Convert Uint8Array to Blob safely
 */
function uint8ArrayToBlob(data: Uint8Array, type: string): Blob {
  // Create a new ArrayBuffer and copy data to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(data.length);
  new Uint8Array(buffer).set(data);
  return new Blob([buffer], { type });
}

/**
 * Decrypt a PDF and return an unencrypted version
 */
export async function decryptPdf(
  pdfData: ArrayBuffer,
  password: string,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.(0);

  try {
    // Dynamic imports to avoid SSR issues
    const [pdfjsLib, { PDFDocument }] = await Promise.all([
      import('pdfjs-dist'),
      import('pdf-lib'),
    ]);

    onProgress?.(10);

    // Set up pdf.js worker - use unpkg which has proper CORS and module support
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    // First, verify the password works with pdf.js
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfData),
      password: password || '',
    });

    let pdfDoc;
    try {
      pdfDoc = await loadingTask.promise;
    } catch (error) {
      const errorObj = error as { name?: string; code?: number; message?: string };
      if (errorObj.name === 'PasswordException' || 
          errorObj.code === 1 || 
          errorObj.code === 2 ||
          (errorObj.message && errorObj.message.toLowerCase().includes('password'))) {
        throw new Error('Incorrect password. Please try again.');
      }
      throw error;
    }
    
    onProgress?.(30);

    const numPages = pdfDoc.numPages;
    console.log(`PDF loaded with ${numPages} pages, attempting to decrypt...`);

    // Try the simple approach first: use pdf-lib to load and re-save
    try {
      const pdfLibDoc = await PDFDocument.load(pdfData, {
        ignoreEncryption: true,
      });

      onProgress?.(70);

      // Remove encryption by saving without encryption options
      const pdfBytes = await pdfLibDoc.save();

      onProgress?.(100);
      console.log('PDF decrypted successfully with pdf-lib');

      return uint8ArrayToBlob(pdfBytes, 'application/pdf');
    } catch (pdfLibError) {
      console.log('pdf-lib direct load failed:', pdfLibError);
    }

    // Fallback: Render pages to canvas and create new PDF with images
    console.log('Using canvas rendering fallback...');
    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2 }); // Higher scale for better quality

      // Create canvas and render
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not create canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert canvas to PNG and embed in new PDF
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngData = await fetch(pngDataUrl).then(res => res.arrayBuffer());
      const pngImage = await newPdfDoc.embedPng(pngData);

      // Add page with original dimensions
      const newPage = newPdfDoc.addPage([viewport.width / 2, viewport.height / 2]);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width / 2,
        height: viewport.height / 2,
      });

      onProgress?.(30 + (i / numPages) * 65);
    }

    onProgress?.(95);

    const pdfBytes = await newPdfDoc.save();

    onProgress?.(100);
    console.log('PDF decrypted successfully with canvas fallback');

    return uint8ArrayToBlob(pdfBytes, 'application/pdf');
  } catch (error) {
    console.error('Decryption failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('password') || error.message.includes('Password')) {
        throw new Error('Incorrect password. Please try again.');
      }
      throw error;
    }

    throw new Error('Failed to decrypt PDF. Please try again.');
  }
}

/**
 * Simple PDF unlocking for PDFs with only owner-password protection
 * (user can open the PDF but has restricted permissions)
 */
export async function removeRestrictions(
  pdfData: ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<Blob> {
  onProgress?.(0);

  const { PDFDocument } = await import('pdf-lib');

  onProgress?.(20);

  // Load PDF - should work without password for owner-only protection
  const pdfDoc = await PDFDocument.load(pdfData, {
    ignoreEncryption: true,
  });

  onProgress?.(60);

  // Save without encryption
  const pdfBytes = await pdfDoc.save();

  onProgress?.(100);

  return uint8ArrayToBlob(pdfBytes, 'application/pdf');
}
