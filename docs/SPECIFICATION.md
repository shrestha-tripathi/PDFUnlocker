# PDF Password Remover SaaS - Technical Specification

## Document Version
- **Version**: 1.0.0
- **Date**: November 28, 2025
- **Status**: Draft

---

## 1. Executive Summary

This document specifies the architecture and implementation details for a client-side PDF Password Remover Progressive Web Application (PWA) built with Next.js. The application processes PDF files entirely in the browser using WebAssembly, ensuring user privacy by never transmitting files to any server.

---

## 2. Technology Stack

### 2.1 Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |

### 2.2 PDF Processing
| Library | Purpose | Justification |
|---------|---------|---------------|
| **pdf-lib** | PDF manipulation | Pure JS/TS, excellent API, handles basic encryption |
| **pdf.js (pdfjs-dist)** | PDF parsing & rendering | Mozilla's robust PDF engine, handles complex encryption |
| **@aspect-build/pdfium** or custom WASM | Heavy lifting | WASM-based PDF processing for complex operations |

**Primary Approach**: We will use a hybrid approach:
1. **pdf.js** for detecting encryption and rendering previews
2. **pdf-lib** for basic PDF manipulation
3. **Custom WASM solution (QPDF compiled to WASM)** for robust decryption

### 2.3 PWA Stack
| Technology | Purpose |
|------------|---------|
| next-pwa | PWA integration with Next.js |
| Workbox | Service worker management |
| Web App Manifest | Installability |

---

## 3. Architecture Overview

### 3.1 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   File Input  │────▶│  Encryption  │────▶│   Password   │   │
│  │  (Drop/Pick)  │     │   Detector   │     │    Prompt    │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                    │            │
│                                                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Download    │◀────│   PDF        │◀────│   WASM       │   │
│  │   Handler     │     │   Builder    │     │   Decryptor  │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
app/
├── layout.tsx              # Root layout with PWA meta tags
├── page.tsx                # Main application page
├── globals.css             # Global styles + Tailwind
└── manifest.ts             # Web manifest generation

components/
├── ui/
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Card container
│   ├── ProgressBar.tsx     # Progress indicator
│   └── Spinner.tsx         # Loading spinner
├── DropZone.tsx            # Drag and drop file input
├── PasswordModal.tsx       # Password input dialog
├── ProcessingStatus.tsx    # Processing state display
├── DownloadButton.tsx      # Download trigger
└── PrivacyBadge.tsx        # Privacy indicator

lib/
├── pdf/
│   ├── detector.ts         # Encryption detection
│   ├── decryptor.ts        # Decryption logic wrapper
│   └── wasm-loader.ts      # WASM module loader
├── utils/
│   └── file-helpers.ts     # File handling utilities
└── hooks/
    ├── usePdfProcessor.ts  # PDF processing hook
    └── useFileHandler.ts   # File input management

public/
├── wasm/
│   └── qpdf.wasm           # QPDF WebAssembly binary
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker
```

---

## 4. State Management

### 4.1 Application States

```typescript
type AppState = 
  | { status: 'idle' }
  | { status: 'file-selected'; file: File }
  | { status: 'checking-encryption'; file: File }
  | { status: 'password-required'; file: File }
  | { status: 'processing'; file: File; progress: number }
  | { status: 'success'; file: File; decryptedBlob: Blob }
  | { status: 'error'; file: File; error: string };
```

### 4.2 State Transitions

```
idle ──[file dropped]──▶ file-selected
                              │
                              ▼
                       checking-encryption
                        /           \
            [not encrypted]    [encrypted]
                  │                  │
                  ▼                  ▼
             processing      password-required
                  │                  │
                  │          [password entered]
                  │                  │
                  │                  ▼
                  └────────▶ processing
                                  │
                         /                \
                   [success]          [failure]
                       │                  │
                       ▼                  ▼
                   success              error
