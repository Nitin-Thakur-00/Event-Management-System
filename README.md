# 🚀 Event Management System

> A full-stack web application for managing college events, registrations, and core team memberships.

## 📖 About
This project is a comprehensive Event Management Dashboard built to streamline the process of organizing campus events. It allows students to browse upcoming events, register as participants, and apply for core team or volunteer roles. It features a dynamic backend that separates users into specific roles (Core, Volunteer, New) and a real-time database view for administrators.

### ✨ Key Features
- **Dynamic Event Dashboard:** Real-time fetching of event data from the backend.
- **Role-Based Registration:** Intelligent form that sorts applicants into 'Core Team', 'Volunteers', or 'Participants'.
- **Live Database View:** An admin-like page to view all tables (Events, Core Team, Volunteers, Applicants) instantly.
- **Smart Data Handling:** Automatically prevents duplicate entries and verifies existing USNs.
- **Responsive Design:** Built with a modern UI that works on all devices.
- **Dark Mode:** Fully integrated dark/light theme toggle.

## 🛠️ Tech Stack
**Frontend:**
- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **React.js** (Vite)
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS** (Styling)
- ![Lucide](https://img.shields.io/badge/Lucide-Icons-orange?style=for-the-badge) **Lucide React** (Icons)

**Backend:**
- ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) **Node.js** & **Express.js**
- ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) **SQLite3** (Database)

## 📂 Project Structure
```bash
cd Event-Management-System/
├── backend/             # Backend Server & Database
│   ├── server.js        # Main Entry Point (API & SQL Logic)
│   ├── database.db      # SQLite Database File (Auto-generated)
│   └── package.json     # Backend Dependencies
├── public/              # Static Assets
│   └── assets/          # Event Images
├── src/                 # React Frontend Source
│   ├── components/      # Reusable UI Components (Cards, Forms)
│   ├── context/         # State Management
│   ├── pages/           # Application Pages (Index, Apply, DatabaseView)
│   └── App.tsx          # Main Routing Logic
└── package.json         # Frontend Dependencies
```

## Local Setup
Follow these steps to run the project locally on your machine:

Prerequisites-

Node.js (v14 or higher) installed on your system.

Installation-

Clone the repository and navigate into the project directory:
```Bash
git clone https://github.com/Nitin-Thakur-00/Event-Management-System.git
cd Event-Management-System
```
Setup the Backend-

Navigate to the backend folder, install dependencies, and start the server.:
```Bash
cd backend
npm install
node server.js
```
You should see: "Connected to the SQLite database" and "Server running on port 3000".

Setup the Frontend-

Open a new terminal window (keep the backend server running in the first terminal!). Navigate back to the root folder , install dependencies, and start the development server.
```Bash
cd ..
npm install
npm run dev
```
Your frontend should now be running and accessible, typically at http://localhost:5173 or a similar port.
