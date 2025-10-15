import React from 'react';
import { Heart, MapPin, Briefcase, DollarSign } from 'lucide-react';
// Assuming the Redux setup is external as per the user's original file
import { useDispatch, useSelector } from 'react-redux'; 
import { toggleFavorite } from '../redux/favoritesSlice';

export default function JobCard({ job }) {
  const dispatch = useDispatch();
  const favorites = useSelector((s) => s.favorites.items);
  const isFav = favorites.some((j) => j.job_id === job.job_id);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
    
  // Logo placeholder component using the URL generated in useJobs.jsx
  const LogoFallback = () => (
      <div 
          style={{ backgroundImage: `url(${job.employer_logo})` }}
          // Using a placeholder background color/text color for the logo initial
          className="w-10 h-10 bg-gray-700/50 text-teal-400 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 border border-gray-600 bg-center bg-cover"
      >
          {job.employer_name.charAt(0)}
      </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl relative transition duration-300 hover:shadow-teal-500/40 hover:scale-[1.02] flex flex-col justify-between h-full border border-gray-800 hover:border-teal-700/50">
      <div className="mb-4 flex-grow">
        <div className="flex justify-between items-start mb-3">
          {/* Company Logo and Title Group */}
          <div className="flex items-center space-x-3">
              <LogoFallback />
              <div>
                  <p className="text-sm font-light text-gray-400">{job.employer_name}</p>
                  <h3 className="text-xl font-extrabold text-white leading-tight">
                    {job.job_title}
                  </h3>
              </div>
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={() => dispatch(toggleFavorite(job))}
            className={`p-2 rounded-full transition duration-300 transform hover:scale-110 ml-4 flex-shrink-0
              ${isFav 
                ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' 
                : 'bg-gray-800 text-gray-500 hover:text-red-400 hover:bg-gray-700'}`
            }
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
        
        <hr className="my-2 border-gray-800" />

        <div className="flex flex-col space-y-2 text-sm text-gray-400 mt-4">
          {/* Location */}
          <span className="flex items-center">
            <MapPin size={16} className="mr-3 text-teal-500 flex-shrink-0" />
            <span className="font-medium text-gray-300">{job.job_city}</span>
            <span className={`ml-2 text-xs font-mono px-2 py-0.5 rounded-full ${job.job_is_remote ? 'bg-indigo-900/30 text-indigo-400' : 'bg-gray-700/50 text-gray-400'}`}>
                {job.job_is_remote ? 'Remote' : 'Onsite'}
            </span>
          </span>
          {/* Salary */}
          <span className="flex items-center font-bold text-lg text-teal-400">
            <DollarSign size={18} className="mr-3 text-teal-500 flex-shrink-0" />
            {formatCurrency(job.job_min_salary)} - {formatCurrency(job.job_max_salary)}
          </span>
          {/* Job Type */}
          <span className="flex items-center">
            <Briefcase size={16} className="mr-3 text-gray-500 flex-shrink-0" />
            <span className="bg-teal-900/50 text-xs font-mono px-2 py-0.5 rounded tracking-wider text-teal-300">
              {job.job_employment_type}
            </span>
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed mb-4 italic">
        {job.job_description
          ? job.job_description.slice(0, 110) + '...'
          : 'Job description not available.'}
      </p>

      {/* Apply Button */}
      <div className="mt-auto">
        <a
          href={job.job_apply_link}
          target="_blank"
          rel="noreferrer"
          className="block text-center bg-teal-600 text-white text-base font-bold py-3 rounded-lg hover:bg-teal-500 transition duration-300 transform active:scale-[0.98] shadow-lg shadow-teal-600/40"
        >
          Details & Apply
        </a>
      </div>
    </div>
  );
}
