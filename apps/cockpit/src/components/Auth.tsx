export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: "pending" | "idle" | "success" | "error";
  afterSubmit?: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="email" className="block text-sm text-ocean-300 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-ocean-50 placeholder-ocean-500 focus:outline-none focus:border-ocean-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-ocean-300 mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          minLength={6}
          className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-ocean-50 placeholder-ocean-500 focus:outline-none focus:border-ocean-500 transition-colors"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="w-full btn btn-primary py-3"
        disabled={status === "pending"}
      >
        {status === "pending" ? "..." : actionText}
      </button>
      {afterSubmit}
    </form>
  );
}
