import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Upload, FileText, Loader2, Zap, X, AlertTriangle, CheckCircle, 
    Target, BookOpen, Repeat2, Copy, Sliders, BarChart, HardHat, Code, Globe, 
    MessageSquare, TrendingUp, Mic, Clipboard
} from "lucide-react";

// --- CORE LOGIC & MOCK DATA ---

/**
 * Simple word-overlap scoring function.
 */
function simpleScore(resumeText, jobText) {
  const resumeWords = resumeText.toLowerCase().split(/\W+/).filter(Boolean);
  const jobWords = jobText.toLowerCase().split(/\W+/).filter(Boolean);
  const jobSet = new Set(jobWords);
  let matchedJobWords = new Set(); 

  resumeWords.forEach((w) => {
    if (jobSet.has(w) && w.length > 2) { // Ignore short words
      matchedJobWords.add(w);
    }
  });

  let score = Math.round((matchedJobWords.size / Math.max(1, jobSet.size)) * 100);
  
  const isFormatted = resumeText.includes("Experience") && resumeText.includes("Skills");
  if (isFormatted) score = Math.min(100, score + 5);
  if (resumeText.includes("developed") || resumeText.includes("managed")) score = Math.min(100, score + 5);

  return Math.min(100, Math.max(10, score));
}

// Mock Job Descriptions
const MOCK_TARGET_ROLES = [
    { title: "Frontend Developer", keywords: ["React", "Redux", "Tailwind", "hooks", "JavaScript", "REST APIs", "CI/CD", "Testing"] },
    { title: "Data Scientist", keywords: ["Python", "TensorFlow", "PyTorch", "Pandas", "NumPy", "AWS", "Data Pipeline", "Model Deployment"] },
    { title: "Backend Engineer", keywords: ["Node.js", "Express", "Microservices", "PostgreSQL", "MongoDB", "Auth", "Security", "Scalability"] },
];

// Mock Tone Options
const TONE_OPTIONS = ["Professional", "Confident", "Executive", "Fresh Graduate"];

// Mock Rewriting Engine - Mapped to TONE and Target Role
const getRewrittenExperience = (tone, role) => {
    const roleKey = role.split(' ')[0]; // E.g., 'Frontend'
    const toneKey = tone.toLowerCase().replace(' ', '');
    
    const mockRewrites = {
        frontend: {
            professional: `**Developed and deployed a dynamic React-based UI** that significantly improved user engagement and **reduced initial page load time by 35%** through performance optimization techniques.`,
            confident: `**Architected** a cutting-edge **Frontend** system, delivering a high-performance user interface that **boosted conversion metrics** and set a new standard for application speed.`,
            executive: `Spearheaded the technical direction for the primary customer-facing platform, leveraging **React/Redux** to ensure robust **scalability and a 99.9% uptime** reliability.`,
            freshgraduate: `Assisted in **building a functional user interface** with **React** and contributed to minor **performance enhancements** to gain experience with production-level code.`,
        },
    };
    
    // Fallback if the specific role isn't mocked
    return mockRewrites[roleKey.toLowerCase()] ? mockRewrites[roleKey.toLowerCase()][toneKey] : mockRewrites.frontend[toneKey];
};

