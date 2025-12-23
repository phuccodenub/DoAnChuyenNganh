import { Wallet, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/services/api/user.api';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

interface WalletConnectButtonProps {
  onConnectSuccess?: (address: string) => void;
  className?: string;
}

/**
 * Component để connect MetaMask wallet và lưu wallet address vào profile
 */
export const WalletConnectButton = ({ onConnectSuccess, className }: WalletConnectButtonProps) => {
  const { account, isConnecting, isConnected, isMetaMaskInstalled, error, connect, disconnect, formatAddress } = useWallet();
  const { user, updateProfile, updateUserData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Check if user already has wallet_address (normalize to lowercase for comparison)
  // Use useMemo to ensure it updates when user changes
  const { userWalletAddress, hasWalletInProfile, accountMatches } = useMemo(() => {
    const walletAddr = (user as any)?.wallet_address 
      ? String((user as any).wallet_address).toLowerCase().trim() 
      : null;
    const hasWallet = !!walletAddr;
    const connectedLower = account ? account.toLowerCase().trim() : null;
    const matches = connectedLower && walletAddr && connectedLower === walletAddr;
    
    return {
      userWalletAddress: walletAddr,
      hasWalletInProfile: hasWallet,
      accountMatches: matches
    };
  }, [user, account]);

  const handleConnect = async () => {
    const address = await connect();
    
    if (address && onConnectSuccess) {
      onConnectSuccess(address);
    }
    // Note: Không auto-save, để user tự click "Lưu địa chỉ ví vào hồ sơ"
  };

  const saveWalletToProfile = async (address: string) => {
    try {
      setIsSaving(true);
      
      const normalizedAddress = address.toLowerCase().trim();
      
      // Update profile with wallet address
      const success = await updateProfile({
        wallet_address: normalizedAddress,
      } as any);
      
      if (success) {
        // Update user data immediately for UI refresh
        updateUserData({ wallet_address: normalizedAddress } as any);
        toast.success('Đã lưu địa chỉ ví vào hồ sơ!');
        
        // Force component re-render by updating a state
        // Component will automatically re-render when user data changes
      }
    } catch (err: any) {
      console.error('Error saving wallet to profile:', err);
      toast.error(err?.message || 'Không thể lưu địa chỉ ví. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Auto-save when connected and not saved
  useEffect(() => {
    if (isConnected && account && !hasWalletInProfile && !isSaving) {
      // Auto-save after a short delay to avoid double-saving
      const timer = setTimeout(() => {
        saveWalletToProfile(account);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, account, hasWalletInProfile, isSaving]);

  const handleDisconnect = () => {
    disconnect();
    // Optionally remove from profile
    // updateProfile({ wallet_address: null } as any);
  };


  // If connected but not saved to profile
  if (isConnected && account && !hasWalletInProfile) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Ví đã kết nối</p>
              <p className="text-xs text-green-700 mt-1 font-mono">{formatAddress(account)}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => saveWalletToProfile(account)}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="mr-2" />
              Lưu địa chỉ ví vào hồ sơ
            </>
          )}
        </Button>
      </div>
    );
  }

  // If connected and saved (account matches saved wallet)
  if (isConnected && account && hasWalletInProfile && accountMatches) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Ví đã kết nối và lưu</p>
              <p className="text-xs text-green-700 mt-1 font-mono">{formatAddress(account)}</p>
              <p className="text-xs text-green-600 mt-2">
                Bạn sẽ nhận NFT certificates khi hoàn thành khóa học
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="w-full"
        >
          Ngắt kết nối
        </Button>
      </div>
    );
  }
  
  // If saved but different account connected (or not connected)
  if (hasWalletInProfile && (!isConnected || !accountMatches)) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Ví đã được lưu</p>
              <p className="text-xs text-blue-700 mt-1 font-mono">{formatAddress(userWalletAddress)}</p>
              <p className="text-xs text-blue-600 mt-2">
                {isConnected && !accountMatches 
                  ? 'Ví hiện tại khác với ví đã lưu. Kết nối lại ví đã lưu hoặc lưu ví mới.'
                  : 'Kết nối MetaMask để nhận NFT certificates khi hoàn thành khóa học'}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isConnecting || isSaving}
          variant="outline"
          className="w-full"
        >
          {isConnecting || isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Đang kết nối...
            </>
          ) : (
            <>
              <Wallet size={16} className="mr-2" />
              {isConnected && !accountMatches ? 'Lưu ví hiện tại' : 'Kết nối lại MetaMask'}
            </>
          )}
        </Button>
      </div>
    );
  }

  // Not connected - show connect button
  if (!isMetaMaskInstalled) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">MetaMask chưa được cài đặt</p>
              <p className="text-xs text-yellow-700 mt-1">
                Cài đặt MetaMask để kết nối ví và nhận NFT certificates
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          className="w-full"
        >
          <ExternalLink size={16} className="mr-2" />
          Cài đặt MetaMask
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Đang kết nối...
          </>
        ) : (
          <>
            <Wallet size={16} className="mr-2" />
            Kết nối MetaMask
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Kết nối ví để nhận NFT certificates khi hoàn thành khóa học
      </p>
    </div>
  );
};

