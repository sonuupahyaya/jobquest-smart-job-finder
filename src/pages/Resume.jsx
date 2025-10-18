import React from 'react'
import ResumeScorer from '../components/ResumeScorer'
import jobs from '../data/jobs.json'

export default function Resume(){
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4"> Resume Scorer</h2>
      <ResumeScorer job={jobs[0]} />
    </div>
  )
}
