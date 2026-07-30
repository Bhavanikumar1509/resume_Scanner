import React from 'react';
import { OverallAtsReport, ResumeData } from '../types';
import { 
  LayoutDashboard, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  FileText, 
  Sparkles, 
  Clock, 
  History 
} from 'lucide-react';

interface DashboardProps {
  report: OverallAtsReport;
  resume: ResumeData;
  onNavigate: (tab: 'editor' | 'checker' | 'tailor' | 'parser') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  resume,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">ATS Compatibility Monitor & Analytics</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time scanner metrics for <strong className="text-white">{resume.title}</strong>
          </p>
        </div>

        <button
          onClick={() => onNavigate('checker')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1.5 shrink-0"
        >
          <span>Run Full 28-Check Portal Test</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Portal Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Workday */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase">Workday ATS</span>
            <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
              report.portalScores.workday.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.portalScores.workday.score}% Readified
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {report.portalScores.workday.passedChecksCount} / {report.portalScores.workday.totalChecksCount}
            <span className="text-xs font-normal text-slate-400 ml-1">Checks Passed</span>
          </div>

          <div className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700">Top Portal Priority:</p>
            <p>Strict MM/YYYY date formats & single column section headers.</p>
          </div>
        </div>

        {/* Greenhouse */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase">Greenhouse ATS</span>
            <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
              report.portalScores.greenhouse.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.portalScores.greenhouse.score}% Readified
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {report.portalScores.greenhouse.passedChecksCount} / {report.portalScores.greenhouse.totalChecksCount}
            <span className="text-xs font-normal text-slate-400 ml-1">Checks Passed</span>
          </div>

          <div className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700">Top Portal Priority:</p>
            <p>Action verb frontloading & measurable impact metrics.</p>
          </div>
        </div>

        {/* Lever */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase">Lever ATS</span>
            <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
              report.portalScores.lever.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.portalScores.lever.score}% Readified
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {report.portalScores.lever.passedChecksCount} / {report.portalScores.lever.totalChecksCount}
            <span className="text-xs font-normal text-slate-400 ml-1">Checks Passed</span>
          </div>

          <div className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700">Top Portal Priority:</p>
            <p>Summary length balance & clean LinkedIn profile link.</p>
          </div>
        </div>

        {/* Taleo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase">Taleo ATS</span>
            <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
              report.portalScores.taleo.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.portalScores.taleo.score}% Readified
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {report.portalScores.taleo.passedChecksCount} / {report.portalScores.taleo.totalChecksCount}
            <span className="text-xs font-normal text-slate-400 ml-1">Checks Passed</span>
          </div>

          <div className="text-3xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-700">Top Portal Priority:</p>
            <p>Zero non-standard special characters or custom wingdings.</p>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div
          onClick={() => onNavigate('editor')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Edit Document Content</h4>
          <p className="text-xs text-slate-500 mt-1">Update contact details, job history, and skills in standard ATS fields.</p>
        </div>

        <div
          onClick={() => onNavigate('tailor')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Job Description Tailoring</h4>
          <p className="text-xs text-slate-500 mt-1">Paste a job post to extract missing keywords and weave required terms.</p>
        </div>

        <div
          onClick={() => onNavigate('parser')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-3">Parser Stream Test</h4>
          <p className="text-xs text-slate-500 mt-1">Inspect raw ASCII stream as rendered in corporate recruiter dashboards.</p>
        </div>

      </div>

    </div>
  );
};
