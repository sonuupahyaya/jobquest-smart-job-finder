import React, { useState, useEffect } from 'react';
import { Search, Loader2, Zap, Briefcase, MapPin, Clock, Heart } from 'lucide-react';

// --- CUSTOM GLOBAL STYLES FOR ANIMATIONS AND EFFECTS ---
const globalStyles = `
/* VIGNETTE BACKGROUND EFFECT */
.vignette-bg {
    position: relative;
    z-index: 0;
}
.vignette-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* Radial gradient creates a dark border and a glowing center */
    background: radial-gradient(circle at center, rgba(16, 22, 39, 0) 30%, rgba(5, 7, 12, 0.95) 100%);
    z-index: -1; 
}

/* ACCENT LINE DIVIDER - ABOVE SEARCH BAR */
.divider-top {
    position: relative;
    padding-top: 35px; /* Add space for the top line */
}
.divider-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.7);
    border-radius: 9999px;
}

/* ACCENT LINE DIVIDER - BELOW FILTER BAR */
.divider-bottom {
    position: relative;
    padding-bottom: 35px; /* Add space for the bottom line */
}
.divider-bottom::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.8), transparent);
    box-shadow: 0 0 15px rgba(20, 184, 166, 0.7);
    border-radius: 9999px;
}

/* ANIMATIONS */
@keyframes glitch-pulse {
    0%, 100% {
        text-shadow: 0 0 10px #20c997, 0 0 20px #06b6d4;
    }
    25% {
        text-shadow: 2px 2px 12px #20c997, -2px -2px 15px #06b6d4;
    }
    50% {
        text-shadow: -2px 0 10px #06b6d4, 2px 0 25px #20c997;
    }
    75% {
        text-shadow: 1px -1px 11px #20c997, -1px 1px 22px #06b6d4;
    }
}

@keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
}

@keyframes pulse-color {
    0%, 100% { color: #20c997; }
    50% { color: #06b6d4; }
}

/* Custom utility classes */
.animate-glitch {
    animation: glitch-pulse 2.5s infinite alternate;
}
.animate-float {
    animation: float 6s ease-in-out infinite;
}
.animate-pulse-color {
    animation: pulse-color 1.5s infinite alternate;
}

/* ENHANCED SEARCH INPUT FOCUS GLOW (Custom box shadow) */
.input-focus-glow:focus {
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(6, 182, 212, 0.6) !important;
    border-color: #06b6d4 !important;
}
`;

// Helper component to insert global styles
const GlobalStyle = () => (
    <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);

// --- MOCK HOOKS & COMPONENTS FOR SELF-CONTAINED EXECUTION ---

// Mock Job Data
const MOCK_JOBS = [
    { job_id: 1, title: "Senior React Engineer", company: "Aperture Labs", type: "Full-Time", location: "Remote" },
    { job_id: 2, title: "Cloud Backend Specialist", company: "Black Mesa Inc.", type: "Contract", location: "Seattle, WA" },
    { job_id: 3, title: "Data Scientist (ML/AI)", company: "Synapse Corp.", type: "Full-Time", location: "San Francisco, CA" },
    { job_id: 4, title: "DevOps Architect", company: "Cyberdyne Systems", type: "Part-Time", location: "Hybrid" },
    { job_id: 5, title: "Junior UI Designer", company: "LexCorp", type: "Full-Time", location: "New York, NY" },
    { job_id: 6, title: "Game Developer (Unity)", company: "Umbrella Corp.", type: "Contract", location: "Remote" },
];

