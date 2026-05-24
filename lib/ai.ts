// AI Service Integration Helper
// Supports both Gemini and OpenAI APIs

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // "gemini" or "openai"

interface AIGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface ATSAnalysisResult {
  score: number;
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
}

interface CoverLetterResult {
  content: string;
  suggestions: string[];
}

interface LinkedInProfileResult {
  headline: string;
  about: string;
  experienceSummary: string;
  skills: string[];
  featuredContent: string[];
}

async function generateWithGemini(
  prompt: string,
  maxTokens: number = 1000,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

async function generateWithOpenAI(
  prompt: string,
  maxTokens: number = 1000,
  temperature: number = 0.7,
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

async function generateAI(options: AIGenerateOptions): Promise<string> {
  const { prompt, maxTokens = 1000, temperature } = options;

  try {
    if (AI_PROVIDER === "openai") {
      return await generateWithOpenAI(prompt, maxTokens, temperature);
    } else {
      return await generateWithGemini(prompt, maxTokens);
    }
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}

export async function analyzeResumeATS(
  resumeText: string,
): Promise<ATSAnalysisResult> {
  const prompt = `Analyze the following resume for ATS (Applicant Tracking System) compatibility. Return a JSON response with:
- score (0-100)
- missingKeywords (array of strings)
- formattingIssues (array of strings)
- suggestions (array of strings)

Resume:
${resumeText}

Return ONLY valid JSON, no other text.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 1500 });
    const parsed = JSON.parse(response);
    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : [],
      formattingIssues: Array.isArray(parsed.formattingIssues)
        ? parsed.formattingIssues
        : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error("ATS Analysis failed:", error);
    return {
      score: 0,
      missingKeywords: [],
      formattingIssues: ["Could not analyze resume"],
      suggestions: ["Please try again"],
    };
  }
}

export async function optimizeResume(resumeText: string): Promise<string> {
  const prompt = `Improve the following resume by:
1. Enhancing grammar and professional wording
2. Improving impact statements
3. Using strong action verbs
4. Better formatting of achievements
5. Making it more ATS-friendly

Return only the improved resume text, no explanations.

Resume:
${resumeText}`;

  try {
    return await generateAI({ prompt, maxTokens: 2000 });
  } catch (error) {
    console.error("Resume optimization failed:", error);
    throw error;
  }
}

export async function generateCoverLetter(
  jobDescription: string,
  resumeContent: string,
  candidateType: "fresher" | "experienced" | "internship" | "career_change",
): Promise<CoverLetterResult> {
  const typeContext = {
    fresher: "recent graduate with enthusiasm and willingness to learn",
    experienced: "seasoned professional with proven track record",
    internship: "student seeking practical experience and skill development",
    career_change:
      "professional transitioning to a new field with transferable skills",
  };

  const prompt = `Generate a professional cover letter for a ${typeContext[candidateType]}.

Job Description:
${jobDescription}

Candidate Resume:
${resumeContent}

Return a JSON response with:
- content (the cover letter text)
- suggestions (array of 3-5 suggestions for personalization)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 2000 });
    const parsed = JSON.parse(response);
    return {
      content: parsed.content || "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    throw error;
  }
}

export async function generateLinkedInProfile(
  resumeContent: string,
): Promise<LinkedInProfileResult> {
  const prompt = `Based on the following resume, generate LinkedIn profile content optimized for professional visibility.

Resume:
${resumeContent}

Return a JSON response with:
- headline (compelling LinkedIn headline, max 220 chars)
- about (LinkedIn about section, 200-250 words)
- experienceSummary (concise experience summary)
- skills (array of top 10 skills to highlight)
- featuredContent (array of 3-5 content ideas to share)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 2000 });
    const parsed = JSON.parse(response);
    return {
      headline: parsed.headline || "",
      about: parsed.about || "",
      experienceSummary: parsed.experienceSummary || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      featuredContent: Array.isArray(parsed.featuredContent)
        ? parsed.featuredContent
        : [],
    };
  } catch (error) {
    console.error("LinkedIn profile generation failed:", error);
    throw error;
  }
}

export async function analyzeJobDescriptionMatch(
  jobDescription: string,
  resumeContent: string,
): Promise<{
  matchPercentage: number;
  missingSkills: string[];
  missingKeywords: string[];
  suggestedChanges: string[];
}> {
  const prompt = `Analyze how well the resume matches the job description.

Job Description:
${jobDescription}

Resume:
${resumeContent}

Return a JSON response with:
- matchPercentage (0-100)
- missingSkills (array of required skills not in resume)
- missingKeywords (array of important keywords from JD not in resume)
- suggestedChanges (array of specific changes to improve match)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 1500 });
    const parsed = JSON.parse(response);
    return {
      matchPercentage: Math.min(100, Math.max(0, parsed.matchPercentage || 0)),
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : [],
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : [],
      suggestedChanges: Array.isArray(parsed.suggestedChanges)
        ? parsed.suggestedChanges
        : [],
    };
  } catch (error) {
    console.error("Job match analysis failed:", error);
    throw error;
  }
}

export async function generateCareerRoadmap(
  currentRole: string,
  targetRole: string,
  experience: string,
): Promise<string> {
  const prompt = `Create a detailed career roadmap for someone moving from ${currentRole} to ${targetRole}.

Current Experience:
${experience}

Provide a structured roadmap with:
1. Current state assessment
2. Key skills to develop
3. Recommended certifications
4. Suggested roles/experience to pursue
5. Timeline (6-12 months)
6. Action items (monthly goals)

Format as clear, actionable guidance.`;

  try {
    return await generateAI({ prompt, maxTokens: 2000 });
  } catch (error) {
    console.error("Career roadmap generation failed:", error);
    throw error;
  }
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
): Promise<string[]> {
  const prompt = `Generate 15 relevant interview questions for a ${jobTitle} position.

Job Description:
${jobDescription}

Return ONLY a JSON array of strings (questions), nothing else.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 1500 });
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Interview questions generation failed:", error);
    throw error;
  }
}

export async function findTrendingSkills(
  industryOrRole: string,
): Promise<string[]> {
  const prompt = `List the top 15 trending and in-demand skills for ${industryOrRole} in 2024-2025.

Return ONLY a JSON array of skill names as strings, nothing else. Example: ["Skill 1", "Skill 2", ...]`;

  try {
    const response = await generateAI({ prompt, maxTokens: 1000 });
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Trending skills lookup failed:", error);
    throw error;
  }
}

export async function recommendCertifications(skillGaps: string[]): Promise<
  Array<{
    name: string;
    provider: string;
    duration: string;
    level: string;
  }>
> {
  const prompt = `Recommend top certifications for someone with these skill gaps: ${skillGaps.join(", ")}.

Return a JSON array with objects containing:
- name (certification name)
- provider (organization)
- duration (estimated time to complete)
- level (beginner/intermediate/advanced)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await generateAI({ prompt, maxTokens: 1500 });
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Certification recommendation failed:", error);
    throw error;
  }
}
