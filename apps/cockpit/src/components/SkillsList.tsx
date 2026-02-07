import { Link } from "@tanstack/react-router";
import type { Skill, SkillTier } from "../data/skills";

const skillIcons: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997m0 0A8.966 8.966 0 0112 15a8.966 8.966 0 00-5.213 1.658M12 12a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  checklist: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};

const stepColors: Record<number, string> = {
  1: "bg-orange-500",
  2: "bg-blue-600",
  3: "bg-emerald-600",
  4: "bg-violet-600",
  5: "bg-rose-600",
  6: "bg-amber-500",
};

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export function SkillsList({
  skills,
  userTier,
}: {
  skills: Skill[];
  userTier: SkillTier;
}) {
  const freeSkills = skills.filter((s) => s.tier === "free");
  const proSkills = skills.filter((s) => s.tier === "pro");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-ocean-50">
        Skills
      </h2>

      {/* Free skills */}
      <div className="space-y-2">
        {freeSkills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} locked={false} />
        ))}
      </div>

      {/* Divider */}
      {userTier === "free" && (
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-dark-600" />
          <span className="text-xs uppercase tracking-wider text-ocean-500 font-medium">
            Pro Skills
          </span>
          <div className="flex-1 border-t border-dark-600" />
        </div>
      )}

      {/* Pro skills */}
      <div className="space-y-2">
        {proSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            locked={userTier === "free"}
          />
        ))}
      </div>

      {/* Upgrade CTA */}
      {userTier === "free" && (
        <Link
          to="/settings"
          className="block w-full text-center py-3 rounded-lg bg-ocean-600/10 border border-ocean-600/30 text-ocean-300 hover:bg-ocean-600/20 hover:text-ocean-200 transition-colors text-sm font-medium"
        >
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}

function SkillCard({ skill, locked }: { skill: Skill; locked: boolean }) {
  const icon = skillIcons[skill.icon_name];
  const color = stepColors[skill.step] || "bg-ocean-500";
  const isComingSoon =
    skill.status === "coming_soon" || skill.status === "placeholder";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        locked
          ? "bg-dark-800/50 border-dark-700 opacity-60"
          : "bg-dark-800 border-dark-600"
      }`}
    >
      {/* Step badge */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg ${locked ? "bg-dark-700" : color + "/20"} flex items-center justify-center`}
      >
        <span
          className={`text-xs font-bold ${locked ? "text-ocean-600" : "text-ocean-200"}`}
        >
          {String(skill.step).padStart(2, "0")}
        </span>
      </div>

      {/* Icon */}
      <div className={locked ? "text-ocean-600" : "text-ocean-300"}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${locked ? "text-ocean-500" : "text-ocean-100"}`}
          >
            {skill.name}
          </span>
          {isComingSoon && (
            <span className="text-[10px] uppercase tracking-wider bg-ocean-900/50 text-ocean-500 px-1.5 py-0.5 rounded-full leading-none">
              Soon
            </span>
          )}
          {locked && (
            <span className="text-[10px] uppercase tracking-wider bg-ocean-900/50 text-ocean-400 px-1.5 py-0.5 rounded-full leading-none flex items-center gap-1">
              <LockIcon />
              Pro
            </span>
          )}
          {!locked && skill.tier === "free" && skill.status === "available" && (
            <span className="text-[10px] uppercase tracking-wider bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded-full leading-none">
              Free
            </span>
          )}
        </div>
        <p
          className={`text-xs mt-0.5 ${locked ? "text-ocean-600" : "text-ocean-400"}`}
        >
          {skill.description}
        </p>
      </div>
    </div>
  );
}
