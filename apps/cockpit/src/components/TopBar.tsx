import { Link, useRouteContext, useMatches } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ProjectSelector } from "./ProjectSelector";

const navItems = [
  { label: "Dashboard", to: "/dashboard" as const },
  { label: "Configuration", to: "/configuration" as const },
  { label: "AutoShip", to: "/autoship" as const, comingSoon: true },
  { label: "Analytics", to: "/analytics" as const, comingSoon: true },
];

export function TopBar() {
  const context = useRouteContext({ from: "/_authed" });
  const user = context.user;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const username = user?.user_metadata?.user_name || user?.email;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  return (
    <header className="h-14 bg-dark-800 border-b border-dark-700 fixed top-0 w-full z-50 flex items-center px-4">
      {/* Left: Project selector */}
      <div className="flex items-center">
        <ProjectSelector />
      </div>

      {/* Center: Navigation */}
      <nav className="flex-1 flex items-center justify-center gap-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;

          if (item.comingSoon) {
            return (
              <span
                key={item.to}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-ocean-600 cursor-default flex items-center gap-1.5"
              >
                {item.label}
                <span className="text-[10px] uppercase tracking-wider bg-ocean-900/50 text-ocean-500 px-1.5 py-0.5 rounded-full leading-none">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-dark-700 text-ocean-100"
                  : "text-ocean-400 hover:text-ocean-200 hover:bg-dark-700/50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: User menu */}
      <div className="flex items-center" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 hover:bg-dark-700 rounded-lg px-2 py-1.5 transition-colors"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username || ""}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-ocean-600 flex items-center justify-center text-xs text-white font-medium">
              {(username || "?")[0].toUpperCase()}
            </div>
          )}
          <svg
            className="w-4 h-4 text-ocean-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-12 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1">
            <div className="px-3 py-2 border-b border-dark-600">
              <p className="text-ocean-200 text-sm font-medium truncate">
                {username}
              </p>
            </div>
            <Link
              to="/settings"
              className="block px-3 py-2 text-sm text-ocean-300 hover:bg-dark-700 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
            <Link
              to="/logout"
              className="block px-3 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign out
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
