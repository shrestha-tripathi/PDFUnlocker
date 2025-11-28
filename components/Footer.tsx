import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Privacy Statement */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span>🔒</span>
            <span>Your files never leave your device. 100% client-side processing.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Source</span>
            </a>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" /> for privacy
            </span>
          </div>
        </div>

        {/* Install PWA hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Install this app for offline use. Look for the install button in your browser&apos;s address bar.
          </p>
        </div>
      </div>
    </footer>
  );
}
