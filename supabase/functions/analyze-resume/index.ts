import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  resumeText: string;
  customCriteria?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, customCriteria } = await req.json() as AnalysisRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Resume text is too short or empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If custom criteria is provided, evaluate just that criterion
    if (customCriteria) {
      const customResult = await evaluateCustomCriteria(resumeText, customCriteria, LOVABLE_API_KEY);
      return new Response(
        JSON.stringify(customResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Full analysis pipeline
    const result = await performFullAnalysis(resumeText, LOVABLE_API_KEY);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Resume analysis error:", e);
    
    if (e instanceof Response) {
      const status = e.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function callAI(messages: { role: string; content: string }[], apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw response;
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function performFullAnalysis(resumeText: string, apiKey: string) {
  // Step 1: Detect domain and extract structured info
  const domainPrompt = `You are a resume analyzer. Analyze this resume and detect the primary career domain.

RESUME:
${resumeText}

Return ONLY valid JSON (no markdown, no explanation):
{
  "domain": "one of: Data Science, Software Engineering, Marketing, Finance, Design, Sales, Product Management, Operations, Human Resources, Healthcare, Education, Legal, Unknown",
  "confidence": 0.0 to 1.0,
  "evidence": ["key phrases from resume that indicate this domain"],
  "total_years_experience": estimated years as number,
  "key_skills": ["list of main skills found"],
  "key_achievements": ["notable achievements with metrics if present"]
}`;

  const domainResponse = await callAI([
    { role: "system", content: "You analyze resumes. Return only valid JSON, no markdown formatting." },
    { role: "user", content: domainPrompt }
  ], apiKey);

  let domainData;
  try {
    const cleanJson = domainResponse.replace(/```json\n?|\n?```/g, '').trim();
    domainData = JSON.parse(cleanJson);
  } catch {
    domainData = {
      domain: "Unknown",
      confidence: 0.5,
      evidence: [],
      total_years_experience: 0,
      key_skills: [],
      key_achievements: []
    };
  }

  // Step 2: Generate and evaluate criteria
  const criteriaPrompt = `You are an AI readiness evaluator. Based on this ${domainData.domain} professional's resume, generate 3 criteria to evaluate their AI readiness and score each.

RESUME:
${resumeText}

DOMAIN: ${domainData.domain}
EXPERIENCE: ${domainData.total_years_experience} years
KEY SKILLS: ${domainData.key_skills.join(", ")}

For AI readiness, evaluate criteria like:
- Technical adaptability (ability to learn and use AI tools)
- Data-driven decision making
- Automation mindset
- Cross-functional collaboration
- Innovation and experimentation
- Domain-specific AI applications

IMPORTANT RULES:
1. Base ALL evaluations ONLY on evidence in the resume
2. If evidence is weak for a criterion, give a lower score
3. Quote specific resume content as evidence
4. Never make assumptions about skills not mentioned

Return ONLY valid JSON:
{
  "criteria_results": [
    {
      "criterion": "Criterion Name",
      "score": 0-100,
      "explanation": "Clear explanation referencing resume evidence",
      "evidence_used": ["exact quotes or paraphrases from resume"]
    }
  ],
  "overall_score": weighted average 0-100,
  "band": "one of: Excellent (80-100), Good (65-79), Moderate (50-64), Developing (35-49), Beginning (0-34)"
}`;

  const criteriaResponse = await callAI([
    { role: "system", content: "You evaluate AI readiness based only on resume evidence. Return only valid JSON, no markdown." },
    { role: "user", content: criteriaPrompt }
  ], apiKey);

  let criteriaData;
  try {
    const cleanJson = criteriaResponse.replace(/```json\n?|\n?```/g, '').trim();
    criteriaData = JSON.parse(cleanJson);
  } catch {
    criteriaData = {
      criteria_results: [
        {
          criterion: "Technical Adaptability",
          score: 50,
          explanation: "Unable to fully parse resume. Please try again.",
          evidence_used: []
        }
      ],
      overall_score: 50,
      band: "Moderate"
    };
  }

  return {
    overall_score: criteriaData.overall_score,
    band: criteriaData.band,
    domain: domainData.domain,
    domain_confidence: domainData.confidence,
    criteria_results: criteriaData.criteria_results
  };
}

async function evaluateCustomCriteria(resumeText: string, customCriteria: string, apiKey: string) {
  const prompt = `You are evaluating a specific criterion for AI readiness based on a resume.

CRITERION TO EVALUATE: ${customCriteria}

RESUME:
${resumeText}

IMPORTANT RULES:
1. ONLY use evidence present in the resume
2. If no evidence supports this criterion, return null
3. Be specific about what evidence you found or didn't find
4. Quote exact content from the resume as evidence

Return ONLY valid JSON (or null if no evidence):
{
  "criterion": "${customCriteria}",
  "score": 0-100 based on evidence strength,
  "explanation": "Explanation citing specific resume evidence",
  "evidence_used": ["exact quotes from resume supporting the evaluation"]
}

If you cannot find ANY evidence for this criterion in the resume, return exactly: null`;

  const response = await callAI([
    { role: "system", content: "You evaluate criteria using only resume evidence. Return valid JSON or null." },
    { role: "user", content: prompt }
  ], apiKey);

  try {
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    if (cleanJson === "null" || cleanJson === "") {
      return null;
    }
    return JSON.parse(cleanJson);
  } catch {
    return null;
  }
}
