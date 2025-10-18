import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar' // Assuming Navbar is here
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Resume from './pages/Resume'
import CreateCV from './pages/CreateCV'

export default function App() {
  return (
    // The 'dark:' variants here will automatically apply when ThemeToggle adds 'dark' to <html>
    <div
      className="min-h-screen transition-colors duration-500
      bg-white text-gray-900
      dark:bg-gray-900 dark:text-white"
    >
      <Navbar /> {/* Ensure ThemeToggle is rendered inside Navbar */}
      <main className="max-w-6xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/createcv" element={<CreateCV />} />
        </Routes>
      </main>
    </div>
  )
}