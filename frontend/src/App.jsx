// frontend/src/App.jsx (FULL REPLACEMENT with Wallet and Transaction Logic)

import React, { useState, useEffect, useCallback } from 'react';
import { login, signup, logout, getNotes, createNote, updateNote, deleteNote } from "./api.js";
import './index.css';
import useWallet from './useWallet.jsx';
import { ethers } from 'ethers'; // For accessing ethers utility functions (like parseEther)

// --- Components ---

const Auth = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (isLogin) {
                // IMPORTANT: Login uses 'username' field, which maps to email in our API DTO
                await login(email, password); 
                setIsAuthenticated(true);
            } else {
                await signup(email, password);
                setMessage('Signup successful! Please log in.');
                setIsLogin(true);
            }
        } catch (error) {
            // Check for specific error message from the API
            setMessage(error.response?.data?.message || error.response?.data || 'An error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email (Used as Username for API)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-800"
                >
                    {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                </button>
            </div>
        </div>
    );
};

const NoteEditor = ({ currentNote, setCurrentNote, onSave }) => {
    const [title, setTitle] = useState(currentNote ? currentNote.title : '');
    const [content, setContent] = useState(currentNote ? currentNote.content : '');

    useEffect(() => {
        setTitle(currentNote ? currentNote.title : '');
        setContent(currentNote ? currentNote.content : '');
    }, [currentNote]);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        onSave({ ...currentNote, title, content });
        setTitle('');
        setContent('');
        setCurrentNote(null);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md mb-6 border-t-4 border-indigo-500">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {currentNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                required
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                required
            />
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
            >
                {currentNote ? 'Save Changes' : 'Add Note'}
            </button>
            {currentNote && (
                <button
                    onClick={() => setCurrentNote(null)}
                    className="ml-3 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-200"
                >
                    Cancel Edit
                </button>
            )}
        </div>
    );
};

const NotesDashboard = ({ setIsAuthenticated }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [txStatus, setTxStatus] = useState(null); // NEW: State for transaction status

    // Wallet integration hook
    const { 
        walletAddress, 
        isConnected, 
        connectWallet, 
        disconnectWallet,
        error: walletError,
        signer // CRITICAL: Get the signer object for transactions
    } = useWallet();

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getNotes();
            setNotes(response.data);
        } catch (err) {
            setError('Failed to fetch notes. Your session may have expired.');
            // Automatically log out if token is invalid (401 error)
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSave = async (note) => {
        try {
            if (note.id) {
                // Update existing note
                await updateNote(note.id, note.title, note.content);
            } else {
                // Create new note
                await createNote(note.title, note.content);
            }
            fetchNotes(); // Refresh list
        } catch (err) {
            setError('Failed to save note.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNote(id);
            fetchNotes(); // Refresh list
        } catch (err) {
            setError('Failed to delete note.');
        }
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        // Optional: Disconnect wallet on app logout
        disconnectWallet(); 
    };

    // NEW FUNCTION: Handles sending the transaction proof
    const sendProofTransaction = async () => {
        if (!isConnected || !signer) {
            setTxStatus({ message: "Please connect your MetaMask wallet first.", type: 'error' });
            return;
        }

        setTxStatus({ message: "Awaiting transaction confirmation in MetaMask...", type: 'pending' });

        try {
            // Amount to send (e.g., 0.00000001 ETH - very small amount for testing)
            const amount = ethers.parseEther("0.00000001"); 
            
            // Transaction object: sending the amount to your own address (UTXO proof)
            const tx = await signer.sendTransaction({
                to: walletAddress, // Sending the UTXO to yourself
                value: amount,
            });

            setTxStatus({ message: "Transaction submitted. Awaiting block confirmation...", type: 'pending' });
            
            // Wait for the transaction to be mined
            const receipt = await tx.wait(); 

            if (receipt.status === 1) {
                setTxStatus({ 
                    message: `Transaction successful! TX Hash: ${receipt.hash.substring(0, 10)}...`, 
                    type: 'success',
                    hash: receipt.hash
                });
                // Screenshot should be taken here!
            } else {
                setTxStatus({ message: "Transaction failed (Status 0).", type: 'error' });
            }

        } catch (error) {
            console.error("Transaction Error:", error);
            // Handle user rejecting transaction
            const errorMessage = error.code === 4001 ? "Transaction rejected by user." : `Transaction failed: ${error.message || 'Check console.'}`;
            setTxStatus({ message: errorMessage, type: 'error' });
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-indigo-700">My Notes App</h1>
                <div className="flex space-x-4 items-center">
                    
                    {/* ⬅️ NEW BUTTON: Transaction Proof */}
                    <button
                        onClick={sendProofTransaction}
                        disabled={!isConnected}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition duration-200 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                        Send UTXO Proof (0.0...1 ETH)
                    </button>
                    
                    {/* -------------------- WALLET DISPLAY & BUTTONS -------------------- */}
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {isConnected ? `Connected: ${walletAddress.substring(0, 6)}...` : 'Wallet Disconnected'}
                        </span>
                        <button
                            onClick={isConnected ? disconnectWallet : connectWallet}
                            className={`px-4 py-2 text-white font-semibold rounded-lg transition duration-200 ${
                                isConnected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                        </button>
                    </div>
                    {/* -------------------- LOGOUT BUTTON -------------------- */}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ⬅️ NEW: Transaction Status Display */}
            {(txStatus || walletError) && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${
                    txStatus?.type === 'success' ? 'bg-green-100 text-green-800' : 
                    txStatus?.type === 'error' || walletError ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {walletError || txStatus?.message}
                    {txStatus?.hash && (
                        <p className="mt-1 font-mono text-xs">Hash: {txStatus.hash}</p>
                    )}
                </div>
            )}
            
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <NoteEditor 
                currentNote={currentNote} 
                setCurrentNote={setCurrentNote} 
                onSave={handleSave} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="col-span-full text-center text-gray-500">Loading notes...</p>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="p-5 bg-white rounded-lg shadow-md border-l-4 border-indigo-400">
                            <h3 className="text-xl font-bold mb-2 text-gray-800">{note.title}</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                            <div className="mt-4 flex space-x-3">
                                <button
                                    onClick={() => setCurrentNote(note)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const App = () => {
    // Check local storage for token on initial load
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    return (
        isAuthenticated ? (
            <NotesDashboard setIsAuthenticated={setIsAuthenticated} />
        ) : (
            <Auth setIsAuthenticated={setIsAuthenticated} />
        )
    );
};

export default App;