import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  resumeText: string;
  customCriteria?: string;
}

// Domain-specific evaluation criteria - these are FIXED per domain
const DOMAIN_CRITERIA: Record<string, { name: string; description: string; signals: string[] }[]> = {
  "Data Science": [
    {
      name: "Applied ML & Model Building",
      description: "Hands-on experience building, training, and deploying machine learning models",
      signals: ["ML", "machine learning", "model", "tensorflow", "pytorch", "sklearn", "neural network", "deep learning", "training", "inference"]
    },
    {
      name: "Data Infrastructure & Engineering",
      description: "Experience with data pipelines, SQL, big data tools, and data processing at scale",
      signals: ["SQL", "pipeline", "ETL", "spark", "hadoop", "data warehouse", "airflow", "dbt", "data engineering", "database"]
    },
    {
      name: "Business Impact & Problem Framing",
      description: "Ability to translate business problems into data solutions with measurable outcomes",
      signals: ["increased", "reduced", "improved", "ROI", "revenue", "efficiency", "stakeholder", "business", "impact", "metrics", "%"]
    }
  ],
  "Software Engineering": [
    {
      name: "AI/ML Tool Integration",
      description: "Experience integrating AI APIs, LLMs, or ML models into software systems",
      signals: ["API", "OpenAI", "LLM", "GPT", "AI integration", "ML ops", "model serving", "inference", "embedding"]
    },
    {
      name: "Modern Architecture & Automation",
      description: "Experience with CI/CD, cloud infrastructure, containerization, and automation",
      signals: ["CI/CD", "docker", "kubernetes", "AWS", "GCP", "Azure", "terraform", "automation", "DevOps", "microservices"]
    },
    {
      name: "Adaptability & Continuous Learning",
      description: "Evidence of learning new technologies and adapting to changing tech landscape",
      signals: ["learned", "adopted", "migrated", "upgraded", "new technology", "certification", "training", "hackathon"]
    }
  ],
  "Product Management": [
    {
      name: "AI Product Strategy",
      description: "Experience defining AI-powered product features or working with AI/ML teams",
      signals: ["AI feature", "ML product", "data-driven", "personalization", "recommendation", "automation", "AI roadmap"]
    },
    {
      name: "Data-Informed Decision Making",
      description: "Using analytics, A/B testing, and metrics to drive product decisions",
      signals: ["A/B test", "analytics", "metrics", "KPI", "conversion", "retention", "data-driven", "experiment"]
    },
    {
      name: "Cross-Functional Technical Collaboration",
      description: "Working closely with engineering, data science, and design teams",
      signals: ["engineering team", "data science", "technical spec", "API", "architecture", "sprint", "agile", "scrum"]
    }
  ],
  "Marketing": [
    {
      name: "Marketing Automation & AI Tools",
      description: "Experience with AI-powered marketing tools, automation platforms, or personalization",
      signals: ["automation", "personalization", "AI tool", "chatbot", "programmatic", "MarTech", "HubSpot", "Marketo"]
    },
    {
      name: "Data Analytics & Attribution",
      description: "Using data and analytics to measure and optimize marketing performance",
      signals: ["analytics", "attribution", "ROI", "conversion", "Google Analytics", "metrics", "dashboard", "reporting"]
    },
    {
      name: "Content Strategy at Scale",
      description: "Managing content creation, optimization, and distribution at scale",
      signals: ["content strategy", "SEO", "content optimization", "campaign", "A/B test", "engagement", "reach"]
    }
  ],
  "Finance": [
    {
      name: "Financial Modeling & Automation",
      description: "Building automated financial models, forecasts, or algorithmic analysis",
      signals: ["model", "forecast", "automation", "algorithm", "Python", "Excel VBA", "quantitative", "automated"]
    },
    {
      name: "Data Analysis & Reporting",
      description: "Analyzing large financial datasets and creating data-driven insights",
      signals: ["analysis", "SQL", "data", "dashboard", "reporting", "visualization", "Excel", "Tableau", "Power BI"]
    },
    {
      name: "Risk & Compliance Technology",
      description: "Working with risk models, compliance systems, or regulatory technology",
      signals: ["risk", "compliance", "regulatory", "audit", "controls", "monitoring", "detection", "fraud"]
    }
  ],
  "Design": [
    {
      name: "AI-Assisted Design Tools",
      description: "Experience using AI design tools, generative design, or design automation",
      signals: ["AI tool", "Figma AI", "generative", "automation", "prototype", "Midjourney", "DALL-E", "design system"]
    },
    {
      name: "Data-Driven Design Decisions",
      description: "Using user research, analytics, and testing to inform design choices",
      signals: ["user research", "A/B test", "analytics", "usability", "conversion", "metrics", "data-driven", "heatmap"]
    },
    {
      name: "Design Systems & Scalability",
      description: "Creating scalable design systems, components, and design operations",
      signals: ["design system", "component", "library", "Figma", "tokens", "scalable", "documentation", "DesignOps"]
    }
  ],
  "Sales": [
    {
      name: "Sales Technology & CRM",
      description: "Using CRM systems, sales automation, and AI-powered sales tools",
      signals: ["Salesforce", "CRM", "HubSpot", "automation", "pipeline", "forecasting", "lead scoring", "outreach"]
    },
    {
      name: "Data-Driven Sales Performance",
      description: "Using metrics and analytics to optimize sales performance",
      signals: ["quota", "revenue", "metrics", "conversion", "pipeline", "forecast", "performance", "growth", "%"]
    },
    {
      name: "Consultative & Technical Selling",
      description: "Selling technical or complex solutions requiring deep product knowledge",
      signals: ["enterprise", "technical", "solution", "demo", "POC", "implementation", "integration", "complex"]
    }
  ]
};

