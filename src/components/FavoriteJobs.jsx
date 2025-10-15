import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import JobCard from './JobCard'
import { clearFavorites } from '../redux/favoritesSlice'

export default function FavoriteJobs(){
  const favs = useSelector(s => s.favorites.items)
  const dispatch = useDispatch()
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={()=>dispatch(clearFavorites())} className="bg-red-600 text-white px-3 py-1 rounded">Clear All</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favs.length ? favs.map(j => <JobCard key={j.job_id} job={j} />) : <p className="text-gray-500">No favorites yet.</p>}
      </div>
    </div>
  )
}
