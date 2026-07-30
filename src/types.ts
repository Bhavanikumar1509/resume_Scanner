export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface SkillsData {
  hardSkills: string[];
  softSkills: string[];
  toolsAndFrameworks: string[];
  languages: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  link?: string;
  bullets: string[];
  techStack?: string[];
}

export type SectionId = 'summary' | 'workExperience' | 'skills' | 'education' | 'projects' | 'certifications';

export interface ResumeData {
  id: string;
  title: string;
  lastUpdated: string;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillsData;
  certifications: Certification[];
  projects: Project[];
  templateId: 'classic-ats' | 'modern-corporate' | 'tech-minimal' | 'executive-clean' | 'academic-standard';
  sectionOrder?: SectionId[];
  fontFamily?: 'Calibri' | 'Arial' | 'Times New Roman' | 'Georgia' | 'Helvetica' | 'Garamond';
  fontSize?: 'compact' | 'standard' | 'spacious';
  pageMargin?: 'narrow' | 'standard' | 'wide';
  sectionSpacing?: 'workday' | 'standard' | 'compact' | 'spacious';
}

export type PortalType = 'workday' | 'greenhouse' | 'lever' | 'taleo';

export type CheckStatus = 'pass' | 'warning' | 'fail';

export interface AtsCheckResult {
  id: number;
  name: string;
  category: 'Formatting' | 'Contact & Parsing' | 'Keywords & Alignment' | 'Impact & Verbs';
  status: CheckStatus;
  score: number; // 0 - 100
  message: string;
  actionableFix: string;
  affectedPortal: PortalType[] | 'all';
}

export interface PortalCompatibilityScore {
  portal: PortalType;
  portalName: string;
  score: number; // 0 - 100
  passedChecksCount: number;
  totalChecksCount: number;
  keyStrengths: string[];
  keyRisks: string[];
}

export interface OverallAtsReport {
  overallScore: number; // 0 - 100
  statusLabel: 'Critical Fixes Needed' | 'Moderate ATS Readiness' | 'ATS Ready (>80)' | 'Top 5% Candidate';
  portalScores: Record<PortalType, PortalCompatibilityScore>;
  checks: AtsCheckResult[];
  checkSummary: {
    passed: number;
    warnings: number;
    failed: number;
  };
  parsedRepresentation: {
    contactParsed: boolean;
    skillsCount: number;
    workHistoryCount: number;
    dateFormatsValid: boolean;
    extractedKeywords: string[];
  };
}

export interface JobDescriptionMatch {
  jobTitle: string;
  companyName?: string;
  matchScore: number;
  missingHardSkills: string[];
  matchedHardSkills: string[];
  missingSoftSkills: string[];
  missingKeywords: string[];
  portalScores: Record<PortalType, number>;
  suggestedSummary?: string;
  tailoredBullets?: {
    experienceIndex: number;
    originalBullet: string;
    suggestedBullet: string;
    reason: string;
  }[];
}
