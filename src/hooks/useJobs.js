import { useQuery } from '@tanstack/react-query'
import jobsData from '../data/jobs.json'

export function useJobs(query, filters) {
  return useQuery(['jobs', query, filters], () => {
    // simple mock search and filter on local JSON
    const q = (query || '').toLowerCase()
    let results = jobsData.filter(j =>
      j.job_title.toLowerCase().includes(q) ||
      j.job_description.toLowerCase().includes(q) ||
      j.employer_name.toLowerCase().includes(q)
    )
    if (filters) {
      if (filters.location) {
        results = results.filter(r => r.job_city.toLowerCase().includes(filters.location.toLowerCase()))
      }
      if (filters.minSalary) {
        results = results.filter(r => Number(r.job_salary) >= Number(filters.minSalary))
      }
      if (filters.experience) {
        results = results.filter(r => r.job_experience === filters.experience)
      }
    }
    return new Promise(resolve => setTimeout(()=>resolve(results), 200)) // simulate async
  })
}
