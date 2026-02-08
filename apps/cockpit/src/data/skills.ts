export type SkillTier = "free" | "pro";

export type SkillStatus = "available" | "placeholder" | "coming_soon";

export type Skill = {
  id: string;
  name: string;
  step: number;
  tier: SkillTier;
  description: string;
  status: SkillStatus;
  icon_name: string;
  triggers?: string[];
};

export type ProjectPersonality = {
  challenge_level: string;
  transparency_level: string;
  ux_design_model: string;
  development_approach: string;
  documentation_level: string;
  project_summary: string | null;
};
