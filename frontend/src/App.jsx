// frontend/src/App.jsx (FINAL REPLACEMENT: Rich Text Editor Compatibility Fix)

import React, { useState, useEffect, useCallback } from 'react';
import { login, signup, logout, getNotes, createNote, updateNote, deleteNote } from "./api.js";
import './index.css';
import useWallet from './useWallet.jsx';
import { ethers } from 'ethers';
import { useTheme } from './ThemeContext.jsx';
import ReactQuill from 'react-quill'; // ⬅️ IMPORTED REACT QUILL

// ----------------------------------------------------
// ⬅️ CRITICAL FIX: Legacy React 19 Compatibility Wrapper
// This prevents the "findDOMNode is not a function" error by using React.forwardRef
const QuillNoSSRWrapper = React.memo(
  React.forwardRef((props, ref) => (
    <ReactQuill {...props} ref={ref} />
  ))
);
// ----------------------------------------------------

// --- Components ---

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
        // Apply Dark/Light background colors
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-elphaba-dark">
            {/* Apply Dark/Light card colors and shadow, and base text color */}
            <div className="p-8 bg-white dark:bg-elphaba-bg rounded-lg shadow-xl dark:shadow-2xl w-96 dark:text-glinda-light">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-glinda-light">
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email (Used as Username for API)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        // Apply Dark/Light input styles
                        className="w-full p-3 border border-gray-300 dark:border-elphaba-green rounded-lg focus:outline-none focus:ring-2 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        // Apply Dark/Light input styles
                        className="w-full p-3 border border-gray-300 dark:border-elphaba-green rounded-lg focus:outline-none focus:ring-2 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light"
                        required
                    />
                    <button
                        type="submit"
                        // Glinda/Elphaba Button Styles
                        className="w-full p-3 bg-glinda-pink dark:bg-elphaba-green text-white font-semibold rounded-lg hover:bg-pink-700 dark:hover:bg-teal-700 transition duration-200"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600 dark:text-red-400'}`}>{message}</p>}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    // Glinda/Elphaba Link Styles
                    className="w-full mt-4 text-sm text-glinda-pink dark:text-elphaba-green hover:text-pink-700 dark:hover:text-teal-700"
                >
                    {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                </button>
            </div>
        </div>
    );
};

// ⬅️ NEW HELPER: Renders raw HTML content safely
const NoteContent = ({ htmlContent }) => {
    return <div 
        className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />;
};

