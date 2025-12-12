import { useState, useEffect, useCallback } from 'react';

const CARDANO_WALLETS = ['eternl', 'nami', 'flint']; // Add other wallets if needed

export default function useCardanoWallet() {
    const [wallet, setWallet] = useState(null);
    const [walletName, setWalletName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [error, setError] = useState('');

    // Detect available wallet extensions
    const detectWallet = useCallback(() => {
        if (!window.cardano) {
            setError('No Cardano wallet detected. Please install a wallet extension.');
            return null;
        }

        for (let name of CARDANO_WALLETS) {
            if (window.cardano[name]) {
                setWallet(window.cardano[name]);
                setWalletName(name);
                setError('');
                return window.cardano[name];
            }
        }

        setError('No supported Cardano wallet found. Install Eternl, Nami, or Flint.');
        return null;
    }, []);

    // Connect wallet (user must approve in extension popup)
    const connectWallet = useCallback(async () => {
        setError('');
        try {
            const detected = wallet || detectWallet();
            if (!detected) return;

            // Prompt the user to enable the wallet
            const api = await detected.enable();
            setIsConnected(true);

            // Get used addresses (returns array of hex addresses)
            const addresses = await api.getUsedAddresses();
            if (addresses && addresses.length > 0) {
                // Convert hex to bech32 (use API method if available)
                const addr = addresses[0]; 
                setWalletAddress(addr);
            } else {
                setError('No addresses found in wallet.');
            }
        } catch (err) {
            console.error('Wallet connection error:', err);
            if (err?.code === -3 || err?.info?.includes('user canceled')) {
                setError('Connection canceled by user.');
            } else {
                setError(err.message || 'Failed to connect wallet.');
            }
        }
    }, [wallet, detectWallet]);

    // Disconnect wallet (reset state)
    const disconnectWallet = useCallback(() => {
        setIsConnected(false);
        setWalletAddress('');
        setError('');
    }, []);

    // Auto-detect wallet on mount
    useEffect(() => {
        detectWallet();
    }, [detectWallet]);

    return {
        wallet,
        walletName,
        isConnected,
        walletAddress,
        error,
        connectWallet,
        disconnectWallet
    };
}