// Mock useJobs Hook
const useJobs = (query, filters) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Simulate API call delay
        const timer = setTimeout(() => {
            try {
                let filteredJobs = MOCK_JOBS;

                // 1. Filter by Employment Type
                if (filters.employment_type && filters.employment_type !== 'ALL') {
                    filteredJobs = filteredJobs.filter(job => job.type.toLowerCase().includes(filters.employment_type.toLowerCase()));
                }

                // 2. Filter by Search Query
                if (query) {
                    const lowerQuery = query.toLowerCase();
                    filteredJobs = filteredJobs.filter(job =>
                        job.title.toLowerCase().includes(lowerQuery) ||
                        job.company.toLowerCase().includes(lowerQuery) ||
                        job.location.toLowerCase().includes(lowerQuery)
                    );
                }

                // Simulating the 1000+ job experience by duplicating the mock set.
                const massiveJobs = [];
                for (let i = 0; i < 167; i++) { // 167 * 6 jobs = 1002 jobs total
                    massiveJobs.push(...filteredJobs.map(job => ({
                        ...job,
                        job_id: job.job_id + i * 1000
                    })));
                }

                setData(massiveJobs);
            } catch (e) {
                setError("Failed to fetch jobs: Mock data loading error.");
            } finally {
                setIsLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [query, filters]);

    return { data, isLoading, error };
};

// Mock JobCard Component
const JobCard = ({ job }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        setIsFavorite(prev => !prev);
    };

    return (
        <div
            // Stronger 3D Lift/Glow Effect
            className="bg-gray-900 p-6 rounded-xl border border-gray-800 
                shadow-[0_4px_15px_-5px_rgba(20,184,166,0.5)] transition-all duration-300 ease-out animate-float
                hover:scale-[1.03] hover:translate-y-[-4px] 
                hover:shadow-[0_15px_30px_-10px_rgba(20,184,166,1),0_0_50px_-5px_rgba(6,182,212,0.6)]" // Maxed out glow
            style={{ animationDelay: `${(job.job_id % 6) * 0.2}s` }}
        >

            {/* Header: Title/Company/Briefcase and Heart Button */}
            <div className="flex justify-between items-start mb-4">

                {/* Left side: Icon and Title */}
                <div className="flex items-center flex-grow">
                    <Briefcase className="w-6 h-6 text-teal-400 mr-3 flex-shrink-0 drop-shadow-lg" />
                    <h2 className="text-xl font-bold text-gray-100 leading-tight">{job.title}</h2>
                </div>

                {/* Right side: Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="p-1 rounded-full ml-4 text-gray-500 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        className="w-6 h-6 drop-shadow-md"
                        fill={isFavorite ? "rgb(239 68 68)" : "none"} // Tailwind red-500
                        stroke={isFavorite ? "rgb(239 68 68)" : "currentColor"}
                    />
                </button>
            </div>

            {/* Company Name, now positioned below the title/icon block */}
            <p className="text-gray-400 mb-2 font-medium -mt-2">{job.company}</p>

            {/* Location and Type details - Added a separator line for clarity */}
            <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 border-t border-gray-800 pt-4 mt-4">
                <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-cyan-500 drop-shadow-md" />
                    {job.location}
                </span>
                <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-teal-500 drop-shadow-md" />
                    {job.type}
                </span>
            </div>

            {/* Apply button with enhanced glow and subtle hover shift */}
            <button className="mt-4 w-full text-center bg-gradient-to-r from-teal-600 to-cyan-600 
                hover:from-teal-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold text-sm 
                transition-all duration-200 
                shadow-[0_0_20px_rgba(6,182,212,0.5),0_5px_15px_rgba(20,184,166,0.5)]
                hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(6,182,212,0.7),0_7px_20px_rgba(20,184,166,0.7)]">
                APPLY NOW
            </button>
        </div>
    );
};

// Mock JobFilter Component
const JobFilter = ({ onFilter }) => {
    const [selectedType, setSelectedType] = useState('ALL');

    const handleFilterChange = (type) => {
        setSelectedType(type);
        onFilter({ employment_type: type });
    };

    const types = [
        { label: 'All Jobs', value: 'ALL' },
        { label: 'Full-Time', value: 'Full-Time' },
        { label: 'Part-Time', value: 'Part-Time' },
        { label: 'Contract', value: 'Contract' },
    ];

    return (
        <div className="flex justify-center flex-wrap gap-3 my-8 max-w-4xl mx-auto p-4 bg-gray-900 rounded-2xl shadow-inner shadow-gray-950/50 border border-gray-800">
            {types.map((type) => (
                <button
                    key={type.value}
                    onClick={() => handleFilterChange(type.value)}
                    className={`
                        px-5 py-2 rounded-full font-medium transition-all duration-300 text-sm
                        ${selectedType === type.value
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-xl shadow-cyan-500/50 transform scale-[1.05] border border-cyan-400'
                            : 'bg-gray-800 text-gray-400 hover:text-cyan-300 hover:bg-gray-700 border border-gray-700 hover:shadow-inner hover:shadow-cyan-900/50'
                        }
                    `}
                >
                    {type.label}
                </button>
            ))}
        </div>
    );
};

