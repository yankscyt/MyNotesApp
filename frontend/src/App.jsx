import React, { useState, useEffect } from 'react';
import { login, signup, logout, getNotes, createNote, updateNote, deleteNote } from "./api.js";
import './index.css';
import useWallet from './useWallet.jsx'; // EVM/MetaMask Hook
import { ethers } from 'ethers';
import { useTheme } from './ThemeContext.jsx';
// axios import is not needed here if all calls are routed through api.js

// ⬅️ CRITICAL FIX: Import the Cardano hook
import useCardanoWallet from './useCardanoWallet.jsx'; 


// ❌ REMOVED: All old local Cardano functions (connectCardanoWallet, sendADA, getUTxOs) 
// The hook now handles all of this logic using the new api.js functions.


// --- Auth Component ---
const Auth = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { isDarkMode } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (isLogin) {
                await login(email, password);
                setIsAuthenticated(true);
            } else {
                await signup(email, password);
                setMessage('Signup successful! Please log in.');
                setIsLogin(true);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data || 'An error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-elphaba-dark">
            <div className="p-8 bg-white dark:bg-elphaba-bg rounded-lg shadow-xl dark:shadow-2xl w-96 dark:text-glinda-light">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-glinda-light">
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-elphaba-green rounded-lg focus:outline-none focus:ring-2 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-elphaba-green rounded-lg focus:outline-none focus:ring-2 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light" required />
                    <button type="submit" className="w-full p-3 bg-glinda-pink dark:bg-elphaba-green text-white font-semibold rounded-lg hover:bg-pink-700 dark:hover:bg-teal-700 transition duration-200">{isLogin ? 'Log In' : 'Sign Up'}</button>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600 dark:text-red-400'}`}>{message}</p>}
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-glinda-pink dark:text-elphaba-green hover:text-pink-700 dark:hover:text-teal-700">{isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}</button>
            </div>
        </div>
    );
};

// --- Notes Editor ---
const NoteEditor = ({ currentNote, setCurrentNote, onSave }) => {
    const { isDarkMode } = useTheme();
    const [title, setTitle] = useState(currentNote?.title || '');
    const [content, setContent] = useState(currentNote?.content || '');

    useEffect(() => {
        setTitle(currentNote?.title || '');
        setContent(currentNote?.content || '');
    }, [currentNote]);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        onSave({ ...currentNote, title, content });
        setTitle('');
        setContent('');
        setCurrentNote(null);
    };

    return (
        <div className="p-4 bg-white dark:bg-elphaba-bg rounded-lg shadow-md mb-6 border-t-4 border-glinda-pink dark:border-elphaba-green dark:text-glinda-light">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-glinda-light">{currentNote ? 'Edit Note' : 'Create New Note'}</h3>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light focus:border-glinda-pink dark:focus:border-elphaba-green" required />
            <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows="6" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light focus:border-glinda-pink dark:focus:border-elphaba-green" required />
            <div className="pt-2">
                <button onClick={handleSave} className="px-4 py-2 bg-glinda-pink dark:bg-elphaba-green text-white font-semibold rounded-lg hover:bg-pink-700 dark:hover:bg-teal-700 transition duration-200">{currentNote ? 'Save Changes' : 'Add Note'}</button>
                {currentNote && <button onClick={() => setCurrentNote(null)} className="ml-3 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-200">Cancel Edit</button>}
            </div>
        </div>
    );
};

