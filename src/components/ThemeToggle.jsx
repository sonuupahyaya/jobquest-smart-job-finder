import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    // Check saved preference or system setting
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    // This runs only on the first load if no preference is saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Update DOM (add/remove 'dark' class on <html>) + localStorage when theme changes
  useEffect(() => {
    // The 'dark' class is added to the <html> tag, which is what your App.js styles rely on
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`transition-all duration-300 px-4 py-2 rounded-full font-medium shadow-md
        ${dark
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
          : 'bg-yellow-300 text-gray-800 hover:bg-yellow-400'
        }`}
    >
      {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}