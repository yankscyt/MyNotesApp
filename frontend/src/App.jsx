import React, { useState, useEffect } from 'react';
import { login, signup, logout, getNotes, createNote, updateNote, deleteNote } from "./api.js";
import './index.css';

// Contexts and Hooks
import useWallet from './useWallet.jsx'; // Ethereum Hook
import useCardanoWallet from './useCardanoWallet.jsx'; // Cardano Hook
import { useTheme } from './ThemeContext.jsx';
import { ethers } from 'ethers'; // Ethereum

// Components
import AuthForm from './components/AuthForm.jsx';

// --- 1. Notes Editor ---
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
    <div className={`p-6 rounded-2xl shadow-xl mb-6 transition-all duration-500
      ${isDarkMode ? "bg-elphaba-bg/40 backdrop-blur-xl border border-emerald-800/20" : "bg-white border border-gray-200"}`}>
      <h3 className="text-xl font-bold mb-4">{currentNote ? 'Edit Note' : 'Create Note'}</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-3 mb-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-glinda-light focus:ring-2 focus:ring-glinda-pink dark:focus:ring-elphaba-green outline-none"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows="5"
        className="w-full p-3 mb-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-glinda-light focus:ring-2 focus:ring-glinda-pink dark:focus:ring-elphaba-green outline-none"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-glinda-pink dark:bg-elphaba-green text-white font-semibold hover:opacity-90 transition"
        >
          {currentNote ? 'Save Changes' : 'Add Note'}
        </button>
        {currentNote && (
          <button
            onClick={() => setCurrentNote(null)}
            className="px-4 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// --- 2. Dashboard ---
const Dashboard = ({ setIsAuthenticated }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Notes
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ethereum
  const { walletAddress, isConnected, connectWallet, disconnectWallet, signer, error: ethError } = useWallet();
  const [ethTxStatus, setEthTxStatus] = useState(null);

  // Cardano
  const { walletAddress: cardanoAddr, isConnected: isCardanoConnected, connectWallet: connectCardano, disconnectWallet: disconnectCardano, utxos: cardanoUTxOs, txHash: cardanoTx, sendAda: sendAdaTransaction, error: cardanoError } = useCardanoWallet();
  const [adaAmount, setAdaAmount] = useState(1);
  const [txStatus, setTxStatus] = useState(null);

  // Fetch Notes
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotes();
      setNotes(res.data);
    } catch {
      setError('Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSaveNote = async (note) => {
    try {
      if (note.id) await updateNote(note.id, note.title, note.content);
      else await createNote(note.title, note.content);
      fetchNotes();
    } catch {
      setError('Failed to save note.');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch {
      setError('Failed to delete note.');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    disconnectWallet();
    disconnectCardano();
  };

  // Ethereum TX
  const sendEthTx = async () => {
    if (!isConnected || !signer) return setEthTxStatus({ message: "Connect ETH wallet first", type: "error" });
    try {
      const tx = await signer.sendTransaction({ to: walletAddress, value: ethers.parseEther("0.00000001") });
      setEthTxStatus({ message: "Transaction submitted...", type: "pending" });
      const receipt = await tx.wait();
      setEthTxStatus({
        message: receipt.status === 1 ? `ETH TX Success! Hash: ${receipt.hash}` : "Transaction failed",
        type: receipt.status === 1 ? "success" : "error",
        hash: receipt.hash
      });
    } catch (err) {
      setEthTxStatus({ message: err.code === 4001 ? "User rejected TX" : err.message, type: "error" });
    }
  };

  // Cardano TX
  const sendAdaTx = async () => {
    if (!cardanoAddr) return alert("Connect Cardano wallet first!");
    try {
      const hash = await sendAdaTransaction(cardanoAddr, adaAmount);
      if (hash) setTxStatus({ message: `Cardano TX submitted! Hash: ${hash}`, type: "success", hash });
    } catch (err) {
      setTxStatus({ message: `Cardano TX Failed: ${cardanoError || err.message}`, type: "error" });
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 px-6 py-10 ${isDarkMode ? "bg-elphaba-dark text-glinda-light" : "bg-gray-50 text-gray-900"}`}>

      {/* 🌈 Header */}
      <header className="bg-gradient-to-r from-glinda-pink via-purple-500 to-elphaba-green dark:from-emerald-900 dark:via-black dark:to-emerald-700 p-6 rounded-b-3xl shadow-lg mb-10 flex justify-between items-center transition-all duration-500">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">ChainNote Dashboard</h1>
        <div className="flex gap-4 items-center">
          <button onClick={toggleTheme} className="px-4 py-2 rounded-xl bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition">{isDarkMode ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={isConnected ? disconnectWallet : connectWallet} className="px-4 py-2 rounded-xl bg-black/20 text-white backdrop-blur-sm hover:bg-black/30 transition">
            {isConnected ? "ETH Connected" : "Connect ETH"}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition">Logout</button>
        </div>
      </header>

      {/* ⚡ TX Status */}
      {(ethTxStatus || txStatus || ethError || cardanoError) && (
        <div className={`p-4 mb-6 rounded-xl ${ethTxStatus?.type==='success'||txStatus?.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800 dark:bg-red-900 dark:text-glinda-light'}`}>
          {ethTxStatus?.message || txStatus?.message || ethError || cardanoError}
          {ethTxStatus?.hash && <p className="mt-1 font-mono text-xs break-all">{ethTxStatus.hash}</p>}
          {txStatus?.hash && <p className="mt-1 font-mono text-xs break-all">{txStatus.hash}</p>}
        </div>
      )}

      {/* Notes Editor */}
      <NoteEditor currentNote={currentNote} setCurrentNote={setCurrentNote} onSave={handleSaveNote} />

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {loading ? <p className="col-span-full text-center">Loading notes...</p> :
          notes.map(note => (
            <div key={note.id} className={`p-5 rounded-2xl shadow-md border-l-4 border-glinda-pink dark:border-elphaba-green dark:bg-elphaba-dark/40 dark:text-glinda-light hover:scale-[1.01] transition cursor-pointer`}>
              <h3 className="text-xl font-bold mb-2">{note.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{note.content}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCurrentNote(note)} className="text-sm text-glinda-pink dark:text-elphaba-green hover:text-pink-700 dark:hover:text-teal-700 font-medium">Edit</button>
                <button onClick={() => handleDeleteNote(note.id)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 font-medium">Delete</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* ₳ Cardano Panel */}
      <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${isDarkMode ? "bg-elphaba-bg/40 backdrop-blur-xl border border-emerald-800/20" : "bg-white border border-gray-200"}`}>
        <h2 className="text-2xl font-bold mb-4">Cardano Preprod</h2>
        <div className="flex gap-3 mb-4">
          <button onClick={connectCardano} className={`px-4 py-2 rounded-xl text-white font-semibold transition ${isCardanoConnected ? "bg-green-600 hover:bg-green-700" : "bg-glinda-pink dark:bg-elphaba-green hover:bg-pink-700 dark:hover:bg-teal-700"}`} disabled={isCardanoConnected}>
            {isCardanoConnected ? "Wallet Connected" : "Connect Cardano"}
          </button>
          <button onClick={disconnectCardano} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition" disabled={!isCardanoConnected}>Disconnect</button>
        </div>
        {cardanoAddr && <p className="mb-3 font-mono break-all"><strong>Address:</strong> {cardanoAddr}</p>}

        <div className="flex gap-4 items-center">
          <input type="number" min={1} step={1} value={adaAmount} onChange={e => setAdaAmount(Number(e.target.value))} disabled={!isCardanoConnected} className="w-24 p-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-glinda-light focus:ring-2 focus:ring-glinda-pink outline-none" />
          <button onClick={sendAdaTx} disabled={!isCardanoConnected} className={`px-4 py-2 rounded-xl text-white font-semibold transition ${isCardanoConnected ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}>
            Send ADA to Self
          </button>
        </div>

        {cardanoTx && <p className="mt-3 font-mono break-all">TX Hash: {cardanoTx}</p>}
        {cardanoUTxOs.length > 0 && (
          <pre className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-x-auto">{JSON.stringify(cardanoUTxOs, null, 2)}</pre>
        )}
      </div>

      {/* ETH TX Button */}
      <div className="mt-10">
        <button onClick={sendEthTx} disabled={!isConnected} className={`w-full py-3 rounded-xl text-white font-semibold transition ${isConnected ? "bg-glinda-pink dark:bg-elphaba-green hover:opacity-90" : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"}`}>
          Send ETH Proof TX
        </button>
      </div>
    </div>
  );
};

// --- Main App ---
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  return isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <AuthForm setIsAuthenticated={setIsAuthenticated} />;
};

export default AppContent;