const NoteEditor = ({ currentNote, setCurrentNote, onSave }) => {
    // ⬅️ CRITICAL FIX: Add useTheme hook here
    const { isDarkMode } = useTheme(); 

    const [title, setTitle] = useState(currentNote ? currentNote.title : '');
    const [content, setContent] = useState(currentNote ? currentNote.content : '');

    useEffect(() => {
        setTitle(currentNote ? currentNote.title : '');
        setContent(currentNote ? currentNote.content : '');
    }, [currentNote]);

    const handleSave = () => {
        // Check if title is empty or if content is empty HTML (e.g., "<p><br></p>")
        if (!title.trim() || content === '<p><br></p>' || !content.trim()) return;
        onSave({ ...currentNote, title, content });
        setTitle('');
        setContent('');
        setCurrentNote(null);
    };

    // Configuration for the Rich Text Editor toolbar
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'code-block'],
            ['clean']
        ],
    };

    return (
        // Apply Dark/Light card styles and border, and ensure nested text is light
        <div className="p-4 bg-white dark:bg-elphaba-bg rounded-lg shadow-md mb-6 border-t-4 border-glinda-pink dark:border-elphaba-green dark:text-glinda-light">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-glinda-light">
                {currentNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                // Apply Dark/Light input styles
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 focus:ring-glinda-pink dark:bg-gray-700 dark:text-glinda-light focus:border-glinda-pink dark:focus:border-elphaba-green"
                required
            />
            
            {/* ⬅️ USE THE WRAPPER COMPONENT HERE */}
            <QuillNoSSRWrapper 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                className={`mb-3 h-40 ${isDarkMode ? 'dark-editor' : 'light-editor'}`} // Use a class for dark mode styling
            />
            
            <style jsx="true">{`
                /* CRITICAL STYLING FOR DARK MODE - Targets Quill's internal classes */
                .dark-editor .ql-toolbar {
                    border-color: #008080 !important; /* elphaba-green */
                    background-color: #2c2e30; /* elphaba-bg */
                    color: #F8F4FF; /* glinda-light */
                }
                .dark-editor .ql-container {
                    border-color: #008080 !important; /* elphaba-green */
                    background-color: #181a1b !important; /* elphaba-dark */
                }
                .dark-editor .ql-editor {
                    color: #F8F4FF; /* glinda-light */
                }
            `}</style>
            
            <div className="pt-12"> {/* Adds spacing below the editor */}
                <button
                    onClick={handleSave}
                    // Glinda/Elphaba Button Styles
                    className="px-4 py-2 bg-glinda-pink dark:bg-elphaba-green text-white font-semibold rounded-lg hover:bg-pink-700 dark:hover:bg-teal-700 transition duration-200"
                >
                    {currentNote ? 'Save Changes' : 'Add Note'}
                </button>
                {currentNote && (
                    <button
                        onClick={() => setCurrentNote(null)}
                        // Glinda/Elphaba secondary button styles
                        className="ml-3 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>
        </div>
    );
};

const NotesDashboard = ({ setIsAuthenticated }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [txStatus, setTxStatus] = useState(null);

    const { isDarkMode, toggleTheme } = useTheme();

    // Wallet integration hook
    const { 
        walletAddress, 
        isConnected, 
        connectWallet, 
        disconnectWallet,
        error: walletError,
        signer
    } = useWallet();

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getNotes();
            setNotes(response.data);
        } catch (err) {
            setError('Failed to fetch notes. Your session may have expired.');
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
                await updateNote(note.id, note.title, note.content);
            } else {
                await createNote(note.title, note.content);
            }
            fetchNotes(); 
        } catch (err) {
            setError('Failed to save note.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNote(id);
            fetchNotes(); 
        } catch (err) {
            setError('Failed to delete note.');
        }
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        disconnectWallet(); 
    };

    const sendProofTransaction = async () => {
        if (!isConnected || !signer) {
            setTxStatus({ message: "Please connect your MetaMask wallet first.", type: 'error' });
            return;
        }

        setTxStatus({ message: "Awaiting transaction confirmation in MetaMask...", type: 'pending' });

        try {
            const amount = ethers.parseEther("0.00000001"); 
            
            const tx = await signer.sendTransaction({
                to: walletAddress, 
                value: amount,
            });

            setTxStatus({ message: "Transaction submitted. Awaiting block confirmation...", type: 'pending' });
            
            const receipt = await tx.wait(); 

            if (receipt.status === 1) {
                setTxStatus({ 
                    message: `Transaction successful! TX Hash: ${receipt.hash.substring(0, 10)}...`, 
                    type: 'success',
                    hash: receipt.hash
                });
            } else {
                setTxStatus({ message: "Transaction failed (Status 0).", type: 'error' });
            }

        } catch (error) {
            console.error("Transaction Error:", error);
            const errorMessage = error.code === 4001 ? "Transaction rejected by user." : `Transaction failed: ${error.message || 'Check console.'}`;
            setTxStatus({ message: errorMessage, type: 'error' });
        }
    };


    return (
        // Apply Dark/Light Page Background and base text color
        <div className="min-h-screen bg-gray-100 dark:bg-elphaba-dark p-8 dark:text-glinda-light">
            <header className="flex justify-between items-center mb-8">
                {/* Apply Dark/Light Header Text */}
                <h1 className="text-3xl font-extrabold text-glinda-pink dark:text-elphaba-green">ChainNote</h1>
                
                <div className="flex space-x-4 items-center">
                    {/* ⬅️ Glinda/Elphaba Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-glinda-light hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
                        title={isDarkMode ? 'Switch to Glinda Theme (Light)' : 'Switch to Elphaba Theme (Dark)'}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    
                    {/* ⬅️ Glinda/Elphaba UTXO Proof Button */}
                    <button
                        onClick={sendProofTransaction}
                        disabled={!isConnected}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition duration-200 bg-green-600 hover:bg-green-700 dark:bg-elphaba-green dark:hover:bg-teal-700 disabled:bg-gray-400"
                    >
                        Send UTXO Proof
                    </button>
                    
                    {/* -------------------- WALLET DISPLAY & BUTTONS -------------------- */}
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            isConnected ? 'bg-green-100 text-green-800 dark:bg-teal-800 dark:text-glinda-light' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-glinda-light'
                        }`}>
                            {isConnected ? `Connected: ${walletAddress.substring(0, 6)}...` : 'Wallet Disconnected'}
                        </span >
                        <button
                            onClick={isConnected ? disconnectWallet : connectWallet}
                            // Glinda/Elphaba Wallet Button Styles
                            className={`px-4 py-2 text-white font-semibold rounded-lg transition duration-200 ${
                                isConnected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-glinda-pink hover:bg-pink-700 dark:bg-elphaba-green dark:hover:bg-teal-700'
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

            {(txStatus || walletError) && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${
                    txStatus?.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-teal-900 dark:text-glinda-light' : 
                    txStatus?.type === 'error' || walletError ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-glinda-light' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-glinda-light'
                }`}>
                    {walletError || txStatus?.message}
                    {txStatus?.hash && (
                        <p className="mt-1 font-mono text-xs">Hash: {txStatus.hash}</p>
                    )}
                </div>
            )}
            
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-glinda-light rounded-lg">{error}</div>}

            <NoteEditor 
                currentNote={currentNote} 
                setCurrentNote={setCurrentNote} 
                onSave={handleSave} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Loading notes...</p>
                ) : (
                    notes.map(note => (
                        <div key={note.id} 
                             // Apply Dark/Light Note Card styles and ensure nested text is light
                             className="p-5 bg-white dark:bg-elphaba-bg rounded-lg shadow-md border-l-4 border-glinda-pink dark:border-elphaba-green dark:text-glinda-light">
                            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-glinda-light">{note.title}</h3>
                            {/* ⬅️ RENDER HTML CONTENT */}
                            <NoteContent htmlContent={note.content} /> 
                            <div className="mt-4 flex space-x-3">
                                <button
                                    onClick={() => setCurrentNote(note)}
                                    // Apply Dark/Light link styles
                                    className="text-sm text-glinda-pink dark:text-elphaba-green hover:text-pink-700 dark:hover:text-teal-700 font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 font-medium"
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