// --- Dashboard ---
const NotesDashboard = ({ setIsAuthenticated }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [txStatus, setTxStatus] = useState(null);

    const { isDarkMode, toggleTheme } = useTheme();

    // ⬅️ CRITICAL FIX: Replace local Cardano state with hook state
    // const [cardanoAddr, setCardanoAddr] = useState('');
    // const [cardanoUTxOs, setCardanoUTxOs] = useState([]);
    // const [cardanoTx, setCardanoTx] = useState('');
    const [adaAmount, setAdaAmount] = useState(1);
    
    // ⬅️ NEW HOOK CALL: Extract state and handlers from useCardanoWallet
    const {
        walletAddress: cardanoAddr, 
        isConnected: isCardanoConnected, 
        connectWallet: handleConnectCardano, 
        disconnectWallet: handleDisconnectCardano, 
        utxos: cardanoUTxOs, 
        txHash: cardanoTx, 
        sendAda: sendAdaTransaction, // Rename to avoid confusion with local handler
        error: cardanoError 
    } = useCardanoWallet();


    // Ethereum wallet (Keep this)
    const { walletAddress, isConnected, connectWallet, disconnectWallet, error: walletError, signer } = useWallet();

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try { const response = await getNotes(); setNotes(response.data); }
        catch { setError('Failed to fetch notes.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, []);

    const handleSave = async (note) => {
        try { note.id ? await updateNote(note.id, note.title, note.content) : await createNote(note.title, note.content); fetchNotes(); }
        catch { setError('Failed to save note.'); }
    };

    const handleDelete = async (id) => { try { await deleteNote(id); fetchNotes(); } catch { setError('Failed to delete note.'); } };
    const handleLogout = () => { logout(); setIsAuthenticated(false); disconnectWallet(); handleDisconnectCardano(); }; // ⬅️ Disconnect both wallets

    // Ethereum transaction demo
    const sendProofTransaction = async () => {
        if (!isConnected || !signer) { setTxStatus({ message: "Connect MetaMask first", type: 'error' }); return; }
        setTxStatus({ message: "Awaiting transaction...", type: 'pending' });
        try {
            const tx = await signer.sendTransaction({ to: walletAddress, value: ethers.parseEther("0.00000001") });
            setTxStatus({ message: "Transaction submitted...", type: 'pending' });
            const receipt = await tx.wait();
            setTxStatus({ message: receipt.status === 1 ? `TX Successful! Hash: ${receipt.hash}` : "Transaction failed.", type: receipt.status === 1 ? 'success' : 'error', hash: receipt.hash });
        } catch (err) {
            setTxStatus({ message: err.code === 4001 ? "User rejected TX" : `Error: ${err.message}`, type: 'error' });
        }
    };

    // ⬅️ FIX: Implement the local handler using the hook's sendAda function
    const handleSendCardano = async () => {
        if (!cardanoAddr) return alert("Connect Cardano first!");
        try { 
            // The hook handles the whole flow (build, sign, submit)
            const hash = await sendAdaTransaction(cardanoAddr, adaAmount); 
            if (hash) {
                setTxStatus({ message: `Cardano TX submitted! Hash: ${hash}`, type: 'success', hash });
            }
        }
        catch (err) { 
            setTxStatus({ message: `Cardano TX Failed: ${cardanoError || err.message}`, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-elphaba-dark p-8 dark:text-glinda-light">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-glinda-pink dark:text-elphaba-green">ChainNote</h1>
                <div className="flex space-x-4 items-center">
                    <button onClick={toggleTheme} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-glinda-light">{isDarkMode ? '☀️' : '🌙'}</button>

                    <button onClick={sendProofTransaction} disabled={!isConnected} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Send ETH Proof</button>

                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isConnected ? 'bg-green-100 text-green-800 dark:bg-teal-800 dark:text-glinda-light' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-glinda-light'}`}>
                            {isConnected ? `Connected: ${walletAddress.substring(0,6)}...` : 'Wallet Disconnected'}
                        </span>
                        <button onClick={isConnected ? disconnectWallet : connectWallet} className={`px-4 py-2 text-white font-semibold rounded-lg ${isConnected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-glinda-pink hover:bg-pink-700 dark:bg-elphaba-green dark:hover:bg-teal-700'}`}>
                            {isConnected ? 'Disconnect' : 'Connect ETH'}
                        </button>
                    </div>

                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Logout</button>
                </div>
            </header>

            {(txStatus || walletError || cardanoError) && <div className={`p-4 mb-4 rounded-lg ${txStatus?.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800 dark:bg-red-900 dark:text-glinda-light'}`}>{txStatus?.message || walletError || cardanoError}{txStatus?.hash && <p className="mt-1 font-mono text-xs">{txStatus.hash}</p>}</div>}

            <NoteEditor currentNote={currentNote} setCurrentNote={setCurrentNote} onSave={handleSave} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="col-span-full text-center">Loading notes...</p> : notes.map(note => (
                    <div key={note.id} className="p-5 bg-white dark:bg-elphaba-bg rounded-lg shadow-md border-l-4 border-glinda-pink dark:border-elphaba-green dark:text-glinda-light">
                        <h3 className="text-xl font-bold mb-2">{note.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-4 flex space-x-3">
                            <button onClick={() => setCurrentNote(note)} className="text-sm text-glinda-pink dark:text-elphaba-green hover:text-pink-700 dark:hover:text-teal-700 font-medium">Edit</button>
                            <button onClick={() => handleDelete(note.id)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="my-8" />
            <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Cardano Preprod Demo (Solo)</h2>
                
                {/* ⬅️ Update button to use hook state and handlers */}
                <button onClick={handleConnectCardano} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-2" disabled={isCardanoConnected}>
                    {isCardanoConnected ? 'Wallet Connected' : 'Connect Cardano Wallet'}
                </button>
                <button onClick={handleDisconnectCardano} className="px-4 py-2 ml-3 bg-red-600 hover:bg-red-700 text-white rounded-lg mb-2" disabled={!isCardanoConnected}>
                    Disconnect Cardano
                </button>
                
                {cardanoAddr && <p>Connected: {cardanoAddr}</p>}
                
                <div className="mt-2">
                    <label>Amount (ADA):
                        <input type="number" value={adaAmount} onChange={e=>setAdaAmount(Number(e.target.value))} className="ml-2 w-20 p-1 rounded border"/>
                    </label>
                    {/* ⬅️ Update button to use local handler which calls the hook */}
                    <button onClick={handleSendCardano} disabled={!isCardanoConnected} className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Send ADA to Self</button>
                </div>
                
                {cardanoTx && <p className="mt-2"><strong>TX Hash:</strong> {cardanoTx}</p>}
                {cardanoUTxOs.length>0 && 
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <h3>UTxOs ({cardanoUTxOs.length}):</h3>
                        {JSON.stringify(cardanoUTxOs, null, 2)}
                    </pre>}
            </div>
        </div>
    );
};

// --- Main App ---
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    return isAuthenticated ? <NotesDashboard setIsAuthenticated={setIsAuthenticated} /> : <Auth setIsAuthenticated={setIsAuthenticated} />;
};

export default App;