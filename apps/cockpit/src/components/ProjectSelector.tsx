import { useNavigate, useSearch } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { getSupabaseServerClient } from "../utils/supabase";

type Project = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

const fetchProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return { projects: [] as Project[] };

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, status")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  return { projects: (projects || []) as Project[] };
});

export function ProjectSelector() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Load projects on first open
  const loadProjects = async () => {
    if (!loaded) {
      const result = await fetchProjectsFn();
      setProjects(result.projects);
      setLoaded(true);
      // Auto-select first if none selected
      if (!selectedId && result.projects.length > 0) {
        setSelectedId(result.projects[0].id);
      }
    }
  };

  const handleOpen = async () => {
    if (!open) {
      await loadProjects();
    }
    setOpen(!open);
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Auto-load on mount to show current project name
  useEffect(() => {
    loadProjects();
  }, []);

  const current = projects.find((p) => p.id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 hover:bg-dark-700 rounded-lg px-3 py-1.5 transition-colors"
      >
        <span className="text-ocean-100 font-medium text-sm truncate max-w-[200px]">
          {current?.name || "Select project"}
        </span>
        <svg
          className="w-4 h-4 text-ocean-400 flex-shrink-0"
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

      {open && (
        <div className="absolute left-0 top-10 w-64 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                p.id === selectedId
                  ? "bg-ocean-600/20 text-ocean-100"
                  : "text-ocean-300 hover:bg-dark-700"
              }`}
            >
              <span className="block truncate">{p.name}</span>
              {p.status !== "active" && (
                <span className="text-xs text-ocean-500">{p.status}</span>
              )}
            </button>
          ))}

          <div className="border-t border-dark-600 mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate({ to: "/new-project" });
              }}
              className="w-full text-left px-3 py-2 text-sm text-ocean-400 hover:bg-dark-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
