import { Zap, Search, Palette, Compass, FileText } from "lucide-react";
import type { ProjectPersonality } from "../data/skills";

/** Human-readable label for each enum value */
const PERSONALITY_LABELS: Record<string, Record<string, string>> = {
  challenge_level: {
    challenge_actively: "Challenge actively",
    raise_concerns_gently: "Raise concerns gently",
    only_serious_risks: "Only flag serious risks",
    trust_judgment: "Trust my judgment",
  },
  transparency_level: {
    just_outcome: "Just the outcome",
    explain_reasoning: "Explain the reasoning",
    help_understand: "Help me understand",
    full_trust: "Full trust mode",
  },
  ux_design_model: {
    ship_decides: "Ship decides UX",
    ship_proposes_refine: "Ship proposes, I refine",
    founder_designs: "I design, you build",
    depends_on_feature: "Depends on feature",
  },
  development_approach: {
    speed_iteration: "Speed & iteration",
    balanced_quality: "Balanced quality",
    robust_start: "Robust from start",
    depends_feature: "Depends on feature",
  },
  documentation_level: {
    minimal: "Minimal",
    simple_overview: "Simple overview",
    feature_guides: "Feature guides",
    detailed_technical: "Detailed technical",
  },
};

/** Impact/definition per enum value — sourced from SKILL.md */
const PERSONALITY_IMPACTS: Record<string, Record<string, string>> = {
  challenge_level: {
    challenge_actively:
      "I question complexity and suggest simpler alternatives that achieve the same goal. Helps reach MVP faster.",
    raise_concerns_gently:
      "I explain my concerns but build what you want unless you agree to change it.",
    only_serious_risks:
      "I only speak up for critical issues (security, impossible to build). Otherwise I find a way.",
    trust_judgment:
      "I build your vision even if technically challenging.",
  },
  transparency_level: {
    just_outcome:
      "You know what changed, I handle how. Fastest — no time spent on explanations.",
    explain_reasoning:
      "Basic rationale included for context. Slightly more communication time.",
    help_understand:
      "I explain trade-offs considered. Educational but takes more time.",
    full_trust:
      "I make decisions silently unless they affect features you'd notice. Very fast but less visibility.",
  },
  ux_design_model: {
    ship_decides:
      "I design user experience using best practices. You review working features and request changes. Fastest approach.",
    ship_proposes_refine:
      "I create initial UX, you give feedback, I adjust. Collaborative but requires iteration cycles.",
    founder_designs:
      "You specify how features should work and look. I implement your UX vision. Slower but you control every detail.",
    depends_on_feature:
      "You design critical/unique experiences. I handle standard patterns (forms, tables, etc). Balanced speed.",
  },
  development_approach: {
    speed_iteration:
      "Working features quickly with some rough edges. Test with users, improve based on feedback. Fastest learning.",
    balanced_quality:
      "Reasonable pace with solid quality. Not rushed, not slow. Features work well when shipped.",
    robust_start:
      "Thorough building with fewer surprises later, but slower to get features in your hands.",
    depends_feature:
      "Critical features (security, payments) built carefully. Experimental features shipped fast. Balanced risk.",
  },
  documentation_level: {
    minimal:
      "Clean code with light comments. Future developers read the code. Fastest approach.",
    simple_overview:
      "High-level guide — enough to orient someone. Small time investment.",
    feature_guides:
      "Style guides for each major feature. More time but useful reference.",
    detailed_technical:
      "Code comments, architecture diagrams, API docs. Comprehensive but time-intensive.",
  },
};

const TRAIT_CONFIG = [
  { key: "challenge_level" as const, label: "Challenge Level", icon: Zap },
  { key: "transparency_level" as const, label: "Transparency", icon: Search },
  { key: "ux_design_model" as const, label: "UX Design", icon: Palette },
  { key: "development_approach" as const, label: "Approach", icon: Compass },
  { key: "documentation_level" as const, label: "Documentation", icon: FileText },
];

