# 💳 PayDeck — Premium 3D Payment Experience

PayDeck is a state-of-the-art, interactive payment gateway simulation built with a focus on **visual excellence**, **smooth performance**, and **robust validation**. It transforms a standard checkout process into a premium 3D experience.

🚀 **Live App:** [payment-assignmenttt.vercel.app](https://payment-assignmenttt.vercel.app/)

---

## ✨ Premium Features

### 🛠 Assignment Requirements Implemented
*   **Smart Validation**: Real-time error handling for all fields.
*   **Dynamic Formatting**: Automatic card number grouping (e.g., 4-4-4-4).
*   **Brand Intelligence**: Instant detection of Visa, Mastercard, and Amex.
*   **Complex Rules**: Expiry date and CVV validation based on card brand.
*   **Live Preview**: Real-time card mirror showing user input.
*   **State Orchestration**: Full lifecycle handling (Idle → Processing → Success/Fail/Timeout).
*   **Reliability**: AbortController implementation for request timeout management.
*   **Resilience**: Smart retry logic with attempt tracking (Max 3 attempts).
*   **Persistence**: Transaction history saved locally via `localStorage`.
*   **Responsive**: Pixel-perfect layout for both Mobile and Desktop.

### 💎 Custom Enhancements (Beyond Requirements)
*   **3D Interactive Card**: Fully interactive card that flips on click to show the CVV.
*   **Premium Aesthetics**: Curated dark/light mode with glassmorphism and HSL-tailored colors.
*   **Hardware Acceleration**: Optimized with `will-change` and reduced blur for buttery-smooth performance.
*   **Audio Feedback**: Immersive sound effects for successful and failed payments.
*   **Micro-Animations**: Framer Motion powered transitions for every UI state.
*   **Concurrency Control**: Prevention of multiple submissions during active processing.
*   **Exportable Data**: Built-in PDF generator for transaction history reports.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 (Modern Engine) |
| **Animations** | Framer Motion |
| **Routing** | TanStack Router (SPA Mode) |
| **State** | Zustand (Global Store) |
| **Icons** | Lucide React |
| **PDF Engine** | jsPDF |

---

## 🔄 Application Flow

1.  **Entry**: User arrives at the secure checkout page (Light/Dark mode defaults to system preference).
2.  **Input**: As the user types, the **Live 3D Card** updates instantly.
3.  **Validation**: Real-time feedback is provided if any field is incorrect or incomplete.
4.  **Submission**: Clicking "Pay" triggers the `usePayment` orchestration.
    *   The UI enters a "Processing" state for 2.5 seconds.
    *   Hardware-accelerated shimmer effects and status updates are shown.
5.  **Resolution**: The simulated backend returns either a **Success** or **Failure**.
    *   **Success**: Confetti (visual) and Success chime (audio) play.
    *   **Failure**: Error reason is displayed with an option to **Retry**.
6.  **Persistence**: The transaction is automatically assigned a unique ID and saved to the **Transaction History** section.
7.  **Review**: User can view details of any past transaction or download the entire history as a PDF report.

---

## ⚙️ Setup Instructions

To run PayDeck locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shantanutewari12/payment_Assignment.git
    cd payment_Assignment
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components (CardInput, CardPreview, etc.)
├── hooks/          # Custom business logic (usePayment, useAudio)
├── routes/         # TanStack Router page definitions
├── store/          # Zustand state management
├── styles/         # Tailwind v4 configuration and global CSS
├── types/          # TypeScript interfaces and schemas
└── utils/          # Formatting and validation helpers
```

---

Developed with ❤️ for the **Payment Assignment**.
