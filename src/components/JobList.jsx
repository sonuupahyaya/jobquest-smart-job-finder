import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Loader2, Zap, Briefcase, MapPin, Clock, Heart, DollarSign, Star, Globe, Building2, Combine, XCircle, Trash2 } from 'lucide-react';

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

/* MAP PIN GLOW */
.map-pin-glow {
    animation: pulse-glow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
}
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4); }
    50% { box-shadow: 0 0 20px rgba(6, 182, 212, 1), 0 0 30px rgba(6, 182, 212, 0.6); }
}

/* SLIDER TRACK CUSTOMIZATION */
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px; 
    height: 16px; 
    background: #06b6d4; 
    border: 2px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -7px; /* Adjust to sit on the track */
    box-shadow: 0 0 5px rgba(6, 182, 212, 0.8);
    transition: background 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
`;

// Helper component to insert global styles
const GlobalStyle = () => (
    <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);

// --- MOCK DATA (EXPANDED for Map/City filtering) ---
const MOCK_JOBS_RAW = [
    { job_id: 1, title: "Senior React Engineer", company: "Aperture Labs", type: "Full-Time", work_style: "Remote", city: "Remote", salary_range: "₹25L - 40L", min_salary: 2500000, max_salary: 4000000, logo: 'A' },
    { job_id: 2, title: "Cloud Backend Specialist", company: "Black Mesa Inc.", type: "Contract", work_style: "Onsite", city: "Bangalore", salary_range: "₹15L - 22L", min_salary: 1500000, max_salary: 2200000, logo: 'B' },
    { job_id: 3, title: "Data Scientist (ML/AI)", company: "Synapse Corp.", type: "Full-Time", work_style: "Hybrid", city: "Bangalore", salary_range: "₹30L - 50L", min_salary: 3000000, max_salary: 5000000, logo: 'S' },
    { job_id: 4, title: "DevOps Architect", company: "Cyberdyne Systems", type: "Part-Time", work_style: "Hybrid", city: "Pune", salary_range: "₹18L - 30L", min_salary: 1800000, max_salary: 3000000, logo: 'C' },
    { job_id: 5, title: "Junior UI Designer", company: "LexCorp", type: "Full-Time", work_style: "Onsite", city: "Hyderabad", salary_range: "₹8L - 14L", min_salary: 800000, max_salary: 1400000, logo: 'L' },
    { job_id: 6, title: "Game Developer (Unity)", company: "Umbrella Corp.", type: "Contract", work_style: "Remote", city: "Remote", salary_range: "₹20L - 35L", min_salary: 2000000, max_salary: 3500000, logo: 'U' },
    { job_id: 7, title: "Frontend Ninja", company: "Wayne Enterprises", type: "Full-Time", work_style: "Remote", city: "Remote", salary_range: "₹22L - 35L", min_salary: 2200000, max_salary: 3500000, logo: 'W' },
    { job_id: 8, title: "Security Analyst", company: "Stark Industries", type: "Full-Time", work_style: "Onsite", city: "Mumbai", salary_range: "₹40L - 60L", min_salary: 4000000, max_salary: 6000000, logo: 'I' },
    { job_id: 9, title: "Mobile Dev", company: "Marvel", type: "Full-Time", work_style: "Onsite", city: "Mumbai", salary_range: "₹12L - 18L", min_salary: 1200000, max_salary: 1800000, logo: 'M' },
    { job_id: 10, title: "QA Engineer", company: "DC", type: "Contract", work_style: "Hybrid", city: "Delhi", salary_range: "₹10L - 15L", min_salary: 1000000, max_salary: 1500000, logo: 'D' },
    { job_id: 11, title: "Lead Designer", company: "Pixar", type: "Full-Time", work_style: "Onsite", city: "Delhi", salary_range: "₹35L - 45L", min_salary: 3500000, max_salary: 4500000, logo: 'P' },
    { job_id: 12, title: "FullStack Dev", company: "Amazon", type: "Full-Time", work_style: "Hybrid", city: "Bangalore", salary_range: "₹40L - 65L", min_salary: 4000000, max_salary: 6500000, logo: 'Z' },
    { job_id: 13, title: "Data Analyst", company: "Netflix", type: "Part-Time", work_style: "Remote", city: "Remote", salary_range: "₹10L - 20L", min_salary: 1000000, max_salary: 2000000, logo: 'N' },
];

// Helper function to create a massive list for the demo effect
const generateMassiveJobs = (jobs) => {
    const massiveJobs = [];
    // Target 1000+ jobs. Since MOCK_JOBS_RAW has 13 jobs, we need ~77 copies.
    for (let i = 0; i < 77; i++) { 
        massiveJobs.push(...jobs.map(job => ({
            ...job,
            job_id: job.job_id + i * 1000 
        })));
    }
    return massiveJobs;
};

// Calculate initial counts for the map visualization
const getCityCounts = (jobs) => {
    const counts = {};
    jobs.forEach(job => {
        const city = job.city === 'Remote' ? 'Remote' : job.city;
        counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
};
const INITIAL_CITY_COUNTS = getCityCounts(generateMassiveJobs(MOCK_JOBS_RAW));


// --- HOOKS (UPDATED to include city filter) ---

const useJobs = (query, filters) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                let filteredJobs = MOCK_JOBS_RAW;

                // 1. City Filter (New)
                if (filters.city && filters.city !== 'ALL') {
                    filteredJobs = filteredJobs.filter(job => job.city === filters.city);
                }

                // 2. Employment Type Filter
                if (filters.employment_type && filters.employment_type !== 'ALL') {
                    filteredJobs = filteredJobs.filter(job => job.type.toLowerCase() === filters.employment_type.toLowerCase());
                }
                
                // 3. Location Type (Work Style) Filter
                if (filters.location_type && filters.location_type !== 'ALL') {
                    filteredJobs = filteredJobs.filter(job => job.work_style.toLowerCase() === filters.location_type.toLowerCase());
                }

                // 4. Salary Range Filter
                if (filters.salary_range) {
                    const [min, max] = filters.salary_range;
                    filteredJobs = filteredJobs.filter(job => 
                        (job.min_salary >= min && job.min_salary <= max) || 
                        (job.max_salary >= min && job.max_salary <= max) ||
                        (min >= job.min_salary && max <= job.max_salary)
                    );
                }

                // 5. Search Query Filter
                if (query) {
                    const lowerQuery = query.toLowerCase();
                    filteredJobs = filteredJobs.filter(job =>
                        job.title.toLowerCase().includes(lowerQuery) ||
                        job.company.toLowerCase().includes(lowerQuery) ||
                        job.city.toLowerCase().includes(lowerQuery)
                    );
                }

                // Generate massive job list from the filtered subset
                const massiveJobs = generateMassiveJobs(filteredJobs);

                setData(massiveJobs);
            } catch (e) {
                setError("Failed to fetch jobs: Mock data loading error.");
            } finally {
                setIsLoading(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [query, filters]);

    return { data, isLoading, error };
};

// --- Salary Range Component (Unchanged) ---

const SalaryRangeSlider = ({ onSalaryChange, currentRange }) => {
    const minCap = 500000; // 5L
    const maxCap = 6000000; // 60L
    const [minSalary, setMinSalary] = useState(currentRange[0]);
    const [maxSalary, setMaxSalary] = useState(currentRange[1]);

    const formatSalary = (value) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr+`;
        if (value >= 100000) return `${(value / 100000).toFixed(0)} L`;
        return value.toLocaleString('en-IN');
    };

    const handleMinChange = (e) => {
        const newMin = Math.min(Number(e.target.value), maxSalary - 100000);
        setMinSalary(newMin);
        onSalaryChange([newMin, maxSalary]);
    };

    const handleMaxChange = (e) => {
        const newMax = Math.max(Number(e.target.value), minSalary + 100000);
        setMaxSalary(newMax);
        onSalaryChange([minSalary, newMax]);
    };

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-inner shadow-gray-950/50 border border-gray-700 w-full">
            <label className="block text-gray-200 font-semibold mb-3 text-sm flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-teal-400" />
                Salary Range (Annual)
            </label>
            
            <div className="flex justify-between items-center text-sm font-bold text-teal-400 mb-4 bg-gray-900 p-2 rounded-lg">
                <span>{formatSalary(minSalary)}</span>
                <span> - </span>
                <span>{formatSalary(maxSalary)}</span>
            </div>

            <div className="relative pt-1">
                {/* Min Slider */}
                <input
                    type="range"
                    min={minCap}
                    max={maxCap}
                    step={100000} // Steps of 1 lakh
                    value={minSalary}
                    onChange={handleMinChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg absolute z-30"
                    style={{ background: 'transparent' }}
                />
                {/* Max Slider (positioned visually on top) */}
                <input
                    type="range"
                    min={minCap}
                    max={maxCap}
                    step={100000}
                    value={maxSalary}
                    onChange={handleMaxChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg absolute z-30"
                    style={{ background: 'transparent' }}
                />

                {/* Custom Track (To visually highlight the selected range) */}
                <div className="absolute w-full h-2 bg-gray-700 rounded-lg z-10 top-0 pointer-events-none"></div>
                <div
                    className="absolute h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg z-20 top-0 pointer-events-none"
                    style={{
                        left: `${((minSalary - minCap) / (maxCap - minCap)) * 100}%`,
                        width: `${((maxSalary - minSalary) / (maxCap - minCap)) * 100}%`
                    }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{formatSalary(minCap)}</span>
                <span>{formatSalary(maxCap)}+</span>
            </div>
        </div>
    );
};


// --- MapVisualization Component (New) ---

const MapVisualization = ({ cityCounts, onCityClick }) => {
    // Defines coordinates and color themes for cities on a conceptual map
    const cityPins = useMemo(() => ([
        { name: 'Delhi', count: cityCounts['Delhi'] || 0, top: '15%', left: '50%', color: 'blue', size: 1.6 },
        { name: 'Mumbai', count: cityCounts['Mumbai'] || 0, top: '40%', left: '25%', color: 'yellow', size: 1.3 },
        { name: 'Bangalore', count: cityCounts['Bangalore'] || 0, top: '70%', left: '50%', color: 'purple', size: 1.8 },
        { name: 'Pune', count: cityCounts['Pune'] || 0, top: '45%', left: '35%', color: 'red', size: 1.2 },
        { name: 'Hyderabad', count: cityCounts['Hyderabad'] || 0, top: '55%', left: '60%', color: 'teal', size: 1.0 },
        { name: 'Remote', count: cityCounts['Remote'] || 0, top: '80%', left: '10%', color: 'cyan', size: 1.4, label: 'Remote Jobs' },
    ]), [cityCounts]);

    const maxCount = Math.max(...cityPins.map(p => p.count));

    return (
        <div className="max-w-6xl mx-auto my-12 bg-gray-900 p-8 rounded-2xl shadow-2xl shadow-cyan-900/50 border border-gray-800 relative divider-top divider-bottom">
            <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                🌐 Job Hotspots Explorer
            </h2>
            <div 
                className="relative w-full h-96 bg-gray-950 rounded-xl overflow-hidden shadow-inner shadow-gray-950/70 border border-gray-800"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="f1" x="0" y="0" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="0.8" /></filter></defs><rect width="100" height="100" fill="%230f172a" /><path d="M5 95 L25 5 L50 80 L75 20 L95 95 Z" stroke="%23374151" stroke-width="0.3" fill="none" filter="url(%23f1)"/></svg>')`, backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }}
            >
                {/* Static Map Graphic - Simulating a neon-style geography */}
                <div className="absolute inset-0 opacity-20" style={{background: 'linear-gradient(45deg, #111827 0%, #1f2937 50%, #111827 100%)'}}></div>
                <div className="absolute inset-0 opacity-50" style={{background: 'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.1), rgba(6,182,212,0.1) 50%, transparent 80%)'}}></div>


                {/* City Pins (Simulated Clusters) */}
                {cityPins.map(pin => {
                    const opacity = pin.count === 0 ? 0.4 : 1;
                    const scaleFactor = pin.count > 0 ? (1 + (pin.count / maxCount) * 0.5) * pin.size : 1;
                    const glowClass = pin.count > 0 ? 'map-pin-glow' : '';
                    
                    return (
                        <div
                            key={pin.name}
                            className={`absolute flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-[1.1] ${glowClass}`}
                            style={{ 
                                top: pin.top, 
                                left: pin.left, 
                                opacity: opacity,
                                '--pin-color': `var(--tw-color-${pin.color}-400)`, // Use Tailwind colors
                                filter: pin.count > 0 ? `drop-shadow(0 0 8px var(--tw-color-${pin.color}-500))` : 'none'
                            }}
                            onClick={() => onCityClick(pin.name)}
                        >
                            {/* Glow Bubble */}
                            <div 
                                className={`w-3 h-3 rounded-full bg-${pin.color}-500`} 
                                style={{ transform: `scale(${scaleFactor})`, 
                                opacity: 0.8 }}
                            ></div>

                            {/* Tooltip Label */}
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold text-gray-100 bg-gray-700/80 backdrop-blur-sm border border-${pin.color}-600/50 shadow-lg shadow-${pin.color}-900/50`}>
                                {pin.label || pin.name} ({pin.count})
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-500">Click a city bubble to instantly filter jobs below.</p>
                <button 
                    onClick={() => onCityClick('Remote')}
                    className="mt-4 px-4 py-2 text-sm font-bold rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white transition-colors"
                >
                    <Globe className="inline w-4 h-4 mr-2" /> View All Remote Jobs
                </button>
            </div>
        </div>
    );
};


// --- JobFiltersPanel Component (Adapted) ---

const JobFiltersPanel = ({ onFilter, currentFilters }) => {
    const [selectedType, setSelectedType] = useState(currentFilters.employment_type);
    const [selectedLocation, setSelectedLocation] = useState(currentFilters.location_type);
    const [salaryRange, setSalaryRange] = useState(currentFilters.salary_range);
    const isCityFiltered = currentFilters.city !== 'ALL';

    // Filter data for the buttons
    const workStyles = [
        { label: 'All Work Styles', value: 'ALL', icon: <Globe className="w-4 h-4" /> },
        { label: 'Remote', value: 'Remote', icon: <Globe className="w-4 h-4" /> },
        { label: 'Onsite', value: 'Onsite', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Hybrid', value: 'Hybrid', icon: <Combine className="w-4 h-4" /> },
    ];

    const employmentTypes = [
        { label: 'All Types', value: 'ALL' },
        { label: 'Full-Time', value: 'Full-Time' },
        { label: 'Part-Time', value: 'Part-Time' },
        { label: 'Contract', value: 'Contract' },
    ];

    // Combine filters and update parent state whenever a filter changes
    useEffect(() => {
        onFilter(prevFilters => ({
            ...prevFilters, // Keep city filter from map click
            employment_type: selectedType,
            location_type: selectedLocation,
            salary_range: salaryRange,
        }));
    }, [selectedType, selectedLocation, salaryRange, onFilter]);

    const handleClearFilters = () => {
        const defaultRange = [500000, 6000000];
        setSelectedType('ALL');
        setSelectedLocation('ALL');
        setSalaryRange(defaultRange);
        // Also clear the city filter in the parent state
        onFilter({ employment_type: 'ALL', location_type: 'ALL', salary_range: defaultRange, city: 'ALL' });
    };

    const navButtonClass = (value, currentValue, activeColor) => `
        px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm flex items-center justify-center
        ${currentValue === value
            ? `bg-gradient-to-r from-teal-500 to-${activeColor}-500 text-white shadow-xl shadow-${activeColor}-500/50 transform scale-[1.05] border border-${activeColor}-400`
            : 'bg-gray-800 text-gray-400 hover:text-cyan-300 hover:bg-gray-700 border border-gray-700 hover:shadow-inner hover:shadow-cyan-900/50'
        }
    `;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-inner shadow-gray-950/50 border border-gray-800">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-cyan-400" />
                    Advanced Filters
                </h3>
                <button 
                    onClick={handleClearFilters}
                    className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg border border-red-700 hover:bg-red-900/30 transition-colors flex items-center"
                >
                    <XCircle className="w-4 h-4 mr-1" />
                    Clear All Filters
                </button>
            </div>
            
            {/* Active City Filter Display */}
            {isCityFiltered && (
                <div className="mb-6 p-3 bg-cyan-900/50 rounded-lg border border-cyan-700/50 flex items-center justify-between shadow-lg shadow-cyan-900/50">
                    <p className="text-md font-semibold text-gray-100 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-400 fill-red-400/20" />
                        Viewing Jobs In: <span className="text-cyan-400 ml-2">{currentFilters.city}</span>
                    </p>
                    <button 
                        onClick={() => onFilter(prev => ({ ...prev, city: 'ALL' }))}
                        className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                    >
                        [Clear City Filter]
                    </button>
                </div>
            )}


            <div className="flex flex-wrap gap-6">
                {/* Work Style (Location Type) Filter */}
                <div className="flex-1 min-w-[280px]">
                    <h4 className="text-gray-300 font-semibold mb-3 text-sm flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-cyan-400" />
                        Work Style
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {workStyles.map((style) => (
                            <button
                                key={style.value}
                                onClick={() => setSelectedLocation(style.value)}
                                className={navButtonClass(style.value, selectedLocation, 'cyan')}
                            >
                                {style.icon}
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Employment Type Filter */}
                <div className="flex-1 min-w-[280px]">
                    <h4 className="text-gray-300 font-semibold mb-3 text-sm flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-teal-400" />
                        Employment Type
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {employmentTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedType(type.value)}
                                className={navButtonClass(type.value, selectedType, 'teal')}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Salary Range Filter (Full Width) */}
            <div className="mt-6">
                <SalaryRangeSlider 
                    currentRange={salaryRange} 
                    onSalaryChange={setSalaryRange} 
                />
            </div>
        </div>
    );
};

const JobsView = ({ favoriteJobIds, toggleFavorite, filters, setFilters }) => {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    // Use the combined filters (including city)
    const { data: jobs, isLoading, error } = useJobs(query, filters);
    
    // Ref for the job list section to enable smooth scrolling
    const jobListRef = useRef(null);
    
    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(search.trim());
    };

    // New handler for map click
    const handleMapCityClick = (city) => {
        // 1. Update the filter state to the new city
        setFilters(prevFilters => ({ ...prevFilters, city: city }));
        
        // 2. Smooth scroll to the job list section
        if (jobListRef.current) {
            jobListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    return (
        <>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-center mt-4 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 tracking-wide animate-glitch">
                The DevVerse Job Hub
            </h1>

            <MetricsPanel />

            {/* Map Visualization (Entry Point) */}
            <MapVisualization 
                cityCounts={INITIAL_CITY_COUNTS} 
                onCityClick={handleMapCityClick} 
            />

            {/* Search Bar */}
            <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-5xl mx-auto my-10 bg-gray-900 p-6 rounded-3xl 
                    shadow-[0_0_40px_-5px_rgba(6,182,212,0.3),inset_0_0_15px_rgba(6,182,212,0.1)] border border-gray-800 relative divider-top"
            >
                <div className="relative w-full">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search titles, companies, or skills..."
                        className="bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-cyan-700 pl-14 pr-4 py-4 w-full text-lg rounded-xl transition duration-300 outline-none shadow-inner shadow-gray-950/50 input-focus-glow"
                    />
                    <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400"
                        size={24}
                    />
                </div>
                <button
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
                    <JobFiltersPanel onFilter={setFilters} currentFilters={filters} />
                </div>

                {/* Job List Container - Scroll Destination */}
                <div ref={jobListRef} className="pt-2"> 
                    {/* List Heading */}
                    <h2 className="text-3xl font-extrabold text-gray-100 mb-6 border-b border-gray-700 pb-3">
                        {filters.city !== 'ALL' ? (
                            <span className="text-teal-400">{filters.city} Jobs</span>
                        ) : (
                            <span>All Job Listings</span>
                        )}
                        <span className="text-gray-500 ml-3 text-lg font-normal">({jobs ? jobs.length : 0} results)</span>
                    </h2>
                </div>


                {isLoading && (
                    <div className="flex justify-center items-center mt-12 flex-col bg-gray-900 p-12 rounded-2xl max-w-sm mx-auto shadow-2xl shadow-cyan-800/70 border border-cyan-700/50">
                        <Loader2 className="animate-spin text-cyan-400 mb-5 drop-shadow-lg" size={72} />
                        <p className="text-3xl font-extrabold tracking-widest animate-pulse-color">LOADING DATA...</p>
                        <p className="text-sm text-gray-500 mt-3">Applying map filters and initiating array...</p>
                    </div>
                )}

                {error && (
                    <p className="text-red-400 text-center p-8 text-lg bg-gray-900 rounded-xl mx-auto max-w-lg shadow-2xl border border-red-800/50">
                        {error}
                    </p>
                )}

                {/* Job Listings Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
                    {jobs && jobs.length > 0
                        ? jobs.map((j) => (
                            <JobCard 
                                key={j.job_id} 
                                job={j} 
                                isFavorite={favoriteJobIds.has(j.job_id)} 
                                onToggleFavorite={toggleFavorite}
                                mode='list'
                            />
                        ))
                        : null
                    }
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
        </>
    );
};

// --- JobCard Component (Adapted for City/Location Display) ---
const JobCard = ({ job, isFavorite, onToggleFavorite, mode = 'list', onDelete }) => {
    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite(job); 
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(job);
        }
    };

    const renderActionButton = () => {
        if (mode === 'favorite') {
            return (
                <button
                    onClick={handleDeleteClick}
                    className="mt-4 w-full flex justify-center items-center bg-red-700 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm 
                        transition-all duration-200 shadow-lg shadow-red-900/50 hover:translate-y-[-2px]"
                >
                    <Trash2 className="inline w-4 h-4 mr-2" />
                    DELETE JOB
                </button>
            );
        }
        
        return (
            <button className="mt-4 w-full text-center bg-gradient-to-r from-teal-600 to-cyan-600 
                hover:from-teal-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold text-sm 
                transition-all duration-200 
                shadow-[0_0_20px_rgba(6,182,212,0.5),0_5px_15px_rgba(20,184,166,0.5)]
                hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(6,182,212,0.7),0_7px_20px_rgba(20,184,166,0.7)]">
                APPLY NOW
            </button>
        );
    };
    
    // Icon mapping for work_style
    const WorkStyleIcon = {
        'Remote': <Globe className="w-4 h-4 mr-1 text-teal-300 drop-shadow-md" />,
        'Onsite': <Building2 className="w-4 h-4 mr-1 text-red-400 drop-shadow-md" />,
        'Hybrid': <Combine className="w-4 h-4 mr-1 text-yellow-400 drop-shadow-md" />
    }[job.work_style] || <MapPin className="w-4 h-4 mr-1 text-cyan-500 drop-shadow-md" />;

    return (
        <div
            className="bg-gray-900 p-6 rounded-xl border border-gray-800 
                shadow-[0_4px_15px_-5px_rgba(20,184,166,0.5)] transition-all duration-300 ease-out animate-float
                hover:scale-[1.03] hover:translate-y-[-4px] 
                hover:shadow-[0_15px_30px_-10px_rgba(20,184,166,1),0_0_50px_-5px_rgba(6,182,212,0.6)]" 
            style={{ animationDelay: `${(job.job_id % 6) * 0.2}s` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start flex-grow">
                    <div className="w-12 h-12 flex items-center justify-center bg-cyan-700 rounded-lg text-white text-xl font-bold mr-4 flex-shrink-0 shadow-lg shadow-cyan-900/50">
                        {job.logo}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100 leading-tight mb-1">{job.title}</h2>
                        <p className="text-gray-400 font-medium text-sm">{job.company}</p>
                    </div>
                </div>

                <button
                    onClick={handleFavoriteClick}
                    className="p-1 rounded-full ml-4 text-gray-500 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        className="w-6 h-6 drop-shadow-md"
                        fill={isFavorite ? "rgb(239 68 68)" : "none"}
                        stroke={isFavorite ? "rgb(239 68 68)" : "currentColor"}
                    />
                </button>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 border-t border-gray-800 pt-4 mt-4">
                <span className="flex items-center text-teal-400 font-semibold">
                    <DollarSign className="w-4 h-4 mr-1 drop-shadow-md" />
                    {job.salary_range}
                </span>
                <span className="flex items-center">
                    {WorkStyleIcon}
                    {job.work_style} 
                    {job.city !== 'Remote' && (
                        <span className='ml-1 text-gray-400'>({job.city})</span>
                    )}
                </span>
                <span className="flex items-center font-bold text-xs px-2 py-0.5 rounded-full 
                    bg-teal-900/50 text-teal-300 border border-teal-600/50 uppercase tracking-widest">
                    <Clock className="w-3 h-3 mr-1" />
                    {job.type}
                </span>
            </div>

            {renderActionButton()}
        </div>
    );
};

// --- MetricsPanel Component (Unchanged) ---
const MetricsPanel = () => (
    <div className="flex justify-center flex-wrap gap-8 my-10 max-w-7xl mx-auto">
        <div className="text-center p-4 bg-gray-900 rounded-xl shadow-2xl shadow-teal-900/50 border border-teal-700/50 w-48 transition-all hover:scale-[1.05]">
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-lg">{INITIAL_CITY_COUNTS['Bangalore'] * 4}+</p>
            <p className="text-gray-400 mt-1 text-sm uppercase tracking-wider">Jobs In Tech Hubs</p>
        </div>
        <div className="text-center p-4 bg-gray-900 rounded-xl shadow-2xl shadow-cyan-900/50 border border-cyan-700/50 w-48 transition-all hover:scale-[1.05]">
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-lg">{INITIAL_CITY_COUNTS['Remote']}+</p>
            <p className="text-gray-400 mt-1 text-sm uppercase tracking-wider">Remote Opportunities</p>
        </div>
    </div>
);


// --- FavoritesView and AppNavigation (Updated) ---
const FavoritesView = ({ favoriteJobs, onToggleFavorite }) => {
    return (
        <div className="max-w-7xl mx-auto my-12 p-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 tracking-wide flex items-center justify-center">
                <Star className="w-8 h-8 mr-3 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                Your Cyber-Favorites
            </h1>

            {favoriteJobs.length === 0 ? (
                <div className="text-center p-16 bg-gray-900 rounded-2xl border border-red-700/50 shadow-2xl shadow-red-900/50">
                    <Heart className="w-12 h-12 text-red-400 mx-auto mb-4 fill-red-400" />
                    <p className="text-2xl font-light text-gray-400">
                        You haven't favorited any jobs yet.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Click the heart icon on any job card to save it here.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favoriteJobs.map((job) => (
                        <JobCard 
                            key={`fav-${job.job_id}`} 
                            job={job} 
                            isFavorite={true} 
                            onToggleFavorite={onToggleFavorite} 
                            mode='favorite'
                            onDelete={onToggleFavorite} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const AppNavigation = ({ currentView, onViewChange, favoriteCount }) => {
    const navItemClass = (view) => `
        px-4 py-2 font-medium text-sm transition-colors duration-200 cursor-pointer
        ${currentView === view
            ? 'text-teal-400 border-b-2 border-teal-400 shadow-teal-500/50'
            : 'text-gray-400 hover:text-white'
        }
    `;

    return (
        <header className="bg-gray-900 p-4 border-b border-gray-800 shadow-lg shadow-gray-950/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Text "DevExplore" removed. Leaving the h1 element but empty for consistent spacing/structure. */}
                <h1 className="text-2xl font-bold text-teal-400"></h1>
                <nav className="flex space-x-6">
                    <button onClick={() => onViewChange('Jobs')} className={navItemClass('Jobs')}>
                        Jobs
                    </button>
                    <button onClick={() => onViewChange('Favorites')} className={navItemClass('Favorites')}>
                        Favorites
                        {favoriteCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white shadow-md shadow-red-900/50">
                                {favoriteCount}
                            </span>
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
};

// --- MAIN APPLICATION CONTAINER (Updated Default Filters) ---

export default function AppContainer() {
    const defaultFilters = {
        employment_type: 'ALL',
        location_type: 'ALL',
        salary_range: [500000, 6000000], // Default range: 5L - 60L
        city: 'ALL', // New default city filter
    };
    
    const [viewMode, setViewMode] = useState('Jobs'); 
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    const [filters, setFilters] = useState(defaultFilters);

    const toggleFavorite = (jobToToggle) => {
        setFavoriteJobs(prevFavorites => {
            const isFav = prevFavorites.some(job => job.job_id === jobToToggle.job_id);
            
            if (isFav) {
                return prevFavorites.filter(job => job.job_id !== jobToToggle.job_id);
            } else {
                return [jobToToggle, ...prevFavorites]; 
            }
        });
    };

    const favoriteJobIds = useMemo(() => 
        new Set(favoriteJobs.map(job => job.job_id)), 
        [favoriteJobs]
    );

    return (
        <div className="min-h-screen bg-gray-950 font-sans vignette-bg">
            <GlobalStyle /> 
            
            <AppNavigation 
                currentView={viewMode} 
                onViewChange={setViewMode} 
                favoriteCount={favoriteJobs.length}
            />

            <main className="p-4 sm:p-8">
                {viewMode === 'Jobs' && (
                    <JobsView 
                        favoriteJobIds={favoriteJobIds} 
                        toggleFavorite={toggleFavorite}
                        filters={filters}
                        setFilters={setFilters}
                    />
                )}

                {viewMode === 'Favorites' && (
                    <FavoritesView 
                        favoriteJobs={favoriteJobs} 
                        onToggleFavorite={toggleFavorite} 
                    />
                )}
            </main>
        </div>
    );
}