import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

/**
 * Hook để quản lý kết nối MetaMask wallet
 */
export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';

  // Check connection status on mount
  useEffect(() => {
    if (isMetaMaskInstalled) {
      checkConnection();
      // Listen for account changes
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      // Listen for chain changes
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (isMetaMaskInstalled) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isMetaMaskInstalled]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const checkConnection = async () => {
    if (!isMetaMaskInstalled) return;

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      const errorMsg = 'MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension để kết nối ví.';
      setError(errorMsg);
      toast.error(errorMsg);
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setAccount(address);
        setIsConnected(true);
        toast.success('Kết nối ví thành công!');
        return address;
      } else {
        throw new Error('Không thể lấy địa chỉ ví');
      }
    } catch (err: any) {
      let errorMessage = 'Không thể kết nối ví';
      
      if (err.code === 4001) {
        errorMessage = 'Người dùng đã từ chối kết nối ví';
      } else if (err.code === -32002) {
        errorMessage = 'Yêu cầu kết nối đang chờ xử lý. Vui lòng kiểm tra MetaMask.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    toast.success('Đã ngắt kết nối ví');
  }, []);

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    account,
    isConnecting,
    isConnected,
    isMetaMaskInstalled,
    error,
    connect,
    disconnect,
    formatAddress,
  };
};

