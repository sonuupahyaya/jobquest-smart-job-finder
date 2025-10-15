import React, { useState } from 'react'

export default function JobFilter({onFilter}){
  const [location,setLocation] = useState('')
  const [minSalary,setMinSalary] = useState('')
  const [experience,setExperience] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onFilter({location,minSalary,experience})
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow flex gap-3 flex-wrap justify-center">
      <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="border rounded px-3 py-2 w-40" />
      <input value={minSalary} onChange={e=>setMinSalary(e.target.value)} placeholder="Min Salary" type="number" className="border rounded px-3 py-2 w-40" />
      <select value={experience} onChange={e=>setExperience(e.target.value)} className="border rounded px-3 py-2 w-40">
        <option value="">Experience</option>
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
    </form>
  )
}