// --- CUSTOM GLOBAL STYLES (Omitted for brevity, remains the same) ---
const GlobalStyle = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @keyframes background-mesh { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .bg-animated-mesh { background: linear-gradient(-45deg, #0a0e14, #101620, #0a0e14, #0b1523); background-size: 400% 400%; animation: background-mesh 30s ease infinite; }
        .vignette-bg::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, rgba(16, 20, 30, 0) 50%, rgba(3, 7, 18, 1) 100%); z-index: -1; }
        @keyframes neon-pulse { 0% { filter: drop-shadow(0 0 8px #0ea5e9) drop-shadow(0 0 16px #0ea5e9); transform: scale(1); opacity: 0.8; } 50% { filter: drop-shadow(0 0 12px #3b82f6) drop-shadow(0 0 24px #3b82f6); transform: scale(1.02); opacity: 1; } 100% { filter: drop-shadow(0 0 8px #0ea5e9) drop-shadow(0 0 16px #0ea5e9); transform: scale(1); opacity: 0.8; } }
        .score-neon-pulse { animation: neon-pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate; }
        .input-glow-border { transition: all 0.3s; box-shadow: 0 0 0 0px rgba(0,0,0,0); }
        .input-glow-border:hover, .input-glow-border:focus-within { box-shadow: 0 0 0 2px #0e7490, 0 0 25px rgba(6, 182, 212, 0.4); }
    `}} />
);


// --- CAREER SUITE DASHBOARD COMPONENT ---

export default function CareerSuiteDashboard() { // Removed AI from Component Name
    const [resumeText, setResumeText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [fileName, setFileName] = useState("");
    const [errorState, setErrorState] = useState(null);
    const [targetRole, setTargetRole] = useState(MOCK_TARGET_ROLES[0]);
    const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0]);
    const [activeTab, setActiveTab] = useState('analysis'); 
    
    // --- FILE/INPUT HANDLING ---
    
    const handleFile = async (e) => {
        const file = e.target.files[0];
        
        if (!file) {
            setErrorState("Please select a file.");
            return;
        }

        setErrorState(null);
        setFileName(file.name);
        setLoading(true);
        setResult(null);
        setActiveTab('analysis'); 

        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const mockPdfText = "Experienced in React, JavaScript, REST APIs, and state management using Redux. Worked on frontend, implementing new features that boosted user engagement. Managed a small team of 2 junior developers. Skills: React, Redux, Node.js, Express, PostgreSQL. Education: Master of Science, 2020.";
            setResumeText(mockPdfText);
            e.target.value = null; 
        } catch (err) {
            setErrorState(`File handling failed: ${err.message}`);
            setFileName("");
            setResumeText("");
        }
        setLoading(false);
    };

    /**
     * Comprehensive Analysis Simulation 
     */
    const handleScore = async () => {
        if (!resumeText) {
            setErrorState("Please upload a resume first to run the analysis.");
            return;
        }
        
        setErrorState(null);
        setLoading(true);
        
        const jobDescription = targetRole.keywords.join(", ");
        const baseScore = simpleScore(resumeText, jobDescription);
        
        // --- MOCK Detailed Analysis Output Generation ---
        
        const readabilityScore = { ease: 68, passiveVoice: 12, clarityScore: 85, gramarIssues: ["Subject-verb agreement (1)", "Tense consistency (2)"] };
        const atsFactors = [
            { label: "Proper Section Headings", status: resumeText.includes("Skills") ? "PASS" : "FAIL", details: "Detected 'Skills,' 'Experience,' and 'Education.' Optimal for ATS." },
            { label: "Action Verbs Usage", status: resumeText.includes("Managed") ? "GOOD" : "NEEDS_IMPROVEMENT", details: "Used 'Developed' and 'Managed,' but need more quantifiable verbs." },
            { label: "Formatting Style", status: "PASS", details: "Clean, single-column layout assumed." },
        ];
        
        const matchedSkills = targetRole.keywords.filter(k => resumeText.toLowerCase().includes(k.toLowerCase()));
        const missingSkills = targetRole.keywords.filter(k => !resumeText.toLowerCase().includes(k.toLowerCase()));
        
        const roleComparison = {
            strong: matchedSkills.slice(0, 3), 
            missing: missingSkills.slice(0, 3), 
            improvement: `Add projects showcasing **${missingSkills[0] || 'advanced APIs'}** or quantify your experience with **${matchedSkills[0] || 'key technologies'}** to improve the match.`,
        };

        const summary = `Results-driven **${targetRole.title}** with 3+ years of hands-on experience in **${matchedSkills.slice(0, 3).join(', ')}**. Proven ability to deliver high-quality, scalable code solutions, focusing on user experience and architectural efficiency.`; // Renamed aiSummary to summary
        
        const originalExperience = "Worked on frontend, implementing new features that boosted user engagement.";
        
        const actionPlan = [
            `Add 2-3 quantifiable achievements to your **Experience** section.`,
            `Include links to your **GitHub** and **LinkedIn** for professional verification.`,
            `Integrate the missing technical keywords: **${missingSkills.slice(0, 3).join(', ')}** into relevant bullet points.`,
        ];

        const trendSuggestions = [
            { trend: "ML Integration", suggestion: "Consider adding keywords like **LangChain** or **Vector DB** if applicable." },
        ];

        await new Promise(resolve => setTimeout(resolve, 1500));

        setResult({
            score: baseScore,
            atsFactors,
            roleComparison,
            summary, // Updated here
            actionPlan,
            readabilityScore,
            originalExperience,
            trendSuggestions
        });
        setLoading(false);
    };
    
    // --- Helper Functions (No changes needed) ---
    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-400 border-green-600 shadow-green-800/60";
        if (s >= 50) return "text-yellow-400 border-yellow-600 shadow-yellow-800/60";
        return "text-red-400 border-red-600 shadow-red-800/60";
    }

    const renderATSFactors = (factors) => (
        <ul className="space-y-3">
            {factors.map((factor, i) => (
                <li key={i} className="flex items-start bg-gray-900/70 p-3 rounded-lg border border-gray-700/50">
                    {factor.status === 'PASS' || factor.status === 'EXCELLENT' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                        <strong className="text-gray-200">{factor.label}: </strong>
                        <span className={`${factor.status === 'PASS' || factor.status === 'EXCELLENT' ? 'text-green-300' : 'text-yellow-300'} font-medium`}>
                            {factor.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{factor.details}</p>
                    </div>
                </li>
            ))}
        </ul>
    );

    const FeatureCard = ({ icon: Icon, title, description, colorClass = "text-cyan-400" }) => (
        <div className="p-4 bg-gray-800/70 rounded-xl border border-gray-700/50 transition-all duration-300 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-900/30">
            <Icon className={`w-8 h-8 ${colorClass} mx-auto mb-2`} />
            <h5 className="font-bold text-gray-200 text-md">{title}</h5>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
    );
    
    const TabButton = ({ title, icon: Icon, isActive, onClick, disabled = false }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                isActive
                    ? 'text-teal-400 border-b-2 border-teal-400 bg-gray-700/50'
                    : 'text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {title}
        </button>
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    }

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen bg-animated-mesh p-4 sm:p-8 flex items-start justify-center relative vignette-bg font-sans">
            <GlobalStyle />
            {errorState && (
                <div className="fixed top-4 right-4 p-4 bg-red-700 text-white rounded-lg shadow-xl flex items-center z-50">
                    <X className="w-5 h-5 mr-2" />
                    {errorState}
                </div>
            )}

            <div
                className="bg-gray-800 p-6 sm:p-10 rounded-[28px] max-w-6xl w-full my-12 backdrop-blur-sm 
                            border-2 border-indigo-700/60 shadow-[0_0_100px_rgba(20,184,240,0.3),_0_0_30px_rgba(100,116,139,0.7)] relative" 
            >
                
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <HardHat className="w-8 h-8 text-white drop-shadow-lg p-3 bg-indigo-700 rounded-full mb-3 shadow-xl shadow-indigo-500/80" />
                    <h3 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400 
                                            drop-shadow-[0_0_10px_rgba(40,150,255,0.7)]">
                            Career Suite Dashboard
                        </span>
                    </h3>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="mb-8 border-b border-gray-700/50">
                    <div className="flex space-x-4">
                        <TabButton title="Resume Analysis" icon={BarChart} isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                        <TabButton title="Resume Polisher" icon={Code} isActive={activeTab === 'polisher'} onClick={() => setActiveTab('polisher')} disabled={!result} />
                        <TabButton title="Interview Coach" icon={Mic} isActive={activeTab === 'coach'} onClick={() => setActiveTab('coach')} disabled={true} />
                    </div>
                </div>

                {/* --- TAB CONTENT AREA --- */}

                {/* 1. Resume Analysis */}
                {activeTab === 'analysis' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        
                        {/* Input & Upload Area */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="md:col-span-1 p-4 bg-gray-900 rounded-xl border border-indigo-600/50 shadow-inner shadow-gray-950/50">
                                <label className="block text-sm font-medium text-indigo-400 mb-2 flex items-center"><Target className="w-4 h-4 mr-2" /> Target Job Role</label>
                                <select
                                    value={targetRole.title}
                                    onChange={(e) => {
                                        setTargetRole(MOCK_TARGET_ROLES.find(r => r.title === e.target.value));
                                        setResult(null); 
                                    }}
                                    className="w-full bg-gray-700 text-gray-100 py-2.5 px-3 rounded-lg border border-indigo-500/50 focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
                                    disabled={loading}
                                >
                                    {MOCK_TARGET_ROLES.map(role => (
                                        <option key={role.title} value={role.title}>{role.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 relative input-glow-border">
                                <label
                                    className={`flex flex-col items-center justify-center w-full h-full min-h-[120px] border-2 border-dashed rounded-xl cursor-pointer bg-gray-800 transition-all duration-300 group ${loading ? 'opacity-50 cursor-wait' : 'border-cyan-500/80 hover:bg-gray-700/50'}`}
                                >
                                    <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition mb-1" />
                                    <span className="text-cyan-300 font-semibold text-base">
                                        {fileName ? `File: ${fileName}` : "Upload PDF Resume"}
                                    </span>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {loading ? "Processing..." : resumeText ? "File parsed. Ready to analyze." : "Click or drag here (PDF only)."}
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFile}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Score Button */}
                        <div className="flex justify-center mb-10">
                            <motion.button
                                onClick={handleScore}
                                disabled={loading || !resumeText}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-2/3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-teal-600/40 hover:shadow-indigo-500/60 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Running Full Analysis...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-6 h-6 fill-white" />
                                        RUN FULL ANALYSIS
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Analysis Results */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                className="bg-gray-900 p-6 sm:p-8 rounded-2xl border-2 border-teal-700/30 shadow-2xl shadow-teal-900/40"
                            >
                                <h4 className="text-3xl font-bold text-teal-400 mb-6 border-b border-indigo-700/50 pb-2">
                                    Analysis Report: {targetRole.title} Match
                                </h4>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Left: Score, Readability, ATS */}
                                    <div className="lg:col-span-1 space-y-6">
                                        {/* ATS Compatibility Score */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 text-center shadow-lg">
                                            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">ATS Compatibility Score</p>
                                            <div className={`inline-flex items-center justify-center w-36 h-36 mx-auto rounded-full bg-gray-950 border-4 ${getScoreColor(result.score)} shadow-2xl ${result.score >= 80 ? 'score-neon-pulse' : ''}`}>
                                                <span className={`text-6xl font-black ${getScoreColor(result.score)}`}>{result.score}</span>
                                                <span className={`text-2xl ${getScoreColor(result.score)} mt-5`}>/100</span>
                                            </div>
                                        </div>
                                        
                                        {/* Grammar, Readability & Clarity Score (D) */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-teal-500/50 shadow-lg">
                                            <h5 className="text-lg font-bold text-teal-300 mb-3 flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> Clarity & Readability</h5>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                <p><strong className="text-indigo-300">Readability Ease:</strong> {result.readabilityScore.ease}% (Good)</p>
                                                <p><strong className="text-indigo-300">Clarity Score:</strong> {result.readabilityScore.clarityScore}/100</p>
                                            </div>
                                        </div>
                                        
                                        {/* ATS Factor Breakdown */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 shadow-lg">
                                            <h5 className="text-lg font-bold text-cyan-300 mb-3 flex items-center"><Sliders className="w-5 h-5 mr-2" /> ATS Format Check</h5>
                                            {renderATSFactors(result.atsFactors)}
                                        </div>
                                    </div>
                                    
                                    {/* Right: Comparison, Summary, Action Plan */}
                                    <div className="lg:col-span-2 space-y-6">

                                        {/* Job Role Comparison */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-teal-500/50 shadow-lg">
                                            <h5 className="text-lg font-bold text-teal-300 mb-4 flex items-center"><BarChart className="w-5 h-5 mr-2" /> Job Role Comparison</h5>
                                            <p className="mt-4 text-sm text-indigo-300 border-t border-gray-700 pt-3">
                                                💬 **Suggested Improvement:** <span dangerouslySetInnerHTML={{ __html: result.roleComparison.improvement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            </p>
                                        </div>

                                        {/* Resume Summary Generator */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 shadow-lg">
                                            <h5 className="text-lg font-bold text-cyan-300 mb-3 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Resume Summary Generator</h5>
                                            <div className="relative p-3 bg-gray-900 border border-gray-700 rounded-lg">
                                                <p className="text-gray-300 italic text-sm" dangerouslySetInnerHTML={{ __html: result.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                <button 
                                                    onClick={() => copyToClipboard(result.summary.replace(/\*\*(.*?)\*\*/g, '$1'))} 
                                                    className="absolute top-2 right-2 text-cyan-500 hover:text-cyan-300 p-1 rounded transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Personalized Action Plan */}
                                        <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 shadow-lg">
                                            <h5 className="text-xl font-bold text-indigo-300 mb-3 border-b border-gray-700 pb-2 flex items-center"><Repeat2 className="w-5 h-5 mr-2" /> Personalized Action Plan</h5>
                                            <ul className="space-y-3">
                                                {result.actionPlan.map((step, i) => (
                                                    <li key={i} className="flex items-start text-sm text-gray-200">
                                                        <span className="text-indigo-400 font-extrabold mr-3 flex-shrink-0">🧩</span>
                                                        <span dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* 2. Resume Polisher (A & B) */}
                {activeTab === 'polisher' && result && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4 className="text-2xl font-bold text-teal-400 mb-6">Rewriter & Language Optimizer</h4>
                        
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Control Panel */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Language Optimizer (B) */}
                                <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 shadow-lg">
                                    <h5 className="text-lg font-bold text-cyan-300 mb-3 flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> Tone Optimizer</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TONE_OPTIONS.map(tone => (
                                            <button
                                                key={tone}
                                                onClick={() => setSelectedTone(tone)}
                                                className={`py-2 text-sm rounded-lg border transition-all duration-200 ${
                                                    selectedTone === tone 
                                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Translation Assistant (C) - Conceptual */}
                                <div className="p-4 bg-gray-800 rounded-xl border border-indigo-500/50 shadow-lg opacity-50 cursor-not-allowed">
                                    <h5 className="text-lg font-bold text-cyan-300 mb-3 flex items-center"><Globe className="w-5 h-5 mr-2" /> Translation Assistant (WIP)</h5>
                                    <select disabled className="w-full bg-gray-700 text-gray-400 py-2.5 px-3 rounded-lg border border-gray-600 cursor-not-allowed">
                                        <option>English ⇄ German (DeepL API)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Rewriter Output */}
                            <div className="lg:col-span-2 space-y-6">
                                <h5 className="text-xl font-bold text-indigo-300 mb-3">Rewriter (Section: Experience)</h5>
                                
                                {/* Original Text */}
                                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 shadow-inner">
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Original (Example from Resume)</p>
                                    <p className="text-gray-200 italic">{result.originalExperience}</p>
                                </div>

                                {/* Rewritten Text (A) */}
                                <div className="p-4 bg-gray-950 rounded-lg border-2 border-teal-500/70 shadow-2xl shadow-teal-900/50 relative">
                                    <p className="text-sm font-semibold text-teal-300 mb-2">Rewritten Output ({selectedTone} Tone)</p>
                                    <p className="text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: getRewrittenExperience(selectedTone, targetRole.title).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    
                                    <button 
                                        onClick={() => copyToClipboard(getRewrittenExperience(selectedTone, targetRole.title).replace(/\*\*(.*?)\*\*/g, '$1'))} 
                                        className="absolute top-4 right-4 text-teal-400 hover:text-teal-200 p-1"
                                        title="Copy to Clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button className="bg-gradient-to-r from-pink-600 to-red-600 text-white py-2 px-6 rounded-xl font-bold shadow-lg shadow-pink-600/40 opacity-50 cursor-not-allowed" disabled>
                                        Apply to Resume Builder (WIP)
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}

                {/* 3. Interview Coach (Conceptual View) */}
                {activeTab === 'coach' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-gray-700/50 rounded-xl text-center border-4 border-dashed border-cyan-500/50">
                        <Mic className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                        <h4 className="text-2xl font-bold text-white mb-2">Interview Coach 🤖</h4>
                        <p className="text-gray-300 mb-4">
                            Select **Technical, HR, or Company-Specific** mode to start a live voice-supported simulation. Get real-time feedback and a confidence score after each answer.
                        </p>
                        <p className="text-sm text-yellow-400">**(Module requires voice and real-time API support.)**</p>
                    </motion.div>
                )}
                
                {/* --- RELATED ADD-ON FEATURES (Conceptual Section) --- */}
                <div className="mt-16 pt-8 border-t border-gray-700">
                    <h4 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Career Suite: Specialized Tools</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <FeatureCard icon={BookOpen} title="Interview Coach" description="Simulate HR, Technical, or Behavioral interviews." colorClass="text-pink-400" />
                        <FeatureCard icon={Target} title="Job Match Engine" description="Paste a JD for instant matching score and missing keywords." colorClass="text-green-400" />
                        <FeatureCard icon={FileText} title="Cover Letter Customizer" description="Generate tailored letters for any job title in minutes." colorClass="text-yellow-400" />
                        <FeatureCard icon={Sliders} title="Skill Evaluator" description="Quizzes for Python/React/etc. to rate your skills (1-5 stars)." colorClass="text-purple-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}