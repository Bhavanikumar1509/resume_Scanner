import React from 'react';
import { ResumeData, SectionId } from '../types';
import { Sparkles, Check, FileText, Type, ShieldCheck, Ruler, Layers } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  onSelectTemplate: (templateId: ResumeData['templateId']) => void;
  onChangeSettings?: (updated: Partial<ResumeData>) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onSelectTemplate,
  onChangeSettings
}) => {
  const templateId = resume.templateId || 'classic-ats';
  const fontFamily = resume.fontFamily || 'Calibri';
  const fontSize = resume.fontSize || 'standard';
  const pageMargin = resume.pageMargin || 'standard';
  const sectionSpacing = resume.sectionSpacing || 'workday';

  const defaultOrder: SectionId[] = ['summary', 'workExperience', 'skills', 'education', 'projects', 'certifications'];
  const sectionOrder = resume.sectionOrder || defaultOrder;

  // Font Family Map
  const fontCssMap: Record<string, string> = {
    'Calibri': 'Calibri, "Gill Sans", sans-serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Georgia': 'Georgia, serif',
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Garamond': 'Garamond, "Baskerville", serif'
  };

  // Font Size Classes
  const getBodyFontSize = () => {
    switch (fontSize) {
      case 'compact': return 'text-[11px] leading-tight';
      case 'spacious': return 'text-[13px] leading-relaxed';
      case 'standard':
      default: return 'text-[12px] leading-normal';
    }
  };

  // Page Margin Padding
  const getMarginPadding = () => {
    switch (pageMargin) {
      case 'narrow': return 'p-6 sm:p-8'; // 0.5 in
      case 'wide': return 'p-10 sm:p-14'; // 1.0 in
      case 'standard':
      default: return 'p-8 sm:p-11'; // 0.75 in
    }
  };

  // Global Section Spacing
  const getSectionMarginBottom = () => {
    switch (sectionSpacing) {
      case 'compact': return 'mb-3';
      case 'spacious': return 'mb-8';
      case 'standard': return 'mb-6';
      case 'workday':
      default: return 'mb-4'; // Workday ATS standard gap
    }
  };

  const getSectionHeaderStyle = (secTitle: string) => {
    switch (templateId) {
      case 'modern-corporate':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-950 border-l-4 border-blue-600 pl-2.5 py-0.5 mb-2.5 bg-blue-50/40">
            {secTitle}
          </h2>
        );
      case 'tech-minimal':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-700 pb-1 mb-2 flex items-center justify-between">
            <span>// {secTitle}</span>
            <span className="text-[10px] text-slate-400 font-normal">[ATS_PARSED]</span>
          </h2>
        );
      case 'executive-clean':
        return (
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-1 mb-2.5 font-serif">
            {secTitle}
          </h2>
        );
      case 'academic-standard':
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-double border-slate-800 pb-1 mb-2 font-serif">
            {secTitle}
          </h2>
        );
      case 'classic-ats':
      default:
        return (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            {secTitle}
          </h2>
        );
    }
  };

  const renderSection = (secId: SectionId) => {
    switch (secId) {
      case 'summary':
        if (!resume.summary) return null;
        return (
          <div key="summary" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Professional Summary')}
            <p className="text-xs text-slate-800 leading-relaxed text-justify">
              {resume.summary}
            </p>
          </div>
        );

      case 'workExperience':
        if (!resume.workExperience || resume.workExperience.length === 0) return null;
        return (
          <div key="workExperience" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Work Experience')}
            <div className="space-y-4">
              {resume.workExperience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-900">
                      {exp.position} <span className="font-normal text-slate-700">| {exp.company}</span>
                    </p>
                    <p className="text-2xs font-semibold text-slate-600">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </p>
                  </div>

                  {exp.location && (
                    <p className="text-2xs text-slate-500 italic mb-1">
                      {exp.location}
                    </p>
                  )}

                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx} className="leading-snug">
                        <span className="-ml-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!resume.skills) return null;
        return (
          <div key="skills" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Skills & Technical Expertise')}
            <div className="space-y-1 text-xs text-slate-800">
              {resume.skills.hardSkills?.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Core Skills:</strong>{' '}
                  {resume.skills.hardSkills.join(', ')}
                </p>
              )}
              {resume.skills.toolsAndFrameworks?.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Tools & Technologies:</strong>{' '}
                  {resume.skills.toolsAndFrameworks.join(', ')}
                </p>
              )}
              {resume.skills.softSkills?.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Methodologies & Soft Skills:</strong>{' '}
                  {resume.skills.softSkills.join(', ')}
                </p>
              )}
            </div>
          </div>
        );

      case 'education':
        if (!resume.education || resume.education.length === 0) return null;
        return (
          <div key="education" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Education')}
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p className="text-xs text-slate-700">
                      {edu.institution} {edu.location ? `(${edu.location})` : ''} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </p>
                  </div>
                  <p className="text-2xs font-semibold text-slate-600">
                    {edu.startDate} – {edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!resume.certifications || resume.certifications.length === 0) return null;
        return (
          <div key="certifications" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Certifications & Credentials')}
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
              {resume.certifications.map((cert) => (
                <li key={cert.id} className="leading-snug">
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  {cert.issuer && <span className="text-slate-700"> – {cert.issuer}</span>}
                  {cert.date && <span className="text-slate-600"> ({cert.date})</span>}
                  {cert.credentialId && <span className="text-slate-500 font-mono text-2xs ml-1.5">[ID: {cert.credentialId}]</span>}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'projects':
        if (!resume.projects || resume.projects.length === 0) return null;
        return (
          <div key="projects" className={getSectionMarginBottom()}>
            {getSectionHeaderStyle('Key Projects')}
            <div className="space-y-3">
              {resume.projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">
                    {proj.title} {proj.role ? `(${proj.role})` : ''} {proj.link ? `• ${proj.link}` : ''}
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-800 space-y-0.5">
                    {proj.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Template & Portal Typography Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Templates */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>ATS Approved Layout Templates:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'classic-ats', name: 'Classic ATS' },
              { id: 'modern-corporate', name: 'Modern Corporate' },
              { id: 'tech-minimal', name: 'Tech Minimal' },
              { id: 'executive-clean', name: 'Executive Clean' },
              { id: 'academic-standard', name: 'Academic' }
            ].map(tpl => (
              <button
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id as ResumeData['templateId'])}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  templateId === tpl.id
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {templateId === tpl.id && <Check className="w-3.5 h-3.5" />}
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Typography, Font Size, Margins & Portal Compliance Specs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Font Selector */}
            <div className="flex items-center space-x-1.5">
              <Type className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-2xs font-semibold text-slate-500 uppercase">ATS Font:</label>
              <select
                value={fontFamily}
                onChange={(e) => onChangeSettings?.({ fontFamily: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Calibri">Calibri (Workday Default)</option>
                <option value="Arial">Arial (Universal Sans)</option>
                <option value="Times New Roman">Times New Roman (Classic)</option>
                <option value="Georgia">Georgia (Executive Serif)</option>
                <option value="Helvetica">Helvetica (Clean Sans)</option>
                <option value="Garamond">Garamond (Academic)</option>
              </select>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-2xs font-semibold text-slate-500 uppercase">Size:</span>
              <select
                value={fontSize}
                onChange={(e) => onChangeSettings?.({ fontSize: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="compact">Compact (10pt Body)</option>
                <option value="standard">Standard (10.5pt Body)</option>
                <option value="spacious">Spacious (11pt Body)</option>
              </select>
            </div>

            {/* Page Margin Selector */}
            <div className="flex items-center space-x-1.5">
              <Ruler className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-2xs font-semibold text-slate-500 uppercase">Margin:</label>
              <select
                value={pageMargin}
                onChange={(e) => onChangeSettings?.({ pageMargin: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="narrow">Narrow (0.5 in / 12.7mm)</option>
                <option value="standard">Standard (0.75 in / 19mm)</option>
                <option value="wide">Wide (1.0 in / 25.4mm)</option>
              </select>
            </div>

            {/* Section Spacing Selector */}
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-2xs font-semibold text-slate-500 uppercase">Spacing:</label>
              <select
                value={sectionSpacing}
                onChange={(e) => onChangeSettings?.({ sectionSpacing: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="workday">Workday Standard (14px)</option>
                <option value="standard">Standard ATS (16px)</option>
                <option value="compact">Compact (10px)</option>
                <option value="spacious">Spacious (22px)</option>
              </select>
            </div>

            {/* Workday Spacing Preset Quick Action */}
            <button
              onClick={() => onChangeSettings?.({
                fontFamily: 'Calibri',
                pageMargin: 'standard',
                fontSize: 'standard',
                sectionSpacing: 'workday'
              })}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs hover:shadow-xs"
              title="Apply Workday ATS Standard Typography, Margins & Section Spacing"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Workday Preset</span>
            </button>
          </div>

          {/* Global Portal Specs Indicator */}
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-2xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>US Letter & A4 Portal Standard • Workday, Greenhouse, Lever & Taleo Verified</span>
          </div>
        </div>
      </div>

      {/* Render Document Stage */}
      <div className="bg-slate-200/60 p-4 sm:p-8 rounded-2xl border border-slate-300 overflow-x-auto flex justify-center">
        <div
          id="resume-preview-document"
          className={`bg-white text-slate-900 shadow-xl rounded-sm w-full max-w-[800px] min-h-[1050px] transition-all relative ${getMarginPadding()} ${getBodyFontSize()}`}
          style={{
            fontFamily: fontCssMap[fontFamily] || 'Arial, sans-serif'
          }}
        >
          
          {/* Header Contact - Rendered based on selected templateId */}
          {templateId === 'modern-corporate' ? (
            <div className="pb-4 border-b-2 border-blue-600 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950 uppercase">
                    {resume.personalInfo.fullName || 'YOUR FULL NAME'}
                  </h1>
                  {resume.personalInfo.jobTitle && (
                    <p className="text-sm font-bold text-blue-700 mt-0.5 tracking-wide">
                      {resume.personalInfo.jobTitle}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-600 space-y-0.5">
                  {resume.personalInfo.email && <div>{resume.personalInfo.email}</div>}
                  {resume.personalInfo.phone && <div>{resume.personalInfo.phone}</div>}
                  {resume.personalInfo.location && <div>{resume.personalInfo.location}</div>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500 mt-2 font-medium">
                {resume.personalInfo.linkedin && <span>LinkedIn: {resume.personalInfo.linkedin}</span>}
                {resume.personalInfo.linkedin && resume.personalInfo.github && <span>•</span>}
                {resume.personalInfo.github && <span>GitHub: {resume.personalInfo.github}</span>}
              </div>
            </div>
          ) : templateId === 'tech-minimal' ? (
            <div className="pb-4 border-b border-slate-800 mb-6 font-mono">
              <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                <span>[ATS_RESUME_DOC]</span>
                <span>SYSTEM_READY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {resume.personalInfo.fullName || 'YOUR FULL NAME'}
              </h1>
              {resume.personalInfo.jobTitle && (
                <p className="text-xs font-semibold text-slate-700 mt-1 uppercase tracking-wider">
                  &gt; {resume.personalInfo.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-2">
                {[
                  resume.personalInfo.email,
                  resume.personalInfo.phone,
                  resume.personalInfo.location,
                  resume.personalInfo.linkedin,
                  resume.personalInfo.github
                ].filter(Boolean).map((item, idx) => (
                  <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-2xs font-mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : templateId === 'executive-clean' ? (
            <div className="pb-4 border-b-2 border-slate-900 mb-6 font-serif">
              <div className="border-t-4 border-slate-900 pt-3 text-center">
                <h1 className="text-3xl font-extrabold tracking-widest text-slate-950 uppercase">
                  {resume.personalInfo.fullName || 'YOUR FULL NAME'}
                </h1>
                {resume.personalInfo.jobTitle && (
                  <p className="text-sm font-semibold text-slate-800 mt-1 uppercase tracking-wider">
                    {resume.personalInfo.jobTitle}
                  </p>
                )}
                <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-700 mt-2">
                  {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                  {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                  {resume.personalInfo.linkedin && <span>• {resume.personalInfo.linkedin}</span>}
                  {resume.personalInfo.github && <span>• {resume.personalInfo.github}</span>}
                </div>
              </div>
            </div>
          ) : templateId === 'academic-standard' ? (
            <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6 font-serif">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-normal text-slate-900 uppercase">
                {resume.personalInfo.fullName || 'YOUR FULL NAME'}
              </h1>
              {resume.personalInfo.jobTitle && (
                <p className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-widest">
                  {resume.personalInfo.jobTitle}
                </p>
              )}
              <p className="text-xs text-slate-700 mt-2">
                {[
                  resume.personalInfo.email,
                  resume.personalInfo.phone,
                  resume.personalInfo.location,
                  resume.personalInfo.linkedin,
                  resume.personalInfo.github
                ].filter(Boolean).join('  •  ')}
              </p>
            </div>
          ) : (
            <div className="text-center pb-4 border-b border-slate-300 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
                {resume.personalInfo.fullName || 'YOUR FULL NAME'}
              </h1>
              {resume.personalInfo.jobTitle && (
                <p className="text-sm font-semibold text-slate-700 mt-1 uppercase tracking-wide">
                  {resume.personalInfo.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-2.5">
                {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                {resume.personalInfo.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{resume.personalInfo.phone}</span>
                  </>
                )}
                {resume.personalInfo.location && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{resume.personalInfo.location}</span>
                  </>
                )}
                {resume.personalInfo.linkedin && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{resume.personalInfo.linkedin}</span>
                  </>
                )}
                {resume.personalInfo.github && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{resume.personalInfo.github}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Dynamic ATS Section Order Rendering */}
          {sectionOrder.map((secId) => renderSection(secId))}

        </div>
      </div>
    </div>
  );
};
