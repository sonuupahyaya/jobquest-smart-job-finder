// // jobBoardApp.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Search, Loader2, MapPin, Briefcase, DollarSign, Zap, Filter, Heart } from 'lucide-react';

// // NOTE: For a real application, you would need to set up a Redux store.
// // Since Redux state is not provided, I'll create a minimal mock hook for favorites
// // to prevent the original JobCard from throwing an error.

// // --- MOCK REDUX/FAVORITES HOOK (For self-contained example) ---
// const useFavoritesMock = () => {
//     const [favorites, setFavorites] = useState([]);

//     const toggleFavorite = useCallback((job) => {
//         setFavorites(prev => {
//             if (prev.some(j => j.job_id === job.job_id)) {
//                 return prev.filter(j => j.job_id !== job.job_id);
//             } else {
//                 return [...prev, job];
//             }
//         });
//     }, []);

//     return { favorites, toggleFavorite };
// }
// // -----------------------------------------------------------------


// // --- useJobs Hook (Merged from useJobs.jsx) ---
// const JOB_TITLES = ['Software Engineer', 'Frontend Developer', 'Backend Specialist', 'Cloud Architect', 'Security Analyst', 'Mobile App Dev'];
// const COMPANIES = ['AlphaCorp', 'ByteStream', 'CodeWave', 'DigitalGenius', 'EvolveTech', 'FusionWorks'];

// const generateMockJob = (index) => {
//   const title = JOB_TITLES[index % JOB_TITLES.length];
//   const company = COMPANIES[index % COMPANIES.length];
//   const isRemote = index % 4 !== 0;
//   const city = isRemote ? 'Remote' : (index % 5 === 0 ? 'San Francisco' : 'New York');
//   const minSalary = Math.floor(Math.random() * 50 + 80) * 1000;
//   const maxSalary = minSalary + Math.floor(Math.random() * 40 + 20) * 1000;
//   const type = index % 3 === 0 ? 'FULLTIME' : 'PARTTIME';
//   const desc =
//     index % 2 === 0
//       ? "Exciting opportunity to join our core development team focusing on microservices, performance optimization, and scalable APIs."
//       : "Build highly scalable, aesthetic user interfaces using modern frameworks like React and Vue. Must have expertise in state management and component design.";

//   return {
//     job_id: `mock-${index}`,
//     job_title: `${title} - Lvl ${Math.floor(index / 10) + 1}`,
//     employer_name: company,
//     job_city: city,
//     job_is_remote: isRemote,
//     job_min_salary: minSalary,
//     job_max_salary: maxSalary,
//     // Modern placeholder for logos
//     employer_logo: `https://placehold.co/48x48/14B8A6/0F172A?text=${company.charAt(0)}`, 
//     job_description: desc,
//     job_apply_link: '#',
//     job_employment_type: type,
//   };
// };

// function useJobs(query, filters) {
//   const [jobs, setJobs] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadMockJobs = () => {
//       setIsLoading(true);
//       setError(null);

//       // Add a small delay for a better loading experience
//       const timer = setTimeout(() => {
//         try {
//           // Increase job count to 100 cards as requested
//           const TOTAL_JOBS_TO_GENERATE = 100;
//           const generatedJobs = [];

//           for (let i = 0; i < TOTAL_JOBS_TO_GENERATE; i++) {
//             generatedJobs.push(generateMockJob(i));
//           }

//           const filteredJobs = generatedJobs.filter((job) => {
//             const queryText = query.toLowerCase();
//             const queryMatch =
//               job.job_title.toLowerCase().includes(queryText) ||
//               job.employer_name.toLowerCase().includes(queryText);

//             const typeMatch =
//               !filters.employment_type ||
//               filters.employment_type === 'ALL' ||
//               job.job_employment_type === filters.employment_type;

//             return queryMatch && typeMatch;
//           });

//           setJobs(filteredJobs);
//         } catch (err) {
//           setError('Failed to generate mock job data.');
//         } finally {
//           setIsLoading(false);
//         }
//       }, 800);

//       return () => clearTimeout(timer);
//     };

//     loadMockJobs();
//   }, [query, filters]);

//   return { data: jobs, isLoading, error };
// }


// // --- JobFilter Component (Created for full functionality) ---
// const JobFilter = ({ onFilter }) => {
//     const [type, setType] = useState('ALL');

