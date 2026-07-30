import React, { useState } from 'react';
import { Info, X, ShieldCheck, Search, FileCode2, CheckCircle2 } from 'lucide-react';

export const AtsExplanationBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6 shadow-md border border-slate-800 relative overflow-hidden">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        title="Dismiss note"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4 max-w-5xl">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
          <Info className="w-6 h-6" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-white">How ATS Systems Actually Work (Demystifying the "Auto-Reject Robot" Myth)</h3>
            <span className="text-2xs bg-blue-500/30 text-blue-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-400/30">
              System Insight
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Applicant Tracking Systems like <strong className="text-white">Workday, Greenhouse, Lever, and Taleo</strong> do <em className="not-italic text-blue-300 font-medium">NOT</em> have an autonomous AI robot that auto-rejects resumes on its own.
            Instead, recruiters use these portals to filter candidates based on <strong className="text-white">parsing accuracy</strong> and <strong className="text-white">exact keyword search matches</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start space-x-2.5">
              <FileCode2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">1. Structural Parsing</p>
                <p className="text-2xs text-slate-400 mt-0.5">Parsers break down your PDF/Word doc into plain text data fields.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start space-x-2.5">
              <Search className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">2. Recruiter Boolean Filters</p>
                <p className="text-2xs text-slate-400 mt-0.5">Recruiters search dashboards for specific job keywords & skills.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">3. Compliance Score &gt; 80</p>
                <p className="text-2xs text-slate-400 mt-0.5">A score above 80 guarantees your text renders cleanly without breaking.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
