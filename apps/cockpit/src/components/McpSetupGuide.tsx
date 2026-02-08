import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
);

function SailingShip() {
  return (
    <>
      <div className="sailing-track">
        {/* Wave trail */}
        <svg className="sailing-waves" viewBox="0 0 400 20" preserveAspectRatio="none">
          <path
            d="M0 10 Q25 4 50 10 Q75 16 100 10 Q125 4 150 10 Q175 16 200 10 Q225 4 250 10 Q275 16 300 10 Q325 4 350 10 Q375 16 400 10"
            stroke="var(--color-ocean-500)"
            fill="none"
            strokeWidth="1.5"
            opacity="0.3"
            className="sailing-wave-line"
          />
          <path
            d="M0 14 Q30 9 60 14 Q90 19 120 14 Q150 9 180 14 Q210 19 240 14 Q270 9 300 14 Q330 19 360 14 Q390 9 400 14"
            stroke="var(--color-ocean-400)"
            fill="none"
            strokeWidth="1"
            opacity="0.15"
            className="sailing-wave-line-2"
          />
        </svg>

        {/* Ship */}
        <div className="sailing-ship">
          <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
            <path
              d="M32 6 L32 38 L50 38 Z"
              fill="url(#sg1)"
              style={{ transformOrigin: "32px 38px" }}
              className="sail-bob"
            />
            <path
              d="M30 12 L30 34 L18 34 Z"
              fill="url(#sg2)"
              style={{ transformOrigin: "30px 34px" }}
              className="sail-bob-alt"
              opacity="0.7"
            />
            <line x1="32" y1="6" x2="32" y2="44" stroke="#7dd3fc" strokeWidth="2" />
            <path d="M12 44 L52 44 L48 54 L16 54 Z" fill="url(#hg)" />
            <path d="M14 47 L50 47" stroke="#7dd3fc" strokeWidth="1" opacity="0.4" />
            <defs>
              <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="sg2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="hg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f2035" />
                <stop offset="100%" stopColor="#0a1628" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <style>{`
        .sailing-track {
          position: relative;
          height: 56px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .sailing-waves {
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 20px;
        }
        .sailing-wave-line {
          animation: wave-drift 3s ease-in-out infinite;
        }
        .sailing-wave-line-2 {
          animation: wave-drift 3s ease-in-out infinite;
          animation-delay: -1.5s;
        }
        @keyframes wave-drift {
          0%, 100% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
        }
        .sailing-ship {
          position: absolute;
          top: 2px;
          animation: sail-across 8s ease-in-out infinite;
        }
        @keyframes sail-across {
          0% { left: -10%; }
          50% { left: 85%; }
          100% { left: -10%; }
        }
        .sail-bob {
          animation: sail-rock 3s ease-in-out infinite;
        }
        .sail-bob-alt {
          animation: sail-rock 3s ease-in-out infinite;
          animation-delay: -0.4s;
        }
        @keyframes sail-rock {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </>
  );
}

export function McpSetupGuide({ projectId }: { projectId: string | null }) {
  const router = useRouter();

  // Subscribe to Realtime — when matching skill saves personality, auto-refresh
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`personality:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_personality",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          router.invalidate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, router]);

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-display font-semibold text-ocean-50">
          Matching Skill
        </h2>
      </div>

      <SailingShip />

      <ol className="space-y-4 text-sm">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            1
          </span>
          <div>
            <p className="text-ocean-200">
              Download{" "}
              <a
                href="https://claude.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean-400 hover:text-ocean-300 underline underline-offset-2"
              >
                Claude Desktop
              </a>{" "}
              if you haven't already
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            2
          </span>
          <p className="text-ocean-200">
            Open <strong className="text-ocean-100">Settings</strong> →{" "}
            <strong className="text-ocean-100">Connectors</strong> →{" "}
            <strong className="text-ocean-100">Add custom connector</strong>
          </p>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            3
          </span>
          <div className="text-ocean-200">
            <p>
              Enter name{" "}
              <code className="bg-dark-900 px-1.5 py-0.5 rounded text-ocean-300">
                CoShip
              </code>{" "}
              and URL{" "}
              <code className="bg-dark-900 px-1.5 py-0.5 rounded text-ocean-300">
                https://mcp.coship.ai
              </code>
            </p>
            <p className="mt-1 text-ocean-400">
              Click <strong className="text-ocean-300">Add</strong>, then authenticate when prompted
            </p>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            4
          </span>
          <p className="text-ocean-200">
            Click <strong className="text-ocean-100">New Chat</strong> and
            ask:{" "}
            <code className="bg-dark-900 px-1.5 py-0.5 rounded text-ocean-300">
              "Can you match me with CoShip?"
            </code>
          </p>
        </li>
      </ol>

      <p className="mt-5 pt-4 border-t border-dark-600 text-xs text-ocean-500 text-center">
        This page updates automatically when matching completes
      </p>
    </div>
  );
}
