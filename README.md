# 🚀 ExpensePilot - AI Expense Tracker

> **Created by [Milan Mandal](https://github.com/student-MilanMandal)**

ExpensePilot is a full-stack, AI-powered personal finance management web application. It helps users track income, manage expenses, set budget limits, analyze financial habits with visual charts, scan receipts with OCR, and handle loans/khata entries effortlessly.

---

## ✨ Key Features

- 📊 **Interactive Dashboard**: Real-time summary cards, monthly expense trends, and quick financial stats.
- 💸 **Income & Expense Management**: Categorize transactions, add payment methods, filter and search easily.
- 🧾 **AI Smart Receipt Scanner (OCR)**: Automatically extracts total amount and details from receipt images using Tesseract.js.
- 📖 **KhataBook & Loans**: Track money given/taken (Dena-Paona), loan history, and repayment status.
- 💵 **CashBook**: Maintain daily cash-in and cash-out records seamlessly.
- 🎯 **Budgets & Savings Goals**: Set monthly budget caps and track progress towards savings goals.
- 📈 **Analytics & Reports**: Interactive charts (Chart.js), detailed financial insights, and export options.
- 🔐 **Authentication & Security**: Secure JWT login/register, password reset via OTP/Email, and protected routes.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **State Management**: Redux Toolkit & React Query
- **Charts & Animations**: Chart.js, React-Chartjs-2 & Framer Motion
- **OCR Engine**: Tesseract.js

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas (Mongoose ORM)
- **Auth**: JSON Web Tokens (JWT) & bcryptjs
- **Mailing**: Nodemailer (SMTP)

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/student-MilanMandal/Expense.git
cd Expense
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password
```

### 4. Run Development Server
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Server runs on: `http://localhost:5000`

---

## 💻 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both client & server concurrently |
| `npm run server` | Starts backend with nodemon |
| `npm run client` | Starts frontend Vite dev server |
| `npm run build` | Builds frontend for production |

---

## 👤 Author

Developed with ❤️ by **Milan Mandal**  
- **GitHub**: [@student-MilanMandal](https://github.com/student-MilanMandal)
