import type { ResumeData } from "@/types";

const stopWords = new Set([
  "and",
  "the",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "will",
  "can",
  "must",
  "using",
  "use",
  "skills",
  "experience",
  "role",
  "work",
  "workload",
  "team",
  "job",
]);

const actionVerbs = [
  "led",
  "built",
  "created",
  "delivered",
  "designed",
  "managed",
  "improved",
  "optimized",
  "reduced",
  "increased",
  "implemented",
  "developed",
  "orchestrated",
  "owned",
  "drove",
  "support",
  "supported",
  "launched",
  "scaled",
  "automated",
];

const industrySkillsMap: Record<string, string[]> = {
  software: ["React", "Next.js", "TypeScript", "Node.js", "Docker", "AWS"],
  data: ["SQL", "Power BI", "Excel", "Python", "Tableau", "BigQuery"],
  ai: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "LangChain", "NLP"],
  marketing: [
    "SEO",
    "Google Analytics",
    "Content Strategy",
    "Campaign Optimization",
    "Email Marketing",
  ],
  sales: [
    "CRM",
    "Lead Generation",
    "Negotiation",
    "Pipeline Management",
    "Revenue Growth",
  ],
  hr: [
    "Talent Acquisition",
    "Employee Engagement",
    "HRIS",
    "Performance Management",
    "Policy Compliance",
  ],
  mechanical: [
    "CAD",
    "SolidWorks",
    "Project Management",
    "Thermodynamics",
    "Product Design",
  ],
  civil: [
    "AutoCAD",
    "Structural Analysis",
    "Project Planning",
    "Construction Management",
    "Cost Estimation",
  ],
  healthcare: [
    "Patient Care",
    "Clinical Documentation",
    "Healthcare Compliance",
    "EMR",
    "Process Improvement",
  ],
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1")
    .replace(/[“”"'•–—–,.()\[\]\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKeywords(text: string) {
  const normalized = normalizeText(text);
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stopWords.has(token));

  const unique = new Set<string>();
  tokens.forEach((token) => unique.add(token));
  return Array.from(unique);
}

export function joinResumeText(resume: ResumeData) {
  return [
    resume.personalInfo.summary,
    resume.personalInfo.jobTitle,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.projects
      .map((project) => `${project.name} ${project.description}`)
      .join(" "),
    resume.experience
      .map(
        (experience) =>
          `${experience.position} ${experience.company} ${experience.description}`,
      )
      .join(" "),
    resume.skills.map((skill) => skill.name).join(" "),
    resume.education
      .map(
        (education) =>
          `${education.degree} ${education.field} ${education.school}`,
      )
      .join(" "),
    resume.certifications.map((item) => item.value).join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

export function parseJobDescription(jdText: string) {
  const keywords = extractKeywords(jdText);
  const lines = jdText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const requiredSkills: string[] = [];
  const responsibilities: string[] = [];
  let experienceYears: string | null = null;

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (
      /(skills|requirements|must have|should have|experience with)/.test(lower)
    ) {
      const parts = line
        .split(/:|\-|–|\|/)
        .slice(1)
        .join(" ")
        .split(/,|and|or/);
      parts.forEach((part) => {
        const skill = part.trim();
        if (skill.length >= 3 && !stopWords.has(skill)) {
          requiredSkills.push(skill.replace(/\.$/, ""));
        }
      });
    }

    if (/(years of experience|yrs|year experience|experience in)/.test(lower)) {
      const match = lower.match(/(\d+[+]?)\s*(years|yrs|year)/);
      if (match) {
        experienceYears = match[1];
      }
    }

    if (
      /(responsibilities|accountabilities|you will|you are expected)/.test(
        lower,
      )
    ) {
      responsibilities.push(line);
    }
  });

  return {
    requiredSkills: Array.from(new Set(requiredSkills)).slice(0, 20),
    keywords,
    experienceYears,
    responsibilities,
  };
}

