/**
 * PDF Encryption Detection Module
 * 
 * This module detects whether a PDF is encrypted and what type of encryption it uses.
 * It uses pdf.js for robust PDF parsing.
 */

export interface EncryptionInfo {
  isEncrypted: boolean;
  encryptionMethod?: 'RC4-40' | 'RC4-128' | 'AES-128' | 'AES-256' | 'unknown';
  permissions?: {
    printing: boolean;
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
  };
  requiresPassword: boolean;
}

/**
 * Detect if a PDF is encrypted by parsing its structure
 */
export async function detectEncryption(
  pdfData: ArrayBuffer
): Promise<EncryptionInfo> {
  console.log('[PDF Detector] Starting encryption detection, file size:', pdfData.byteLength);
  
  // First, check raw PDF bytes for /Encrypt dictionary
  // This is the most reliable way to detect if a PDF has any encryption
  const rawEncryption = checkRawPdfEncryption(pdfData);
  console.log('[PDF Detector] Raw encryption check result:', rawEncryption);
  
  if (rawEncryption.hasEncryptDict) {
    console.log('[PDF Detector] PDF has /Encrypt dictionary, will prompt for password');
    return {
      isEncrypted: true,
      encryptionMethod: rawEncryption.encryptionMethod,
      requiresPassword: true, // Always ask for password if encrypted
    };
  }

  try {
    // Dynamic import of pdf.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker - use unpkg which has proper CORS and module support
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    // Try to load the document without a password first
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfData),
    });

    try {
      const pdfDocument = await loadingTask.promise;
      console.log('[PDF Detector] PDF loaded without password, pages:', pdfDocument.numPages);
      
      // Document loaded successfully - check if it has restrictions
      const permissions = await pdfDocument.getPermissions();
      console.log('[PDF Detector] Permissions:', permissions);
      
      // Check for any permission restrictions as indicator of owner-password encryption
      const hasRestrictions = permissions !== null && permissions.length > 0;
      
      if (hasRestrictions) {
        console.log('[PDF Detector] PDF has restrictions, will prompt for password');
        return {
          isEncrypted: true,
          requiresPassword: true, // Changed to true - if it has restrictions, ask for password
          permissions: {
            printing: !permissions.includes(0x0004),
            modifying: !permissions.includes(0x0008),
            copying: !permissions.includes(0x0010),
            annotating: !permissions.includes(0x0020),
          },
        };
      }
      
      console.log('[PDF Detector] PDF is not encrypted');
      return {
        isEncrypted: false,
        requiresPassword: false,
      };
    } catch (error: unknown) {
      // Check if it's a password error - pdf.js throws PasswordException
      const errorObj = error as { name?: string; code?: number; message?: string };
      console.log('[PDF Detector] PDF.js error:', errorObj);
      
      const isPasswordError = 
        errorObj.name === 'PasswordException' ||
        errorObj.code === 1 || // PasswordException.NEED_PASSWORD
        errorObj.code === 2 || // PasswordException.INCORRECT_PASSWORD
        (errorObj.message && errorObj.message.toLowerCase().includes('password'));
      
      if (isPasswordError) {
        console.log('[PDF Detector] Password required (from pdf.js error)');
        return {
          isEncrypted: true,
          requiresPassword: true,
        };
      }
      
      // Other error - use fallback
      console.log('[PDF Detector] Using fallback detection');
      return fallbackDetection(pdfData);
    }
  } catch (error) {
    console.warn('[PDF Detector] PDF.js detection failed, using fallback:', error);
    return fallbackDetection(pdfData);
  }
}

/**
 * Check raw PDF bytes for encryption dictionary
 */
