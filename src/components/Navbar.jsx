import React from 'react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="backdrop-blur-lg bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-gray-900/80 text-gray-100 px-8 py-4 flex items-center justify-between shadow-lg border-b border-gray-700">
      {/* Logo Section */}
      <div className="text-3xl font-extrabold tracking-wide">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
          JobQuest
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8 text-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `relative transition-all duration-300 hover:text-cyan-400 ${
              isActive ? 'text-cyan-400 after:w-full' : 'text-gray-300'
            } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-cyan-400 after:transition-all after:duration-300 after:w-0 hover:after:w-full`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `relative transition-all duration-300 hover:text-purple-400 ${
              isActive ? 'text-purple-400 after:w-full' : 'text-gray-300'
            } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 after:w-0 hover:after:w-full`
          }
        >
          Favorites
        </NavLink>

        <NavLink
          to="/resume"
          className={({ isActive }) =>
            `relative transition-all duration-300 hover:text-blue-400 ${
              isActive ? 'text-blue-400 after:w-full' : 'text-gray-300'
            } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300 after:w-0 hover:after:w-full`
          }
        >
          AI Resume
        </NavLink>

        {/* Theme Toggle Button */}
        <div className="ml-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
