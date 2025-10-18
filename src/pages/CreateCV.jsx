import React, { useState, useCallback, useRef, useEffect } from "react";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Trash2, Download, Eye, EyeOff, Code } from "lucide-react";

// NOTE: For this to work, you must have run 'npm install jspdf html2canvas'
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Utility function to format dates for display
const formatDate = (dateString) => {
  if (!dateString) return 'Present';
  try {
    // The month input type returns YYYY-MM, so we format it for display
    const [year, month] = dateString.split('-');
    if (year && month) {
        return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    }
    return dateString; // Fallback for incomplete date strings
  } catch (e) {
    return dateString; // Fallback for invalid date strings
  }
};

// ----------------------------------------------------------------------
// --- Sub-Component: CV Preview (Wrapped with forwardRef) ---
// ----------------------------------------------------------------------
const CVPreview = React.forwardRef(({ data }, ref) => {
  const { personal, skills, experience, education } = data;

  // Function to split skills string into an array, removing empty lines
  const skillsArray = (skills.content || '').split('\n').filter(s => s.trim() !== '');

  return (
    // The ref is attached to this main container div
    <div ref={ref} className="bg-gray-800 p-8 sm:p-12 lg:p-16 shadow-2xl rounded-xl min-h-[90vh] transition-all duration-300 text-white">
      <header className="pb-4 mb-4 border-b-4 border-cyan-400">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{personal.name || "Full Name"}</h1>
        <p className="text-xl text-cyan-400 font-medium">{personal.title || "Professional Title"}</p>
        <div className="flex flex-wrap text-sm text-gray-400 mt-2 gap-x-4">
          <span className="flex items-center gap-1">
            <Mail size={14} className="text-cyan-400" />
            {personal.email || "email@example.com"}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={14} className="text-cyan-400" />
            {personal.phone || "(123) 456-7890"}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-cyan-400" />
            {personal.location || "City, Country"}
          </span>
        </div>
      </header>

      {/* Skills Section - Moved to top, below contact info */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-white border-b-2 border-gray-600 pb-1 mb-3 flex items-center gap-2">
          <Code size={20} className="text-cyan-400" /> SKILLS
        </h2>
        {skillsArray.length > 0 ? (
            <div className="text-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
                {skillsArray.map((skill, index) => (
                    <div key={index} className="text-gray-300 font-medium">{skill}</div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 text-sm italic">No skills added yet.</p>
        )}
      </section>

      {/* Experience (Renamed to Projects) - Placed after Skills */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-white border-b-2 border-gray-600 pb-1 mb-3 flex items-center gap-2">
          <Briefcase size={20} className="text-cyan-400" /> PROJECTS / PROFESSIONAL EXPERIENCE
          {experience.length === 0 && <span className="text-gray-500 text-sm italic font-normal ml-2">Click "Add Entry" to begin!</span>}
          </h2>
        {experience.length > 0 ? (
          experience.map((exp, index) => (
            <div key={index} className="mb-4 last:mb-0 p-3 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exp.jobTitle || "Project Title"}</h3>
                  <p className="text-cyan-400 font-medium">{exp.company || "Company/Context"}</p>
                </div>
                <p className="text-sm text-gray-400 font-mono text-right">
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </p>
              </div>
              <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{exp.description || "Key responsibilities and achievements."}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No experience/projects added yet.</p>
        )}
      </section>

      {/* Education - Remains at the bottom */}
      <section>
        <h2 className="text-2xl font-bold text-white border-b-2 border-gray-600 pb-1 mb-3 flex items-center gap-2">
          <GraduationCap size={20} className="text-cyan-400" /> EDUCATION
          {education.length === 0 && <span className="text-gray-500 text-sm italic font-normal ml-2">Click "Add Entry" to begin!</span>}
        </h2>
        {education.length > 0 ? (
          education.map((edu, index) => (
            <div key={index} className="mb-4 last:mb-0 p-3 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{edu.degree || "Degree Name"}</h3>
                  <p className="text-cyan-400 font-medium">{edu.institution || "Institution Name"}</p>
                </div>
                <p className="text-sm text-gray-400 font-mono text-right">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No education added yet.</p>
        )}
      </section>
    </div>
  );
});

CVPreview.displayName = 'CVPreview';

// ----------------------------------------------------------------------
// --- Sub-Component: Dynamic Form Field (Experience/Education) ---
// ----------------------------------------------------------------------
const DynamicFields = ({ title, items, setItem, addItem, removeItem, fields }) => {

  const handleFieldChange = useCallback((index, field, value) => {
    setItem(prevItems => prevItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  }, [setItem]);

  // Common input classes for dark theme
  const darkInputClasses = "mt-1 block w-full rounded-md border-gray-600 bg-gray-900 text-white shadow-sm focus:border-cyan-400 focus:ring-cyan-400 sm:text-sm p-2 transition-shadow";

  return (
    <div className="p-4 border border-gray-700 rounded-xl bg-gray-800 shadow-inner mb-6">
      <h3 className="text-xl font-semibold mb-3 text-cyan-400">{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-600 rounded-lg bg-gray-700 relative">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 rounded-full transition-colors"
            // ✅ FIXED: Replaced unclosed template literal with correct template string
            title={`Remove ${title} entry`}
          >
            <Trash2 size={16} />
          </button>
          {fields.map(field => (
            <div key={field.name} className="mb-2">
              <label className="block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className={darkInputClasses + " resize-none"}
                  rows="3"
                  value={item[field.name] || ''}
                  onChange={(e) => handleFieldChange(index, field.name, e.target.value)}
                />
              ) : (
                <input
                  type={field.type}
                  className={darkInputClasses}
                  value={item[field.name] || ''}
                  onChange={(e) => handleFieldChange(index, field.name, e.target.value)}
                />
              )}
        </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-md"
      >
        <Plus size={16} /> Add {title} Entry
      </button>
    </div>
  );
};

// ----------------------------------------------------------------------
// --- Main Component: CV Builder (Acts as the 'create cv' component logic) ---
// ----------------------------------------------------------------------
const CVBuilder = () => {
  
  const initialPersonalState = {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  };

  const initialSkills = {
      content: "",
  }

  const initialExperience = [];

  const initialEducation = [];


  const [data, setData] = useState({
    personal: initialPersonalState,
    skills: initialSkills,
    experience: initialExperience,
    education: initialEducation
  });
  
  const [showPreview, setShowPreview] = useState(false);
  
  const cvRef = useRef(null); 

  // State to check if libraries are ready.
  const [isLibraryReady, setIsLibraryReady] = useState(false);

  // Robust check for library availability using both imports and global window objects
  useEffect(() => {
    let interval;
    
    const checkLibraries = () => {
        // Check for the function from the import AND the window object (for CDN fallbacks)
        const h2cReady = typeof html2canvas === 'function' || typeof window.html2canvas === 'function';
        // Check for the function from the import AND the window object (for CDN fallbacks)
        const jsPDFReady = typeof jsPDF === 'function' || (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function');

        if (h2cReady && jsPDFReady) {
            setIsLibraryReady(true);
            clearInterval(interval);
        }
    };
    
    interval = setInterval(checkLibraries, 200);
    checkLibraries(); // Initial check
    return () => clearInterval(interval); // Cleanup
  }, []);


  const handlePersonalChange = useCallback((e) => {
    const { name, value } = e.target;
    setData(prevData => ({
      ...prevData,
      personal: {
        ...prevData.personal,
        [name]: value
      }
    }));
  }, []);

  const handleSkillsChange = useCallback((e) => {
    setData(prevData => ({
      ...prevData,
      skills: {
        ...prevData.skills,
        content: e.target.value
      }
    }));
  }, []);

  // --- Download Functionality ---
  const handleDownloadCV = useCallback(() => {
    // Safety check
    if (!isLibraryReady) {
        console.error('PDF libraries not ready, aborting download.');
        return;
    }

    // Use the imported function reference or fall back to the window object
    const html2canvasFunc = typeof html2canvas === 'function' ? html2canvas : window.html2canvas;
    const jsPDFFunc = typeof jsPDF === 'function' ? jsPDF : window.jspdf.jsPDF;

    const input = cvRef.current;

    if (input && html2canvasFunc && jsPDFFunc) {
      // Store original styles to restore them later
      const originalStyle = input.style.cssText;
      
      // TEMPORARY STYLE OVERRIDES FOR PDF READABILITY
      input.style.cssText += 'background-color: #ffffff !important; color: #000000 !important;'; 
      
      const textElements = input.querySelectorAll('.text-white, .text-gray-400, .text-gray-300');
      const originalTextColors = [];
      textElements.forEach(el => {
        originalTextColors.push({ el, color: el.style.color });
        el.style.color = '#000000';
      });
      
      const grayBoxes = input.querySelectorAll('.bg-gray-700');
      const originalBoxColors = [];
      grayBoxes.forEach(el => {
        originalBoxColors.push({ el, bg: el.style.backgroundColor });
        el.style.backgroundColor = '#f3f4f6';
      });

      // Convert the HTML element to a canvas
      html2canvasFunc(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        // Initialize jsPDF
        const pdf = new jsPDFFunc({ 
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        const finalHeight = imgHeight * ratio;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);

        // Download the PDF
        // ✅ FIXED: Replaced unclosed template literal with correct template string
        const filename = `${(data.personal.name || 'CV').replace(/\s/g, '_')}_CV.pdf`;
        pdf.save(filename);
        
        // Restore the original styles after generation
        input.style.cssText = originalStyle;
        originalTextColors.forEach(item => item.el.style.color = item.color);
        originalBoxColors.forEach(item => item.el.style.backgroundColor = item.bg);
        
      }).catch(error => {
        console.error("Error generating PDF:", error);
        // Restore styles on error
        if(input) {
            input.style.cssText = originalStyle;
            originalTextColors.forEach(item => item.el.style.color = item.color);
            originalBoxColors.forEach(item => item.el.style.backgroundColor = item.bg);
        }
      });
    } else {
        console.error('CV element or PDF library not found.');
    }
  }, [data.personal.name, isLibraryReady]);


  // --- Experience/Projects Handlers ---
  const addExperience = useCallback(() => {
    setData(prevData => ({
      ...prevData,
      experience: [...prevData.experience, { jobTitle: '', company: '', startDate: '', endDate: '', description: '' }]
    }));
  }, []);

  const removeExperience = useCallback((index) => {
    setData(prevData => ({
      ...prevData,
      experience: prevData.experience.filter((_, i) => i !== index)
    }));
  }, []);

  // --- Education Handlers ---
  const addEducation = useCallback(() => {
    setData(prevData => ({
      ...prevData,
      education: [...prevData.education, { degree: '', institution: '', startDate: '', endDate: '' }]
    }));
  }, []);

  const removeEducation = useCallback((index) => {
    setData(prevData => ({
      ...prevData,
      education: prevData.education.filter((_, i) => i !== index)
    }));
  }, []);

  // Define fields for dynamic components
  const experienceFields = [
    { name: 'jobTitle', label: 'Project/Job Title', type: 'text' },
    { name: 'company', label: 'Client/Context (Optional)', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'month' },
    { name: 'endDate', label: 'End Date (Leave blank for present)', type: 'month' },
    { name: 'description', label: 'Key Achievements & Tech', type: 'textarea' },
  ];

  const educationFields = [
    { name: 'degree', label: 'Degree/Field of Study', type: 'text' },
    { name: 'institution', label: 'Institution', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'month' },
    { name: 'endDate', label: 'End Date (Leave blank for present)', type: 'month' },
  ];

  // Common input classes for dark theme
  const darkInputClasses = "p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-cyan-400 focus:border-cyan-400 transition-shadow";
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 font-['Inter']">
      <h1 className="text-3xl font-extrabold text-white mb-6 text-center">
        Build your cv 
      </h1>

      <div className="max-w-7xl mx-auto">
        {/* EDIT MODE: Input Form (Full width) */}
        {!showPreview && (
            <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 transition-all duration-300">
                <form className="space-y-6">
                    <h2 className="text-2xl font-bold text-cyan-400 border-b border-gray-600 pb-2 mb-4">Personal Information</h2>
                    
                    {/* Personal Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className={darkInputClasses}
                            value={data.personal.name}
                            onChange={handlePersonalChange}
                        />
                        <input
                            type="text"
                            name="title"
                            placeholder="Professional Title"
                            className={darkInputClasses}
                            value={data.personal.title}
                            onChange={handlePersonalChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className={darkInputClasses}
                            value={data.personal.email}
                            onChange={handlePersonalChange}
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            className={darkInputClasses}
                            value={data.personal.phone}
                            onChange={handlePersonalChange}
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="Location (City, State/Country)"
                            className={darkInputClasses + " sm:col-span-2"}
                            value={data.personal.location}
                            onChange={handlePersonalChange}
                        />
                    </div>

                    {/* Skills Input Section */}
                    <div>
                        <label className="block text-2xl font-bold text-cyan-400 border-b border-gray-600 pb-2 mb-4">SKILLS</label>
                        <textarea
                            name="skills"
                            rows="6"
                            placeholder="Enter skills, one category or item per line. (e.g., Programming: Python, Frameworks: Django)"
                            className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-cyan-400 focus:border-cyan-400 transition-shadow resize-none"
                            value={data.skills.content}
                            onChange={handleSkillsChange}
                        />
                        <p className="text-xs text-gray-400 mt-1">Each line break will create a new item in the preview.</p>
                    </div>

                    {/* Experience/Projects Section (Title updated) */}
                    <DynamicFields
                        title="Projects / Professional Experience"
                        items={data.experience}
                        setItem={(updater) => setData(prev => ({ ...prev, experience: updater(prev.experience) }))}
                        addItem={addExperience}
                        removeItem={removeExperience}
                        fields={experienceFields}
                    />

                    {/* Education Section */}
                    <DynamicFields
                        title="Education"
                        items={data.education}
                        setItem={(updater) => setData(prev => ({ ...prev, education: updater(prev.education) }))}
                        addItem={addEducation}
                        removeItem={removeEducation}
                        fields={educationFields}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {/* Preview CV Button (Green) */}
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-colors shadow-lg bg-green-600 hover:bg-green-700"
                        >
                            <Eye size={20} /> Preview CV (Full Screen)
                        </button>
                    
                        {/* Download Button */}
                        <button
                            type="button" 
                            onClick={handleDownloadCV}
                            disabled={!isLibraryReady}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-colors shadow-lg 
                                ${isLibraryReady ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'}`}
                        >
                            <Download size={20} /> 
                            {isLibraryReady ? 'Download CV (PDF)' : 'Loading PDF Libraries...'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* PREVIEW MODE: CV Preview (Full width) */}
        {showPreview && (
            <div className="w-full">
                <div className="mb-6 flex justify-center space-x-4 relative z-10">
                    <button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-lg"
                    >
                        <EyeOff size={20} /> Hide Preview (Go Back to Form)
                    </button>
                    {/* Download Button */}
                    <button
                        type="button" 
                        onClick={handleDownloadCV}
                        disabled={!isLibraryReady}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-colors shadow-lg 
                            ${isLibraryReady ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'}`}
                    >
                        <Download size={20} /> 
                        {isLibraryReady ? 'Download CV (PDF)' : 'Loading PDF Libraries...'}
                    </button>
                </div>
                {/* The actual CV Preview component, passing the ref */}
                <CVPreview data={data} ref={cvRef} />
            </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// --- App Component (The required file structure container) ---
// ----------------------------------------------------------------------
const App = () => {
  return (
    <>
      {/* NOTE: If you are using a modern React setup (like Vite/CRA), 
          you should install Tailwind via NPM instead of using the CDN script here. 
          However, since it was in your original code, it is preserved here. 
          The PDF libraries are now imported via NPM at the top. */}
      <script src="https://cdn.tailwindcss.com"></script>
      <CVBuilder />
    </>
  );
};

export default App;