// Default criteria for unknown domains
const DEFAULT_CRITERIA = [
  {
    name: "Technical Adaptability",
    description: "Ability to learn and adopt new technologies, especially AI tools",
    signals: ["technology", "tool", "software", "system", "platform", "learned", "adopted", "implemented"]
  },
  {
    name: "Data Literacy",
    description: "Comfort working with data, analytics, and data-driven decision making",
    signals: ["data", "analytics", "metrics", "analysis", "reporting", "dashboard", "insights", "Excel", "SQL"]
  },
  {
    name: "Process Automation",
    description: "Experience automating workflows or improving operational efficiency",
    signals: ["automation", "process", "efficiency", "streamlined", "improved", "reduced", "optimized", "workflow"]
  }
];

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
    
    const errorResponse = e as Response;
    if (errorResponse?.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (errorResponse?.status === 402) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function callAI(messages: { role: string; content: string }[], apiKey: string, tools?: unknown[], tool_choice?: unknown) {
  const body: Record<string, unknown> = {
    model: "google/gemini-3-flash-preview",
    messages,
    temperature: 0.2,
  };
  
  if (tools) {
    body.tools = tools;
    body.tool_choice = tool_choice;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw response;
  }

  const data = await response.json();
  
  // Handle tool calls
  if (data.choices[0]?.message?.tool_calls) {
    const toolCall = data.choices[0].message.tool_calls[0];
    return JSON.parse(toolCall.function.arguments);
  }
  
  return data.choices[0]?.message?.content || "";
}

async function performFullAnalysis(resumeText: string, apiKey: string) {
  // Step 1: Detect domain using structured output
  const domainTools = [
    {
      type: "function",
      function: {
        name: "detect_domain",
        description: "Detect the primary career domain from a resume",
        parameters: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              enum: ["Data Science", "Software Engineering", "Product Management", "Marketing", "Finance", "Design", "Sales", "Unknown"],
              description: "The primary career domain detected"
            },
            confidence: {
              type: "number",
              description: "Confidence score between 0 and 1"
            },
            evidence: {
              type: "array",
              items: { type: "string" },
              description: "Key phrases from resume indicating this domain"
            },
            years_experience: {
              type: "number",
              description: "Estimated total years of experience"
            }
          },
          required: ["domain", "confidence", "evidence", "years_experience"],
          additionalProperties: false
        }
      }
    }
  ];

  const domainPrompt = `Analyze this resume and detect the PRIMARY career domain. 
Be STRICT - only classify into a domain if there is strong evidence.
Look at job titles, skills, and work history to determine the domain.

IMPORTANT: A software engineer is NOT a data scientist unless they specifically work on ML/AI.
A product manager is different from a software engineer.

RESUME:
${resumeText}`;

  let domainData;
  try {
    domainData = await callAI(
      [
        { role: "system", content: "You are a resume analyzer. Detect career domains accurately based on evidence." },
        { role: "user", content: domainPrompt }
      ],
      apiKey,
      domainTools,
      { type: "function", function: { name: "detect_domain" } }
    );
  } catch {
    domainData = {
      domain: "Unknown",
      confidence: 0.5,
      evidence: [],
      years_experience: 0
    };
  }

  // Step 2: Get domain-specific criteria
  const criteria = DOMAIN_CRITERIA[domainData.domain] || DEFAULT_CRITERIA;

  // Step 3: Evaluate each criterion strictly against the resume
  const evaluationTools = [
    {
      type: "function",
      function: {
        name: "evaluate_criteria",
        description: "Evaluate resume against specific criteria",
        parameters: {
          type: "object",
          properties: {
            criteria_results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  criterion: { type: "string" },
                  score: { 
                    type: "number",
                    description: "Score 0-100. Give LOW scores (0-30) if no evidence. Medium (30-60) if some evidence. High (60-100) only with strong, specific evidence."
                  },
                  explanation: { type: "string" },
                  evidence_used: {
                    type: "array",
                    items: { type: "string" },
                    description: "EXACT quotes from the resume. Empty if no evidence found."
                  }
                },
                required: ["criterion", "score", "explanation", "evidence_used"],
                additionalProperties: false
              }
            }
          },
          required: ["criteria_results"],
          additionalProperties: false
        }
      }
    }
  ];

  const evaluationPrompt = `You are evaluating a resume for ${domainData.domain} AI readiness.

CRITICAL RULES:
1. ONLY use evidence that exists in the resume - do NOT assume or infer skills not mentioned
2. If a criterion has NO supporting evidence in the resume, the score MUST be 0-20
3. If evidence is WEAK or indirect, score 20-50
4. Only give scores 70+ if there is STRONG, SPECIFIC evidence with details
5. Quote EXACT text from the resume as evidence
6. Different domains have different criteria - a Data Scientist needs ML experience, a PM needs product strategy
7. Someone with NO ${domainData.domain} experience should score LOW even if they're experienced in other fields

CRITERIA TO EVALUATE:
${criteria.map((c, i) => `${i + 1}. ${c.name}: ${c.description}
   Look for: ${c.signals.join(", ")}`).join("\n\n")}

RESUME:
${resumeText}

For each criterion, find specific evidence. If you cannot find evidence, give a low score and explain what's missing.`;

  let evaluationData;
  try {
    evaluationData = await callAI(
      [
        { role: "system", content: "You evaluate resumes strictly based on evidence. No assumptions. Low scores for missing evidence." },
        { role: "user", content: evaluationPrompt }
      ],
      apiKey,
      evaluationTools,
      { type: "function", function: { name: "evaluate_criteria" } }
    );
  } catch (e) {
    console.error("Evaluation error:", e);
    evaluationData = {
      criteria_results: criteria.map(c => ({
        criterion: c.name,
        score: 25,
        explanation: "Unable to evaluate. Please try again.",
        evidence_used: []
      }))
    };
  }

  // Calculate overall score with proper weighting
  const scores = evaluationData.criteria_results.map((r: { score: number }) => r.score);
  const overallScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);

  // Determine band based on score
  let band: string;
  if (overallScore >= 80) band = "Excellent";
  else if (overallScore >= 65) band = "Good";
  else if (overallScore >= 50) band = "Moderate";
  else if (overallScore >= 35) band = "Developing";
  else band = "Beginning";

  return {
    overall_score: overallScore,
    band,
    domain: domainData.domain,
    domain_confidence: domainData.confidence,
    criteria_results: evaluationData.criteria_results
  };
}

