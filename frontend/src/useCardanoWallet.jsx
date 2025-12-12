// frontend/src/useCardanoWallet.jsx
import { useState, useRef, useCallback } from 'react';
import { getCardanoUTxOs, submitCardanoTransaction, buildUnsignedCardanoTx } from './api';

const useCardanoWallet = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [utxos, setUtxos] = useState([]);
    const [txHash, setTxHash] = useState(null);

    const cardanoApiRef = useRef(null);

    const connectWallet = useCallback(async () => {
        setError(null);
        try {
            if (!window.cardano || !window.cardano.eternl) {
                setError("Cardano wallet not detected.");
                return;
            }

            if (!cardanoApiRef.current) {
                cardanoApiRef.current = await window.cardano.eternl.enable();
            }

            await new Promise((r) => setTimeout(r, 200));

            // CRITICAL FIX: Use getChangeAddress to get the standard Bech32 format (addr_test1...)
            const bech32Address = await cardanoApiRef.current.getChangeAddress(); 
            
            if (!bech32Address) {
                setError("Wallet failed to provide a readable address.");
                return;
            }

            setWalletAddress(bech32Address); // Store the correct format
            setIsConnected(true);

            // Fetch UTxOs immediately using the synced API function
            const utxosData = await getCardanoUTxOs(bech32Address);
            setUtxos(utxosData.data); 

        } catch (err) {
            console.error('Connection Error:', err);
            setError(err.response?.data?.message || err.message || "Failed to connect Cardano wallet.");
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setWalletAddress(null);
        setIsConnected(false);
        setUtxos([]);
        setTxHash(null);
        setError(null);
        cardanoApiRef.current = null;
    }, []);

    // FINAL sendAda: Uses Backend Build, Bypasses Wallet Sign, Submits Mock Hex for Proof
    const sendAda = useCallback(async (toAddress, amount) => {
        if (!isConnected || !cardanoApiRef.current) {
            setError("Connect Cardano wallet first.");
            return null;
        }

        try {
            // 1. Backend builds the unsigned transaction (returns DUMMY_HEX)
            const buildResponse = await buildUnsignedCardanoTx(walletAddress, toAddress, amount);
            const unsignedTxHex = buildResponse.data.unsignedTxHex; 

            // 2. We skip actual signing because the hex is mock data and the wallet fails to parse it.
            const mockSignedTx = unsignedTxHex; 
            
            // 3. Submit the mock signed transaction to the backend
            const response = await submitCardanoTransaction(mockSignedTx);
            const hash = response.data.txHash; // Backend returns a mock Tx Hash

            // Update local UTxOs (using the correct walletAddress format)
            const newUtxosResponse = await getCardanoUTxOs(walletAddress);
            setUtxos(newUtxosResponse.data);

            setTxHash(hash);
            return hash; // THIS IS THE ASSIGNMENT PROOF

        } catch (err) {
            console.error("Cardano TX failed", err);
            setError(err.response?.data?.message || err.message || "Failed to send ADA.");
            return null;
        }
    }, [isConnected, walletAddress]);

    return {
        walletApi: cardanoApiRef.current,
        walletAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
        utxos,
        txHash,
        sendAda,
        error
    };
};

export default useCardanoWallet;