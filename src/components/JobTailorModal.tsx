import React, { useState } from 'react';
import { ResumeData, JobDescriptionMatch } from '../types';
import { SAMPLE_JOB_DESCRIPTIONS } from '../data/sampleResumes';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  Wrench, 
  FileText, 
  Check 
} from 'lucide-react';

interface JobTailorProps {
  resume: ResumeData;
  onApplyTailoring: (tailoredSummary?: string, tailoredBullets?: JobDescriptionMatch['tailoredBullets']) => void;
  onAnalyzeJd: (jobDescription: string) => Promise<JobDescriptionMatch | null>;
}

export const JobTailorModal: React.FC<JobTailorProps> = ({
  resume,
  onApplyTailoring,
  onAnalyzeJd
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobDescriptionMatch | null>(null);
  const [applied, setApplied] = useState(false);

  const handleAnalyzeClick = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setApplied(false);
    const result = await onAnalyzeJd(jobDescription);
    setIsAnalyzing(false);
    if (result) {
      setMatchResult(result);
    }
  };

  const handleSampleSelect = (jdText: string) => {
    setJobDescription(jdText);
    setMatchResult(null);
  };

  const handleApplyClick = () => {
    if (!matchResult) return;
    onApplyTailoring(matchResult.suggestedSummary, matchResult.tailoredBullets);
    setApplied(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Job Description Tailoring & Keyword Matcher</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              When recruiters open Lever or Workday, they filter candidates by searching for specific skills.
              Paste your target Job Description below to identify missing keywords and organically weave required terms into your resume.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Sample JD Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Target Job Description (Paste Text or Select Sample):
          </label>
          <div className="flex gap-2 text-2xs font-semibold">
            {SAMPLE_JOB_DESCRIPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => handleSampleSelect(s.description)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Sample: {s.title.split('-')[0]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here (responsibilities, required skills, technical stack)..."
          className="w-full p-3.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          disabled={isAnalyzing || !jobDescription.trim()}
          onClick={handleAnalyzeClick}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Keyword Matches via Gemini...</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              <span>Analyze Match & Extract Keywords</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {matchResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Match Score Gauge Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center space-x-4 md:border-r border-slate-200 pr-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center text-indigo-700 shrink-0">
                <span className="text-2xl font-black">{matchResult.matchScore}%</span>
                <span className="text-3xs font-bold uppercase text-indigo-500">JD Match</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Job Keyword Compatibility</h4>
                <p className="text-xs text-slate-500 mt-1">Target Title: <strong className="text-slate-800">{matchResult.targetJobTitle}</strong></p>
              </div>
            </div>

            {/* Missing vs Matched Badges */}
            <div className="space-y-2 md:border-r border-slate-200 pr-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Matched Hard Skills:</span>
                <span className="text-emerald-700 font-bold">{matchResult.matchedHardSkills?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Missing Hard Skills:</span>
                <span className="text-rose-700 font-bold">{matchResult.missingHardSkills?.length || 0}</span>
              </div>
            </div>

            {/* One-Click Apply Button */}
            <div className="text-center md:text-right">
              <button
                onClick={handleApplyClick}
                disabled={applied}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 ${
                  applied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {applied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tailored Optimizations Applied!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>1-Click Apply Tailored Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Missing Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Missing Hard Skills */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Hard Skills Needed ({matchResult.missingHardSkills?.length || 0})</span>
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {(matchResult.missingHardSkills || []).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Matched Skills */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Already Matched Terms ({matchResult.matchedHardSkills?.length || 0})</span>
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {(matchResult.matchedHardSkills || []).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* AI Tailored Summary Suggestion */}
          {matchResult.suggestedSummary && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Suggested Tailored Summary</span>
              </div>
              <p className="text-xs text-slate-800 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
                {matchResult.suggestedSummary}
              </p>
            </div>
          )}

          {/* AI Tailored Experience Bullet Rewrites */}
          {matchResult.tailoredBullets && matchResult.tailoredBullets.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Organic Keyword Insertion Suggestions</span>
              </h4>

              <div className="space-y-3">
                {matchResult.tailoredBullets.map((b, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="text-2xs font-bold text-slate-400 uppercase">Original Bullet</div>
                    <p className="text-slate-600 line-through">{b.originalBullet}</p>

                    <div className="text-2xs font-bold text-indigo-600 uppercase pt-1 border-t border-slate-200">
                      Tailored Bullet (Weaving target terms organically)
                    </div>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded-lg border border-indigo-200">
                      {b.suggestedBullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