// NEW: High-Impact Metrics Component
const MetricsPanel = () => (
    <div className="flex justify-center flex-wrap gap-8 my-10 max-w-7xl mx-auto">
        <div className="text-center p-4 bg-gray-900 rounded-xl shadow-2xl shadow-teal-900/50 border border-teal-700/50 w-48 transition-all hover:scale-[1.05]">
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-lg">1002+</p>
            <p className="text-gray-400 mt-1 text-sm uppercase tracking-wider">Active Jobs</p>
        </div>
        <div className="text-center p-4 bg-gray-900 rounded-xl shadow-2xl shadow-cyan-900/50 border border-cyan-700/50 w-48 transition-all hover:scale-[1.05]">
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-lg">15K+</p>
            <p className="text-gray-400 mt-1 text-sm uppercase tracking-wider">Devs Hired</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export default function JobList() {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ employment_type: 'ALL' });
    const { data: jobs, isLoading, error } = useJobs(query, filters);

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(search.trim());
    };

    return (
        <div className="min-h-screen bg-gray-950 p-4 sm:p-8 font-sans vignette-bg">
            <GlobalStyle /> {/* **FIXED: Custom styles are now loaded here** */}

            {/* Sharper Header with stronger holographic glitch effect */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-center mt-4 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 tracking-wide animate-glitch">
                The DevVerse Job Hub
            </h1>

            <MetricsPanel />

            {/* Search Bar (Enhanced with sharper shadows and gradient button) */}
            <form
                onSubmit={handleSearch}
                // **UPDATED: Added divider-top and stronger shadow for hero element glow**
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-5xl mx-auto my-10 bg-gray-900 p-6 rounded-3xl 
                    shadow-[0_0_40px_-5px_rgba(6,182,212,0.3),inset_0_0_15px_rgba(6,182,212,0.1)] border border-gray-800 relative divider-top"
            >
                <div className="relative w-full">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search titles, companies, or skills..."
                        // **UPDATED: Using custom focus glow class**
                        className="bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-cyan-700 pl-14 pr-4 py-4 w-full text-lg rounded-xl transition duration-300 outline-none shadow-inner shadow-gray-950/50 input-focus-glow"
                    />
                    <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400"
                        size={24}
                    />
                </div>
                <button
                    // **UPDATED: Stronger 3D press effect and hover shift**
                    className="w-full sm:w-1/4 flex-shrink-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform 
                        hover:scale-[1.02] hover:translate-y-[-2px] active:scale-[0.98] active:translate-y-[1px]
                        shadow-lg shadow-cyan-600/50 flex justify-center items-center tracking-wider"
                >
                    <Zap className="inline w-5 h-5 mr-2" />
                    FIND JOBS
                </button>
            </form>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* JobFilter Component - Wrapped with bottom divider */}
                <div className="relative divider-bottom pb-12">
                    <JobFilter onFilter={setFilters} />
                </div>

                {/* Loading State - Color Pulse added for extra effect */}
                {isLoading && (
                    <div className="flex justify-center items-center mt-12 flex-col bg-gray-900 p-12 rounded-2xl max-w-sm mx-auto shadow-2xl shadow-cyan-800/70 border border-cyan-700/50">
                        <Loader2 className="animate-spin text-cyan-400 mb-5 drop-shadow-lg" size={72} />
                        <p className="text-3xl font-extrabold tracking-widest animate-pulse-color">
                            LOADING DATA...
                        </p>
                        <p className="text-sm text-gray-500 mt-3">
                            Initiating massive job array...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <p className="text-red-400 text-center p-8 text-lg bg-gray-900 rounded-xl mx-auto max-w-lg shadow-2xl border border-red-800/50">
                        {error}
                    </p>
                )}

                {/* Job Listings Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
                    {/* 1. Display Job Cards */}
                    {jobs && jobs.length > 0
                        ? jobs.map((j) => <JobCard key={j.job_id} job={j} />)
                        : null
                    }
                    {/* 2. Display No Results Message */}
                    {!isLoading && !error && jobs && jobs.length === 0 && (
                        <div className="col-span-full text-center p-16 bg-gray-950 rounded-2xl
                            shadow-[inset_0_0_15px_rgba(20,184,166,0.5),0_0_30px_rgba(6,182,212,0.4)]
                            border border-teal-500/50">
                            <Search className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                            <p className="text-2xl font-light text-gray-400">
                                <span className="text-teal-400 font-bold">Heads up!</span> No jobs found
                                matching "{query || 'all jobs'}" with the current filters.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Try a broader search term or different filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}