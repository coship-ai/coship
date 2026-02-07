import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

export function McpSetupGuide() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  function handleCheckConnection() {
    setChecking(true);
    router.invalidate().finally(() => setChecking(false));
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-ocean-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-ocean-50">
            Connect MCP Server
          </h2>
          <p className="text-sm text-ocean-400">
            Set up Claude Desktop to work with Ship
          </p>
        </div>
      </div>

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
            <strong className="text-ocean-100">Add Connector</strong>
          </p>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            3
          </span>
          <p className="text-ocean-200">
            Search for <strong className="text-ocean-100">CoShip</strong>,
            click <strong className="text-ocean-100">Connect</strong>, and
            authenticate when prompted
          </p>
        </li>

        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ocean-500/20 text-ocean-300 flex items-center justify-center text-xs font-medium">
            4
          </span>
          <p className="text-ocean-200">
            Ask Claude:{" "}
            <code className="bg-dark-900 px-1.5 py-0.5 rounded text-ocean-300">
              "Set up Ship"
            </code>{" "}
            to begin matching
          </p>
        </li>
      </ol>

      <div className="mt-5 pt-4 border-t border-dark-600">
        <button
          onClick={handleCheckConnection}
          disabled={checking}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white transition-colors disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check Connection"}
        </button>
      </div>
    </div>
  );
}
