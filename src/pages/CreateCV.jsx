import React, { useState, useCallback, useRef, useEffect } from "react";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, Trash2, Download, Eye, EyeOff, Code, Palette, Type, LayoutGrid, Sun, Moon, RotateCcw } from "lucide-react";

// NOTE: For this to work, you must have run 'npm install jspdf html2canvas'
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Utility function to format dates for display
const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
        const [year, month] = dateString.split('-');
        if (year && month) {
            return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
            });
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
};

// --- CONFIGURATION OBJECTS ---
const THEMES = {
    'Blue (Corporate)': '#2563EB', // blue-600
    'Green (Modern)': '#10B981', // green-500
    'Red (Creative)': '#EF4444', // red-500
    'Black/White (Minimal)': '#374151', // gray-700
};

const FONTS = {
    'Roboto': 'Roboto, sans-serif',
    'Poppins': 'Poppins, sans-serif',
    'Lato': 'Lato, sans-serif',
    'Inter': 'Inter, sans-serif',
    'Merriweather': 'Merriweather, serif',
};

const DEFAULT_CUSTOMIZATION = {
    accentColor: THEMES['Blue (Corporate)'],
    fontFamily: FONTS['Roboto'],
    layout: 'Two-column', // Options: 'One-column', 'Two-column'
    mode: 'Light', // Options: 'Light', 'Dark'
};

