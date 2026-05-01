# Circlo - Student Social Media Platform

Circlo is a full-stack social media application designed for students to connect, share, and interact. It features real-time messaging, post creation, comments, likes, and a follow system, all built with a modern tech stack.

## 🚀 Features

-   **User Authentication**: Secure login and registration with JWT and password hashing.
-   **Social Graph**: Follow/Unfollow users to build your network.
-   **Feed**: View posts from users you follow.
-   **Interactions**: Like and comment on posts.
-   **Real-time Messaging**: Chat with other users instantly using Socket.io.
-   **Profile Management**: Customizable user profiles with avatars and bios.
-   **Responsive Design**: A clean, modern UI optimized for all devices.

## 🛠️ Tech Stack

### Client (Frontend)
-   **React 19**: Modern UI library for building interactive interfaces.
-   **Vite**: Fast build tool and development server.
-   **TypeScript**: Static typing for better code quality and developer experience.
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI design.
-   **Framer Motion**: Production-ready animation library.
-   **Lucide React**: Beautiful & consistent icons.
-   **Socket.io Client**: Real-time bidirectional event-based communication.

### Server (Backend)
-   **Node.js & Express**: Robust and scalable backend runtime and framework.
-   **PostgreSQL**: Powerful open-source relational database.
-   **Prisma ORM**: Next-generation Node.js and TypeScript ORM for easy database access.
-   **Socket.io**: Real-time engine for messaging features.
-   **JWT & Bcrypt**: Secure authentication mechanisms.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js** (v18 or higher)
-   **PostgreSQL** (running locally or a cloud instance)

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/TanishkBhatt168/Circlo-Social-Media-Web-App.git
cd Circlo-Social-Media-Web-App
```

### 2. Setup Server
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/circlo?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"
```

Initialize the database:
```bash
npx prisma migrate dev --name init
```

### 3. Setup Client
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

## 🚀 Running the App

You will need to run both the server and client concurrently (in separate terminals).

### Start Backend (Server)
```bash
# In /server directory
npm run dev
```
The server will start on `http://localhost:5000`.

### Start Frontend (Client)
```bash
# In /client directory
npm run dev
```
The client will start on `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