//     useEffect(() => {
//         // Pass the filter state up to the parent component
//         onFilter({ employment_type: type });
//     }, [type, onFilter]);

//     const filterOptions = [
//         { label: 'All Types', value: 'ALL' },
//         { label: 'Full-Time', value: 'FULLTIME' },
//         { label: 'Part-Time', value: 'PARTTIME' },
//     ];

//     return (
//         <div className="flex justify-center items-center py-4 px-2 sm:px-4 bg-gray-900 rounded-xl shadow-inner shadow-teal-900/20 border border-gray-800 max-w-lg mx-auto mb-10">
//             <Filter className="w-5 h-5 text-teal-400 mr-3 hidden sm:block" />
//             {filterOptions.map((option) => (
//                 <button
//                     key={option.value}
//                     onClick={() => setType(option.value)}
//                     className={`px-4 py-2 text-sm font-semibold rounded-lg mx-1 transition-all duration-300 transform hover:scale-[1.05]
//                         ${
//                             type === option.value
//                                 ? 'bg-teal-600 text-white shadow-md shadow-teal-500/40'
//                                 : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                         }`
//                     }
//                 >
//                     {option.label}
//                 </button>
//             ))}
//         </div>
//     );
// };


// // --- JobCard Component (Merged and Enhanced from JobCard.jsx) ---
// function JobCard({ job }) {
//     // Replace Redux hooks with mock hook
//     const { favorites, toggleFavorite } = useFavoritesMock();
//     const isFav = favorites.some((j) => j.job_id === job.job_id);
    
//     // Fallback logo if the mock logo URL fails
//     const LogoFallback = () => (
//         <div className="w-12 h-12 bg-teal-600/20 text-teal-400 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0 border border-teal-600/50">
//             {job.employer_name.charAt(0)}
//         </div>
//     );

//     const formatCurrency = (amount) =>
//         new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 0,
//         }).format(amount);

//     return (
//         <div className="bg-gray-900 rounded-xl p-6 shadow-2xl relative transition duration-300 hover:shadow-teal-500/40 hover:scale-[1.02] flex flex-col h-full border border-gray-800 hover:border-teal-700/50">
//             <div className="mb-4 flex items-start justify-between">
//                 <div className="flex items-center">
//                     {/* Using a simple div as a placeholder for the image to simplify the single-file example */}
//                     <LogoFallback /> 
//                     <div className="ml-4">
//                         <p className="text-sm font-light text-gray-400">{job.employer_name}</p>
//                         <h3 className="text-xl font-extrabold text-white leading-snug">
//                             {job.job_title}
//                         </h3>
//                     </div>
//                 </div>
                
//                 <button
//                     onClick={() => toggleFavorite(job)} // Use mock toggle
//                     className={`p-2 rounded-full transition duration-300 ml-2 transform hover:scale-110
//                         ${isFav 
//                             ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' 
//                             : 'bg-gray-800 text-gray-500 hover:text-red-400 hover:bg-gray-700'}`
//                     }
//                 >
//                     <Heart size={18} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
//                 </button>
//             </div>

//             <hr className="my-3 border-gray-800" />

//             {/* Job Details */}
//             <div className="flex flex-col space-y-2 text-sm text-gray-400 mb-4 flex-grow">
//                 <p className="flex items-center text-base font-semibold text-teal-400">
//                     <DollarSign size={18} className="mr-3 text-teal-500 flex-shrink-0" />
//                     {formatCurrency(job.job_min_salary)} - {formatCurrency(job.job_max_salary)}
//                 </p>
//                 <span className="flex items-center">
//                     <MapPin size={16} className="mr-3 text-gray-500 flex-shrink-0" />
//                     <span className="font-medium text-gray-300">{job.job_city}</span>
//                     <span className={`ml-2 text-xs font-mono px-2 py-0.5 rounded-full ${job.job_is_remote ? 'bg-indigo-900/30 text-indigo-400' : 'bg-gray-700/50 text-gray-400'}`}>
//                         {job.job_is_remote ? 'Remote' : 'Onsite'}
//                     </span>
//                 </span>
//                 <span className="flex items-center">
//                     <Briefcase size={16} className="mr-3 text-gray-500 flex-shrink-0" />
//                     <span className="bg-teal-900/50 text-xs font-mono px-2 py-0.5 rounded tracking-wider text-teal-300">
//                         {job.job_employment_type}
//                     </span>
//                 </span>
//             </div>
            
