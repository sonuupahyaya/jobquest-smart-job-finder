import { useState, useEffect } from 'react';

const JOB_TITLES = ['Software Engineer', 'Frontend Developer', 'Backend Specialist', 'Cloud Architect', 'Security Analyst', 'Mobile App Dev', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX/UI Designer'];
const COMPANIES = ['AlphaCorp Solutions', 'ByteStream Dynamics', 'CodeWave Innovations', 'DigitalGenius Inc.', 'EvolveTech Systems', 'FusionWorks Group', 'Global Nexus', 'Hyper Edge', 'Infinity Labs', 'Juno Systems'];

const generateMockJob = (index) => {
  // Use more titles/companies for variety with 1000 jobs
  const title = JOB_TITLES[index % JOB_TITLES.length];
  const company = COMPANIES[index % COMPANIES.length];
  const isRemote = index % 4 !== 0;
  const city = isRemote ? 'Remote' : (index % 7 === 0 ? 'San Francisco' : index % 7 === 1 ? 'New York' : index % 7 === 2 ? 'Austin' : 'Seattle');
  const minSalary = Math.floor(Math.random() * 50 + 80) * 1000;
  const maxSalary = minSalary + Math.floor(Math.random() * 40 + 20) * 1000;
  const type = index % 3 === 0 ? 'FULLTIME' : 'PARTTIME';
  const desc =
    index % 2 === 0
      ? "Exciting opportunity to join our core development team focusing on microservices, performance optimization, and scalable APIs, utilizing modern cloud infrastructures."
      : "Build highly scalable, aesthetic user interfaces using modern frameworks like React/Vue/Angular. Must have expertise in state management and component design, driving user experience initiatives.";

  return {
    job_id: `mock-${index}`,
    job_title: `${title} - Lvl ${Math.floor(index / 12) + 1}`,
    employer_name: company,
    job_city: city,
    job_is_remote: isRemote,
    job_min_salary: minSalary,
    job_max_salary: maxSalary,
    // Updated logo placeholder for a clean dark theme look
    employer_logo: `https://placehold.co/48x48/1F2937/10B981?text=${company.charAt(0)}`,
    job_description: desc,
    job_apply_link: '#',
    job_employment_type: type,
  };
};

export function useJobs(query, filters) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMockJobs = () => {
      setIsLoading(true);
      setError(null);

      const timer = setTimeout(() => {
        try {
          // Setting the generation count to 1000
          const TOTAL_JOBS_TO_GENERATE = 1000; 
          const generatedJobs = [];

          for (let i = 0; i < TOTAL_JOBS_TO_GENERATE; i++) {
            generatedJobs.push(generateMockJob(i));
          }

          const filteredJobs = generatedJobs.filter((job) => {
            const queryText = (query || '').toLowerCase();
            const queryMatch =
              job.job_title.toLowerCase().includes(queryText) ||
              job.employer_name.toLowerCase().includes(queryText) ||
              job.job_description.toLowerCase().includes(queryText);

            const typeMatch =
              !filters.employment_type ||
              filters.employment_type === 'ALL' ||
              job.job_employment_type === filters.employment_type;

            return queryMatch && typeMatch;
          });

          setJobs(filteredJobs);
        } catch (err) {
          console.error("Mock data generation error:", err);
          setError('Failed to generate mock job data.');
        } finally {
          setIsLoading(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    };

    loadMockJobs();
  }, [query, filters]);

  return { data: jobs, isLoading, error };
}