export function compareKeywords(resume: ResumeData, jdText: string) {
  const resumeText = joinResumeText(resume);
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = extractKeywords(jdText);
  const matched = jdKeywords.filter((keyword) => resumeKeywords.has(keyword));
  const missing = jdKeywords.filter((keyword) => !resumeKeywords.has(keyword));

  return {
    matchedKeywords: Array.from(new Set(matched)).slice(0, 40),
    missingKeywords: Array.from(new Set(missing)).slice(0, 40),
    keywordMatchPct: jdKeywords.length
      ? Math.round((matched.length / jdKeywords.length) * 100)
      : 100,
    jdKeywordsCount: jdKeywords.length,
  };
}

export function getExperienceQuality(resume: ResumeData) {
  const descriptions = resume.experience
    .map((item) => item.description.trim())
    .filter(Boolean);
  if (!descriptions.length) {
    return 12;
  }

  const lengthScore = Math.min(
    100,
    Math.round(
      descriptions.reduce((sum, desc) => sum + desc.length, 0) /
        descriptions.length /
        120,
    ) *
      20 +
      20,
  );
  const verbCount = descriptions.flatMap((desc) =>
    actionVerbs.filter((verb) => desc.toLowerCase().includes(verb)),
  ).length;
  const verbScore = Math.min(
    100,
    Math.round((verbCount / Math.max(1, descriptions.length)) * 40),
  );

  return Math.min(100, Math.round(lengthScore * 0.55 + verbScore * 0.45));
}

export function getEducationCompleteness(resume: ResumeData) {
  if (!resume.education.length) {
    return 0;
  }

  const completeCount = resume.education.filter((education) =>
    Boolean(
      education.school &&
      education.degree &&
      education.field &&
      education.startDate &&
      education.endDate,
    ),
  ).length;

  return Math.round((completeCount / resume.education.length) * 100);
}

export function getProjectStrength(resume: ResumeData) {
  if (!resume.projects.length) {
    return 10;
  }

  const projectScore = resume.projects.reduce((score, project) => {
    const hasText = Boolean(project.description.trim());
    const hasLink = Boolean(project.link.trim());
    if (hasText && hasLink) {
      return score + 25;
    }
    if (hasText) {
      return score + 18;
    }
    return score + 8;
  }, 0);

  return Math.min(100, projectScore);
}

export function getFormattingIssues(resume: ResumeData) {
  const issues: string[] = [];
  const contact = resume.personalInfo;
  if (!contact.email || !contact.phone || !contact.location) {
    issues.push(
      "Complete your core contact information: email, phone, and location.",
    );
  }

  if (!contact.summary?.trim()) {
    issues.push("Add a concise professional summary to lead your resume.");
  }

  if (!resume.experience.length) {
    issues.push("Add at least one relevant work experience entry.");
  }

  if (!resume.skills.length) {
    issues.push("List at least 4-6 relevant skills for your target role.");
  }

  if (!resume.projects.length) {
    issues.push("Include at least one project or achievement to show results.");
  }

  if (resume.achievements.length === 0) {
    issues.push("Convert role duties into measurable achievements.");
  }

  return issues;
}

export function generateResumeScore(resume: ResumeData, jdText?: string) {
  const experienceQuality = getExperienceQuality(resume);
  const educationCompleteness = getEducationCompleteness(resume);
  const projectStrength = getProjectStrength(resume);
  const formattingIssues = getFormattingIssues(resume);
  const baseScore = Math.round(
    experienceQuality * 0.3 +
      educationCompleteness * 0.2 +
      projectStrength * 0.2 +
      (100 - formattingIssues.length * 12) * 0.2,
  );

  const jdComparison = jdText ? compareKeywords(resume, jdText) : null;
  const keywordScore = jdComparison ? jdComparison.keywordMatchPct : 100;

  const finalScore = Math.min(
    100,
    Math.max(0, Math.round(baseScore * 0.75 + keywordScore * 0.25)),
  );

  return {
    score: finalScore,
    experienceQuality,
    educationCompleteness,
    projectStrength,
    formattingIssues,
    keywordMatchPct: keywordScore,
    missingKeywords: jdComparison?.missingKeywords || [],
    matchedKeywords: jdComparison?.matchedKeywords || [],
    jdKeywordsCount: jdComparison?.jdKeywordsCount || 0,
  };
}

