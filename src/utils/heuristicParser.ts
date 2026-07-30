import { ResumeData } from '../types';

export function heuristicParseResumeText(rawText: string, currentResume: ResumeData): ResumeData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Extract Contact Info via Regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const locationMatch = rawText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/);

  // Name estimation (usually 1st non-empty line)
  let fullName = currentResume.personalInfo.fullName;
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 40 && !firstLine.toLowerCase().includes('resume') && !firstLine.includes('@')) {
      fullName = firstLine;
    }
  }

  // Job Title estimation (usually 2nd line if short)
  let jobTitle = currentResume.personalInfo.jobTitle;
  if (lines.length > 1) {
    const secondLine = lines[1];
    if (secondLine.length < 50 && !secondLine.includes('@') && !secondLine.includes('http')) {
      jobTitle = secondLine;
    }
  }

  // Section splitting
  const sections: { [key: string]: string[] } = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: []
  };

  let currentSec = 'summary';

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('WORK EXPERIENCE') || upper.includes('EMPLOYMENT HISTORY') || upper.includes('EXPERIENCE')) {
      currentSec = 'experience';
      continue;
    } else if (upper.includes('EDUCATION') || upper.includes('ACADEMIC')) {
      currentSec = 'education';
      continue;
    } else if (upper.includes('SKILL') || upper.includes('TECHNICAL EXPERTISE') || upper.includes('COMPETENCIES')) {
      currentSec = 'skills';
      continue;
    } else if (upper.includes('CERTIFICAT') || upper.includes('CREDENTIAL') || upper.includes('BADGE')) {
      currentSec = 'certifications';
      continue;
    } else if (upper.includes('PROJECT') || upper.includes('KEY PROJECTS')) {
      currentSec = 'projects';
      continue;
    } else if (upper.includes('SUMMARY') || upper.includes('PROFILE') || upper.includes('OBJECTIVE')) {
      currentSec = 'summary';
      continue;
    }

    sections[currentSec].push(line);
  }

  // Extract Summary
  const summaryText = sections.summary.join(' ').slice(0, 500) || currentResume.summary;

  // Extract Hard Skills & Tools
  const rawSkillsText = sections.skills.join(', ');
  const foundSkills = rawSkillsText.split(/[,•|*;\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 35);
  const hardSkills = foundSkills.length > 0 ? Array.from(new Set(foundSkills.slice(0, 15))) : currentResume.skills.hardSkills;

  // Build experience bullets
  const expLines = sections.experience;
  const bullets: string[] = [];
  expLines.forEach(l => {
    if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*')) {
      bullets.push(l.replace(/^[•\-\*\s]+/, ''));
    } else if (l.length > 25 && bullets.length < 8) {
      bullets.push(l);
    }
  });

  const parsedExperience = expLines.length > 0 ? [
    {
      id: 'exp-parsed-1',
      company: 'Extracted Company / Organization',
      position: jobTitle || 'Professional Role',
      location: locationMatch ? locationMatch[0] : 'Remote / Hybrid',
      startDate: '01/2021',
      endDate: 'Present',
      isCurrent: true,
      bullets: bullets.length > 0 ? bullets : ['Led key departmental deliverables and ATS compliance operations.']
    }
  ] : currentResume.workExperience;

  return {
    ...currentResume,
    personalInfo: {
      ...currentResume.personalInfo,
      fullName: fullName || currentResume.personalInfo.fullName,
      jobTitle: jobTitle || currentResume.personalInfo.jobTitle,
      email: emailMatch ? emailMatch[0] : currentResume.personalInfo.email,
      phone: phoneMatch ? phoneMatch[0] : currentResume.personalInfo.phone,
      location: locationMatch ? locationMatch[0] : currentResume.personalInfo.location,
      linkedin: linkedinMatch ? linkedinMatch[0] : currentResume.personalInfo.linkedin,
      github: githubMatch ? githubMatch[0] : currentResume.personalInfo.github
    },
    summary: summaryText,
    workExperience: parsedExperience,
    skills: {
      ...currentResume.skills,
      hardSkills: hardSkills
    }
  };
}
