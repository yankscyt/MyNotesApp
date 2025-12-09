// frontend/src/useWallet.jsx

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // 1. Connect function
    const connectWallet = useCallback(async () => {
        setError(null);
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const currentProvider = new ethers.BrowserProvider(window.ethereum);
                const currentSigner = await currentProvider.getSigner();
                
                setProvider(currentProvider);
                setSigner(currentSigner);
                setWalletAddress(accounts[0]);
                setIsConnected(true);
            } catch (err) {
                setError("Connection rejected by user or MetaMask is locked.");
                setIsConnected(false);
            }
        } else {
            setError("MetaMask not detected. Please install it.");
            setIsConnected(false);
        }
    }, []);

    // 2. Disconnect function
    const disconnectWallet = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setWalletAddress(null);
        setIsConnected(false);
        setError(null);
    }, []);

    // 3. Effect to handle account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setIsConnected(true);
                } else {
                    disconnectWallet();
                }
            };
            
            // Re-establish connection on load if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(handleAccountsChanged)
                .catch(console.error);

            // Set up event listener for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Clean up the event listener on component unmount
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [disconnectWallet]);

    return {
        provider,
        signer,
        walletAddress,
        isConnected,
        error,
        connectWallet,
        disconnectWallet,
    };
};

export default useWallet;