export function buildRecommendations(resume: ResumeData, jdText?: string) {
  const issues = getFormattingIssues(resume);
  const recommendations = [...issues];

  if (!resume.personalInfo.summary.trim()) {
    recommendations.push(
      "Write a recruiter-friendly summary that highlights your target role and key strengths.",
    );
  }

  if (
    resume.experience.length &&
    resume.experience.every(
      (item) =>
        !item.description.includes("%") &&
        !item.description.includes("improved"),
    )
  ) {
    recommendations.push(
      "Add measurable outcomes or productivity improvements in your experience descriptions.",
    );
  }

  if (resume.achievements.length === 0) {
    recommendations.push(
      "Turn responsibility statements into achievement bullet points with metrics.",
    );
  }

  if (jdText) {
    const comparison = compareKeywords(resume, jdText);
    if (comparison.missingKeywords.length > 0) {
      recommendations.push(
        `Match the job description by adding keywords such as: ${comparison.missingKeywords.slice(0, 8).join(", ")}.`,
      );
    }
  }

  if (
    !resume.personalInfo.linkedin?.trim() &&
    !resume.personalInfo.github?.trim()
  ) {
    recommendations.push(
      "Add a LinkedIn or GitHub profile link to strengthen recruiter trust.",
    );
  }

  return Array.from(new Set(recommendations)).slice(0, 8);
}

export function generateSummary(resume: ResumeData) {
  const title = resume.personalInfo.jobTitle || "professional";
  const location = resume.personalInfo.location
    ? `based in ${resume.personalInfo.location}`
    : "with strong domain experience";
  const skills = resume.skills
    .slice(0, 5)
    .map((skill) => skill.name)
    .filter(Boolean);
  const achievement =
    resume.achievements[0]?.value ||
    resume.projects[0]?.description ||
    "delivering measurable results";

  return `Experienced ${title} ${location}, known for ${achievement.toLowerCase()}. Skilled in ${skills.join(", ")} and proven at transforming complex challenges into clear business outcomes.`;
}

export function generateAchievement(raw: string) {
  const normalized = normalizeText(raw);
  if (!normalized) {
    return "Add specific numbers and results to turn this into a measurable achievement.";
  }

  const actionMatch = actionVerbs.find((verb) => normalized.includes(verb));
  const result = normalized.replace(
    /worked on|was responsible for|helped with|assisted with|worked with|supported/gi,
    "delivered",
  );
  const metric = /\b(\d+)%\b/.test(raw)
    ? "improving outcomes by " + raw.match(/\b(\d+)%\b/)?.[1] + "%"
    : "driving measurable business impact";
  const statement = result.charAt(0).toUpperCase() + result.slice(1);

  if (!actionMatch) {
    return `Delivered ${statement} while ${metric}.`;
  }

  return `${statement.replace(/\.$/, "")} and ${metric}.`;
}

export function recommendTrendingSkills(jobTitle: string) {
  const title = jobTitle.toLowerCase();
  const seeds = Object.entries(industrySkillsMap).find(([key]) =>
    title.includes(key),
  );
  if (seeds) {
    return seeds[1];
  }

  return [
    "Communication",
    "Problem Solving",
    "Collaboration",
    "Adaptability",
    "Data Analysis",
  ];
}

export function recommendProjects(jobTitle: string) {
  const title = jobTitle.toLowerCase();
  if (title.includes("software") || title.includes("engineer")) {
    return [
      "Build a full-stack web app using React, Next.js and a cloud backend.",
      "Create an automation tool that reduces manual workflows by 30%.",
      "Develop a performance-focused feature with measurable user impact.",
    ];
  }

  if (title.includes("data") || title.includes("analyst")) {
    return [
      "Analyze business datasets to uncover trends and improve decision making.",
      "Create interactive dashboards using Power BI or Tableau.",
      "Build a predictive model that supports a key business outcome.",
    ];
  }

  if (title.includes("marketing")) {
    return [
      "Run a campaign that increased leads by a measurable percentage.",
      "Design marketing assets and track conversions through analytics.",
      "Optimize content strategy for organic traffic growth.",
    ];
  }

  return [
    "Create a project that demonstrates your core domain skills.",
    "Focus on measurable outcomes and clear responsibilities.",
    "Build a case study that shows process improvement and customer impact.",
  ];
}

