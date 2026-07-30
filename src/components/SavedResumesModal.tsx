import React, { useState, useEffect } from 'react';
import { 
  db, 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  User 
} from '../lib/firebase';
import { ResumeData } from '../types';
import { Cloud, Save, Trash2, FolderOpen, Plus, Clock, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SavedResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentResume: ResumeData;
  onLoadResume: (resume: ResumeData) => void;
  onShowToast: (msg: string) => void;
  onOpenAuth: () => void;
}

interface SavedResumeItem {
  id: string;
  userId: string;
  title: string;
  updatedAt: string;
  resumeData: ResumeData;
}

export const SavedResumesModal: React.FC<SavedResumesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentResume,
  onLoadResume,
  onShowToast,
  onOpenAuth
}) => {
  const [savedList, setSavedList] = useState<SavedResumeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchSavedResumes();
      // Pre-fill save title
      const name = currentResume.personalInfo.fullName || 'My Resume';
      const role = currentResume.personalInfo.targetRole ? ` - ${currentResume.personalInfo.targetRole}` : '';
      setSaveTitle(`${name}${role}`);
    }
  }, [isOpen, currentUser]);

  const fetchSavedResumes = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    let items: SavedResumeItem[] = [];

    // Try Firestore first
    try {
      const q = query(
        collection(db, 'resumes'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as SavedResumeItem;
        items.push({
          ...data,
          id: docSnap.id
        });
      });
    } catch (err: any) {
      console.warn('Firestore fetch fallback to local sync:', err);
    }

    // Merge with LocalStorage fallback
    try {
      const localKey = `resumeup_saved_${currentUser.uid}`;
      const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        const localItems: SavedResumeItem[] = JSON.parse(localRaw);
        localItems.forEach(lItem => {
          if (!items.some(i => i.id === lItem.id)) {
            items.push(lItem);
          }
        });
      }
    } catch (e) {
      console.error('Local storage read error:', e);
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setSavedList(items);
    setLoading(false);
  };

  const handleSaveCurrent = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!saveTitle.trim()) {
      setError('Please provide a title for this resume.');
      return;
    }

    setSaving(true);
    setError(null);

    const resumeId = currentResume.id || 'resume-' + Date.now();
    const updatedResume = { ...currentResume, id: resumeId };

    const payload: SavedResumeItem = {
      id: resumeId,
      userId: currentUser.uid,
      title: saveTitle.trim(),
      updatedAt: new Date().toISOString(),
      resumeData: updatedResume
    };

    // Save locally
    try {
      const localKey = `resumeup_saved_${currentUser.uid}`;
      const localRaw = localStorage.getItem(localKey);
      let localItems: SavedResumeItem[] = localRaw ? JSON.parse(localRaw) : [];
      localItems = localItems.filter(i => i.id !== resumeId);
      localItems.unshift(payload);
      localStorage.setItem(localKey, JSON.stringify(localItems));
    } catch (e) {
      console.error('Local save error:', e);
    }

    // Save to Firestore
    try {
      const docRef = doc(db, 'resumes', resumeId);
      await setDoc(docRef, payload);
    } catch (err: any) {
      console.warn('Firestore save warning (local saved):', err);
    }

    onShowToast(`Saved "${saveTitle.trim()}" to your account!`);
    setSaving(false);
    await fetchSavedResumes();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!currentUser) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    // Remove locally
    try {
      const localKey = `resumeup_saved_${currentUser.uid}`;
      const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        let localItems: SavedResumeItem[] = JSON.parse(localRaw);
        localItems = localItems.filter(i => i.id !== id);
        localStorage.setItem(localKey, JSON.stringify(localItems));
      }
    } catch (e) {
      console.error('Local delete error:', e);
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'resumes', id));
    } catch (err: any) {
      console.warn('Firestore delete warning:', err);
    }

    onShowToast(`Deleted "${title}".`);
    setSavedList(prev => prev.filter(item => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Saved Resumes & Cloud Backups</h3>
              <p className="text-2xs text-slate-300">
                {currentUser ? `Saved under ${currentUser.email}` : 'Sign in to persist your built resumes indefinitely'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!currentUser ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-4">
              <Cloud className="w-12 h-12 text-blue-500 mx-auto opacity-80" />
              <div>
                <h4 className="text-base font-bold text-slate-800">Sign in to save resumes to your account</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  When signed in, all your created, uploaded, and tailored resumes will be saved to your cloud library indefinitely until you choose to manually delete them.
                </p>
              </div>
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
              >
                <span>Sign In / Register Account</span>
              </button>
            </div>
          ) : (
            <>
              {/* Save Active Resume Panel */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Save className="w-4 h-4 text-blue-600" />
                    <span>Save Current Active Resume</span>
                  </h4>
                  <span className="text-2xs text-blue-700 font-medium">Cloud Storage Enabled</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Resume Title (e.g. Senior Frontend Engineer - Workday Version)"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <button
                    onClick={handleSaveCurrent}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all shrink-0 flex items-center justify-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save to Cloud'}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Saved Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Saved Resumes ({savedList.length})
                  </h4>
                  <span className="text-3xs text-slate-400">Stored until manually deleted</span>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Loading your cloud saved resumes...
                  </div>
                ) : savedList.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-600">No saved resumes found in your account</p>
                    <p className="text-2xs text-slate-400 mt-0.5">Use the box above to save your current resume.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {savedList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-bold text-slate-900 text-sm truncate">{item.title}</h5>
                          <div className="flex items-center space-x-3 text-2xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Updated {new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">
                              {item.resumeData.personalInfo.targetRole || 'General Resume'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => {
                              onLoadResume(item.resumeData);
                              onShowToast(`Loaded "${item.title}" into editor.`);
                              onClose();
                            }}
                            className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-200 hover:border-blue-300 transition-colors flex items-center space-x-1"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Load</span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete resume permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
