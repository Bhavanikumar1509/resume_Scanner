import React, { useState } from 'react';
import { ResumeData, SectionId } from '../types';
import { 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Briefcase, 
  Wrench, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  FileText,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';

interface SectionReordererProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

interface SectionInfo {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  description: string;
  atsTip: string;
  countBadge: string;
}

const ALL_SECTIONS: Record<SectionId, Omit<SectionInfo, 'id'>> = {
  summary: {
    label: 'Professional Summary',
    icon: FileText,
    description: 'Executive pitch & core target keywords',
    atsTip: 'Recommended #1: Parsers extract current title & core keywords here first.',
    countBadge: '1 Paragraph'
  },
  workExperience: {
    label: 'Work Experience',
    icon: Briefcase,
    description: 'Chronological roles, metric bullets & tech stacks',
    atsTip: 'Recommended #2 for Experienced Pros: Highest weight in ATS ranking algorithms.',
    countBadge: 'Roles'
  },
  skills: {
    label: 'Skills & Expertise',
    icon: Wrench,
    description: 'Categorized hard skills, tools & methodologies',
    atsTip: 'Placing skills near the top helps Tech & Developer role keyword indexing.',
    countBadge: 'Keywords'
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    description: 'Degrees, institutions, honors & GPAs',
    atsTip: 'Recommended #2 for New Grads: Places academic credentials up front.',
    countBadge: 'Degrees'
  },
  projects: {
    label: 'Key Projects',
    icon: FolderGit2,
    description: 'Practical implementations, links & tech stacks',
    atsTip: 'Great for engineering portfolios & career switchers.',
    countBadge: 'Projects'
  },
  certifications: {
    label: 'Certifications',
    icon: Award,
    description: 'Industry licenses, AWS, Scrum, PMP badges',
    atsTip: 'Boosts compliance filters for specialized regulated roles.',
    countBadge: 'Certs'
  }
};

const DEFAULT_ORDER: SectionId[] = ['summary', 'workExperience', 'skills', 'education', 'projects', 'certifications'];

export const SectionReorderer: React.FC<SectionReordererProps> = ({
  resume,
  onChange
}) => {
  const currentOrder: SectionId[] = resume.sectionOrder && resume.sectionOrder.length > 0 
    ? resume.sectionOrder 
    : DEFAULT_ORDER;

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getSectionCount = (id: SectionId): string => {
    switch (id) {
      case 'summary':
        return resume.summary ? '1 summary' : 'Empty';
      case 'workExperience':
        return `${resume.workExperience?.length || 0} roles`;
      case 'skills':
        const totalSkills = (resume.skills?.hardSkills?.length || 0) + 
          (resume.skills?.toolsAndFrameworks?.length || 0) + 
          (resume.skills?.softSkills?.length || 0);
        return `${totalSkills} keywords`;
      case 'education':
        return `${resume.education?.length || 0} degrees`;
      case 'projects':
        return `${resume.projects?.length || 0} projects`;
      case 'certifications':
        return `${resume.certifications?.length || 0} certs`;
      default:
        return 'Active';
    }
  };

  const updateOrder = (newOrder: SectionId[]) => {
    onChange({
      ...resume,
      sectionOrder: newOrder
    });
  };

  // Move item up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, movedItem);
    updateOrder(newOrder);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...currentOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    updateOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Apply Presets
  const applyPreset = (preset: 'experienced' | 'newGrad' | 'techFocus') => {
    let presetOrder: SectionId[] = [];
    if (preset === 'experienced') {
      presetOrder = ['summary', 'workExperience', 'skills', 'education', 'projects', 'certifications'];
    } else if (preset === 'newGrad') {
      presetOrder = ['summary', 'education', 'skills', 'workExperience', 'projects', 'certifications'];
    } else if (preset === 'techFocus') {
      presetOrder = ['summary', 'skills', 'workExperience', 'projects', 'education', 'certifications'];
    }
    updateOrder(presetOrder);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/20 text-blue-300 text-2xs font-bold px-2.5 py-0.5 rounded-md border border-blue-400/30 uppercase tracking-wider">
              ATS Layout Optimizer
            </span>
            <span className="text-2xs text-slate-400 font-medium">Drag & Drop Section Flow</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Reorder Resume Sections</h3>
          <p className="text-xs text-slate-300">
            Customize section sequence for target portal algorithms. Drag handles or use buttons to reorder.
          </p>
        </div>

        {/* Reset / Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => applyPreset('experienced')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-2xs font-bold transition-all flex items-center space-x-1"
            title="Summary → Experience → Skills → Education"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Experienced Pro</span>
          </button>

          <button
            onClick={() => applyPreset('newGrad')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-2xs font-bold transition-all flex items-center space-x-1"
            title="Summary → Education → Skills → Experience"
          >
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>New Grad</span>
          </button>

          <button
            onClick={() => applyPreset('techFocus')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-2xs font-bold transition-all flex items-center space-x-1"
            title="Summary → Skills → Experience → Projects"
          >
            <Wrench className="w-3 h-3 text-amber-400" />
            <span>Tech Focus</span>
          </button>

          <button
            onClick={() => updateOrder(DEFAULT_ORDER)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to default order"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Reorderable List */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
          <GripVertical className="w-4 h-4 text-blue-600" />
          <span>Section Order Hierarchy (Top to Bottom):</span>
        </p>

        {currentOrder.map((secId, index) => {
          const info = ALL_SECTIONS[secId] || {
            label: secId,
            icon: FileText,
            description: 'Custom Section',
            atsTip: 'Standard ATS parsing block',
            countBadge: 'Active'
          };
          const Icon = info.icon;
          const count = getSectionCount(secId);
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={secId}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-xl border p-3.5 transition-all flex items-center justify-between gap-3 ${
                isDragging
                  ? 'opacity-40 border-blue-400 bg-blue-50/50 scale-[0.99] shadow-inner'
                  : isDragOver
                  ? 'border-2 border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-400/20'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              {/* Left Grip & Info */}
              <div className="flex items-center space-x-3.5 min-w-0">
                
                {/* Drag Handle */}
                <div 
                  className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Click and drag to reorder section"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Section Index Badge */}
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  #{index + 1}
                </div>

                {/* Icon */}
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">{info.label}</h4>
                    <span className="text-3xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      {count}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 truncate mt-0.5">{info.description}</p>
                </div>
              </div>

              {/* Right Controls & Tips */}
              <div className="flex items-center space-x-2 shrink-0">
                
                {/* ATS Tip Badge (Hidden on small mobile) */}
                <div className="hidden lg:flex items-center space-x-1 text-3xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg max-w-[220px]">
                  <Info className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">{info.atsTip}</span>
                </div>

                {/* Move Up / Down Buttons */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === currentOrder.length - 1}
                    className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ATS Flow Insights Callout */}
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-2">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Why Section Order Matters in ATS Systems</span>
        </div>
        <p className="text-2xs text-blue-950 leading-relaxed">
          Top-tier ATS engines like <strong>Workday</strong>, <strong>Greenhouse</strong>, and <strong>Taleo</strong> use top-down document parsers. Placing your <strong>Work Experience</strong> or <strong>Skills</strong> immediately below your <strong>Contact Information</strong> ensures critical job titles, dates, and hard keywords are indexed at the highest priority before secondary sections.
        </p>
      </div>

    </div>
  );
};
