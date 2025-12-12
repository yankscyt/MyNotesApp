import React from "react";
import { useWallet } from "../useWallet.js";
import { useTheme } from "../ThemeContext.jsx";

const Dashboard = () => {
  const { wallet, connected, connectWallet } = useWallet();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-all duration-500 
      ${isDarkMode ? "bg-elphaba-dark text-glinda-light" : "bg-gray-50 text-gray-900"}
    `}>

      {/* 🌈 GRADIENT HEADER */}
      <header 
        className="
          bg-gradient-to-r 
          from-glinda-pink via-purple-500 to-elphaba-green 
          dark:from-emerald-900 dark:via-black dark:to-emerald-700
          p-8 rounded-b-3xl shadow-lg transition-all duration-500
        "
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            MyNotes Dashboard
          </h1>

          <div className="flex items-center gap-4">

            <button 
              onClick={toggleTheme}
              className="
                px-4 py-2 rounded-xl bg-white/20 
                text-white text-sm backdrop-blur-sm
                hover:bg-white/30 transition
              "
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button 
              onClick={connectWallet}
              className="
                px-4 py-2 rounded-xl bg-black/20 text-white 
                hover:bg-black/30 backdrop-blur-sm
                transition text-sm
              "
            >
              {connected ? "Wallet Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-10">

        {/* 🌿 WALLET CARD */}
        <div 
          className={`
            p-6 rounded-2xl shadow-xl mb-10 transform transition-all duration-700
            ${isDarkMode 
              ? "bg-elphaba-bg/40 backdrop-blur-xl border border-emerald-700/20" 
              : "bg-white border border-gray-200"}
          `}
        >
          <h2 className="text-xl font-bold mb-3">Wallet Status</h2>

          {connected ? (
            <div className="space-y-2 text-sm animate-fadeIn">
              <p><span className="font-semibold">Wallet:</span> {wallet?.name}</p>
              <p><span className="font-semibold">Network:</span> {wallet?.networkId === 0 ? "Preprod" : "Mainnet"}</p>
              <p><span className="font-semibold">Balance:</span> {wallet?.balance} ADA</p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 animate-fadeIn">
              No wallet connected yet.
            </p>
          )}
        </div>


        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* 📝 NOTES MOCK UI */}
          <div 
            className={`
              p-6 rounded-2xl shadow-lg transition-all duration-700
              ${isDarkMode 
                ? "bg-elphaba-bg/40 backdrop-blur-xl border border-emerald-800/20" 
                : "bg-white"}
            `}
          >
            <h2 className="text-xl font-bold mb-4">Your Notes</h2>

            <div className="grid gap-4">

              {/* Note Card */}
              <div className="
                p-4 rounded-xl shadow-md border border-gray-200 
                dark:border-emerald-900/40 dark:bg-emerald-950/40
                hover:scale-[1.01] transition transform duration-300 cursor-pointer
              ">
                <h3 className="font-semibold mb-1">Meeting Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  Discussed blockchain integration and ADA wallet logic...
                </p>
              </div>

              <div className="
                p-4 rounded-xl shadow-md border border-gray-200 
                dark:border-emerald-900/40 dark:bg-emerald-950/40
                hover:scale-[1.01] transition transform duration-300 cursor-pointer
              ">
                <h3 className="font-semibold mb-1">Shopping List</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  Coffee, shampoo, dog food, more coffee...
                </p>
              </div>

              <div className="
                p-4 rounded-xl shadow-md border border-gray-200 
                dark:border-emerald-900/40 dark:bg-emerald-950/40
                hover:scale-[1.01] transition transform duration-300 cursor-pointer
              ">
                <h3 className="font-semibold mb-1">Ideas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  Maybe create a Cardano powered to-do list next...
                </p>
              </div>

            </div>
          </div>

          {/* ₳ TRANSACTIONS */}
          <div 
            className={`
              p-6 rounded-2xl shadow-lg transition-all duration-700
              ${isDarkMode 
                ? "bg-elphaba-bg/40 backdrop-blur-xl border border-emerald-800/20" 
                : "bg-white"}
            `}
          >
            <h2 className="text-xl font-bold mb-4">Transactions</h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send ADA, view transfers, flex your blockchain skills soon.
            </p>

            <button
              disabled={!connected}
              className={`w-full py-3 rounded-xl text-white font-semibold transition
                ${connected
                  ? "bg-glinda-pink dark:bg-elphaba-green hover:opacity-90"
                  : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"}
              `}
            >
              Send ADA
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
