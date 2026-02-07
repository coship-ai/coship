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
};
