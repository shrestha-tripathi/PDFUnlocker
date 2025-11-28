'use client';

import { FileKey, Menu, X } from 'lucide-react';
import { useState } from 'react';
import PrivacyBadge from './PrivacyBadge';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
              <FileKey className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              PDF<span className="text-primary-600 dark:text-primary-400">Unlock</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <PrivacyBadge />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <PrivacyBadge />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
