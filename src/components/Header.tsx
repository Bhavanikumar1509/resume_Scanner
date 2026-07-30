import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  LayoutDashboard, 
  Search, 
  RotateCcw,
  FileSpreadsheet,
  FileType,
  Upload,
  User as UserIcon,
  Cloud,
  ShieldCheck
} from 'lucide-react';
import { OverallAtsReport } from '../types';
import { User } from '../lib/firebase';

interface HeaderProps {
  activeTab: 'editor' | 'checker' | 'parser' | 'tailor' | 'dashboard';
  setActiveTab: (tab: 'editor' | 'checker' | 'parser' | 'tailor' | 'dashboard') => void;
  report: OverallAtsReport;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportTxt: () => void;
  onLoadDemo: () => void;
  onOpenUploadModal?: () => void;
  onOpenAuth: () => void;
  onOpenSavedResumes: () => void;
  currentUser: User | null;
  resumeTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  report,
  onExportPdf,
  onExportDocx,
  onExportTxt,
  onLoadDemo,
  onOpenUploadModal,
  onOpenAuth,
  onOpenSavedResumes,
  currentUser,
  resumeTitle
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <div className="w-4 h-4 border-2 border-white rounded-xs" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800 text-xl tracking-tight">ResumeUp.AI</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">
                  ATS Engine
                </span>
              </div>
              <p className="text-2xs text-slate-400 hidden sm:block font-medium">Workday • Greenhouse • Lever • Taleo</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Content Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'checker'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Compatibility Test</span>
              <span className={`ml-1 text-3xs px-2 py-0.5 rounded-md font-bold border ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}/100
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tailor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tailor'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Tailor</span>
            </button>

            <button
              onClick={() => setActiveTab('parser')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'parser'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Parser Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Action Bar & Export Dropdown */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSavedResumes}
              title="View, save and manage cloud resumes"
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 rounded-lg transition-colors shadow-2xs"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Saved Resumes</span>
            </button>

            <button
              onClick={onOpenAuth}
              title={currentUser ? `Account: ${currentUser.email}` : "Sign In / Create Account"}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors border shadow-2xs ${
                currentUser 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {currentUser ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserIcon className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden md:inline max-w-[110px] truncate">
                {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : 'Sign In'}
              </span>
            </button>

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                title="Upload PDF/DOCX or paste existing resume to auto-fill"
                className="hidden lg:flex items-center space-x-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}

            <button
              onClick={onLoadDemo}
              title="Load sample high-scoring resume data"
              className="hidden xl:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF / DOCX</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATS Compliant Downloads</p>
                  </div>

                  <button
                    onClick={() => { setShowExportMenu(false); onExportPdf(); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-3 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="font-medium leading-none">PDF Document (.pdf)</p>
                      <p className="text-xs text-slate-400 mt-1">Universal vector clean print</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setShowExportMenu(false); onExportDocx(); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-3 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium leading-none">Editable Word (.docx)</p>
                      <p className="text-xs text-slate-400 mt-1">Workday & Taleo preferred</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setShowExportMenu(false); onExportTxt(); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-3 transition-colors"
                  >
                    <FileType className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-medium leading-none">Plain Text (.txt)</p>
                      <p className="text-xs text-slate-400 mt-1">Raw ASCII web portal paste</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs space-x-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'editor' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'checker' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            28 Checks ({report.overallScore})
          </button>
          <button
            onClick={() => setActiveTab('tailor')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'tailor' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Job Tailor
          </button>
          <button
            onClick={() => setActiveTab('parser')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'parser' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Parser Test
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
        </div>

      </div>
    </header>
  );
};
