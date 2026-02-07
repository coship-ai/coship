import { Zap, Search, Palette, Compass } from "lucide-react";

const mockTraits = [
  {
    label: "Challenge Level",
    value: "Balanced",
    icon: <Zap className="w-4 h-4 text-ocean-400" />,
  },
  {
    label: "Transparency",
    value: "High",
    icon: <Search className="w-4 h-4 text-ocean-400" />,
  },
  {
    label: "UX Design",
    value: "User-first",
    icon: <Palette className="w-4 h-4 text-ocean-400" />,
  },
  {
    label: "Approach",
    value: "Pragmatic",
    icon: <Compass className="w-4 h-4 text-ocean-400" />,
  },
];

export function ShipPersonality({ projectName }: { projectName: string }) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
      <h2 className="text-lg font-display font-semibold text-ocean-50 mb-1">
        Ship's Personality
      </h2>
      <p className="text-xs text-ocean-500 mb-4">{projectName}</p>

      <p className="text-sm text-ocean-300 mb-5 leading-relaxed">
        Ship is configured as a balanced co-founder who challenges your ideas
        constructively while maintaining high transparency about technical
        trade-offs. Ship favors user-first design decisions and takes a
        pragmatic approach to feature prioritization.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {mockTraits.map((trait) => (
          <div
            key={trait.label}
            className="bg-dark-900 rounded-lg border border-dark-700 p-3"
          >
            <span className="mb-1 block">{trait.icon}</span>
            <p className="text-[11px] text-ocean-500 uppercase tracking-wider">
              {trait.label}
            </p>
            <p className="text-sm text-ocean-200 font-medium">{trait.value}</p>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-dark-700">
        <p className="text-xs text-ocean-500">
          Run the{" "}
          <code className="bg-dark-900 px-1.5 py-0.5 rounded text-ocean-400">
            Matching
          </code>{" "}
          skill in Claude to customize Ship's personality.
        </p>
      </div>
    </div>
  );
}