export function generateCoverLetter(
  resume: ResumeData,
  role: string,
  company: string,
  jdText?: string,
) {
  const intro = `Dear Hiring Team,\n\nI am excited to apply for the ${role} position at ${company}. With experience in ${resume.personalInfo.jobTitle || role} and a proven track record of delivering results through strong collaboration, I am confident I can contribute to your team.`;

  const highlights = `In my current role, I have delivered ${resume.achievements[0]?.value || "business improvements"} while building expertise in ${resume.skills
    .slice(0, 4)
    .map((skill) => skill.name)
    .join(
      ", ",
    )}. I focus on measurable outcomes, clean execution, and stakeholder alignment.`;

  const closing = `I would welcome the opportunity to discuss how my experience aligns with your needs at ${company}. Thank you for considering my application.`;

  const jdNote = jdText
    ? `\n\nI reviewed the role details and believe my experience matches the skills and priorities outlined in the job description.`
    : "";

  return `${intro}\n\n${highlights}${jdNote}\n\n${closing}\n\nSincerely,\n${resume.personalInfo.fullName}`;
}

export function generateInterviewQuestions(jobTitle: string) {
  const normalized = jobTitle.toLowerCase();
  const technical =
    normalized.includes("engineer") ||
    normalized.includes("developer") ||
    normalized.includes("data") ||
    normalized.includes("analyst");

  return {
    hr: [
      "Tell me about your most impactful career project.",
      "Why are you interested in this role and company?",
      "How do you prioritize competing deadlines?",
    ],
    technical: technical
      ? [
          `Describe a recent ${jobTitle} project you delivered end-to-end.`,
          "How do you approach debugging and root-cause analysis?",
          "Explain a technical tradeoff you made and why.",
        ]
      : [
          "What tools do you rely on to organize your daily work?",
          "How do you learn new processes or systems quickly?",
          "Describe a time you improved collaboration across teams.",
        ],
    behavioral: [
      "Tell me about a time you solved a difficult problem under pressure.",
      "Describe a situation where you had to adapt to new requirements quickly.",
      "How do you manage feedback and incorporate it into your work?",
    ],
  };
}

export function generateCareerRoadmap(jobTitle: string) {
  const title = jobTitle.toLowerCase();
  if (title.includes("software") || title.includes("engineer")) {
    return [
      "Master full-stack development with React, Next.js, and cloud services.",
      "Build a portfolio of end-to-end technical projects with measurable impact.",
      "Learn system design and architecture for scalable applications.",
      "Earn certifications in cloud or DevOps to strengthen your profile.",
    ];
  }

  if (title.includes("data") || title.includes("analyst")) {
    return [
      "Sharpen SQL and data visualization skills using Power BI or Tableau.",
      "Practice building predictive models and explaining business impact.",
      "Create dashboards that empower stakeholders with actionable insights.",
      "Pursue analytics or data science certifications to validate your expertise.",
    ];
  }

  if (title.includes("marketing")) {
    return [
      "Focus on campaign strategy, content performance, and analytics.",
      "Gain hands-on experience with SEO, paid media, and email automation.",
      "Build a marketing portfolio with measurable engagement metrics.",
      "Take certifications in digital marketing, analytics, or brand strategy.",
    ];
  }

  return [
    "Clarify your target role and the industry skills that hiring managers seek.",
    "Build a collection of projects or case studies that show real outcomes.",
    "Learn tools and processes widely used in your target career field.",
    "Connect with mentors and recruiters to refine your growth path.",
  ];
}

export function optimizeLinkedIn(resume: ResumeData) {
  const title = resume.personalInfo.jobTitle || "Professional";
  const skills = resume.skills
    .slice(0, 5)
    .map((skill) => skill.name)
    .filter(Boolean);
  const headline = `${title} | ${skills.slice(0, 4).join(" • ")}`;
  const about = `Experienced ${title} with a strong track record in ${skills.join(", ")} and measurable impact across projects. Skilled at aligning business outcomes, improving processes, and building high-performing teams.`;

  return { headline, about };
}
