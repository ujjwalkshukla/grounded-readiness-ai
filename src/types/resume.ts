export interface ResumeSection {
  text: string;
  span_start: number;
  span_end: number;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  duration_months: number;
  bullets: ResumeSection[];
}

export interface SkillItem {
  skill: string;
  span_start: number;
  span_end: number;
}

export interface ProjectItem {
  title: string;
  bullets: ResumeSection[];
}

export interface AchievementItem {
  metric: string;
  context: string;
  span_start: number;
  span_end: number;
}

export interface ResumeJSON {
  raw_text: string;
  metadata: {
    file_type: string;
    language: string;
  };
  sections: {
    header: {
      name: string;
      email: string;
      phone: string;
      location: string;
    };
    experience: ExperienceItem[];
    skills: SkillItem[];
    projects: ProjectItem[];
    education: string[];
    certifications: string[];
    achievements: AchievementItem[];
  };
  derived: {
    total_years_experience: number;
    domain: string;
    domain_confidence: number;
  };
}

export interface CriterionEvidence {
  text: string;
  section: string;
}

export interface CriterionResult {
  criterion: string;
  score: number;
  explanation: string;
  evidence_used: string[];
}

export interface AIReadinessResult {
  overall_score: number;
  band: string;
  domain: string;
  domain_confidence: number;
  criteria_results: CriterionResult[];
}

export type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'detecting_domain'
  | 'generating_criteria'
  | 'scoring'
  | 'complete'
  | 'error';
