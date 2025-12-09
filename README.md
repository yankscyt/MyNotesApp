# 💎 ChainNote: Secure Full-Stack Note Taking App with Decentralized Identity

ChainNote is a full-stack, secure web application that combines traditional server-side data management (Spring Boot + MySQL) with modern decentralized identity and transaction capabilities (MetaMask/Ethereum). This project fulfills the requirements for the final blockchain project, demonstrating mastery across multiple domains.

## ✨ Features Implemented (The MVP)

* **Full CRUD API:** Full Create, Read, Update, Delete functionality for notes via REST endpoints.
* **Security:** JWT (JSON Web Token) based authentication for secure access to the API.
* **Authentication:** User Sign-Up and Login (Email/Password).
* **Decentralized Identity:** Frontend integration with MetaMask wallet via Ethers.js.
* **Proof of Work Requirement:** Contains a function to send a small UTXO (transaction proof) to the user's own address.
* **Modern UI/UX:** Implements the "Glinda & Elphaba" theme (Light/Dark Mode toggle) and a rich text editor.

## 🛠️ Tech Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | `Java 17` / `Spring Boot` | RESTful API, Service Layer Architecture. |
| **Security** | `Spring Security` / `JWT` | Stateless token-based authentication. |
| **Database** | `MySQL` / `JPA` | Data persistence for users and notes. |
| **Frontend** | `React` / `Vite` | Modern single-page application framework. |
| **Styling** | `Tailwind CSS` | Utility-first CSS framework for rapid, modern design. |
| **Web3** | `MetaMask` / `Ethers.js` | Wallet connection and blockchain interaction. |

## 🚀 Getting Started (Local Setup)

To run this project locally, you need Java 17, Maven, Node.js, and a running MySQL instance.

### 1. Database Setup

1.  Ensure MySQL is running (e.g., via XAMPP/WAMP or local installation).
2.  Create a database named `ash_notes_db`.
3.  The Spring Boot application will automatically create the required tables (`users`, `notes`) on startup, thanks to JPA/Hibernate.

### 2. Backend Installation (`/backend/mynotesapp`)

1.  Navigate to the backend directory:
    ```bash
    cd backend/mynotesapp
    ```
2.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *The server will start on `http://localhost:8080`.*

### 3. Frontend Installation (`/frontend`)

1.  Navigate to the frontend directory in a **new terminal window**:
    ```bash
    cd frontend
    ```
2.  Install dependencies (may require compatibility flags due to React versioning):
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Run the frontend:
    ```bash
    npm run dev
    ```
    *The UI will be accessible at `http://localhost:5173`.*

## 🧪 Web3/Blockchain Requirements

To test the Web3 features (Wallet Connect & UTXO Proof):

1.  **Install MetaMask:** Ensure the MetaMask browser extension is installed.
2.  **Switch Network:** Set MetaMask to the **Sepolia Test Network**.
3.  **Get Funds:** Acquire free Sepolia ETH from a public faucet (e.g., a Sepolia PoW Faucet) as transactions require gas fees.
4.  **Test:** Log in to the application and click **"Connect Wallet"**, then **"Send UTXO Proof"** to confirm functionality.

***

## 👤 Author

* **Yankee Caburnay**

---
*Created using a custom-built, secure Spring Boot and React template.*