function SailingShipCompact() {
  return (
    <>
      <div className="sailing-track-compact">
        <svg className="sailing-waves-compact" viewBox="0 0 400 20" preserveAspectRatio="none">
          <path
            d="M0 10 Q25 4 50 10 Q75 16 100 10 Q125 4 150 10 Q175 16 200 10 Q225 4 250 10 Q275 16 300 10 Q325 4 350 10 Q375 16 400 10"
            stroke="var(--color-ocean-500)"
            fill="none"
            strokeWidth="1.5"
            opacity="0.3"
            className="sailing-wave-line-c"
          />
          <path
            d="M0 14 Q30 9 60 14 Q90 19 120 14 Q150 9 180 14 Q210 19 240 14 Q270 9 300 14 Q330 19 360 14 Q390 9 400 14"
            stroke="var(--color-ocean-400)"
            fill="none"
            strokeWidth="1"
            opacity="0.15"
            className="sailing-wave-line-c2"
          />
        </svg>
        <div className="sailing-ship-c">
          <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
            <path d="M32 6 L32 38 L50 38 Z" fill="url(#spsg1)" style={{ transformOrigin: "32px 38px" }} className="sail-bob-c" />
            <path d="M30 12 L30 34 L18 34 Z" fill="url(#spsg2)" style={{ transformOrigin: "30px 34px" }} className="sail-bob-c-alt" opacity="0.7" />
            <line x1="32" y1="6" x2="32" y2="44" stroke="#7dd3fc" strokeWidth="2" />
            <path d="M12 44 L52 44 L48 54 L16 54 Z" fill="url(#sphg)" />
            <path d="M14 47 L50 47" stroke="#7dd3fc" strokeWidth="1" opacity="0.4" />
            <defs>
              <linearGradient id="spsg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="spsg2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="sphg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f2035" />
                <stop offset="100%" stopColor="#0a1628" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <style>{`
        .sailing-track-compact {
          position: relative;
          height: 48px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .sailing-waves-compact {
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 20px;
        }
        .sailing-wave-line-c {
          animation: wave-drift-c 3s ease-in-out infinite;
        }
        .sailing-wave-line-c2 {
          animation: wave-drift-c 3s ease-in-out infinite;
          animation-delay: -1.5s;
        }
        @keyframes wave-drift-c {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }
        .sailing-ship-c {
          position: absolute;
          top: 2px;
          animation: sail-across-c 10s ease-in-out infinite;
        }
        @keyframes sail-across-c {
          0% { left: -8%; }
          50% { left: 88%; }
          100% { left: -8%; }
        }
        .sail-bob-c {
          animation: sail-rock-c 3s ease-in-out infinite;
        }
        .sail-bob-c-alt {
          animation: sail-rock-c 3s ease-in-out infinite;
          animation-delay: -0.4s;
        }
        @keyframes sail-rock-c {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </>
  );
}

type Props = {
  personality: ProjectPersonality;
  personalityUpdatedAt?: string | null;
};

export function ShipPersonality({ personality, personalityUpdatedAt }: Props) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-4 h-full flex flex-col">
      <h2 className="text-lg font-display font-semibold text-ocean-50 mb-3">
        Ship's Personality
      </h2>

      <SailingShipCompact />

      {/* Mission statement as a prominent quote */}
      {personality.project_summary && (
        <blockquote className="relative my-3 pl-3 border-l-2 border-ocean-500">
          <p className="text-[13px] text-ocean-200 leading-relaxed italic">
            "{personality.project_summary}"
          </p>
        </blockquote>
      )}

      {/* Settings stacked vertically — selected option + impact description */}
      <div className="flex-1 space-y-2 mt-1">
        {TRAIT_CONFIG.map((trait) => {
          const Icon = trait.icon;
          const value = personality[trait.key];
          const label = PERSONALITY_LABELS[trait.key]?.[value] ?? value;
          const impact = PERSONALITY_IMPACTS[trait.key]?.[value] ?? "";

          return (
            <div
              key={trait.key}
              className="bg-dark-900 rounded-lg border border-dark-700 px-3 py-2.5"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Icon className="w-3.5 h-3.5 text-ocean-400 flex-shrink-0" />
                <span className="text-[10px] text-ocean-500 uppercase tracking-wider font-medium">
                  {trait.label}
                </span>
              </div>
              <p className="text-[13px] text-ocean-100 font-medium mb-0.5 pl-[22px]">
                {label}
              </p>
              {impact && (
                <p className="text-[11px] text-ocean-500 leading-snug pl-[22px]">
                  {impact}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="pt-3 border-t border-dark-700 mt-3">
        <p className="text-[11px] text-ocean-500">
          Run the{" "}
          <code className="bg-dark-900 px-1 py-0.5 rounded text-ocean-400 text-[10px]">
            Matching
          </code>{" "}
          skill in Claude to reconfigure.
          {personalityUpdatedAt && (
            <span className="block mt-1 text-ocean-600">
              Last configured{" "}
              {new Date(personalityUpdatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
