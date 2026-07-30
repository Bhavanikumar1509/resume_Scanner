import React, { useState, useMemo, useEffect } from 'react';
import { ResumeData, OverallAtsReport, JobDescriptionMatch } from './types';
import { SAMPLE_RESUMES } from './data/sampleResumes';
import { runFullAtsScan } from './utils/atsChecker';
import { heuristicParseResumeText } from './utils/heuristicParser';
import { exportToPdf, exportToDocx, exportToPlainText } from './utils/exporters';
import { auth, onAuthStateChanged, User } from './lib/firebase';
import { Header } from './components/Header';
import { AtsExplanationBanner } from './components/AtsExplanationBanner';
import { ResumeActionBanner } from './components/ResumeActionBanner';
import { UploadResumeModal } from './components/UploadResumeModal';
import { AuthModal } from './components/AuthModal';
import { SavedResumesModal } from './components/SavedResumesModal';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { AtsCheckerPanel } from './components/AtsCheckerPanel';
import { ParserSimulator } from './components/ParserSimulator';
import { JobTailorModal } from './components/JobTailorModal';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'checker' | 'parser' | 'tailor' | 'dashboard'>('editor');
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUMES[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedResumesModalOpen, setIsSavedResumesModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('resumeup_custom_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        const stored = localStorage.getItem('resumeup_custom_user');
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute 28-point ATS Scan Report
  const atsReport: OverallAtsReport = useMemo(() => {
    return runFullAtsScan(resume);
  }, [resume]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export handlers
  const handleExportPdf = async () => {
    try {
      showToast('Generating high-resolution vector PDF...');
      const fileName = `${(resume.personalInfo.fullName || 'Resume').trim().replace(/\s+/g, '_')}_Resume.pdf`;
      await exportToPdf('resume-preview-document', fileName, resume);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PDF.');
    }
  };

  const handleExportDocx = async () => {
    try {
      showToast('Generating editable Word .docx document...');
      await exportToDocx(resume, `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.docx`);
      showToast('Word (.docx) document exported successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export DOCX.');
    }
  };

  const handleExportTxt = () => {
    try {
      exportToPlainText(resume, `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.txt`);
      showToast('Plain text (.txt) exported!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export TXT.');
    }
  };

  // Load demo data
  const handleLoadDemo = () => {
    const nextIdx = (SAMPLE_RESUMES.findIndex(r => r.id === resume.id) + 1) % SAMPLE_RESUMES.length;
    setResume(SAMPLE_RESUMES[nextIdx]);
    showToast(`Loaded ${SAMPLE_RESUMES[nextIdx].title}`);
  };

  // Clear / Remove Current Resume
  const handleClearResume = () => {
    setResume({
      id: 'resume-blank-' + Date.now(),
      title: 'Blank Resume',
      lastUpdated: new Date().toISOString().split('T')[0],
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
      },
      summary: '',
      workExperience: [],
      education: [],
      skills: {
        hardSkills: [],
        softSkills: [],
        toolsAndFrameworks: [],
        languages: []
      },
      certifications: [],
      projects: [],
      templateId: 'classic-ats',
      fontFamily: 'Calibri',
      fontSize: 'standard',
      pageMargin: 'standard'
    });
    showToast('Resume cleared! Ready for new upload or custom details.');
  };

  // Server API: AI Bullet Enhancement
  const handleEnhanceBullet = async (bullet: string, position: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/gemini/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet,
          jobTitle: position,
          targetKeywords: resume.skills.hardSkills
        })
      });

      const json = await res.json();
      if (json.success && json.data?.enhanced) {
        showToast('Bullet point polished with action verbs & metrics!');
        return json.data.enhanced;
      }
    } catch (err) {
      console.error('Enhance bullet error:', err);
    }
    return null;
  };

  // Server API: AI Raw Text Resume Parsing (with Heuristic Fallback)
  const handleParseRawText = async (rawText: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/gemini/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setResume(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: d.personalInfo?.fullName || prev.personalInfo.fullName,
              jobTitle: d.personalInfo?.jobTitle || prev.personalInfo.jobTitle,
              email: d.personalInfo?.email || prev.personalInfo.email,
              phone: d.personalInfo?.phone || prev.personalInfo.phone,
              location: d.personalInfo?.location || prev.personalInfo.location,
              linkedin: d.personalInfo?.linkedin || prev.personalInfo.linkedin
            },
            summary: d.summary || prev.summary,
            workExperience: (d.workExperience && d.workExperience.length) ? d.workExperience.map((e: any, idx: number) => ({
              id: 'exp-' + idx,
              company: e.company || 'Company',
              position: e.position || 'Role',
              location: e.location || '',
              startDate: e.startDate || '01/2021',
              endDate: e.endDate || 'Present',
              isCurrent: Boolean(e.isCurrent),
              bullets: e.bullets || ['Delivered key business initiatives.']
            })) : prev.workExperience,
            skills: {
              hardSkills: d.skills?.hardSkills || prev.skills.hardSkills,
              softSkills: d.skills?.softSkills || prev.skills.softSkills,
              toolsAndFrameworks: d.skills?.toolsAndFrameworks || prev.skills.toolsAndFrameworks,
              languages: d.skills?.languages || prev.skills.languages
            }
          }));

          showToast('Resume parsed with Gemini AI into ATS fields!');
          return true;
        }
      }
    } catch (err) {
      console.warn('API Parse raw text warning, using heuristic parser:', err);
    }

    // Resilient Fallback Heuristic Parsing
    try {
      setResume(prev => heuristicParseResumeText(rawText, prev));
      showToast('Resume content parsed & structured into ATS fields!');
      return true;
    } catch (fallbackErr) {
      console.error('Fallback parse error:', fallbackErr);
      showToast('Could not structure text automatically. Please paste sections into editor.');
      return false;
    }
  };

  // Server API: AI Job Description Tailoring
  const handleAnalyzeJd = async (jobDescription: string): Promise<JobDescriptionMatch | null> => {
    try {
      const res = await fetch('/api/gemini/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          jobDescription
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        showToast('Job description analyzed for keyword gaps!');
        return json.data;
      }
    } catch (err) {
      console.error('Analyze JD error:', err);
      showToast('Failed to analyze job description.');
    }
    return null;
  };

  // Apply Tailoring
  const handleApplyTailoring = (
    tailoredSummary?: string,
    tailoredBullets?: JobDescriptionMatch['tailoredBullets']
  ) => {
    setResume(prev => {
      let updatedSummary = prev.summary;
      if (tailoredSummary) {
        updatedSummary = tailoredSummary;
      }

      let updatedExp = [...prev.workExperience];
      if (tailoredBullets && tailoredBullets.length > 0) {
        tailoredBullets.forEach(tb => {
          if (updatedExp[tb.experienceIndex]) {
            const exp = updatedExp[tb.experienceIndex];
            const bulletIdx = exp.bullets.findIndex(b => b === tb.originalBullet);
            if (bulletIdx !== -1) {
              const newBullets = [...exp.bullets];
              newBullets[bulletIdx] = tb.suggestedBullet;
              updatedExp[tb.experienceIndex] = { ...exp, bullets: newBullets };
            }
          }
        });
      }

      return {
        ...prev,
        summary: updatedSummary,
        workExperience: updatedExp
      };
    });

    showToast('Applied tailored summary and keyword bullet optimizations!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        report={atsReport}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        onExportTxt={handleExportTxt}
        onLoadDemo={handleLoadDemo}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSavedResumes={() => setIsSavedResumesModalOpen(true)}
        currentUser={currentUser}
        resumeTitle={resume.title}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Quick Action Workflow Accelerator Banner */}
        <ResumeActionBanner
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenTailor={() => setActiveTab('tailor')}
          onOpenChecker={() => setActiveTab('checker')}
          currentName={resume.personalInfo.fullName}
          jobCount={resume.workExperience.length}
          skillCount={resume.skills.hardSkills.length + resume.skills.toolsAndFrameworks.length}
        />

        {/* Educational ATS Reality Banner */}
        <AtsExplanationBanner />

        {/* Tab Views */}

        {/* TAB 1: RESUME BUILDER & LIVE PREVIEW */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Editor */}
              <div className="lg:col-span-6 space-y-6">
                <ResumeEditor
                  resume={resume}
                  onChange={setResume}
                  onEnhanceBullet={handleEnhanceBullet}
                  onParseRawText={handleParseRawText}
                />
              </div>

              {/* Live Document Preview */}
              <div className="lg:col-span-6 lg:sticky lg:top-20">
                <ResumePreview
                  resume={resume}
                  onSelectTemplate={(templateId) => setResume(prev => ({ ...prev, templateId }))}
                  onChangeSettings={(updated) => setResume(prev => ({ ...prev, ...updated }))}
                />
              </div>

            </div>

            {/* Prominent Run ATS Scan & Diagnostic Test Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-2xs font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    {atsReport.overallScore}% Overall Score
                  </span>
                  <span className="text-slate-400 text-xs">• 28 Automated Portal Diagnostic Checks</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Ready to test your newly built resume against Workday, Greenhouse & Taleo?
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Run a full structural diagnostic scan to detect parsing errors, missing contact details, bullet action verbs, and section order compliance.
                </p>
              </div>

              <button
                onClick={() => {
                  showToast('Running 28-point Workday, Greenhouse & Taleo ATS diagnostic test...');
                  setActiveTab('checker');
                }}
                className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 border border-blue-400/30 group"
              >
                <span>Run Full ATS Scan & Test</span>
                <span className="bg-white/20 group-hover:translate-x-1 transition-transform p-1 rounded-md">
                  →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 28-CHECK ATS PORTAL SCANNER */}
        {activeTab === 'checker' && (
          <AtsCheckerPanel report={atsReport} />
        )}

        {/* TAB 3: JOB DESCRIPTION TAILORING */}
        {activeTab === 'tailor' && (
          <JobTailorModal
            resume={resume}
            onApplyTailoring={handleApplyTailoring}
            onAnalyzeJd={handleAnalyzeJd}
          />
        )}

        {/* TAB 4: ATS PARSER SIMULATOR */}
        {activeTab === 'parser' && (
          <ParserSimulator resume={resume} />
        )}

        {/* TAB 5: ATS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            report={atsReport}
            resume={resume}
            onNavigate={setActiveTab}
          />
        )}

      </main>

      {/* Modal: Upload & Auto-Fill Resume */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onParseResume={handleParseRawText}
        onNavigateToTab={setActiveTab}
        onClearResume={handleClearResume}
      />

      {/* Modal: Sign In / User Profile Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
        onCustomLogin={(user) => setCurrentUser(user)}
      />

      {/* Modal: Saved Resumes & Cloud Storage */}
      <SavedResumesModal
        isOpen={isSavedResumesModalOpen}
        onClose={() => setIsSavedResumesModalOpen(false)}
        currentUser={currentUser}
        currentResume={resume}
        onLoadResume={setResume}
        onShowToast={showToast}
        onOpenAuth={() => {
          setIsSavedResumesModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

    </div>
  );
}
