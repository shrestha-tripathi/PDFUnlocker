import { Shield } from 'lucide-react';

export default function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full text-sm text-green-700 dark:text-green-400 font-medium">
      <Shield className="w-4 h-4" />
      <span>100% Private</span>
    </div>
  );
}