function checkRawPdfEncryption(pdfData: ArrayBuffer): { 
  hasEncryptDict: boolean; 
  encryptionMethod?: EncryptionInfo['encryptionMethod'];
} {
  const bytes = new Uint8Array(pdfData);
  
  // For small files, check the entire file. For large files, check start and end
  // The /Encrypt reference is typically in the trailer at the end of the file
  let textToSearch = '';
  
  if (bytes.length <= 100000) {
    // Small file - check everything
    textToSearch = new TextDecoder('latin1').decode(bytes);
  } else {
    // Large file - check first 50KB and last 50KB (trailer is usually at end)
    const start = new TextDecoder('latin1').decode(bytes.slice(0, 50000));
    const end = new TextDecoder('latin1').decode(bytes.slice(-50000));
    textToSearch = start + end;
  }
  
  console.log('[PDF Detector] Searching for /Encrypt in', textToSearch.length, 'bytes');
  
  // Look for /Encrypt dictionary reference in the PDF
  // Common patterns:
  // /Encrypt 5 0 R (indirect reference)
  // /Encrypt << ... >> (inline dictionary)
  const patterns = [
    /\/Encrypt\s+\d+\s+\d+\s+R/,  // indirect reference
    /\/Encrypt\s*<</,              // inline dictionary
    /\/Encrypt\b/,                 // any /Encrypt keyword
  ];
  
  let encryptMatch = null;
  for (const pattern of patterns) {
    encryptMatch = textToSearch.match(pattern);
    if (encryptMatch) {
      console.log('[PDF Detector] Found encryption pattern:', encryptMatch[0]);
      break;
    }
  }
  
  if (!encryptMatch) {
    console.log('[PDF Detector] No /Encrypt pattern found');
    return { hasEncryptDict: false };
  }
  
  // Try to determine the encryption type
  const vMatch = textToSearch.match(/\/V\s+(\d+)/);
  let encryptionMethod: EncryptionInfo['encryptionMethod'] = 'unknown';
  
  if (vMatch) {
    const v = parseInt(vMatch[1], 10);
    console.log('[PDF Detector] Encryption version V:', v);
    switch (v) {
      case 1:
        encryptionMethod = 'RC4-40';
        break;
      case 2:
        encryptionMethod = 'RC4-128';
        break;
      case 4:
        encryptionMethod = 'AES-128';
        break;
      case 5:
        encryptionMethod = 'AES-256';
        break;
    }
  }
  
  return { hasEncryptDict: true, encryptionMethod };
}

/**
 * Fallback encryption detection by parsing raw PDF bytes
 * This is used when pdf.js fails or is unavailable
 */
function fallbackDetection(pdfData: ArrayBuffer): EncryptionInfo {
  const bytes = new Uint8Array(pdfData);
  const text = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(bytes.length, 10000)));
  
  // Look for /Encrypt dictionary in the PDF
  const encryptMatch = text.match(/\/Encrypt\s+\d+\s+\d+\s+R/);
  
  if (encryptMatch) {
    // PDF has an encryption dictionary
    // Try to determine the encryption type from /Filter and /V values
    
    const filterMatch = text.match(/\/Filter\s*\/([A-Za-z]+)/);
    const vMatch = text.match(/\/V\s+(\d+)/);
    
    let encryptionMethod: EncryptionInfo['encryptionMethod'] = 'unknown';
    
    if (vMatch) {
      const v = parseInt(vMatch[1], 10);
      switch (v) {
        case 1:
          encryptionMethod = 'RC4-40';
          break;
        case 2:
          encryptionMethod = 'RC4-128';
          break;
        case 4:
          encryptionMethod = 'AES-128';
          break;
        case 5:
          encryptionMethod = 'AES-256';
          break;
      }
    }
    
    return {
      isEncrypted: true,
      encryptionMethod,
      requiresPassword: true, // Assume password required in fallback mode
    };
  }
  
  return {
    isEncrypted: false,
    requiresPassword: false,
  };
}

/**
 * Check if a PDF can be opened with a given password
 */
export async function verifyPassword(
  pdfData: ArrayBuffer,
  password: string
): Promise<boolean> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfData),
      password,
    });
    
    await loadingTask.promise;
    return true;
  } catch {
    return false;
  }
}
