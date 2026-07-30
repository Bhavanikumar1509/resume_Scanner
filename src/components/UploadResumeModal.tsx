import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ArrowRight,
  Briefcase,
  User,
  Wrench,
  GraduationCap
} from 'lucide-react';
import { extractTextFromFile } from '../utils/fileExtractor';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseResume: (rawText: string) => Promise<boolean>;
  onParseAndTailor?: (rawText: string, jobDesc: string) => Promise<boolean>;
  onNavigateToTab: (tab: 'editor' | 'checker' | 'tailor' | 'parser' | 'dashboard') => void;
  onClearResume?: () => void;
}

export const UploadResumeModal: React.FC<UploadResumeModalProps> = ({
  isOpen,
  onClose,
  onParseResume,
  onNavigateToTab,
  onClearResume
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedSummary, setExtractedSummary] = useState<{
    success: boolean;
    textLength: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleProcessResume = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    let textToParse = rawText;

    try {
      if (activeTab === 'upload') {
        if (!file) {
          setErrorMsg('Please select or drop a PDF, DOCX, or TXT file.');
          setIsProcessing(false);
          return;
        }
        setStatusStep(`Extracting text from ${file.name}...`);
        textToParse = await extractTextFromFile(file);
      }

      if (!textToParse || textToParse.trim().length < 30) {
        setErrorMsg('Could not extract sufficient text from the resume. Please paste the resume text manually.');
        setIsProcessing(false);
        return;
      }

      setStatusStep('AI Gemini is parsing & auto-filling ATS fields...');
      const success = await onParseResume(textToParse);

      if (success) {
        setExtractedSummary({
          success: true,
          textLength: textToParse.length
        });
      } else {
        setErrorMsg('Failed to structure resume content. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing resume file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Upload & Auto-Fill Existing Resume</h2>
              <p className="text-xs text-slate-300">Skip manual entry — Gemini AI auto-structures your PDF/DOCX into ATS fields</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Mode Switcher */}
          {!extractedSummary && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab('upload'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Upload PDF / DOCX / TXT</span>
              </button>
              <button
                onClick={() => { setActiveTab('paste'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'paste' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Paste Raw Resume Text</span>
              </button>
            </div>
          )}

          {/* Extracted Success State */}
          {extractedSummary ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900">Resume Auto-Filled Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Gemini structured your resume text into standardized ATS contact info, work history, skills, and education records.
                </p>
              </div>

              {/* Extracted Metrics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <User className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Contact Info</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Mapped</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <Briefcase className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Work History</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Extracted</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <Wrench className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Skill Keywords</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Parsed</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <GraduationCap className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xs text-slate-500 font-semibold uppercase">Education</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Recorded</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('checker');
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Portal Test</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('tailor');
                  }}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Tailor Job</span>
                </button>

                <button
                  onClick={() => {
                    setExtractedSummary(null);
                    setFile(null);
                    setRawText('');
                  }}
                  className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Different File</span>
                </button>

                {onClearResume && (
                  <button
                    onClick={() => {
                      onClearResume();
                      setExtractedSummary(null);
                      setFile(null);
                      setRawText('');
                    }}
                    className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear / Remove Resume</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Tab 1: File Upload */}
              {activeTab === 'upload' && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    file ? 'border-blue-500 bg-blue-50/40' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.rtf"
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                      <p className="text-2xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto border border-slate-200">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Click to select or drag & drop your resume</p>
                        <p className="text-xs text-slate-500 mt-1">Supports PDF, Word DOCX, or Plain Text files</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Raw Text Paste */}
              {activeTab === 'paste' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Paste Complete Resume Text:</label>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the full text of your existing resume here (Contact, Experience, Skills, Education)..."
                    className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Processing Spinner Indicator */}
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-xs flex items-center space-x-3 animate-pulse">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div>
                    <p className="font-bold text-blue-950">Processing Resume Content...</p>
                    <p className="text-2xs text-blue-700 mt-0.5">{statusStep}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end items-center space-x-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleProcessResume}
                  disabled={isProcessing || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !rawText.trim())}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing & Auto-Filling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Auto-Fill Details with Gemini AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