//             <p className="text-xs text-gray-500 leading-relaxed mb-4 italic">
//                 {job.job_description
//                     ? job.job_description.slice(0, 110) + '...'
//                     : 'Job description not available.'}
//             </p>

//             {/* Apply Button */}
//             <div className="mt-auto">
//                 <a
//                     href={job.job_apply_link}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="block text-center bg-teal-600 text-white text-base font-bold py-3 rounded-lg hover:bg-teal-500 transition duration-300 transform active:scale-[0.98] shadow-lg shadow-teal-600/40"
//                 >
//                     Apply Now
//                 </a>
//             </div>
//         </div>
//     );
// }


// // --- JobList Component (Merged and Enhanced from JobList.jsx) ---
// export default function JobBoardApp() {
//   const [search, setSearch] = useState('');
//   // Set an initial broad query to display jobs on load
//   const [query, setQuery] = useState(''); 
//   const [filters, setFilters] = useState({ employment_type: 'ALL' });
  
//   // Use the merged hook
//   const { data: jobs, isLoading, error } = useJobs(query, filters);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setQuery(search.trim());
//   };

//   return (
//     // Dark theme background
//     <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
      
//       {/* Header */}
//       <header className="text-center py-6">
//         <h1 className="text-5xl font-extrabold tracking-tight">
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500 drop-shadow-lg">
//                 The Tech Job Board
//             </span>
//         </h1>
//         <p className="text-gray-400 mt-2 text-lg">
//             Explore {jobs.length} roles matching your criteria.
//         </p>
//       </header>

//       {/* Search Bar */}
//       <form
//         onSubmit={handleSearch}
//         className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-5xl mx-auto my-10 bg-gray-900 p-3 rounded-2xl shadow-2xl shadow-teal-900/30 border border-gray-800"
//       >
//         <div className="relative w-full">
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search for titles, companies, or skills... (e.g., React, Backend, AlphaCorp)"
//             className="bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 pl-14 pr-4 py-4 w-full text-lg rounded-xl focus:border-teal-500 focus:ring-teal-500 transition duration-300 outline-none"
//           />
//           <Search
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-400"
//             size={24}
//           />
//         </div>
//         <button 
//           className="w-full sm:w-1/4 flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold transition duration-300 transform active:scale-[0.99] shadow-lg shadow-teal-600/40"
//         >
//           <Zap className="inline w-5 h-5 mr-2" />
//           Search
//         </button>
//       </form>

//       {/* Main Content Area */}
//       <div className="max-w-7xl mx-auto">
//         {/* Filters */}
//         <JobFilter onFilter={setFilters} />

//         {/* Loading State */}
//         {isLoading && (
//           <div className="flex justify-center items-center mt-12 flex-col bg-gray-900 p-10 rounded-xl max-w-md mx-auto shadow-2xl border border-gray-800">
//             <Loader2 className="animate-spin text-teal-400 mb-5" size={64} />
//             <p className="text-2xl text-gray-300 font-semibold">
//               Crunching the data...
//             </p>
//             <p className="text-sm text-gray-500 mt-2">
//                 Loading 100 job listings. Hang tight!
//             </p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <p className="text-red-400 text-center p-8 text-lg bg-gray-900 rounded-xl mx-auto max-w-lg shadow-2xl border border-red-800/50">
//             {error}
//           </p>
//         )}

//         {/* Job Listings Grid */}
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
//           {jobs && jobs.length > 0 ? (
//             jobs.map((j) => <JobCard key={j.job_id} job={j} />)
//           ) : (
//             // No Results State
//             !isLoading &&
//             !error && (
//               <div className="col-span-full text-center p-16 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
//                 <Search className="w-12 h-12 text-teal-400 mx-auto mb-4" />
//                 <p className="text-2xl font-light text-gray-400">
//                   <span className="text-teal-400 font-bold">Heads up!</span> No jobs found
//                   matching "{query || 'all jobs'}" with the current filters.
//                 </p>
//                 <p className="text-sm text-gray-500 mt-2">Try a broader search term or different filters.</p>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }