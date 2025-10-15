import React from 'react'
import FavoriteJobs from '../components/FavoriteJobs'

export default function Favorites(){
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Saved Jobs</h2>
      <FavoriteJobs />
    </div>
  )
}
