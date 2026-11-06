import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Plus } from "lucide-react";
import { logoutAdmin } from "../lib/api";

const Admiral = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f8f7f3]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-14">
        <Link to="/admin" className="flex shrink-0 flex-col leading-none">
          <span className="text-[20px] font-semibold tracking-[0.2em] text-[#171717]">
            STAN
          </span>
          <span className="mt-1 text-[8px] tracking-[0.45em] text-black/45">
            ART STUDIO
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/shop"
            className="group flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-black/55 transition hover:text-black"
          >
            View shop
            <ExternalLink
              size={12}
              strokeWidth={1.4}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>

          <Link
            to="/admin/add-artwork"
            className="flex items-center gap-2 bg-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-black"
          >
            <Plus size={14} strokeWidth={1.5} />
            Add artwork
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/55 transition hover:text-black"
          >
            <LogOut size={14} strokeWidth={1.4} />
            Sign out
          </button>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/admin/add-artwork"
            className="flex items-center gap-1.5 bg-[#171717] px-3 py-2.5 text-[9px] uppercase tracking-[0.16em] text-white"
          >
            <Plus size={13} strokeWidth={1.5} />
            Add
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black/60"
          >
            <LogOut size={15} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Admiral;
