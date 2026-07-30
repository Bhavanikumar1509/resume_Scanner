import React, { useState } from 'react';
import { ResumeData, PortalType } from '../types';
import { 
  Search, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2 
} from 'lucide-react';

interface ParserSimulatorProps {
  resume: ResumeData;
}

export const ParserSimulator: React.FC<ParserSimulatorProps> = ({ resume }) => {
  const [activePortal, setActivePortal] = useState<PortalType>('workday');
  const [copied, setCopied] = useState(false);

  const portalDetails = {
    workday: {
      name: 'Workday Recruiting Parser',
      description: 'Strict schema parsing. Extracts structured candidate profiles into Workday fields.',
      accuracyRating: '98% Parsed'
    },
    greenhouse: {
      name: 'Greenhouse Candidate Indexer',
      description: 'Focuses on experience chronology, social profile links, and key skill tags.',
      accuracyRating: '99% Parsed'
    },
    lever: {
      name: 'Lever Talent Database Parser',
      description: 'Scans for candidate summaries, recent role keywords, and boolean search terms.',
      accuracyRating: '96% Parsed'
    },
    taleo: {
      name: 'Taleo Legacy Parsing Engine',
      description: 'Rigid ASCII text extraction requiring standard section headers and dates.',
      accuracyRating: '94% Parsed'
    }
  };

  const handleCopyRaw = () => {
    const raw = `
NAME: ${resume.personalInfo.fullName}
TITLE: ${resume.personalInfo.jobTitle}
EMAIL: ${resume.personalInfo.email}
PHONE: ${resume.personalInfo.phone}
LOCATION: ${resume.personalInfo.location}
LINKEDIN: ${resume.personalInfo.linkedin}

SUMMARY:
${resume.summary}

WORK EXPERIENCE:
${resume.workExperience.map(e => `${e.company} | ${e.position} | ${e.startDate} - ${e.endDate}\n${e.bullets.map(b => '* ' + b).join('\n')}`).join('\n\n')}

SKILLS:
${(resume.skills.hardSkills || []).join(', ')}

EDUCATION:
${resume.education.map(e => `${e.institution} - ${e.degree} in ${e.fieldOfStudy} (${e.startDate} - ${e.endDate})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Portal Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">ATS Automated Parser Simulation</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            See exactly how automated screening systems extract your candidate data into recruiter database fields.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['workday', 'greenhouse', 'lever', 'taleo'] as PortalType[]).map(p => (
            <button
              key={p}
              onClick={() => setActivePortal(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                activePortal === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p} Engine
            </button>
          ))}
        </div>
      </div>

      {/* Active Engine Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">{portalDetails[activePortal].name}</p>
            <p className="text-xs text-slate-300 mt-0.5">{portalDetails[activePortal].description}</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{portalDetails[activePortal].accuracyRating}</span>
        </span>
      </div>

      {/* Extracted Fields Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Parsed Structured Contact & Attributes */}
        <div className="space-y-6">
          
          {/* Contact Fields Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Extracted Contact Fields</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">Candidate Name</span>
                <span className="font-bold text-slate-900">{resume.personalInfo.fullName || '—'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">Primary Job Title</span>
                <span className="font-bold text-slate-900">{resume.personalInfo.jobTitle || '—'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">Email Address</span>
                <span className="font-bold text-indigo-600">{resume.personalInfo.email || '—'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">Phone Number</span>
                <span className="font-bold text-slate-900">{resume.personalInfo.phone || '—'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">Location</span>
                <span className="font-bold text-slate-900">{resume.personalInfo.location || '—'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xs font-bold uppercase text-slate-400 block">LinkedIn Profile</span>
                <span className="font-bold text-slate-900">{resume.personalInfo.linkedin || '—'}</span>
              </div>
            </div>
          </div>

          {/* Extracted Skills Tags Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Extracted Skill Search Index Tags</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {[...(resume.skills.hardSkills || []), ...(resume.skills.toolsAndFrameworks || [])].map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-2xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Extracted Education Credentials</span>
            </h4>

            <div className="space-y-2 text-xs">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600 mt-0.5">{edu.institution} ({edu.startDate} – {edu.endDate})</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Work History Chronology & Raw Parser Stream */}
        <div className="space-y-6">
          
          {/* Work History Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Extracted Employment Chronology</span>
            </h4>

            <div className="space-y-3">
              {resume.workExperience.map((exp, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{exp.position}</p>
                      <p className="text-slate-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-3xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>

                  <p className="text-2xs text-slate-600 line-clamp-2 leading-relaxed">
                    {exp.bullets.join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Text Stream Output */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Raw Parser ASCII Stream</span>
              </div>

              <button
                onClick={handleCopyRaw}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-2xs font-semibold transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Raw Text'}</span>
              </button>
            </div>

            <pre className="text-3xs font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto text-emerald-400 leading-relaxed max-h-72">
{`NAME: ${resume.personalInfo.fullName}
TITLE: ${resume.personalInfo.jobTitle}
EMAIL: ${resume.personalInfo.email}
PHONE: ${resume.personalInfo.phone}
LOCATION: ${resume.personalInfo.location}

--- SUMMARY ---
${resume.summary}

--- WORK HISTORY (${resume.workExperience.length} entries) ---
${resume.workExperience.map(e => `[${e.startDate} - ${e.endDate}] ${e.position} @ ${e.company}\n${e.bullets.map(b => '  - ' + b).join('\n')}`).join('\n\n')}

--- SKILLS (${(resume.skills.hardSkills || []).length} keywords) ---
${(resume.skills.hardSkills || []).join(', ')}`}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
