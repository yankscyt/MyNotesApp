import React, { useState } from 'react';
import { connectCardanoWallet, sendADA, getUTxOs } from '../cardanoWallet';

export default function CardanoPreprod() {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(1);
    const [utxos, setUtxos] = useState([]);
    const [txHash, setTxHash] = useState('');
    const [loading, setLoading] = useState(false);

    // Connect wallet
    const handleConnect = async () => {
        const addr = await connectCardanoWallet();
        if (addr) {
            setAddress(addr);
            const fetchedUTxOs = await getUTxOs(addr);
            setUtxos(fetchedUTxOs);
        }
    };

    // Send ADA to self (solo project)
    const handleSend = async () => {
        if (!address) return alert("Connect wallet first!");
        setLoading(true);
        try {
            const hash = await sendADA(address, amount);
            setTxHash(hash);
            const updatedUTxOs = await getUTxOs(address);
            setUtxos(updatedUTxOs);
        } catch (err) {
            console.error(err);
            alert("Transaction failed");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h2>Cardano Preprod Solo Demo</h2>

            <button onClick={handleConnect} disabled={loading}>
                {address ? "Wallet Connected" : "Connect Cardano Wallet"}
            </button>

            {address && <p>Connected address: {address}</p>}

            <div style={{ margin: "1rem 0" }}>
                <label>
                    Amount (ADA):
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{ marginLeft: "0.5rem", width: "80px" }}
                    />
                </label>
            </div>

            <button onClick={handleSend} disabled={loading || !address}>
                {loading ? "Sending..." : "Send ADA to Self"}
            </button>

            {txHash && (
                <p>
                    <strong>Transaction Hash:</strong> {txHash}
                </p>
            )}

            <h3>UTxOs:</h3>
            <pre style={{ background: "#eee", padding: "1rem" }}>
                {JSON.stringify(utxos, null, 2)}
            </pre>
        </div>
    );
}
