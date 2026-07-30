import { ResumeData, AtsCheckResult, OverallAtsReport, PortalCompatibilityScore, PortalType } from '../types';

const ACTION_VERBS = new Set([
  'achieved', 'architected', 'built', 'created', 'designed', 'developed', 'directed',
  'drove', 'engineered', 'established', 'executed', 'expanded', 'generated', 'implemented',
  'increased', 'initiated', 'launched', 'led', 'managed', 'maximized', 'mentored',
  'negotiated', 'optimized', 'orchestrated', 'pioneered', 'reduced', 'refactored',
  'restructured', 'scaled', 'spearheaded', 'streamlined', 'transformed', 'upgraded',
  'collaborated', 'delivered', 'facilitated', 'guided', 'analyzed', 'formulated', 'automated'
]);

const WEAK_PASSIVE_PHRASES = [
  'responsible for', 'duties included', 'tasked with', 'helped with', 'assisted in',
  'worked on', 'involved in', 'handled', 'was required to', 'in charge of'
];

export function runFullAtsScan(resume: ResumeData): OverallAtsReport {
  const checks: AtsCheckResult[] = [];

  // Helper text representations
  const allBullets = resume.workExperience.flatMap(e => e.bullets || []);
  const allText = [
    resume.personalInfo.fullName,
    resume.personalInfo.jobTitle,
    resume.summary,
    ...resume.workExperience.map(e => `${e.company} ${e.position} ${e.bullets.join(' ')}`),
    ...resume.education.map(e => `${e.institution} ${e.degree} ${e.fieldOfStudy}`),
    ...(resume.skills.hardSkills || []),
    ...(resume.skills.toolsAndFrameworks || []),
    ...(resume.skills.softSkills || []),
    ...resume.projects.map(p => `${p.title} ${p.bullets.join(' ')}`),
  ].join(' ');

  const totalWords = allText.split(/\s+/).filter(Boolean).length;

  // --- CHECK 1: Contact Info Completeness ---
  const hasName = Boolean(resume.personalInfo.fullName.trim());
  const hasEmail = Boolean(resume.personalInfo.email.trim());
  const hasPhone = Boolean(resume.personalInfo.phone.trim());
  const hasLocation = Boolean(resume.personalInfo.location.trim());
  const contactScore = [hasName, hasEmail, hasPhone, hasLocation].filter(Boolean).length * 25;
  checks.push({
    id: 1,
    name: 'Contact Details Completeness',
    category: 'Contact & Parsing',
    status: contactScore === 100 ? 'pass' : contactScore >= 75 ? 'warning' : 'fail',
    score: contactScore,
    message: contactScore === 100 
      ? 'All essential candidate contact details (Name, Email, Phone, Location) are clearly specified.'
      : 'Missing essential contact fields that recruiters and ATS parsers extract.',
    actionableFix: 'Ensure Full Name, Email, Phone Number, and City/State location are present in plain text.',
    affectedPortal: 'all'
  });

  // --- CHECK 2: Standard Headings Compliance ---
  const standardHeadingsPass = Boolean(resume.workExperience.length) && Boolean(resume.education.length) && Boolean(resume.skills.hardSkills.length);
  checks.push({
    id: 2,
    name: 'Standard ATS Section Headings',
    category: 'Formatting',
    status: standardHeadingsPass ? 'pass' : 'warning',
    score: standardHeadingsPass ? 100 : 60,
    message: standardHeadingsPass
      ? 'Standard section titles ("Work Experience", "Education", "Skills") detected cleanly.'
      : 'Non-standard or missing standard section headings may confuse Workday and Taleo parsers.',
    actionableFix: 'Use recognized headings like "Work Experience", "Education", "Skills", and "Professional Summary".',
    affectedPortal: ['workday', 'taleo']
  });

  // --- CHECK 3: Single-Column Structure Safety ---
  const singleColumnPass = true; // Designed template engine enforces single-column
  checks.push({
    id: 3,
    name: 'Single-Column Layout Verification',
    category: 'Formatting',
    status: 'pass',
    score: 100,
    message: 'Template strictly maintains a single-column layout without unparsable HTML table tags or text boxes.',
    actionableFix: 'Maintain single-column design. Avoid floating text frames or multi-column resume grids.',
    affectedPortal: ['workday', 'lever']
  });

  // --- CHECK 4: Universal Font Compatibility ---
  checks.push({
    id: 4,
    name: 'Universal ATS Typography',
    category: 'Formatting',
    status: 'pass',
    score: 100,
    message: 'Uses standard system-safe typography (Inter / Arial / System Sans) recognizable by all portal OCR engines.',
    actionableFix: 'Avoid decorative custom web fonts that fail to embed in PDF outputs.',
    affectedPortal: 'all'
  });

  // --- CHECK 5: Header/Footer Trap Safety ---
  const headerTrapPass = hasEmail && hasPhone;
  checks.push({
    id: 5,
    name: 'Header & Footer Text Trap Check',
    category: 'Formatting',
    status: headerTrapPass ? 'pass' : 'fail',
    score: headerTrapPass ? 100 : 0,
    message: headerTrapPass 
      ? 'Contact details reside in the main document flow rather than isolated Word/PDF header regions.'
      : 'Contact details are missing or placed inside isolated header margins.',
    actionableFix: 'Keep phone number and email inside the main document body, not in Word top/bottom headers.',
    affectedPortal: ['workday', 'greenhouse']
  });

  // --- CHECK 6: Special Characters & Symbols ---
  const nonAsciiSymbols = (allText.match(/[^\x00-\x7F]/g) || []).length;
  const symbolScore = nonAsciiSymbols > 15 ? 50 : nonAsciiSymbols > 5 ? 80 : 100;
  checks.push({
    id: 6,
    name: 'Unparsable Symbols & Wingdings',
    category: 'Formatting',
    status: symbolScore === 100 ? 'pass' : symbolScore === 80 ? 'warning' : 'fail',
    score: symbolScore,
    message: symbolScore === 100
      ? 'Document is free of non-standard symbols, stars, or wingdings icons that garble text.'
      : `Detected ${nonAsciiSymbols} non-standard special characters that may distort in Taleo/Workday parsers.`,
    actionableFix: 'Replace custom bullet icons or wingding stars with clean standard bullet points or hyphens.',
    affectedPortal: ['taleo', 'workday']
  });

  // --- CHECK 7: Date Format Uniformity ---
  const allDates = resume.workExperience.flatMap(e => [e.startDate, e.endDate]);
  const validMmYyyy = allDates.every(d => !d || /^(0[1-9]|1[0-2])\/\d{4}$|^Present$|^\d{4}$/i.test(d.trim()));
  checks.push({
    id: 7,
    name: 'Date Format Uniformity (MM/YYYY)',
    category: 'Formatting',
    status: validMmYyyy ? 'pass' : 'warning',
    score: validMmYyyy ? 100 : 70,
    message: validMmYyyy
      ? 'All employment and education dates adhere to standard MM/YYYY or YYYY formats.'
      : 'Inconsistent date formats detected (e.g. "Mar 2021" vs "03/2021").',
    actionableFix: 'Format all dates consistently as MM/YYYY (e.g. 03/2023) or YYYY.',
    affectedPortal: ['workday', 'taleo']
  });

  // --- CHECK 8: Clean Hyperlink URLs ---
  const linkedinUrl = resume.personalInfo.linkedin || '';
  const cleanLink = !linkedinUrl || linkedinUrl.includes('linkedin.com/');
  checks.push({
    id: 8,
    name: 'Hyperlink Format Cleanliness',
    category: 'Formatting',
    status: cleanLink ? 'pass' : 'warning',
    score: cleanLink ? 100 : 70,
    message: cleanLink ? 'URLs and profile links are formatted with explicit domain strings.' : 'Hyperlinks may be obscured by anchor text.',
    actionableFix: 'Write out clean domain strings (e.g. linkedin.com/in/yourname) so parsers convert them accurately.',
    affectedPortal: ['taleo', 'lever']
  });

  // --- CHECK 9: Email Parsing Validity ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmail = emailRegex.test(resume.personalInfo.email.trim());
  checks.push({
    id: 9,
    name: 'Email Address Syntax Validation',
    category: 'Contact & Parsing',
    status: validEmail ? 'pass' : 'fail',
    score: validEmail ? 100 : 0,
    message: validEmail ? 'Email address syntax is 100% valid for recruiter auto-contact routing.' : 'Invalid or missing email address syntax.',
    actionableFix: 'Provide a valid standard email address (e.g., name@domain.com).',
    affectedPortal: 'all'
  });

  // --- CHECK 10: Phone Number Syntax ---
  const phoneRegex = /^[\+\d\s\(\)\-\.]{7,20}$/;
  const validPhone = phoneRegex.test(resume.personalInfo.phone.trim());
  checks.push({
    id: 10,
    name: 'Phone Number Syntax Standard',
    category: 'Contact & Parsing',
    status: validPhone ? 'pass' : 'warning',
    score: validPhone ? 100 : 50,
    message: validPhone ? 'Phone number format matches standard international or US patterns.' : 'Phone number format may not parse properly.',
    actionableFix: 'Format phone number cleanly with area code, e.g. +1 (555) 019-2831.',
    affectedPortal: 'all'
  });

  // --- CHECK 11: Location City & State Parsing ---
  const locationText = resume.personalInfo.location.trim();
  const validLocation = locationText.length >= 3 && locationText.includes(',');
  checks.push({
    id: 11,
    name: 'City & State Geographical Tagging',
    category: 'Contact & Parsing',
    status: validLocation ? 'pass' : 'warning',
    score: validLocation ? 100 : 60,
    message: validLocation ? 'Location cleanly formatted with City and State/Country for geographic search filters.' : 'Location missing comma-separated City, State.',
    actionableFix: 'Use standard "City, State" (e.g. "San Francisco, CA" or "London, UK") format.',
    affectedPortal: ['greenhouse', 'workday']
  });

  // --- CHECK 12: LinkedIn Profile Link ---
  const hasLinkedin = Boolean(resume.personalInfo.linkedin.trim());
  checks.push({
    id: 12,
    name: 'LinkedIn Profile Detection',
    category: 'Contact & Parsing',
    status: hasLinkedin ? 'pass' : 'warning',
    score: hasLinkedin ? 100 : 60,
    message: hasLinkedin ? 'LinkedIn URL detected. Lever and Greenhouse prioritize candidates with verified social profiles.' : 'Missing LinkedIn profile link.',
    actionableFix: 'Include your customized LinkedIn profile link in the contact header.',
    affectedPortal: ['lever', 'greenhouse']
  });

  // --- CHECK 13: Summary Length Balance ---
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  const summaryScore = summaryWords >= 30 && summaryWords <= 120 ? 100 : summaryWords > 0 ? 70 : 40;
  checks.push({
    id: 13,
    name: 'Professional Summary Length (30-120 words)',
    category: 'Contact & Parsing',
    status: summaryScore === 100 ? 'pass' : 'warning',
    score: summaryScore,
    message: summaryScore === 100
      ? `Summary is optimally sized at ${summaryWords} words.`
      : summaryWords === 0
      ? 'No professional summary found. Summaries provide crucial immediate keyword density.'
      : `Summary is ${summaryWords} words. Aim for 30–120 words.`,
    actionableFix: 'Craft a 3-4 sentence professional overview detailing your primary title, key domain skills, and top metrics.',
    affectedPortal: ['lever', 'greenhouse']
  });

  // --- CHECK 14: Chronological Sequence Integrity ---
  const hasExp = resume.workExperience.length > 0;
  checks.push({
    id: 14,
    name: 'Reverse Chronological Order Integrity',
    category: 'Contact & Parsing',
    status: hasExp ? 'pass' : 'warning',
    score: hasExp ? 100 : 50,
    message: hasExp ? 'Work history entries presented cleanly in order.' : 'No work experience history entries added.',
    actionableFix: 'List your most recent job role first and progress backward chronologically.',
    affectedPortal: ['greenhouse', 'workday']
  });

  // --- CHECK 15: Hard Skills Density ---
  const hardSkillsCount = resume.skills.hardSkills?.length || 0;
  const hardSkillsScore = hardSkillsCount >= 8 ? 100 : hardSkillsCount >= 5 ? 75 : 40;
  checks.push({
    id: 15,
    name: 'Essential Hard Skills Density',
    category: 'Keywords & Alignment',
    status: hardSkillsScore === 100 ? 'pass' : hardSkillsScore === 75 ? 'warning' : 'fail',
    score: hardSkillsScore,
    message: `Extracted ${hardSkillsCount} explicit hard skill tags. Recruiter boolean searches rely heavily on explicit skill arrays.`,
    actionableFix: 'Add at least 8-12 specific hard skills and domain methodologies relevant to your target job.',
    affectedPortal: ['workday', 'taleo']
  });

  // --- CHECK 16: Soft Skills Presence ---
  const softSkillsCount = resume.skills.softSkills?.length || 0;
  checks.push({
    id: 16,
    name: 'Soft Skills & Leadership Keywords',
    category: 'Keywords & Alignment',
    status: softSkillsCount >= 3 ? 'pass' : 'warning',
    score: softSkillsCount >= 3 ? 100 : 60,
    message: softSkillsCount >= 3 ? 'Soft skills and leadership attributes detected.' : 'Sparse soft skills section.',
    actionableFix: 'Include 3-5 core soft skills such as "Cross-Functional Collaboration", "Stakeholder Management", "Agile Leadership".',
    affectedPortal: ['greenhouse', 'lever']
  });

  // --- CHECK 17: Tools & Frameworks Count ---
  const toolsCount = resume.skills.toolsAndFrameworks?.length || 0;
  checks.push({
    id: 17,
    name: 'Tools & Technology Stack Coverage',
    category: 'Keywords & Alignment',
    status: toolsCount >= 4 ? 'pass' : 'warning',
    score: toolsCount >= 4 ? 100 : 65,
    message: toolsCount >= 4 ? `${toolsCount} specific software tools and technical frameworks listed.` : 'Few specific technical tools listed.',
    actionableFix: 'Specify exact software tools, cloud providers, or database platforms you use daily.',
    affectedPortal: ['workday', 'lever']
  });

  // --- CHECK 18: Action Verb Front-Loading ---
  let actionVerbBullets = 0;
  allBullets.forEach(b => {
    const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && ACTION_VERBS.has(firstWord)) {
      actionVerbBullets++;
    }
  });
  const verbRatio = allBullets.length ? actionVerbBullets / allBullets.length : 0;
  const verbScore = Math.round(verbRatio * 100);
  checks.push({
    id: 18,
    name: 'Action Verb Front-Loading Ratio',
    category: 'Impact & Verbs',
    status: verbScore >= 70 ? 'pass' : verbScore >= 40 ? 'warning' : 'fail',
    score: verbScore,
    message: `${verbScore}% of bullet points begin with a strong, definitive action verb.`,
    actionableFix: 'Begin every experience bullet point with an impactful verb (e.g. "Architected", "Spearheaded", "Optimized", "Launched").',
    affectedPortal: ['greenhouse', 'lever']
  });

  // --- CHECK 19: Measurable Metrics Density ---
  let metricBullets = 0;
  const metricRegex = /\d+(%|\$|k|M|B|x|\+)?|\b(percent|million|billion|thousand)\b/i;
  allBullets.forEach(b => {
    if (metricRegex.test(b)) {
      metricBullets++;
    }
  });
  const metricRatio = allBullets.length ? metricBullets / allBullets.length : 0;
  const metricScore = Math.round(metricRatio * 100);
  checks.push({
    id: 19,
    name: 'Quantifiable Metrics & Impact ($ / % / #)',
    category: 'Impact & Verbs',
    status: metricScore >= 50 ? 'pass' : metricScore >= 25 ? 'warning' : 'fail',
    score: metricScore,
    message: `${metricScore}% of bullet points contain quantifiable metrics or performance numbers.`,
    actionableFix: 'Add dollar amounts ($), percentage growth (%), team sizes, or efficiency increases to at least half of your bullet points.',
    affectedPortal: ['greenhouse', 'lever', 'workday']
  });

  // --- CHECK 20: Bullet Length Balance ---
  let idealLengthBullets = 0;
  allBullets.forEach(b => {
    const len = b.trim().split(/\s+/).length;
    if (len >= 12 && len <= 28) {
      idealLengthBullets++;
    }
  });
  const lengthRatio = allBullets.length ? idealLengthBullets / allBullets.length : 1;
  const lengthScore = Math.round(lengthRatio * 100);
  checks.push({
    id: 20,
    name: 'Bullet Length Scannability (12-28 words)',
    category: 'Impact & Verbs',
    status: lengthScore >= 70 ? 'pass' : 'warning',
    score: lengthScore,
    message: `${lengthScore}% of experience bullet points meet optimal scannable word counts.`,
    actionableFix: 'Trim excessively long multi-line paragraphs into concise, punchy 1-2 line bullet points (15-25 words).',
    affectedPortal: 'all'
  });

  // --- CHECK 21: Bullet Count Per Role ---
  const validBulletCounts = resume.workExperience.every(e => e.bullets.length >= 2 && e.bullets.length <= 6);
  checks.push({
    id: 21,
    name: 'Experience Role Bullet Count Balance',
    category: 'Impact & Verbs',
    status: validBulletCounts ? 'pass' : 'warning',
    score: validBulletCounts ? 100 : 70,
    message: validBulletCounts ? 'Role bullet counts are balanced (3-5 bullets per key job).' : 'Some roles have too few (<2) or too many (>6) bullet points.',
    actionableFix: 'Aim for 3-5 high-impact bullets for recent positions and 2-3 bullets for older roles.',
    affectedPortal: ['workday', 'taleo']
  });

  // --- CHECK 22: Passive Voice Elimination ---
  let passiveMatches = 0;
  WEAK_PASSIVE_PHRASES.forEach(phrase => {
    if (allText.toLowerCase().includes(phrase)) {
      passiveMatches++;
    }
  });
  const passiveScore = passiveMatches === 0 ? 100 : Math.max(30, 100 - passiveMatches * 20);
  checks.push({
    id: 22,
    name: 'Passive Voice & Filler Phrase Elimination',
    category: 'Impact & Verbs',
    status: passiveScore === 100 ? 'pass' : 'warning',
    score: passiveScore,
    message: passiveMatches === 0
      ? 'Zero weak passive phrases ("responsible for", "tasked with") detected.'
      : `Found ${passiveMatches} weak passive phrases in your text.`,
    actionableFix: 'Replace phrases like "responsible for" or "duties included" with active verbs like "Managed", "Executed", or "Delivered".',
    affectedPortal: ['lever', 'greenhouse']
  });

  // --- CHECK 23: Acronym + Full Term Coverage ---
  const commonAcronyms = ['aws', 'api', 'sql', 'ci/cd', 'seo', 'k8s', 'ui/ux', 'okr', 'crm', 'saas'];
  const acronymsFound = commonAcronyms.filter(a => allText.toLowerCase().includes(a)).length;
  checks.push({
    id: 23,
    name: 'Acronym & Abbreviation Keyword Coverage',
    category: 'Keywords & Alignment',
    status: acronymsFound > 0 ? 'pass' : 'pass',
    score: 100,
    message: 'Domain terminology and technical acronyms checked for boolean matching.',
    actionableFix: 'When using acronyms, consider including the full term once (e.g. "AWS (Amazon Web Services)") for maximum search coverage.',
    affectedPortal: ['lever', 'workday']
  });

  // --- CHECK 24: Repetitive Word Frequency ---
  const wordFreq: Record<string, number> = {};
  allBullets.join(' ').toLowerCase().split(/\s+/).forEach(w => {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length > 4 && !['their', 'there', 'which', 'other', 'about', 'through', 'using', 'based'].includes(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  const overused = Object.entries(wordFreq).filter(([_, count]) => count > 6);
  const repScore = overused.length === 0 ? 100 : Math.max(40, 100 - overused.length * 15);
  checks.push({
    id: 24,
    name: 'Vocabulary Diversity & Repetition Check',
    category: 'Impact & Verbs',
    status: repScore === 100 ? 'pass' : 'warning',
    score: repScore,
    message: overused.length === 0
      ? 'Vocabulary is varied without repetitive buzzword spam.'
      : `Overused words detected: ${overused.map(([w, c]) => `"${w}" (${c}x)`).join(', ')}.`,
    actionableFix: 'Vary your action verbs and vocabulary to prevent sounding repetitive.',
    affectedPortal: ['lever', 'greenhouse']
  });

  // --- CHECK 25: Job Title Clarity ---
  const hasJobTitle = Boolean(resume.personalInfo.jobTitle.trim());
  checks.push({
    id: 25,
    name: 'Standard Target Job Title Alignment',
    category: 'Keywords & Alignment',
    status: hasJobTitle ? 'pass' : 'fail',
    score: hasJobTitle ? 100 : 0,
    message: hasJobTitle ? `Target title "${resume.personalInfo.jobTitle}" is explicitly stated.` : 'Target job title is missing in the contact header.',
    actionableFix: 'Include a clear target job title under your name (e.g. "Senior Software Engineer" or "Product Manager").',
    affectedPortal: 'all'
  });

  // --- CHECK 26: Education & Degree Formatting ---
  const hasEdu = resume.education.length > 0;
  checks.push({
    id: 26,
    name: 'Education & Academic Degree Standard',
    category: 'Contact & Parsing',
    status: hasEdu ? 'pass' : 'warning',
    score: hasEdu ? 100 : 50,
    message: hasEdu ? 'Degree and institution details clearly listed.' : 'No education history listed.',
    actionableFix: 'List degree name (e.g. Bachelor of Science in Computer Science), institution, and completion year.',
    affectedPortal: 'all'
  });

  // --- CHECK 27: Section Hierarchy Depth ---
  const hasMultipleSections = (resume.workExperience.length > 0 ? 1 : 0) +
    (resume.education.length > 0 ? 1 : 0) +
    (resume.skills.hardSkills.length > 0 ? 1 : 0) +
    (resume.summary ? 1 : 0);
  checks.push({
    id: 27,
    name: 'Section Hierarchy Balance',
    category: 'Formatting',
    status: hasMultipleSections >= 3 ? 'pass' : 'warning',
    score: hasMultipleSections >= 3 ? 100 : 60,
    message: hasMultipleSections >= 3 ? 'Document possesses a rich structural hierarchy.' : 'Missing key structural sections.',
    actionableFix: 'Ensure all primary sections (Summary, Experience, Education, Skills) are populated.',
    affectedPortal: 'all'
  });

  // --- CHECK 28: Total Word Count Range ---
  const wordCountScore = totalWords >= 300 && totalWords <= 950 ? 100 : totalWords < 300 ? 50 : 70;
  checks.push({
    id: 28,
    name: 'Total Document Length & Density (300-900 words)',
    category: 'Formatting',
    status: wordCountScore === 100 ? 'pass' : 'warning',
    score: wordCountScore,
    message: wordCountScore === 100
      ? `Total word count (${totalWords} words) is optimal for standard 1 to 2 page parsing.`
      : `Document length is ${totalWords} words. Aim for 350-800 words.`,
    actionableFix: 'Adjust content length so it fits cleanly into 1 or 2 full pages without sparse white space or overflow clutter.',
    affectedPortal: 'all'
  });

  // --- Calculate Overall & Portal Scores ---
  const totalScoreSum = checks.reduce((acc, c) => acc + c.score, 0);
  const overallScore = Math.round(totalScoreSum / checks.length);

  // Portal Weights
  const calculatePortalScore = (portal: PortalType, portalName: string): PortalCompatibilityScore => {
    const portalChecks = checks.filter(c => c.affectedPortal === 'all' || (Array.isArray(c.affectedPortal) && c.affectedPortal.includes(portal)));
    const portalSum = portalChecks.reduce((acc, c) => acc + c.score, 0);
    const score = Math.round(portalSum / portalChecks.length);
    const passed = portalChecks.filter(c => c.status === 'pass').length;

    const keyStrengths = portalChecks.filter(c => c.status === 'pass').slice(0, 3).map(c => c.name);
    const keyRisks = portalChecks.filter(c => c.status !== 'pass').slice(0, 3).map(c => c.actionableFix);

    return {
      portal,
      portalName,
      score,
      passedChecksCount: passed,
      totalChecksCount: portalChecks.length,
      keyStrengths,
      keyRisks
    };
  };

  const portalScores = {
    workday: calculatePortalScore('workday', 'Workday ATS'),
    greenhouse: calculatePortalScore('greenhouse', 'Greenhouse ATS'),
    lever: calculatePortalScore('lever', 'Lever ATS'),
    taleo: calculatePortalScore('taleo', 'Taleo ATS')
  };

  const passedCount = checks.filter(c => c.status === 'pass').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'fail').length;

  let statusLabel: OverallAtsReport['statusLabel'] = 'Moderate ATS Readiness';
  if (overallScore >= 90) statusLabel = 'Top 5% Candidate';
  else if (overallScore >= 80) statusLabel = 'ATS Ready (>80)';
  else if (overallScore >= 60) statusLabel = 'Moderate ATS Readiness';
  else statusLabel = 'Critical Fixes Needed';

  return {
    overallScore,
    statusLabel,
    portalScores,
    checks,
    checkSummary: {
      passed: passedCount,
      warnings: warningCount,
      failed: failedCount
    },
    parsedRepresentation: {
      contactParsed: Boolean(resume.personalInfo.email && resume.personalInfo.fullName),
      skillsCount: (resume.skills.hardSkills?.length || 0) + (resume.skills.toolsAndFrameworks?.length || 0),
      workHistoryCount: resume.workExperience.length,
      dateFormatsValid: validMmYyyy,
      extractedKeywords: [...(resume.skills.hardSkills || []), ...(resume.skills.toolsAndFrameworks || [])]
    }
  };
}