```

---

## 5. PDF Processing Implementation

### 5.1 Encryption Detection (using pdf.js)

```typescript
interface EncryptionInfo {
  isEncrypted: boolean;
  encryptionMethod?: 'RC4-40' | 'RC4-128' | 'AES-128' | 'AES-256';
  permissions?: {
    printing: boolean;
    modifying: boolean;
    copying: boolean;
  };
  requiresPassword: boolean;
}
```

### 5.2 Decryption Strategy

1. **Attempt 1**: Try opening with empty password (owner password often empty)
2. **Attempt 2**: Request user password
3. **Attempt 3**: Use WASM QPDF for robust decryption

### 5.3 WASM Integration Options

**Option A: Pre-built QPDF WASM (Recommended)**
- Use Emscripten to compile QPDF to WebAssembly
- Load via dynamic import
- ~2-3MB WASM binary

**Option B: pdf-lib with custom handlers**
- Lighter weight (~500KB)
- May not handle all encryption types

**Selected Approach**: We'll use **pdf.js** for detection and basic handling, with a fallback to a WASM-compiled solution for complex cases.

---

## 6. UI Design Specification

### 6.1 Color Palette

```css
:root {
  /* Primary - Trust Blue */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Success Green */
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-700: #374151;
  --gray-900: #111827;
  
  /* Error */
  --error-500: #ef4444;
}
```

### 6.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                              │
│  [Logo] PDF Password Remover         [Privacy Badge] 🔒     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │                     │                  │
│                    │    DROP ZONE        │                  │
│                    │                     │                  │
│                    │  [Icon] Drop PDF    │                  │
│                    │    or click to      │                  │
│                    │      browse         │                  │
│                    │                     │                  │
│                    └─────────────────────┘                  │
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │  Processing Status  │                  │
│                    │  [═══════════════]  │                  │
│                    │  [Download Button]  │                  │
│                    └─────────────────────┘                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                              │
│  "Your files never leave your device" • PWA Install Prompt  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Component Tailwind Classes

**Drop Zone**:
```
border-2 border-dashed border-gray-300 
hover:border-primary-500 
rounded-xl p-12 
transition-colors duration-200
bg-gray-50 hover:bg-primary-50
```

**Primary Button**:
```
bg-primary-600 hover:bg-primary-700 
text-white font-medium 
px-6 py-3 rounded-lg 
transition-colors duration-200
shadow-sm hover:shadow-md
```

**Success Card**:
```
bg-success-50 border border-success-200 
rounded-xl p-6
```

---

## 7. PWA Configuration

### 7.1 Web Manifest

```json
{
  "name": "PDF Password Remover",
  "short_name": "PDF Unlock",
  "description": "Remove passwords from PDF files - 100% private, works offline",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 7.2 Service Worker Strategy

- **Static Assets**: Cache-first strategy
- **WASM Files**: Cache-first with network fallback
- **HTML/JS**: Stale-while-revalidate

---

## 8. Security Considerations

### 8.1 Client-Side Only Guarantees
- No `fetch()` calls to external APIs for PDF processing
- All WASM code bundled locally
- No analytics or telemetry that includes file data

### 8.2 Memory Management
- Use `ArrayBuffer` for file handling
- Clear sensitive data from memory after processing
- Implement file size limits (configurable, default 100MB)

---

## 9. Error Handling

| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Invalid PDF | "This doesn't appear to be a valid PDF file" | Allow retry |
| Wrong Password | "Incorrect password. Please try again." | Re-prompt |
| Unsupported Encryption | "This PDF uses encryption we can't handle yet" | Show support link |
| File Too Large | "File exceeds maximum size of X MB" | Suggest alternatives |
| Browser Incompatible | "Please use a modern browser (Chrome, Firefox, Edge)" | Show requirements |

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load (LCP) | < 2.5s |
| Time to Interactive | < 3.5s |
| WASM Load Time | < 1s (cached) |
| PDF Processing (10MB) | < 5s |
| Lighthouse PWA Score | 100 |

---

## 11. Browser Support

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Full support |
| Safari | 15+ | Limited WASM features |
| Edge | 90+ | Full support |

---

## 12. Implementation Phases

### Phase 1: Core Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up static export configuration
- [ ] Create basic layout and routing

### Phase 2: UI Components
- [ ] Build DropZone component
- [ ] Build PasswordModal component
- [ ] Build ProcessingStatus component
- [ ] Build DownloadButton component

### Phase 3: PDF Processing
- [ ] Integrate pdf.js for encryption detection
- [ ] Implement decryption logic
- [ ] Add WASM fallback (if needed)
- [ ] Test with various encrypted PDFs

### Phase 4: PWA Features
- [ ] Configure next-pwa
- [ ] Create service worker
- [ ] Add web manifest
- [ ] Test offline functionality

### Phase 5: Polish
- [ ] Error handling improvements
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation

---

## 13. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pdfjs-dist": "^4.0.0",
    "pdf-lib": "^1.17.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "next-pwa": "^5.6.0"
  }
}
```

---

## 14. File Size Budget

| Asset | Size Budget |
|-------|-------------|
| Main JS Bundle | < 200KB (gzipped) |
| PDF.js Worker | < 500KB |
| WASM Binary | < 3MB |
| CSS | < 50KB |
| Total Initial Load | < 800KB |

---

## 15. Next Steps

Upon approval of this specification:
1. Initialize the Next.js project
2. Implement components in order of dependency
3. Integrate PDF processing logic
4. Add PWA features
5. Test and deploy

---

*Document prepared for PDF Password Remover SaaS project*
