import { ResumeData } from '../types';

export const SAMPLE_RESUMES: ResumeData[] = [
  {
    id: 'sample-software-engineer',
    title: 'Senior Software Engineer (ATS Optimized)',
    lastUpdated: '2026-07-30',
    templateId: 'classic-ats',
    personalInfo: {
      fullName: 'Alex Vance',
      jobTitle: 'Senior Software Engineer',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 382-9102',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexvance-dev',
      github: 'github.com/alexvance-dev',
      website: 'alexvance.dev',
    },
    summary: 'Results-oriented Senior Software Engineer with over 6 years of experience architecting distributed cloud systems, high-throughput microservices, and web applications. Proven track record of reducing system latency by 42% and driving engineering team efficiency through CI/CD pipeline automation.',
    workExperience: [
      {
        id: 'exp-1',
        company: 'CloudScale Technologies',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '03/2023',
        endDate: 'Present',
        isCurrent: true,
        bullets: [
          'Architected and deployed enterprise microservices in TypeScript, Node.js, and React serving 1.8M daily active users with 99.99% uptime.',
          'Optimized PostgreSQL query execution plans and Redis caching layer, reducing API latency by 42% across core user workflows.',
          'Spearheaded migration to Kubernetes on AWS (EKS), cutting cloud infrastructure costs by $115,000 annually.',
          'Mentored 5 junior engineers and introduced automated GitHub Actions workflows, accelerating deployment frequency from bi-weekly to daily.'
        ],
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS EKS', 'Redis', 'Docker', 'GraphQL']
      },
      {
        id: 'exp-2',
        company: 'Apex Data Labs',
        position: 'Software Engineer',
        location: 'San Jose, CA',
        startDate: '06/2020',
        endDate: '02/2023',
        isCurrent: false,
        bullets: [
          'Engineered real-time data streaming pipeline handling over 100,000 events/sec using Apache Kafka and Python.',
          'Built responsive front-end dashboard with React, Redux, and Tailwind CSS for enterprise data analytics visualization.',
          'Refactored legacy REST endpoints to GraphQL, decreasing payload size by 35% and client load time by 600ms.'
        ],
        technologies: ['React', 'Python', 'Apache Kafka', 'GraphQL', 'Tailwind CSS', 'Docker']
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science (B.S.)',
        fieldOfStudy: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '08/2016',
        endDate: '05/2020',
        gpa: '3.82 / 4.0',
        highlights: ['Dean\'s Honors List (6 consecutive semesters)', 'ACM Programming Club President']
      }
    ],
    skills: {
      hardSkills: [
        'TypeScript', 'JavaScript (ES6+)', 'Node.js', 'React.js', 'Python', 'GraphQL', 'RESTful API Design',
        'System Architecture', 'Database Optimization', 'Microservices Architecture', 'CI/CD Pipelines'
      ],
      softSkills: [
        'Technical Leadership', 'Cross-Functional Collaboration', 'Agile / Scrum', 'Mentorship', 'Problem Solving'
      ],
      toolsAndFrameworks: [
        'AWS (EKS, Lambda, S3)', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Apache Kafka', 'Git', 'GitHub Actions'
      ],
      languages: ['English (Native)', 'Spanish (Professional)']
    },
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        date: '11/2023'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'OpenPulse - Real-time Server Performance Monitor',
        role: 'Creator & Maintainer',
        link: 'github.com/alexvance-dev/openpulse',
        bullets: [
          'Built open-source telemetry dashboard in Node.js and React with over 1,200 GitHub stars.',
          'Integrated WebSockets and Prometheus metrics for sub-10ms system health alerts.'
        ],
        techStack: ['Node.js', 'React', 'Prometheus', 'WebSockets', 'Tailwind CSS']
      }
    ]
  },
  {
    id: 'sample-product-manager',
    title: 'Senior Product Manager',
    lastUpdated: '2026-07-28',
    templateId: 'modern-corporate',
    personalInfo: {
      fullName: 'Sarah Lin',
      jobTitle: 'Senior Product Manager',
      email: 'sarah.lin@example.com',
      phone: '+1 (555) 749-2041',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/sarahlin-pm',
      github: '',
      website: 'sarahlinpm.com',
    },
    summary: 'Data-driven Product Leader with 7+ years of experience launching B2B SaaS and consumer mobile products from 0 to 1. Track record of driving 38% YoY ARR growth and scaling active user retention through quantitative user research, OKR alignment, and roadmap prioritization.',
    workExperience: [
      {
        id: 'exp-1',
        company: 'Vanguard SaaS Solutions',
        position: 'Senior Product Manager',
        location: 'New York, NY',
        startDate: '01/2022',
        endDate: 'Present',
        isCurrent: true,
        bullets: [
          'Led cross-functional team of 14 engineers, designers, and data analysts to launch AI-driven automated onboarding flow, boosting conversion rate by 28%.',
          'Managed product lifecycle and quarterly OKRs for core enterprise tier, growing annual recurring revenue (ARR) from $12M to $16.5M in 18 months.',
          'Conducted 80+ customer discovery interviews and quantitative A/B experiments to redesign checkout funnel, cutting user churn by 14%.'
        ]
      },
      {
        id: 'exp-2',
        company: 'FlowMetrics Mobile',
        position: 'Product Manager',
        location: 'New York, NY',
        startDate: '08/2018',
        endDate: '12/2021',
        isCurrent: false,
        bullets: [
          'Owned product roadmap for iOS and Android mobile app with 500k+ MAU, prioritizing feature backlogs using RICE framework.',
          'Partnered with UX research and engineering to deliver dark mode and notification customization, improving 30-day retention by 19%.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Columbia University',
        degree: 'Bachelor of Arts (B.A.)',
        fieldOfStudy: 'Economics & Psychology',
        location: 'New York, NY',
        startDate: '09/2014',
        endDate: '05/2018'
      }
    ],
    skills: {
      hardSkills: [
        'Product Strategy', 'Product Lifecycle Management', 'Roadmapping', 'A/B Testing', 'User Research',
        'Agile / Scrum Methodology', 'SQL Data Analysis', 'Wireframing', 'Go-To-Market (GTM) Strategy'
      ],
      softSkills: [
        'Executive Stakeholder Management', 'Cross-Functional Leadership', 'Conflict Resolution', 'Data-Informed Decision Making'
      ],
      toolsAndFrameworks: [
        'Jira', 'Confluence', 'Mixpanel', 'Amplitude', 'Figma', 'Productboard', 'SQL', 'Tableau'
      ],
      languages: ['English (Native)', 'Mandarin (Fluent)']
    },
    certifications: [
      {
        id: 'cert-1',
        name: 'Certified Scrum Product Owner (CSPO)',
        issuer: 'Scrum Alliance',
        date: '04/2021'
      }
    ],
    projects: []
  }
];

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'jd-sr-frontend',
    title: 'Senior Frontend / Fullstack Engineer - Workday / Greenhouse Partner',
    company: 'FinTech Innovations Inc.',
    description: `We are looking for a Senior Software Engineer to join our high-growth platform team.

Key Responsibilities:
- Design, build, and maintain scalable web applications and microservices using TypeScript, React, and Node.js.
- Optimize database queries (PostgreSQL/Redis) for low latency and high availability.
- Work closely with DevOps to deploy microservices on AWS (EKS / Lambda) using Docker and Kubernetes.
- Drive frontend performance improvements, web vitals, and unit/integration testing (Jest, Cypress).
- Collaborate in an Agile/Scrum environment with cross-functional product managers and designers.

Required Hard Skills & Qualifications:
- 5+ years of production experience with TypeScript, React, Node.js, and RESTful/GraphQL APIs.
- Deep experience with PostgreSQL, Redis, Docker, and AWS cloud infrastructure.
- Demonstrated experience in CI/CD pipeline automation and Kubernetes orchestration.
- Bachelor's degree in Computer Science, Software Engineering, or equivalent experience.
- Strong problem-solving, system design, and technical communication skills.`
  },
  {
    id: 'jd-lead-pm',
    title: 'Lead Product Manager - Enterprise SaaS (Lever / Taleo Target)',
    company: 'CloudScale Enterprises',
    description: `Seeking a Lead Product Manager to drive product strategy and execution for our core B2B SaaS platform.

Responsibilities:
- Define product roadmaps, quarterly OKRs, and go-to-market strategies aligned with revenue targets.
- Conduct quantitative cohort analysis using Mixpanel/Amplitude and qualitative customer discovery interviews.
- Lead cross-functional engineering and UX teams using Agile frameworks (Jira, RICE prioritization).
- Analyze churn metrics, customer acquisition costs (CAC), and lifetime value (LTV) to optimize conversion funnels.

Qualifications:
- 6+ years in Product Management for B2B SaaS platforms.
- Proven expertise with SQL data extraction, Mixpanel, Jira, and Figma wireframing.
- CSPO or Agile Certification preferred. Strong executive presentation skills.`
  }
];
