import React, { useState } from 'react';
import { login, signup } from "../api.js";
import { useTheme } from "../ThemeContext.jsx";

const AuthForm = ({ setIsAuthenticated }) => {
    const { isDarkMode } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage("");

        try {
            if (isLogin) {
                await login(email, password);
                setIsAuthenticated(true);
            } else {
                await signup(email, password);
                setMessage("Account created successfully!");
                setIsLogin(true);
            }
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                err.response?.data ||
                "Something went wrong."
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-elphaba-dark px-4">
            <div className="w-full max-w-md bg-white dark:bg-elphaba-bg shadow-xl rounded-2xl p-8 animate-fadeIn">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-glinda-light drop-shadow-sm">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-glinda-light focus:ring-2 focus:ring-glinda-pink dark:focus:ring-elphaba-green outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-glinda-light focus:ring-2 focus:ring-glinda-pink dark:focus:ring-elphaba-green outline-none"
                    />

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-glinda-pink dark:bg-elphaba-green text-white font-semibold hover:opacity-90 transition"
                    >
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center text-sm ${
                        message.includes("success") ? "text-green-600" : "text-red-500"
                    }`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full mt-6 text-sm text-center text-glinda-pink dark:text-elphaba-green hover:underline"
                >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </div>
    );
};

export default AuthForm;
