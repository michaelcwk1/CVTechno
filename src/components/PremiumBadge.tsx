// src/components/PremiumBadge.tsx
import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { premiumService } from '@/services/paymentService';
import { useEffect, useState } from 'react';

export function PremiumBadge() {
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const checkPremium = () => {
      const data = premiumService.getPremiumData();
      setIsPremium(data.isValid);
      setExpiresAt(data.expiresAt);
    };

    checkPremium();
    
    // Check every minute
    const interval = setInterval(checkPremium, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isPremium) return null;

  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}j ${minutes}m tersisa`;
  };

  return (
    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 gap-1">
      <Crown className="h-3 w-3" />
      Premium Active
      <span className="text-xs opacity-80 ml-1">• {getTimeRemaining()}</span>
    </Badge>
  );
}

// Component untuk lock premium features
interface PremiumLockProps {
  children: React.ReactNode;
  onUpgradeClick: () => void;
  featureName?: string;
}

export function PremiumLock({ children, onUpgradeClick, featureName = "fitur ini" }: PremiumLockProps) {
  const isPremium = premiumService.hasActivePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none opacity-50 blur-sm">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
        <div className="text-center space-y-3 p-6 bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-lg max-w-sm">
          <Sparkles className="h-8 w-8 text-yellow-500 mx-auto" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Premium Feature</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upgrade untuk menggunakan {featureName}
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            Upgrade Sekarang - Rp 19k
          </button>
        </div>
      </div>
    </div>
  );
}