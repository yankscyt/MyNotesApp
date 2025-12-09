// frontend/src/App.jsx (FULL REPLACEMENT - RESTORATION)

import React, { useState, useEffect } from 'react';
import { login, signup, logout, getNotes, createNote, updateNote, deleteNote } from "./api.js";
import './index.css';

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
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-indigo-700">My Notes App</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
                >
                    Logout
                </button>
            </header>

            <NoteEditor 
                currentNote={currentNote} 
                setCurrentNote={setCurrentNote} 
                onSave={handleSave} 
            />

            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

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