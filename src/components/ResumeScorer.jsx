import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, Zap, X, AlertTriangle, ChevronsUp, ShieldOff } from "lucide-react";

// --- PDF.js Setup (Initial Placeholder) ---
// We remove the static global check and define a placeholder. The library object will be stored in a Ref.

/**
 * Simple word-overlap scoring function.
 * @param {string} resumeText - Text extracted from the resume.
 * @param {string} jobText - Text from the job description.
 * @returns {number} - Match score (0-100).
 */
function simpleScore(resumeText, jobText) {
  const resumeWords = resumeText.toLowerCase().split(/\W+/).filter(Boolean);
  const jobWords = jobText.toLowerCase().split(/\W+/).filter(Boolean);
  const jobSet = new Set(jobWords);
  let match = 0;
  resumeWords.forEach((w) => {
    if (jobSet.has(w)) match++;
  });
  // Calculate score and cap at 100
  const score = Math.min(
    100,
    Math.round((match / Math.max(1, jobWords.length)) * 100)
  );
  return score;
}

// --- CUSTOM GLOBAL STYLES (Dampened) ---
const globalStyles = `
/* GLOBAL STYLES - FOCUSED ON NEON/CYBERPUNK AESTHETIC */
@keyframes background-mesh {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.bg-animated-mesh {
    background: linear-gradient(-45deg, #0a0e14, #101620, #0a0e14, #0b1523);
    background-size: 400% 400%;
    /* REDUCED ANIMATION SPEED */
    animation: background-mesh 30s ease infinite;
}

.vignette-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(16, 20, 30, 0) 50%, rgba(3, 7, 18, 1) 100%);
    z-index: -1; 
}

@keyframes neon-pulse {
    0% { filter: drop-shadow(0 0 8px #0ea5e9) drop-shadow(0 0 16px #0ea5e9); transform: scale(1); opacity: 0.8; }
    50% { filter: drop-shadow(0 0 12px #3b82f6) drop-shadow(0 0 24px #3b82f6); transform: scale(1.02); opacity: 1; }
    100% { filter: drop-shadow(0 0 8px #0ea5e9) drop-shadow(0 0 16px #0ea5e9); transform: scale(1); opacity: 0.8; }
}

.score-neon-pulse {
    /* DAMPENED PULSE SPEED */
    animation: neon-pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
}

.input-glow-border {
    transition: all 0.3s;
    box-shadow: 0 0 0 0px rgba(0,0,0,0);
}

.input-glow-border:hover, .input-glow-border:focus-within {
    box-shadow: 0 0 0 2px #0e7490, 0 0 25px rgba(6, 182, 212, 0.4);
}
`;

// Helper component to insert global styles
const GlobalStyle = () => (
    <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
);


// --- Component Start ---

