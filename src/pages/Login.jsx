import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { fetchMe, getToken, loginAdmin } from "../lib/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [error, setError] = useState("");

  const requestedPath = location.state?.from;
  const destination =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//")
      ? requestedPath
      : "/admin";

  useEffect(() => {
    let active = true;

    if (!getToken()) return undefined;

    fetchMe()
      .then(() => {
        if (active) navigate(destination, { replace: true });
      })
      .catch(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [destination, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f3]">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border border-black/20 border-t-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] px-6">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center py-12">
        <div className="w-full">
          <div className="mb-12 flex items-center justify-between">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/45 transition hover:text-black"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.4}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Back to studio
            </Link>

            <div className="flex flex-col items-end leading-none">
              <span className="text-[17px] font-semibold tracking-[0.2em] text-[#171717]">
                STAN
              </span>
              <span className="mt-1 text-[7px] tracking-[0.4em] text-black/45">
                ART STUDIO
              </span>
            </div>
          </div>

          <div className="mb-10">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
              <LockKeyhole size={17} strokeWidth={1.3} />
            </div>

            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
              Studio Administration
            </p>

            <h1 className="text-4xl font-light tracking-[-0.04em] text-[#171717]">
              Welcome back.
            </h1>

            <p className="mt-4 text-sm leading-6 text-black/50">
              Sign in to manage artworks, prices and studio sales.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="admin@stanartstudio.com"
                required
                autoComplete="email"
                className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full border-b border-black/20 bg-transparent px-0 py-3 pr-10 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-black/40 transition hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff size={17} strokeWidth={1.4} />
                  ) : (
                    <Eye size={17} strokeWidth={1.4} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-between bg-[#171717] px-5 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </span>

              {!loading && (
                <ArrowRight
                  size={17}
                  strokeWidth={1.3}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-10 border-t border-black/10 pt-6">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/30">
              Authorized studio access only
            </p>

            <p className="mt-3 text-center text-xs leading-5 text-black/40">
              Your sign-in details live in the server&apos;s{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-[11px] text-black/60">
                .env.local
              </code>{" "}
              file. Ask the site owner for access.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
