import React, { useEffect, useState } from 'react'
export default function ThemeToggle(){
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  useEffect(()=> {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <button onClick={()=>setDark(!dark)} className="bg-white text-sm px-3 py-1 rounded">
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
