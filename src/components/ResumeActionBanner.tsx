import React from 'react';
import { Upload, Sparkles, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface ResumeActionBannerProps {
  onOpenUpload: () => void;
  onOpenTailor: () => void;
  onOpenChecker: () => void;
  currentName: string;
  jobCount: number;
  skillCount: number;
}

export const ResumeActionBanner: React.FC<ResumeActionBannerProps> = ({
  onOpenUpload,
  onOpenTailor,
  onOpenChecker,
  currentName,
  jobCount,
  skillCount
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 mb-6 shadow-md border border-slate-700/60 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-400/30">
              ATS Workflow Accelerator
            </span>
            <span className="text-2xs text-slate-400 font-medium hidden sm:inline">
              Loaded: <strong className="text-white">{currentName || 'Untitled Candidate'}</strong> ({jobCount} roles, {skillCount} skills)
            </span>
          </div>
          
          <h2 className="text-base font-bold text-white tracking-tight">
            How would you like to build or optimize your resume today?
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload your existing PDF/Word file to auto-fill all ATS data fields, or tailor your loaded profile against a job description.
          </p>
        </div>

        {/* Right Action Cards */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Card 1: Upload Existing */}
          <button
            onClick={onOpenUpload}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 group"
          >
            <Upload className="w-4 h-4 text-white" />
            <div className="text-left">
              <p className="leading-none">Upload Existing Resume</p>
              <p className="text-3xs text-blue-100 font-normal mt-0.5">PDF/Word Auto-Fill</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Card 2: Tailor for Job */}
          <button
            onClick={onOpenTailor}
            className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 group"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <p className="leading-none">AI Job Tailoring</p>
              <p className="text-3xs text-slate-300 font-normal mt-0.5">Match JD Keywords</p>
            </div>
          </button>

          {/* Card 3: 28-Check Portal */}
          <button
            onClick={onOpenChecker}
            className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="leading-none">Portal Test</p>
              <p className="text-3xs text-slate-400 font-normal mt-0.5">Workday/Greenhouse</p>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
