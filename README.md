# PDF Password Remover

A privacy-focused Progressive Web App (PWA) that removes passwords from PDF files entirely in the browser. Your files never leave your device.

## Features

- 🔒 **100% Private**: All processing happens locally in your browser
- ⚡ **Lightning Fast**: No upload/download delays
- 📴 **Works Offline**: Install as a PWA for offline use
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📱 **Mobile Ready**: Works on all devices

## Tech Stack

- **Framework**: Next.js 14 (Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf.js + pdf-lib
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PDFUnlocker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates a static export in the `out/` directory that can be deployed to any static hosting service.

### Deployment Options

The app can be deployed to:

- **GitHub Pages**: Push to `gh-pages` branch
- **Vercel**: Connect your repository
- **Netlify**: Drag and drop the `out/` folder
- **Any Static Host**: Upload the `out/` directory

## Project Structure

```
PDFUnlocker/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── DropZone.tsx      # File drop area
│   ├── PasswordModal.tsx # Password input dialog
│   ├── ProcessingStatus.tsx
│   ├── DownloadButton.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── PrivacyBadge.tsx
├── lib/
│   ├── hooks/
│   │   └── usePdfProcessor.ts
│   └── pdf/
│       ├── detector.ts   # Encryption detection
│       └── decryptor.ts  # PDF decryption
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
├── docs/
│   └── SPECIFICATION.md  # Technical specification
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## How It Works

1. **File Selection**: User drops or selects a PDF file
2. **Encryption Detection**: The app checks if the PDF is encrypted using pdf.js
3. **Password Handling**: If needed, prompts for password
4. **Decryption**: Uses pdf-lib to create an unencrypted copy
5. **Download**: User downloads the unlocked PDF

## PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Service worker caches app resources
- **File Handling**: Can be set as default PDF handler (Chrome)

## Icon Generation

For production, generate icons at these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Use the SVG at `/public/icons/icon.svg` as the source.

You can use tools like:
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/nicholasio/pwa-asset-generator)

## Security Considerations

- Files are processed entirely in the browser
- No server-side code or API calls for PDF processing
- Passwords are never transmitted anywhere
- Memory is cleared after processing

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

## Limitations

- Maximum file size: 100MB (configurable)
- Some heavily encrypted PDFs may not be supported
- Very complex PDFs may have some formatting changes

## Contributing

Contributions are welcome! Please read the specification document in `docs/SPECIFICATION.md` for technical details.

## License

MIT License - feel free to use for personal or commercial projects.