// --- Customization Panel Component ---
const CustomizationPanel = ({ customization, onCustomizationChange, onRestoreDefault }) => {

    const colorClasses = (color) => `w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-150 ${customization.accentColor === color ? 'ring-4 ring-offset-2 ring-offset-gray-900 ring-white' : 'border-gray-500 hover:ring-2 hover:ring-gray-400'}`;
    const fontButtonClass = (font) => `px-3 py-1 text-sm rounded transition-all duration-150 border ${customization.fontFamily === font ? 'bg-cyan-600 text-white border-cyan-500 shadow-md' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`;
    const layoutButtonClass = (layout) => `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 border ${customization.layout === layout ? 'bg-teal-600 text-white border-teal-500 shadow-md' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`;
    
    return (
        <div className="p-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 sticky top-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-red-400" /> Customize Resume
            </h3>

            {/* Color Picker */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center"><Palette className="w-4 h-4 mr-1 text-cyan-400" /> Accent Color</p>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(THEMES).map(([name, hex]) => (
                        <div key={name} className="flex flex-col items-center">
                            <div
                                style={{ backgroundColor: hex }}
                                className={colorClasses(hex)}
                                onClick={() => onCustomizationChange('accentColor', hex)}
                                title={name}
                            ></div>
                            <span className="text-xs text-gray-400 mt-1" style={{ color: customization.accentColor === hex ? hex : 'inherit' }}>{name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Font Options */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center"><Type className="w-4 h-4 mr-1 text-cyan-400" /> Font Family</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(FONTS).map(([name, css]) => (
                        <button
                            key={name}
                            onClick={() => onCustomizationChange('fontFamily', css)}
                            className={fontButtonClass(css)}
                            style={{ fontFamily: css }}
                        >
                            Aa {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Styles */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center"><LayoutGrid className="w-4 h-4 mr-1 text-cyan-400" /> Layout Style</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCustomizationChange('layout', 'One-column')}
                        className={layoutButtonClass('One-column')}
                    >
                        1-Column (Classic)
                    </button>
                    <button
                        onClick={() => onCustomizationChange('layout', 'Two-column')}
                        className={layoutButtonClass('Two-column')}
                    >
                        2-Column (Modern)
                    </button>
                </div>
            </div>
            
            {/* Dark/Light Mode */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-300 mb-2 flex items-center"><Sun className="w-4 h-4 mr-1 text-cyan-400" /> Theme Mode</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCustomizationChange('mode', 'Light')}
                        className={layoutButtonClass('Light')}
                    >
                        <Sun className="w-4 h-4 mr-1" /> Light
                    </button>
                    <button
                        onClick={() => onCustomizationChange('mode', 'Dark')}
                        className={layoutButtonClass('Dark')}
                    >
                        <Moon className="w-4 h-4 mr-1" /> Dark
                    </button>
                </div>
            </div>

            {/* Restore Button */}
            <button
                onClick={onRestoreDefault}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
            >
                <RotateCcw className="w-4 h-4" /> Restore Default
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// --- Sub-Component: CV Preview (Wrapped with forwardRef and Customization) ---
// ----------------------------------------------------------------------
const CVPreview = React.forwardRef(({ data, customization }, ref) => {
    const { personal, skills, experience, education } = data;
    const { accentColor, fontFamily, layout, mode } = customization;

    const skillsArray = (skills.content || '').split('\n').filter(s => s.trim() !== '');
    
    // Conditional Classes based on customization
    const previewContainerClasses = `
        ${mode === 'Dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
        p-8 sm:p-12 lg:p-16 shadow-2xl rounded-xl min-h-[90vh] transition-all duration-300 
        ${layout === 'Two-column' ? 'grid md:grid-cols-3 gap-8' : ''}
    `;

    const accentTextColor = { color: accentColor };
    const accentBorderColor = { borderColor: accentColor };
    const baseTextColor = mode === 'Dark' ? 'text-white' : 'text-gray-900';
    const subTextColor = mode === 'Dark' ? 'text-gray-400' : 'text-gray-700';
    const sectionBgColor = mode === 'Dark' ? 'bg-gray-700' : 'bg-gray-100';
    const sectionDividerColor = mode === 'Dark' ? 'border-gray-600' : 'border-gray-300';

    // Apply font family globally to the CV container
    const previewStyle = { 
        fontFamily: fontFamily, 
        '--primary-color': accentColor, // Set CSS variable for use in dynamic borders/backgrounds
    };
    
    const SectionHeader = ({ icon: Icon, title }) => (
        <h2 
            className={`text-2xl font-bold ${baseTextColor} border-b-2 ${sectionDividerColor} pb-1 mb-3 flex items-center gap-2`}
            style={accentTextColor}
        >
            <Icon size={20} style={accentTextColor} /> {title}
        </h2>
    );

    const ContactInfo = () => (
        <div className={`flex flex-wrap text-sm ${subTextColor} mt-2 gap-x-4`}>
            <span className="flex items-center gap-1">
                <Mail size={14} style={accentTextColor} />
                {personal.email || "email@example.com"}
            </span>
            <span className="flex items-center gap-1">
                <Phone size={14} style={accentTextColor} />
                {personal.phone || "(123) 456-7890"}
            </span>
            <span className="flex items-center gap-1">
                <MapPin size={14} style={accentTextColor} />
                {personal.location || "City, Country"}
            </span>
        </div>
    );
    
    // --- Layout Rendering Logic ---
    
    const mainContent = (
        <div className={`${layout === 'Two-column' ? 'md:col-span-2' : ''}`}>
            {/* Experience/Projects Section */}
            <section className="mb-6">
                <SectionHeader icon={Briefcase} title="PROJECTS / PROFESSIONAL EXPERIENCE" />
                {experience.length > 0 ? (
                    experience.map((exp, index) => (
                        <div key={index} className={`mb-4 last:mb-0 p-3 ${sectionBgColor} rounded-lg`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`text-lg font-semibold ${baseTextColor}`}>{exp.jobTitle || "Project Title"}</h3>
                                    <p className="font-medium" style={accentTextColor}>{exp.company || "Company/Context"}</p>
                                </div>
                                <p className={`text-sm ${subTextColor} font-mono text-right`}>
                                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                                </p>
                            </div>
                            <p className={`text-sm ${subTextColor} mt-2 whitespace-pre-wrap`}>{exp.description || "Key responsibilities and achievements."}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">No experience/projects added yet.</p>
                )}
            </section>
            
            {/* Education Section */}
            <section>
                <SectionHeader icon={GraduationCap} title="EDUCATION" />
                {education.length > 0 ? (
                    education.map((edu, index) => (
                        <div key={index} className={`mb-4 last:mb-0 p-3 ${sectionBgColor} rounded-lg`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`text-lg font-semibold ${baseTextColor}`}>{edu.degree || "Degree Name"}</h3>
                                    <p className="font-medium" style={accentTextColor}>{edu.institution || "Institution Name"}</p>
                                </div>
                                <p className={`text-sm ${subTextColor} font-mono text-right`}>
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
    
    const sidebarContent = (
        <div className={`md:col-span-1 ${layout === 'Two-column' ? 'order-first' : 'hidden'}`}>
            {/* Skills Section - Only in 2-Column layout */}
            <section className="mb-6">
                <SectionHeader icon={Code} title="SKILLS" />
                {skillsArray.length > 0 ? (
                    <ul className={`text-sm ${subTextColor} list-none pl-0`}>
                        {skillsArray.map((skill, index) => (
                            <li key={index} className="flex items-start mb-1 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:mr-2 before:mt-1.5" style={{...accentTextColor, '--tw-text-opacity': 1, backgroundColor: accentColor}}>
                                <span className={subTextColor} style={{...accentTextColor, color: 'inherit'}}>{skill}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                )}
            </section>
        </div>
    );

    const skillsOneColumn = (
        <section className={`mb-6 ${layout === 'One-column' ? '' : 'hidden'}`}>
            <SectionHeader icon={Code} title="SKILLS" />
            {skillsArray.length > 0 ? (
                <div className={`text-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 ${subTextColor}`}>
                    {skillsArray.map((skill, index) => (
                        <div key={index} className="font-medium flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full mr-2" style={{backgroundColor: accentColor}}></span>
                            {skill}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm italic">No skills added yet.</p>
            )}
        </section>
    );

    return (
        <div ref={ref} className={previewContainerClasses} style={previewStyle}>
            {/* Header always goes here */}
            <header className={`pb-4 mb-4 border-b-4 ${layout === 'Two-column' ? 'md:col-span-3' : ''}`} style={accentBorderColor}>
                <h1 className={`text-4xl font-extrabold ${baseTextColor} tracking-tight`}>{personal.name || "Full Name"}</h1>
                <p className="text-xl font-medium" style={accentTextColor}>{personal.title || "Professional Title"}</p>
                <ContactInfo />
            </header>

            {/* Layout Switcher */}
            {layout === 'Two-column' && (
                <>
                    {sidebarContent}
                    {mainContent}
                </>
            )}
            
            {layout === 'One-column' && (
                <div className=''>
                    {skillsOneColumn}
                    {mainContent}
                </div>
            )}
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
// --- Main Component: CV Builder ---
// ----------------------------------------------------------------------
const CVBuilder = () => {
    
    const initialPersonalState = { name: '', title: '', email: '', phone: '', location: '', summary: '', };
    const initialSkills = { content: "", }
    const initialExperience = [];
    const initialEducation = [];


    const [data, setData] = useState({
        personal: initialPersonalState,
        skills: initialSkills,
        experience: initialExperience,
        education: initialEducation
    });

    // New state for customization
    const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
    
    const [showPreview, setShowPreview] = useState(false);
    const cvRef = useRef(null); 
    const [isLibraryReady, setIsLibraryReady] = useState(false);

    // Handles changes from the Customization Panel
    const handleCustomizationChange = useCallback((key, value) => {
        setCustomization(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleRestoreDefault = useCallback(() => {
        setCustomization(DEFAULT_CUSTOMIZATION);
    }, []);

    // Check for PDF libraries
    useEffect(() => {
        let interval;
        const checkLibraries = () => {
            const h2cReady = typeof html2canvas === 'function' || typeof window.html2canvas === 'function';
            const jsPDFReady = typeof jsPDF === 'function' || (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function');
            if (h2cReady && jsPDFReady) {
                setIsLibraryReady(true);
                clearInterval(interval);
            }
        };
        interval = setInterval(checkLibraries, 200);
        checkLibraries();
        return () => clearInterval(interval);
    }, []);


    const handlePersonalChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(prevData => ({
            ...prevData,
            personal: { ...prevData.personal, [name]: value }
        }));
    }, []);

    const handleSkillsChange = useCallback((e) => {
        setData(prevData => ({
            ...prevData,
            skills: { ...prevData.skills, content: e.target.value }
        }));
    }, []);

    // --- Download Functionality (Modified to handle Light Mode for printing) ---
    const handleDownloadCV = useCallback(() => {
        if (!isLibraryReady) {
            console.error('PDF libraries not ready, aborting download.');
            return;
        }

        const html2canvasFunc = typeof html2canvas === 'function' ? html2canvas : window.html2canvas;
        const jsPDFFunc = typeof jsPDF === 'function' ? jsPDF : window.jspdf.jsPDF;

        const input = cvRef.current;
        if (!input || !html2canvasFunc || !jsPDFFunc) {
             console.error('CV element or PDF library not found.');
             return;
        }

        // TEMPORARY FORCED LIGHT MODE FOR PRINTING
        const originalCustomization = customization;
        setCustomization(prev => ({ ...prev, mode: 'Light' }));

        // Wait a tick for React to render the forced Light Mode
        setTimeout(() => {
            html2canvasFunc(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDFFunc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = pdfWidth / imgWidth;
                const finalHeight = imgHeight * ratio;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);

                const filename = `${(data.personal.name || 'CV').replace(/\s/g, '_')}_CV.pdf`;
                pdf.save(filename);
                
                // RESTORE ORIGINAL CUSTOMIZATION
                setCustomization(originalCustomization);

            }).catch(error => {
                console.error("Error generating PDF:", error);
                // RESTORE ORIGINAL CUSTOMIZATION on error
                setCustomization(originalCustomization);
            });
        }, 50); // Small delay to ensure render finishes
    }, [data.personal.name, isLibraryReady, customization]);


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
                Build your CV
            </h1>

            <div className="max-w-7xl mx-auto flex gap-6">
                
                {/* Left Side: Form or Full Preview */}
                <div className="flex-grow">
                    {/* EDIT MODE: Input Form */}
                    {!showPreview && (
                        <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 transition-all duration-300">
                            <form className="space-y-6">
                                <h2 className="text-2xl font-bold text-cyan-400 border-b border-gray-600 pb-2 mb-4">Personal Information</h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" name="name" placeholder="Full Name" className={darkInputClasses} value={data.personal.name} onChange={handlePersonalChange} />
                                    <input type="text" name="title" placeholder="Professional Title" className={darkInputClasses} value={data.personal.title} onChange={handlePersonalChange} />
                                    <input type="email" name="email" placeholder="Email Address" className={darkInputClasses} value={data.personal.email} onChange={handlePersonalChange} />
                                    <input type="tel" name="phone" placeholder="Phone Number" className={darkInputClasses} value={data.personal.phone} onChange={handlePersonalChange} />
                                    <input type="text" name="location" placeholder="Location (City, State/Country)" className={darkInputClasses + " sm:col-span-2"} value={data.personal.location} onChange={handlePersonalChange} />
                                </div>

                                {/* Skills Input Section */}
                                <div>
                                    <label className="block text-2xl font-bold text-cyan-400 border-b border-gray-600 pb-2 mb-4">SKILLS</label>
                                    <textarea
                                        name="skills"
                                        rows="6"
                                        placeholder="Enter skills, one item per line. (e.g., JavaScript, React, Python)"
                                        className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:ring-cyan-400 focus:border-cyan-400 transition-shadow resize-none"
                                        value={data.skills.content}
                                        onChange={handleSkillsChange}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Each line break will create a new item in the preview.</p>
                                </div>

                                {/* Experience/Projects Section */}
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
                                    {isLibraryReady ? 'Download CV (PDF)' : 'Download/PDF Library Not Ready'}
                                </button>
                            </div>
                            {/* The actual CV Preview component, passing the ref and customization */}
                            <CVPreview data={data} ref={cvRef} customization={customization} />
                        </div>
                    )}
                </div>

                {/* Right Side: Customization Panel (Always visible next to the form) */}
                {!showPreview && (
                    <div className="w-full max-w-xs hidden lg:block flex-shrink-0">
                        <CustomizationPanel 
                            customization={customization}
                            onCustomizationChange={handleCustomizationChange}
                            onRestoreDefault={handleRestoreDefault}
                        />
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
    // Inject custom fonts for the preview panel
    const fontStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Poppins:wght@400;600;700&family=Roboto:wght@400;700&display=swap');
    `;
    
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
            <script src="https://cdn.tailwindcss.com"></script>
            <CVBuilder />
        </>
    );
};

export default App;