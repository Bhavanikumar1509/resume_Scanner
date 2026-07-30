import React, { useState, useRef } from 'react';
import { ResumeData, WorkExperience, Education, Certification, Project } from '../types';
import { extractTextFromFile } from '../utils/fileExtractor';
import { SectionReorderer } from './SectionReorderer';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Award, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileSearch, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface CommaSeparatedInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  isTextarea?: boolean;
}

const CommaSeparatedInput: React.FC<CommaSeparatedInputProps> = ({
  value,
  onChange,
  placeholder,
  rows = 2,
  className,
  isTextarea = true
}) => {
  const [localText, setLocalText] = useState(() => (value || []).join(', '));

  React.useEffect(() => {
    const parsedCurrent = localText.split(',').map(s => s.trim()).filter(Boolean);
    const targetArr = value || [];
    if (JSON.stringify(parsedCurrent) !== JSON.stringify(targetArr)) {
      setLocalText(targetArr.join(', '));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    setLocalText(rawVal);
    const parsed = rawVal.split(',').map(s => s.trim()).filter(Boolean);
    onChange(parsed);
  };

  if (isTextarea) {
    return (
      <textarea
        rows={rows}
        value={localText}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <input
      type="text"
      value={localText}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  onEnhanceBullet: (bullet: string, position: string) => Promise<string | null>;
  onParseRawText: (rawText: string) => Promise<boolean>;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onChange,
  onEnhanceBullet,
  onParseRawText
}) => {
  const [activeSection, setActiveSection] = useState<'contact' | 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications' | 'reorder' | 'import'>('contact');
  const [rawTextImport, setRawTextImport] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [enhancingBulletIndex, setEnhancingBulletIndex] = useState<{ expId: string; index: number } | null>(null);

  // Helper updates
  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value
      }
    });
  };

  const updateSummary = (summary: string) => {
    onChange({ ...resume, summary });
  };

  // Certification Helpers
  const addCertification = () => {
    const newCert: Certification = {
      id: 'cert-' + Date.now(),
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialId: ''
    };
    onChange({
      ...resume,
      certifications: [...(resume.certifications || []), newCert]
    });
  };

  const updateCertificationField = (id: string, field: keyof Certification, value: string) => {
    onChange({
      ...resume,
      certifications: (resume.certifications || []).map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const deleteCertification = (id: string) => {
    onChange({
      ...resume,
      certifications: (resume.certifications || []).filter(c => c.id !== id)
    });
  };

  // Project Helpers
  const addProject = () => {
    const newProject: Project = {
      id: 'proj-' + Date.now(),
      title: 'New Key Project',
      role: 'Lead Developer / Architect',
      link: 'github.com/username/project',
      bullets: ['Engineered high-performance web solution with responsive interface.'],
      techStack: ['React', 'TypeScript', 'Node.js']
    };
    onChange({
      ...resume,
      projects: [newProject, ...(resume.projects || [])]
    });
  };

  const updateProjectField = (id: string, field: keyof Project, value: any) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const updateProjectBullet = (projId: string, bulletIdx: number, text: string) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).map(p => {
        if (p.id !== projId) return p;
        const newBullets = [...p.bullets];
        newBullets[bulletIdx] = text;
        return { ...p, bullets: newBullets };
      })
    });
  };

  const addProjectBullet = (projId: string) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).map(p => {
        if (p.id !== projId) return p;
        return { ...p, bullets: [...p.bullets, 'Designed CI/CD automated deployment pipeline.'] };
      })
    });
  };

  const removeProjectBullet = (projId: string, bulletIdx: number) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).map(p => {
        if (p.id !== projId) return p;
        return { ...p, bullets: p.bullets.filter((_, i) => i !== bulletIdx) };
      })
    });
  };

  const deleteProject = (id: string) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).filter(p => p.id !== id)
    });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu: Education = {
      id: 'edu-' + Date.now(),
      institution: 'University Name',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      location: 'City, State',
      startDate: '2020',
      endDate: '2024',
      gpa: '3.8 / 4.0'
    };
    onChange({
      ...resume,
      education: [...(resume.education || []), newEdu]
    });
  };

  const deleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: (resume.education || []).filter(e => e.id !== id)
    });
  };

  // Work Experience Helpers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: 'exp-' + Date.now(),
      company: 'New Company',
      position: 'Job Title',
      location: 'City, State',
      startDate: '01/2023',
      endDate: 'Present',
      isCurrent: true,
      bullets: ['Achieved quantifiable success by leading key operational projects.']
    };
    onChange({
      ...resume,
      workExperience: [newExp, ...resume.workExperience]
    });
  };

  const updateExpField = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const updateBullet = (expId: string, bulletIdx: number, text: string) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.map(exp => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = text;
        return { ...exp, bullets: newBullets };
      })
    });
  };

  const addBullet = (expId: string) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.map(exp => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: [...exp.bullets, 'Achieved metric performance improvement using specialized tools.'] };
      })
    });
  };

  const removeBullet = (expId: string, bulletIdx: number) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.map(exp => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIdx) };
      })
    });
  };

  const deleteExperience = (id: string) => {
    onChange({
      ...resume,
      workExperience: resume.workExperience.filter(e => e.id !== id)
    });
  };

  // AI Enhance Single Bullet
  const handleEnhanceClick = async (expId: string, bulletIdx: number, bulletText: string, jobTitle: string) => {
    setEnhancingBulletIndex({ expId, index: bulletIdx });
    const enhanced = await onEnhanceBullet(bulletText, jobTitle);
    if (enhanced) {
      updateBullet(expId, bulletIdx, enhanced);
    }
    setEnhancingBulletIndex(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Raw Text Import
  const handleRawTextSubmit = async () => {
    if (!rawTextImport.trim()) return;
    setIsParsing(true);
    const success = await onParseRawText(rawTextImport);
    setIsParsing(false);
    if (success) {
      setActiveSection('contact');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsParsing(true);
      try {
        const text = await extractTextFromFile(file);
        setRawTextImport(text);
        const success = await onParseRawText(text);
        if (success) {
          setActiveSection('contact');
        }
      } catch (err) {
        console.error('File import error:', err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Section Switcher Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 p-2 gap-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveSection('contact')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'contact' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>

        <button
          onClick={() => setActiveSection('summary')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'summary' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveSection('experience')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'experience' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({resume.workExperience.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('skills')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'skills' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => setActiveSection('education')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'education' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education</span>
        </button>

        <button
          onClick={() => setActiveSection('certifications')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'certifications' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Certifications ({(resume.certifications || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSection('projects')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSection === 'projects' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:bg-slate-100'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({(resume.projects || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSection('reorder')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap bg-blue-50/70 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold ${
            activeSection === 'reorder' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : ''
          }`}
        >
          <GripVertical className="w-3.5 h-3.5" />
          <span>Reorder Sections</span>
        </button>

        <button
          onClick={() => setActiveSection('import')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ml-auto bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold`}
        >
          <FileSearch className="w-3.5 h-3.5 text-blue-600" />
          <span>Import Resume</span>
        </button>
      </div>

      <div className="p-6">
        
        {/* SECTION: Reorder Sections (Drag & Drop) */}
        {activeSection === 'reorder' && (
          <SectionReorderer resume={resume} onChange={onChange} />
        )}
        
        {/* SECTION: Contact Info */}
        {activeSection === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Contact Details & Header Info</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title *</label>
                <input
                  type="text"
                  value={resume.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="alex.vance@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location (City, State / Country) *</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile Link</label>
                <input
                  type="text"
                  value={resume.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/alexvance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile Link</label>
                <input
                  type="text"
                  value={resume.personalInfo.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="github.com/alexvance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Summary */}
        {activeSection === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Professional Summary</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {resume.summary.split(/\s+/).filter(Boolean).length} / 120 words (30-100 recommended)
              </span>
            </div>

            <textarea
              rows={5}
              value={resume.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Provide a 3-4 sentence high-impact summary highlighting your title, core skills, key achievements, and primary metrics..."
              className="w-full p-3 border border-slate-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        )}

        {/* SECTION: Work Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span>Work Experience</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">List roles reverse-chronologically. Front-load each bullet point with an action verb.</p>
              </div>

              <button
                onClick={addExperience}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-6">
              {resume.workExperience.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative">
                  <button
                    onClick={() => deleteExperience(exp.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Experience Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExpField(exp.id, 'company', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Position / Job Title *</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExpField(exp.id, 'position', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">Start Date (MM/YYYY) *</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExpField(exp.id, 'startDate', e.target.value)}
                        placeholder="03/2023"
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-semibold text-slate-600 mb-1">End Date (MM/YYYY or Present)</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExpField(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Achievement Bullets ({exp.bullets.length})</label>
                      <button
                        onClick={() => addBullet(exp.id)}
                        className="text-2xs text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    {exp.bullets.map((bullet, bIdx) => {
                      const isEnhancingThis = enhancingBulletIndex?.expId === exp.id && enhancingBulletIndex?.index === bIdx;

                      return (
                        <div key={bIdx} className="flex items-start space-x-2">
                          <span className="text-slate-400 mt-2 text-xs font-bold">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs leading-relaxed"
                          />
                          <button
                            disabled={isEnhancingThis}
                            onClick={() => handleEnhanceClick(exp.id, bIdx, bullet, exp.position)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-2xs font-bold transition-all flex items-center space-x-1 shrink-0"
                            title="AI Polish Bullet with Metrics & Action Verbs"
                          >
                            {isEnhancingThis ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                            <span>AI Polish</span>
                          </button>
                          <button
                            onClick={() => removeBullet(exp.id, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Skills */}
        {activeSection === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              <span>Skills & Technical Categorization</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hard Skills (Comma-separated)
              </label>
              <CommaSeparatedInput
                rows={3}
                value={resume.skills.hardSkills || []}
                onChange={(items) => onChange({
                  ...resume,
                  skills: {
                    ...resume.skills,
                    hardSkills: items
                  }
                })}
                placeholder="TypeScript, Node.js, React, PostgreSQL, REST APIs, Microservices..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tools & Frameworks (Comma-separated)
              </label>
              <CommaSeparatedInput
                rows={3}
                value={resume.skills.toolsAndFrameworks || []}
                onChange={(items) => onChange({
                  ...resume,
                  skills: {
                    ...resume.skills,
                    toolsAndFrameworks: items
                  }
                })}
                placeholder="AWS, Docker, Kubernetes, Git, Jira, Redis, Kafka..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Methodologies & Soft Skills (Comma-separated)
              </label>
              <CommaSeparatedInput
                rows={2}
                value={resume.skills.softSkills || []}
                onChange={(items) => onChange({
                  ...resume,
                  skills: {
                    ...resume.skills,
                    softSkills: items
                  }
                })}
                placeholder="Technical Leadership, Cross-Functional Leadership, Agile/Scrum, Problem Solving..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SECTION: Education */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Education & Credentials</span>
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education Entry</span>
              </button>
            </div>

            {(!resume.education || resume.education.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Education Entries Added</p>
                <button
                  onClick={addEducation}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education Entry</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {resume.education.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative">
                    <button
                      onClick={() => deleteEducation(edu.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Education Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="sm:col-span-2">
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Institution *</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].institution = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. Stanford University"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Degree *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].degree = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. Bachelor of Science"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Field of Study *</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].fieldOfStudy = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. Computer Science"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">GPA (Optional)</label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].gpa = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. 3.8 / 4.0 or Magna Cum Laude"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Location (Optional)</label>
                        <input
                          type="text"
                          value={edu.location || ''}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].location = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. Stanford, CA"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].startDate = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. 2018"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">End Date / Graduation</label>
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => {
                            const newEdu = [...resume.education];
                            newEdu[idx].endDate = e.target.value;
                            onChange({ ...resume, education: newEdu });
                          }}
                          placeholder="e.g. 2022"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Certifications */}
        {activeSection === 'certifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Certifications & Industry Badges</span>
              </h3>
              <button
                onClick={addCertification}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </div>

            {(!resume.certifications || resume.certifications.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <Award className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700">No Certifications Added Yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Adding industry certifications (AWS, Scrum, PMP, Cisco, Google, etc.) boosts ATS compliance filters for specialized roles.
                </p>
                <button
                  onClick={addCertification}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Certification</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(resume.certifications || []).map((cert) => (
                  <div key={cert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                    <button
                      onClick={() => deleteCertification(cert.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Certification Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="sm:col-span-2">
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Certification Name *</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertificationField(cert.id, 'name', e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect – Associate"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Issuing Organization *</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertificationField(cert.id, 'issuer', e.target.value)}
                          placeholder="e.g. Amazon Web Services / Scrum.org"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Issue Date / Year</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateCertificationField(cert.id, 'date', e.target.value)}
                          placeholder="e.g. 11/2023 or 2024"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Credential ID / Verification URL (Optional)</label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => updateCertificationField(cert.id, 'credentialId', e.target.value)}
                          placeholder="e.g. Credly link or ID # AWS-8921039"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Key Projects */}
        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                <span>Key Projects & Portfolio Highlights</span>
              </h3>
              <button
                onClick={addProject}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Key Project</span>
              </button>
            </div>

            {(!resume.projects || resume.projects.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Key Projects Added Yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Adding 1 to 3 key projects demonstrates practical impact, coding expertise, and modern tool proficiency.
                </p>
                <button
                  onClick={addProject}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Project Entry</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {(resume.projects || []).map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative">
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Project Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Project Name / Title *</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateProjectField(proj.id, 'title', e.target.value)}
                          placeholder="e.g. AI Content Generator App"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Role / Subheading</label>
                        <input
                          type="text"
                          value={proj.role}
                          onChange={(e) => updateProjectField(proj.id, 'role', e.target.value)}
                          placeholder="e.g. Lead Full-Stack Architect"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Project Link / GitHub URL</label>
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={(e) => updateProjectField(proj.id, 'link', e.target.value)}
                          placeholder="github.com/username/project"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-slate-600 mb-1">Technologies Used (Comma-separated)</label>
                        <CommaSeparatedInput
                          value={proj.techStack || []}
                          onChange={(items) => updateProjectField(proj.id, 'techStack', items)}
                          isTextarea={false}
                          placeholder="React, TypeScript, Node.js, Tailwind"
                          className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Project Highlights & Impact ({proj.bullets.length})</label>
                        <button
                          onClick={() => addProjectBullet(proj.id)}
                          className="text-2xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {proj.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start space-x-2">
                          <span className="text-slate-400 mt-2 text-xs font-bold">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateProjectBullet(proj.id, bIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs leading-relaxed"
                          />
                          <button
                            onClick={() => removeProjectBullet(proj.id, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Import Unstructured Resume Text */}
        {activeSection === 'import' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-base">
              <FileSearch className="w-5 h-5 text-blue-600" />
              <span>Import & AI Auto-Parse Existing Resume</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your existing PDF or Word file or paste your resume text below. Gemini AI will automatically extract and structure your Contact, Work History, Skills, and Education into standard ATS compliant fields.
            </p>

            {/* File Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl p-5 text-center cursor-pointer transition-all"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.txt,.rtf"
                className="hidden"
              />
              <div className="flex items-center justify-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Click to upload PDF or Word document (.pdf, .docx, .txt)</p>
                  <p className="text-2xs text-slate-500">Auto-extracts text and maps all fields automatically</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 my-2">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">OR PASTE RAW TEXT</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <textarea
              rows={6}
              value={rawTextImport}
              onChange={(e) => setRawTextImport(e.target.value)}
              placeholder="Paste your existing resume text here..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono leading-relaxed"
            />

            <button
              disabled={isParsing || !rawTextImport.trim()}
              onClick={handleRawTextSubmit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Resume via Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Structure Text Into ATS Form</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
