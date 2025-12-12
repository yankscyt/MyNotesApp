import { useState } from "react";
import { linkWalletAddress } from "./api"; // your API file

export default function useWallet() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  //  CONNECT CARDANO (Nami / Eternl / Lace)
  // -----------------------------
  const connectCardano = async () => {
    setLoading(true);
    setError(null);

    try {
      let wallet;

      if (window.cardano?.eternl) {
        wallet = await window.cardano.eternl.enable();
      } else if (window.cardano?.nami) {
        wallet = await window.cardano.nami.enable();
      } else if (window.cardano?.lace) {
        wallet = await window.cardano.lace.enable();
      } else {
        setError("No Cardano wallet detected. Install Nami / Eternl / Lace.");
        setLoading(false);
        return;
      }

      const usedAddresses = await wallet.getUsedAddresses();
      if (!usedAddresses || usedAddresses.length === 0) {
        setError("Wallet connected, but no used addresses found.");
        setLoading(false);
        return;
      }

      // Convert from CBOR → address
      const addressHex = usedAddresses[0];
      const address = window.cardano.getAddressFromHex
        ? window.cardano.getAddressFromHex(addressHex)
        : addressHex;

      console.log("Cardano Wallet Address:", address);
      setWalletAddress(address);

      // Save to backend
      const res = await linkWalletAddress(address);
      console.log("Backend Response:", res.data);

    } catch (err) {
      console.error("Connection Error (Cardano):", err);
      setError("Failed to connect to Cardano wallet.");
    }

    setLoading(false);
  };

  // -----------------------------
  //  CONNECT ETHEREUM (MetaMask)
  // -----------------------------
  const connectEthereum = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        setError("MetaMask not detected.");
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      console.log("Ethereum Wallet Address:", address);
      setWalletAddress(address);

      const res = await linkWalletAddress(address);
      console.log("Backend Response:", res.data);

    } catch (err) {
      console.error("Connection Error (ETH):", err);
      setError("Failed to connect to MetaMask.");
    }

    setLoading(false);
  };

  return {
    walletAddress,
    loading,
    error,
    connectCardano,
    connectEthereum,
  };
}