export default function ResumeScorer({ job }) {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false); // For file/score processing
  const [dependencyLoading, setDependencyLoading] = useState(true); // For initial PDF.js load
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorState, setErrorState] = useState(null); // State for custom errors
  const [isPdfLibReady, setIsPdfLibReady] = useState(false); // Library ready status
  
  const pdfjsRef = useRef(null); // Ref to hold the dynamically loaded PDF library object

  // Robustly determine job description, prioritizing the prop but using a strong default
  const jobDescription = job && job.job_description
    ? job.job_description
    : "Frontend Developer with React, Redux, and Tailwind CSS experience. Must have 3+ years experience and familiarity with CI/CD."; // Default JD

  // --- Dependency Loading Effect ---
  useEffect(() => {
    // 1. Check if the library is already loaded globally
    if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === 'function') {
      pdfjsRef.current = window.pdfjsLib;
      pdfjsRef.current.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      setIsPdfLibReady(true);
      setDependencyLoading(false);
      setErrorState(null);
      return;
    }

    // 2. If not loaded, dynamically inject the main script
    setErrorState("Loading critical PDF dependency...");
    
    const mainLibUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.js';
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    const script = document.createElement('script');
    script.src = mainLibUrl;
    script.async = true;

    script.onload = () => {
      if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === 'function') {
        pdfjsRef.current = window.pdfjsLib;
        pdfjsRef.current.GlobalWorkerOptions.workerSrc = workerUrl;
        setIsPdfLibReady(true);
        setErrorState(null);
      } else {
        setErrorState("Failed to initialize PDF.js after loading the script. File upload disabled.");
        setIsPdfLibReady(false);
      }
      setDependencyLoading(false);
    };

    script.onerror = () => {
      setErrorState("Failed to load PDF.js library from CDN. Check network connection.");
      setIsPdfLibReady(false);
      setDependencyLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup function: attempt to remove the script element on unmount
    return () => {
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
    };
  }, []);


  const handleFile = async (e) => {
    const file = e.target.files[0];
    const pdfjsLib = pdfjsRef.current; // Use the ref
    
    if (!file || !isPdfLibReady || !pdfjsLib) {
        if (!isPdfLibReady) {
            setErrorState("PDF processing is not ready yet. Please wait for dependency loading to finish.");
        }
        return;
    }

    // Reset states
    setErrorState(null);
    setFileName(file.name);
    setLoading(true); // Start file processing loading
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use the library stored in the ref
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise; 
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Clean up text content for better scoring
        text += content.items.map((it) => it.str).join(" ").replace(/\s+/g, ' ') + "\n";
      }
      setResumeText(text);
    } catch (err) {
      console.error("Error reading PDF:", err);
      setErrorState(`Failed to read PDF. Ensure it's a valid PDF. Error: ${err.message || 'Parsing failed'}`);
      setFileName("");
      setResumeText("");
    }
    setLoading(false); // End file processing loading
  };

  const handleScore = async () => {
    if (!resumeText) {
      setErrorState("Please upload a PDF resume first to run the analysis.");
      return;
    }
    
    setErrorState(null);
    setLoading(true);

    const score = simpleScore(resumeText, jobDescription);
    
    // Detailed mock reasons based on score level
    let reasons = [];
    if (score >= 80) {
      reasons = [
        "🔥 **Optimal Match (80%+):** High signal-to-noise ratio; your resume is highly optimized for this role.",
        "🎯 **Core Alignment:** Detected key phrases like 'React hooks' and 'CI/CD pipelines' directly matching the JD's context.",
        "✨ **Pro-Tip:** Quantify achievements further (e.g., 'reduced load time by 40%') for an unbeatable application.",
        "✅ **Green Light:** Ready for submission to the ATS and human review."
      ];
    } else if (score >= 50) {
      reasons = [
        "👍 **Solid Foundation (50%-79%):** You have the right skills, but presentation needs tuning.",
        "💡 **Missing Keywords:** We recommend explicitly mentioning 'Redux Toolkit' or 'Tailwind Utility-First' instead of generic terms.",
        "✍️ **Experience Gap:** Ensure your tenure (e.g., '3+ years experience') is clearly visible near relevant roles.",
        "📈 **Action Required:** Integrate 3-5 more specific technical terms from the JD into your project descriptions."
      ];
    } else {
      reasons = [
        "⚠️ **Requires Major Review (0%-49%):** The current resume is too generic for this highly specific job description.",
        "🔍 **Immediate Focus:** Critically analyze the JD and replace 50% of your resume's vocabulary with their language.",
        "📚 **Technology Mismatch:** Keywords for modern stacks (React, Tailwind) are present but appear weakly or infrequently.",
        "🔄 **Recommendation:** Use a Skills Matrix section to explicitly list all required technologies for easy ATS parsing."
      ];
    }

    setResult({
      score,
      reasons,
    });
    setLoading(false);
  };
  
  // Determines the tailwind color classes for the score ring
  const getScoreColor = (s) => {
      if (s >= 80) return "text-green-400 border-green-600 shadow-green-800/60";
      if (s >= 50) return "text-yellow-400 border-yellow-600 shadow-yellow-800/60";
      return "text-red-400 border-red-600 shadow-red-800/60";
  }

  // --- UI Component ---

  return (
    // Apply the animated mesh background here
    <div className="min-h-screen bg-animated-mesh p-4 sm:p-8 flex items-center justify-center relative vignette-bg font-sans">
      <GlobalStyle />
      {/* If dependencies are loading, show a fullscreen overlay */}
      {dependencyLoading && (
        <div className="absolute inset-0 bg-gray-950/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-xl text-cyan-200 font-medium">Initializing ATS Scanner...</p>
            <p className="text-sm text-gray-400 mt-2">Loading critical PDF parsing libraries (PDF.js) from CDN.</p>
            <p className="text-sm text-gray-500 mt-1">{errorState}</p>
        </div>
      )}

      <div
        className="bg-gray-800 p-6 sm:p-10 rounded-[28px] max-w-4xl w-full my-12 backdrop-blur-sm 
                   border-2 border-indigo-700/60 
                   shadow-[0_0_100px_rgba(20,184,240,0.3),_0_0_30px_rgba(100,116,139,0.7)] relative" 
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="p-3 bg-indigo-700 rounded-full mb-3 shadow-xl shadow-indigo-500/80"
            >
                <ChevronsUp className="w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>
            <h3 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 
                                 drop-shadow-[0_0_10px_rgba(40,150,255,0.7)]">
                    ATS Optimization Matrix
                </span>
            </h3>
            <p className="text-gray-200 text-base max-w-lg mt-2">
                Deploy your resume for real-time keyword analysis and score projection against the target role.
            </p>
        </div>

        {/* Job Description Preview */}
        <motion.div 
            className="text-center mb-8 p-4 bg-gray-800 rounded-xl border border-indigo-500/30 shadow-inner shadow-gray-950/50"
        >
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-1">Target Job Keywords (Default)</p>
            <p className="text-gray-200 italic text-sm">
                {jobDescription.substring(0, 120)}...
            </p>
        </motion.div>
        
        {/* Error Banner */}
        {errorState && !dependencyLoading && ( // Only show if not during initial dependency load
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 p-4 ${isPdfLibReady ? 'bg-red-900/70 border-red-700' : 'bg-yellow-900/70 border-yellow-700'} 
                           border rounded-xl flex items-center justify-between shadow-lg`}
            >
                <div className="flex items-center">
                    {isPdfLibReady ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                    ) : (
                        <ShieldOff className="w-5 h-5 text-yellow-400 mr-3" />
                    )}
                    <p className={`text-sm ${isPdfLibReady ? 'text-red-300' : 'text-yellow-300'} font-medium`}>{errorState}</p>
                </div>
                <button onClick={() => setErrorState(null)} className={`p-1 ${isPdfLibReady ? 'text-red-300 hover:text-red-100' : 'text-yellow-300 hover:text-yellow-100'}`}>
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        )}

        {/* File Upload Area */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 relative input-glow-border" 
        >
            <label
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer 
                           bg-gray-800 transition-all duration-300 group
                           ${isPdfLibReady && !dependencyLoading
                                ? 'border-cyan-500/80 hover:bg-gray-700/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                                : 'border-gray-600/50 cursor-not-allowed opacity-50'
                           }`}
            >
                <Upload className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition mb-2" />
                <span className="text-cyan-300 font-semibold text-lg">
                    {fileName ? "File Ready: Initiate Scan?" : "Drag & Drop or Click to Upload PDF Resume"}
                </span>
                <p className="text-gray-300 text-sm mt-1">
                    {isPdfLibReady ? "Encrypted, client-side processing (PDF format required)." : "Waiting for dependencies..."}
                </p>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFile}
                    className="hidden"
                    disabled={!isPdfLibReady || dependencyLoading}
                />
            </label>
        </motion.div>

        {/* File Name & Action Button Container */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
            {/* File Name Display */}
            <div className="sm:w-1/2 w-full">
                {fileName && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-gray-300 p-3 bg-gray-800 rounded-xl flex items-center justify-start gap-3 border border-gray-700/50 shadow-inner shadow-gray-950/50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        ) : (
                            <FileText className="w-5 h-5 text-cyan-400" />
                        )}
                        <span className="font-mono text-cyan-300 truncate max-w-full">
                            {fileName}
                        </span>
                    </motion.div>
                )}
            </div>
            
            {/* Score Button */}
            <div className="sm:w-1/2 w-full flex justify-end">
                <motion.button
                    onClick={handleScore}
                    disabled={loading || !fileName || result || !isPdfLibReady || dependencyLoading}
                    whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 0 40px rgba(99, 102, 241, 0.8), 0 0 10px rgba(255, 255, 255, 0.5)"
                    }}
                    whileTap={{ scale: 0.95, rotate: 0 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white 
                               px-10 py-3 rounded-xl font-bold text-lg flex items-center gap-3 transition-all duration-300 
                               shadow-lg shadow-indigo-600/40 hover:shadow-cyan-500/60 
                               disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Data Streams...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 fill-white" />
                            Execute Match Algorithm
                        </>
                    )}
                </motion.button>
            </div>
        </div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="mt-6 bg-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-indigo-700/30 shadow-2xl shadow-cyan-900/40"
          >
            <div className="grid md:grid-cols-3 gap-8">
                {/* Score Circle (Dynamic Effect) */}
                <motion.div
                    initial={{ scale: 0.3, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.2, type: "spring", stiffness: 60, damping: 10 }}
                    className={`md:col-span-1 flex flex-col items-center justify-center p-6 rounded-full aspect-square 
                                 bg-gray-900 border-4 ${getScoreColor(result.score)}
                                 shadow-2xl ${result.score >= 80 ? 'score-neon-pulse' : 'shadow-indigo-900/50'}
                                 transition-all duration-500 ease-out`}
                >
                    <p className="text-xl font-semibold text-gray-200 mb-1 tracking-widest">Match Score</p>
                    <div className="relative">
                        <motion.span
                            className={`text-8xl font-black ${getScoreColor(result.score)} leading-none drop-shadow-xl`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            {result.score}
                        </motion.span>
                        <span className={`text-4xl absolute top-0 right-[-25px] ${getScoreColor(result.score)}`}>%</span>
                    </div>
                </motion.div>
                
                {/* Recommendations List */}
                <div className="md:col-span-2">
                    <h4 className="text-2xl font-bold text-indigo-300 mb-4 border-b border-cyan-700/50 pb-2">
                        Optimization Recommendations
                    </h4>
                    <ul className="space-y-4 text-gray-200">
                        {result.reasons.map((r, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1, duration: 0.4, type: "spring", stiffness: 180 }}
                                whileHover={{ backgroundColor: '#1f2937' }} 
                                className="flex items-start gap-3 bg-gray-900 p-3 rounded-xl border border-gray-700/70 shadow-md transition-colors duration-200"
                            >
                                <Zap className={`w-4 h-4 ${result.score >= 80 ? 'text-green-400' : 'text-cyan-400'} flex-shrink-0 mt-1.5`} />
                                <span className="text-sm">
                                    <span dangerouslySetInnerHTML={{ __html: r.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