async function evaluateCustomCriteria(resumeText: string, customCriteria: string, apiKey: string) {
  const tools = [
    {
      type: "function",
      function: {
        name: "evaluate_criterion",
        description: "Evaluate a single criterion against a resume",
        parameters: {
          type: "object",
          properties: {
            has_evidence: {
              type: "boolean",
              description: "Whether ANY evidence was found for this criterion"
            },
            criterion: { type: "string" },
            score: { 
              type: "number",
              description: "Score 0-100. 0 if no evidence at all."
            },
            explanation: { type: "string" },
            evidence_used: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["has_evidence", "criterion", "score", "explanation", "evidence_used"],
          additionalProperties: false
        }
      }
    }
  ];

  const prompt = `Evaluate this resume for the criterion: "${customCriteria}"

RULES:
1. Search the resume for ANY evidence related to this criterion
2. If NO evidence exists, set has_evidence to false and score to 0
3. Quote exact text from the resume as evidence
4. Do not assume or infer - only use what's written

RESUME:
${resumeText}`;

  try {
    const result = await callAI(
      [
        { role: "system", content: "Evaluate strictly based on resume evidence only." },
        { role: "user", content: prompt }
      ],
      apiKey,
      tools,
      { type: "function", function: { name: "evaluate_criterion" } }
    );

    if (!result.has_evidence) {
      return null;
    }

    return {
      criterion: result.criterion,
      score: result.score,
      explanation: result.explanation,
      evidence_used: result.evidence_used
    };
  } catch {
    return null;
  }
}
