# 🎭 Friend Zone Adventures

> A strategic social deduction game inspired by Mafia/Werewolf mechanics. Engage in bidding, role reveals, and epic challenges with friends!

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)](https://supabase.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [How to Play (Simple Guide)](#-how-to-play-simple-guide)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

**Friend Zone Adventures** is an interactive, real-time multiplayer game that combines strategy, deception, and fun. Perfect for game nights, it features a dynamic role system and bidding mechanics where players compete, collaborate, and deceive each other. The game is fully synchronized online so you and your friends can play remotely!

---

## 🎮 How to Play (Simple Guide)

1. **Join the Game**: Enter a lobby with your friends.
2. **Get a Role**: You'll be assigned a secret role (like in Mafia or Werewolf). Some people are the "good guys", and some are the "bad guys"!
3. **Play the Rounds**: During the game, you will bid on challenges and vote. You need to figure out who is who!
4. **Win the Game**: If you're a good guy, find the bad guys. If you're a bad guy, try to trick everyone else until the end!

---

## ✨ Features

- 🌐 **Real-time Multiplayer**: Play online with your friends featuring live synchronization powered by Supabase.
- 🎭 **Dynamic Roles**: Unique abilities for each player assigned at the start of the game.
- 💰 **Bidding Mechanics**: Strategic decision-making and resource management.
- 💬 **Live Chat**: Discuss, debate, and deceive in real-time.
- 🏆 **Round-based Challenges**: Epic mini-games and challenges to prove your worth.
- 📱 **Responsive UI**: Beautiful dark/light mode designs crafted with Tailwind CSS and shadcn/ui.

---

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: [React Query](https://tanstack.com/query/latest)

---

## 🚀 Getting Started

Follow these steps to set up the game on your local machine:

### 1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd friend-zone-adventures
```

### 2. Install dependencies
```sh
npm install
```

### 3. Setup Environment Variables
Copy the example environment file and add your Supabase credentials:
```sh
cp .env.example .env
```
*(Make sure to fill in your Supabase URL and Anon Key in the `.env` file.)*

### 4. Start the Development Server
```sh
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified by Vite).

---

## ☁️ Deployment

For a detailed 30-minute Vercel + Supabase launch checklist, please refer to `DEPLOYMENT.md` inside the project folder.

To build the project for production locally:
```sh
npm run build
npm run preview
```

---

## 📂 Project Structure

```text
├── src/
│   ├── components/    # Reusable UI components (shadcn-ui)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions & game logic
│   ├── integrations/  # External service setups (e.g., Supabase client)
│   ├── pages/         # Main page route components
│   └── App.tsx        # Application root & routing
├── public/            # Static assets
└── supabase/          # Supabase edge functions and configurations
```

---

<div align="center">
  <p>Created with ❤️ by SAsiru and the Friend Zone Adventures team.</p>
</div>
