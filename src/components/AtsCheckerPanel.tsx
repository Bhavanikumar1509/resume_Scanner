import React, { useState } from 'react';
import { OverallAtsReport, PortalType, AtsCheckResult } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Building2
} from 'lucide-react';

interface AtsCheckerPanelProps {
  report: OverallAtsReport;
  onApplyFix?: (checkId: number) => void;
}

export const AtsCheckerPanel: React.FC<AtsCheckerPanelProps> = ({
  report,
  onApplyFix
}) => {
  const [selectedPortal, setSelectedPortal] = useState<PortalType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCheckId, setExpandedCheckId] = useState<number | null>(null);

  const getStatusBadge = (status: AtsCheckResult['status']) => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>PASSED</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>WARNING</span>
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>CRITICAL FIX</span>
          </span>
        );
    }
  };

  const filteredChecks = report.checks.filter(c => {
    if (selectedPortal !== 'all') {
      if (c.affectedPortal !== 'all' && Array.isArray(c.affectedPortal) && !c.affectedPortal.includes(selectedPortal)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && c.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Score Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Gauge / Score Circle */}
        <div className="flex items-center space-x-5 md:border-r border-slate-200 pr-4">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={238.76}
                strokeDashoffset={238.76 - (238.76 * report.overallScore) / 100}
                strokeLinecap="round"
                className={
                  report.overallScore >= 80
                    ? 'text-emerald-500 transition-all duration-1000'
                    : report.overallScore >= 60
                    ? 'text-amber-500 transition-all duration-1000'
                    : 'text-rose-500 transition-all duration-1000'
                }
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{report.overallScore}</span>
              <span className="block text-3xs font-bold text-slate-400 mt-0.5">/ 100</span>
            </div>
          </div>

          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider mb-1 ${
              report.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.statusLabel}
            </span>
            <h3 className="font-bold text-slate-900 text-base">ATS Compliance Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Aim for &gt;80 to guarantee structural compliance & keyword alignment across portals.
            </p>
          </div>
        </div>

        {/* Passed / Warnings / Failed Counts */}
        <div className="grid grid-cols-3 gap-2 md:border-r border-slate-200 pr-4 text-center">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <p className="text-2xl font-black text-emerald-700">{report.checkSummary.passed}</p>
            <p className="text-3xs font-bold uppercase text-emerald-800 mt-0.5">Passed</p>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <p className="text-2xl font-black text-amber-700">{report.checkSummary.warnings}</p>
            <p className="text-3xs font-bold uppercase text-amber-800 mt-0.5">Warnings</p>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <p className="text-2xl font-black text-rose-700">{report.checkSummary.failed}</p>
            <p className="text-3xs font-bold uppercase text-rose-800 mt-0.5">Critical</p>
          </div>
        </div>

        {/* Portal Compatibility Badges */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Portal Scanning Readiness</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Workday</span>
              <span className={`font-bold ${report.portalScores.workday.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {report.portalScores.workday.score}%
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Greenhouse</span>
              <span className={`font-bold ${report.portalScores.greenhouse.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {report.portalScores.greenhouse.score}%
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Lever</span>
              <span className={`font-bold ${report.portalScores.lever.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {report.portalScores.lever.score}%
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Taleo</span>
              <span className={`font-bold ${report.portalScores.taleo.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {report.portalScores.taleo.score}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Portal Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Filter Portal Scanner:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All 28 Checks' },
            { id: 'workday', label: 'Workday Portal' },
            { id: 'greenhouse', label: 'Greenhouse Portal' },
            { id: 'lever', label: 'Lever Portal' },
            { id: 'taleo', label: 'Taleo Portal' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPortal(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPortal === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium outline-none"
        >
          <option value="all">All Categories</option>
          <option value="Formatting">Formatting & Layout</option>
          <option value="Contact & Parsing">Contact & Parsing</option>
          <option value="Keywords & Alignment">Keywords & Alignment</option>
          <option value="Impact & Verbs">Action Verbs & Impact</option>
        </select>
      </div>

      {/* List of 28 Checks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Check Specification ({filteredChecks.length})</span>
          <span>Status & Fix</span>
        </div>

        {filteredChecks.map((check) => {
          const isExpanded = expandedCheckId === check.id;

          return (
            <div key={check.id} className="p-4 hover:bg-slate-50/60 transition-colors">
              <div
                onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 font-mono text-2xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                    #{check.id}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-slate-900">{check.name}</p>
                      <span className="text-3xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {check.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{check.message}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {getStatusBadge(check.status)}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Actionable Fix Panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 bg-blue-50/40 p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-950">Actionable ATS Fix Recommendation:</p>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{check.actionableFix}</p>
                    </div>
                  </div>

                  <div className="text-3xs text-slate-500 font-semibold uppercase tracking-wider pt-1 border-t border-blue-100">
                    Target Portal Impact: {Array.isArray(check.affectedPortal) ? check.affectedPortal.join(', ') : 'All Corporate ATS'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
