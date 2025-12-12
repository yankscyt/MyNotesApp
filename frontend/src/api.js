import axios from 'axios';

// Base URL
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- AUTH SERVICE ---

// LOGIN (backend expects username + password)
export const login = (email, password) => {
    return api.post('/auth/login', { username: email, password })
        .then(response => {
            const token = response.data.token;
            localStorage.setItem('token', token);
            return token;
        });
};

// SIGNUP (backend expects username + password)
export const signup = (email, password) => {
    return api.post('/auth/signup', { username: email, password })
        .then(response => {
            if (response.status === 201) {
                return response.data;
            }
            throw new Error(response.data.message || 'Signup failed.');
        })
        .catch(error => {
            throw error;
        });
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
};

// --- NOTES SERVICE ---

export const getNotes = () => {
    return api.get('/notes');
};

export const createNote = (title, content) => {
    return api.post('/notes', { title, content });
};

export const updateNote = (id, title, content) => {
    return api.put(`/notes/${id}`, { title, content });
};

export const deleteNote = (id) => {
    return api.delete(`/notes/${id}`);
};


// --- WALLET SERVICE (EVM/MetaMask) ---

// ⬅️ FIX APPLIED: Correct payload key for backend DTO
export const linkWalletAddress = (walletAddress) => {
  const token = localStorage.getItem("token");

  return api.post( // ⬅️ Changed API to 'api' object
    "/user/link-wallet",
    { walletAddress },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


// --- CARDANO SERVICE (ADA/Blockfrost) ---

// Fetches UTxOs from the backend service using the address query parameter
export const getCardanoUTxOs = async (address) => {
    return api.get(`/cardano/utxos?address=${address}`);
};

// ⬅️ CRITICAL FIX: NEW FUNCTION ADDED TO EXPORT LIST
export const buildUnsignedCardanoTx = async (sender, recipient, amount) => {
    // Backend endpoint is /api/cardano/build-unsigned-tx
    return api.post('/cardano/build-unsigned-tx', { 
        senderAddress: sender, 
        recipientAddress: recipient, 
        amountAda: amount 
    });
};

// Submits the CBOR signed transaction hex to the backend for broadcast
export const submitCardanoTransaction = async (signedTxHex) => {
    // Backend expects the raw hex in a field named 'signedTxHex'
    return api.post('/cardano/submit-tx', { signedTxHex });
};

export default api;