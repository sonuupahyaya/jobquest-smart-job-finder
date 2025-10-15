import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Resume from './pages/Resume'

export default function App(){
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/resume' element={<Resume />} />
        </Routes>
      </main>
    </div>
  )
}
