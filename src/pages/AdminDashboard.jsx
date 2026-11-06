import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  Inbox,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import Admiral from "../component/Admiral";
import ArtworkEditModal from "../component/admin/ArtworkEditModal";
import RecordSaleModal from "../component/admin/RecordSaleModal";
import {
  deleteArtwork,
  deleteSale,
  fetchArtworks,
  fetchSales,
  fetchStats,
  updateSaleStatus,
} from "../lib/api";
import { formatDate, formatNaira, truncate } from "../lib/format";
import {
  ARTWORK_STATUS_LABELS,
  ARTWORK_STATUS_STYLES,
  CATEGORY_LABELS,
  SALE_STATUS_LABELS,
  SALE_STATUS_STYLES,
} from "../lib/constants";

const StatCard = ({ label, value, note, icon: Icon }) => (
  <div className="border-b border-black/10 px-0 py-7 sm:border-r sm:px-6 lg:border-b-0">
    <div className="mb-7 flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-[0.22em] text-black/40">
        {label}
      </span>
      <Icon size={17} strokeWidth={1.3} className="text-black/35" />
    </div>

    <p className="text-3xl font-light tracking-[-0.04em] text-[#171717] sm:text-4xl">
      {value}
    </p>

    {note && <p className="mt-3 text-xs text-black/40">{note}</p>}
  </div>
);

const StatusPill = ({ styles, children }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${styles}`}
  >
    {children}
  </span>
);

const FilterChips = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const active = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`border px-3 py-2 text-[9px] uppercase tracking-[0.16em] transition ${
            active
              ? "border-black bg-black text-white"
              : "border-black/15 text-black/45 hover:border-black/40 hover:text-black"
          }`}
        >
          {option.label}
          {option.count !== undefined ? ` (${option.count})` : ""}
        </button>
      );
    })}
  </div>
);

const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="border border-dashed border-black/15 px-6 py-16 text-center">
    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/10">
      <Icon size={19} strokeWidth={1.2} className="text-black/35" />
    </div>

    <h3 className="text-xl font-light text-[#171717]">{title}</h3>
    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/40">
      {text}
    </p>

    {action && <div className="mt-7">{action}</div>}
  </div>
);

const SaleActions = ({ sale, busy, onStatus, onDelete }) => {
  const disabled = busy === sale.id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sale.status === "pending" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatus(sale, "paid")}
          className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-emerald-700 transition hover:border-emerald-400 disabled:opacity-50"
        >
          <CheckCircle2 size={12} strokeWidth={1.6} />
          Mark paid
        </button>
      )}

      {sale.status === "pending" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatus(sale, "cancelled")}
          className="inline-flex items-center gap-1.5 border border-black/10 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-black/45 transition hover:border-black/30 hover:text-black disabled:opacity-50"
        >
          <XCircle size={12} strokeWidth={1.6} />
          Cancel
        </button>
      )}

      {sale.status === "paid" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatus(sale, "cancelled")}
          className="inline-flex items-center gap-1.5 border border-black/10 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-black/45 transition hover:border-black/30 hover:text-black disabled:opacity-50"
        >
          <XCircle size={12} strokeWidth={1.6} />
          Cancel
        </button>
      )}

      {sale.status === "cancelled" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatus(sale, "pending")}
          className="inline-flex items-center gap-1.5 border border-black/10 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-black/45 transition hover:border-black/30 hover:text-black disabled:opacity-50"
        >
          <RefreshCw size={12} strokeWidth={1.6} />
          Reopen
        </button>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(sale)}
        aria-label={`Delete sale for ${sale.artworkTitle}`}
        className="flex h-7 w-7 items-center justify-center border border-transparent text-black/30 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {disabled ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Trash2 size={13} strokeWidth={1.6} />
        )}
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [saleModal, setSaleModal] = useState({
    open: false,
    artworkId: null,
  });
  const [busyId, setBusyId] = useState("");
  const [artworkFilter, setArtworkFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const handleError = useCallback(
    (requestError) => {
      if (requestError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(
        requestError.message || "Something went wrong. Please try again.",
      );
    },
    [navigate],
  );

  const loadDashboard = useCallback(async () => {
    const [statsData, artworksData, salesData] = await Promise.all([
      fetchStats(),
      fetchArtworks(),
      fetchSales(),
    ]);

    setStats(statsData);
    setArtworks(artworksData);
    setSales(salesData);
  }, []);

  useEffect(() => {
    let active = true;

    loadDashboard()
      .catch((loadError) => {
        if (active) handleError(loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadDashboard, handleError]);

  const refresh = useCallback(async () => {
    try {
      await loadDashboard();
      setError("");
    } catch (refreshError) {
      handleError(refreshError);
    }
  }, [loadDashboard, handleError]);

  const filteredArtworks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return artworks.filter((artwork) => {
      const matchesStatus =
        artworkFilter === "all" || artwork.status === artworkFilter;

      if (!matchesStatus) return false;
      if (!term) return true;

      return [artwork.title, artwork.collection, artwork.medium, artwork.category]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [artworks, artworkFilter, search]);

  const filteredSales = useMemo(() => {
    if (saleFilter === "all") return sales;
    return sales.filter((sale) => sale.status === saleFilter);
  }, [sales, saleFilter]);

  const handleDeleteArtwork = async (artwork) => {
    const confirmed = window.confirm(
      `Delete "${artwork.title}"? This cannot be undone. Past sales will be kept in your records.`,
    );

    if (!confirmed) return;

    setBusyId(artwork.id);
    setError("");

    try {
      await deleteArtwork(artwork.id);
      await refresh();
    } catch (deleteError) {
      handleError(deleteError);
    } finally {
      setBusyId("");
    }
  };

  const handleSaleStatus = async (sale, status) => {
    if (
      status === "cancelled" &&
      !window.confirm(
        `Cancel the sale for "${sale.artworkTitle}"? The artwork will be marked available again.`,
      )
    ) {
      return;
    }

    setBusyId(sale.id);
    setError("");

    try {
      await updateSaleStatus(sale.id, status);
      await refresh();
    } catch (statusError) {
      handleError(statusError);
    } finally {
      setBusyId("");
    }
  };

  const handleDeleteSale = async (sale) => {
    const confirmed = window.confirm(
      `Delete the sale record for "${sale.artworkTitle}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyId(sale.id);
    setError("");

    try {
      await deleteSale(sale.id);
      await refresh();
    } catch (deleteError) {
      handleError(deleteError);
    } finally {
      setBusyId("");
    }
  };

  const openSaleModal = (artworkId = null) =>
    setSaleModal({ open: true, artworkId });

  const closeSaleModal = () =>
    setSaleModal({ open: false, artworkId: null });

  const pendingCount = sales.filter((sale) => sale.status === "pending").length;
  const sellableCount = artworks.filter(
    (artwork) => artwork.status !== "sold",
  ).length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "artworks", label: `Artworks (${artworks.length})` },
    {
      id: "sales",
      label: `Sales${pendingCount ? ` · ${pendingCount} pending` : ` (${sales.length})`}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <Admiral />

      <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 lg:px-14 lg:py-14">
        <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-9 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
              Dashboard
            </p>

            <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl">
              Welcome back.
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-black/50">
              Track sales, publish new work and keep every price up to date from
              one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {sellableCount > 0 && (
              <button
                type="button"
                onClick={() => openSaleModal()}
                className="flex items-center gap-2 border border-black/15 px-4 py-3.5 text-[10px] uppercase tracking-[0.18em] text-black/60 transition hover:border-black/40 hover:text-black"
              >
                <Banknote size={15} strokeWidth={1.4} />
                Record sale
              </button>
            )}

            <Link
              to="/admin/add-artwork"
              className="group flex items-center gap-3 bg-[#171717] px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-black"
            >
              <Plus size={15} strokeWidth={1.5} />
              Add artwork
              <ArrowUpRight
                size={13}
                strokeWidth={1.3}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto border-b border-black/10">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative shrink-0 px-4 py-4 text-[10px] uppercase tracking-[0.18em] transition ${
                tab === item.id
                  ? "text-black"
                  : "text-black/40 hover:text-black/70"
              }`}
            >
              {item.label}

              {tab === item.id && (
                <span className="absolute bottom-0 left-0 h-px w-full bg-black" />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={refresh}
              className="w-fit border-b border-red-300 pb-0.5 text-[10px] uppercase tracking-[0.16em] transition hover:border-red-600"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={24}
                strokeWidth={1.3}
                className="mx-auto animate-spin text-black/40"
              />
              <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-black/35">
                Loading studio data
              </p>
            </div>
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <>
                {pendingCount > 0 && (
                  <div className="mt-8 flex flex-col gap-4 border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Clock3
                        size={18}
                        strokeWidth={1.4}
                        className="mt-0.5 shrink-0 text-amber-700"
                      />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {pendingCount} purchase{" "}
                          {pendingCount === 1 ? "request" : "requests"} waiting
                        </p>
                        <p className="mt-1 text-xs leading-5 text-amber-800/70">
                          Review the buyer details and mark each request as paid
                          once payment is confirmed.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTab("sales")}
                      className="w-fit border-b border-amber-700/40 pb-0.5 text-[10px] uppercase tracking-[0.16em] text-amber-900 transition hover:border-amber-900"
                    >
                      Review sales
                    </button>
                  </div>
                )}

                <section className="mt-8 grid grid-cols-1 border-b border-black/10 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total artworks"
                    value={stats?.totalArtworks ?? 0}
                    note={`${stats?.collections ?? 0} ${
                      stats?.collections === 1 ? "collection" : "collections"
                    }`}
                    icon={ImageIcon}
                  />

                  <StatCard
                    label="Available"
                    value={stats?.available ?? 0}
                    note={`${stats?.reserved ?? 0} reserved`}
                    icon={Package}
                  />

                  <StatCard
                    label="Sold"
                    value={stats?.sold ?? 0}
                    note={`${stats?.paidSales ?? 0} paid sales`}
                    icon={ShoppingBag}
                  />

                  <div className="border-b border-black/10 px-0 py-7 sm:px-6 lg:border-b-0 lg:pr-0">
                    <div className="mb-7 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-black/40">
                        Revenue
                      </span>
                      <TrendingUp
                        size={17}
                        strokeWidth={1.3}
                        className="text-black/35"
                      />
                    </div>

                    <p className="text-3xl font-light tracking-[-0.04em] text-[#171717] sm:text-4xl">
                      {formatNaira(stats?.totalRevenue ?? 0)}
                    </p>

                    <p className="mt-3 text-xs text-black/40">
                      {formatNaira(stats?.monthRevenue ?? 0)} this month
                    </p>
                  </div>
                </section>

                <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                  <section>
                    <div className="mb-5 flex items-end justify-between">
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/40">
                          Latest activity
                        </p>
                        <h2 className="text-2xl font-light tracking-[-0.03em]">
                          Recent sales
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTab("sales")}
                        className="group flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-black/45 transition hover:text-black"
                      >
                        View all
                        <ArrowUpRight
                          size={12}
                          strokeWidth={1.4}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>

                    {sales.length === 0 ? (
                      <div className="border border-dashed border-black/15 px-5 py-10 text-center">
                        <Inbox
                          size={19}
                          strokeWidth={1.2}
                          className="mx-auto mb-3 text-black/30"
                        />
                        <p className="text-sm text-black/45">
                          No sales recorded yet.
                        </p>
                        {sellableCount > 0 && (
                          <button
                            type="button"
                            onClick={() => openSaleModal()}
                            className="mt-4 border-b border-black pb-0.5 text-[10px] uppercase tracking-[0.16em]"
                          >
                            Record your first sale
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-black/10">
                        {sales.slice(0, 5).map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center gap-4 border-b border-black/10 py-4"
                          >
                            <div className="h-14 w-12 shrink-0 overflow-hidden bg-[#e7e3da]">
                              {sale.artworkImage ? (
                                <img
                                  src={sale.artworkImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[#171717]">
                                {sale.artworkTitle}
                              </p>
                              <p className="mt-1 truncate text-xs text-black/40">
                                {sale.buyerName || "No buyer name"} ·{" "}
                                {formatDate(sale.saleDate)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm tabular-nums text-[#171717]">
                                {formatNaira(sale.amount)}
                              </p>
                              <div className="mt-1.5">
                                <StatusPill
                                  styles={SALE_STATUS_STYLES[sale.status]}
                                >
                                  {SALE_STATUS_LABELS[sale.status]}
                                </StatusPill>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="mb-5 flex items-end justify-between">
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/40">
                          Collection
                        </p>
                        <h2 className="text-2xl font-light tracking-[-0.03em]">
                          Latest artworks
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTab("artworks")}
                        className="group flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-black/45 transition hover:text-black"
                      >
                        Manage
                        <ArrowUpRight
                          size={12}
                          strokeWidth={1.4}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>

                    {artworks.length === 0 ? (
                      <EmptyState
                        icon={ImageIcon}
                        title="No artworks yet"
                        text="Upload your first piece to start building the studio collection."
                        action={
                          <Link
                            to="/admin/add-artwork"
                            className="inline-flex items-center gap-2 border-b border-black pb-1 text-[10px] uppercase tracking-[0.18em]"
                          >
                            Add your first artwork
                            <ArrowUpRight size={12} strokeWidth={1.4} />
                          </Link>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {artworks.slice(0, 4).map((artwork) => (
                          <button
                            key={artwork.id}
                            type="button"
                            onClick={() => setEditingArtwork(artwork)}
                            className="group block text-left"
                          >
                            <div className="aspect-[4/5] overflow-hidden bg-[#e7e3da]">
                              <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                              />
                            </div>

                            <p className="mt-3 truncate text-sm text-[#171717]">
                              {artwork.title}
                            </p>
                            <p className="mt-1 text-[11px] text-black/40">
                              {formatNaira(artwork.price)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </>
            )}

            {tab === "artworks" && (
              <section className="mt-8">
                <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <FilterChips
                    value={artworkFilter}
                    onChange={setArtworkFilter}
                    options={[
                      { value: "all", label: "All", count: artworks.length },
                      {
                        value: "available",
                        label: "Available",
                        count: artworks.filter(
                          (artwork) => artwork.status === "available",
                        ).length,
                      },
                      {
                        value: "reserved",
                        label: "Reserved",
                        count: artworks.filter(
                          (artwork) => artwork.status === "reserved",
                        ).length,
                      },
                      {
                        value: "sold",
                        label: "Sold",
                        count: artworks.filter(
                          (artwork) => artwork.status === "sold",
                        ).length,
                      },
                    ]}
                  />

                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      size={15}
                      strokeWidth={1.4}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                    />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search artworks"
                      className="w-full border border-black/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
                    />
                  </div>
                </div>

                {filteredArtworks.length === 0 ? (
                  <EmptyState
                    icon={ImageIcon}
                    title={
                      artworks.length === 0
                        ? "No artworks yet"
                        : "No matches found"
                    }
                    text={
                      artworks.length === 0
                        ? "Upload your first piece to start building the studio collection."
                        : "Try a different filter or search term."
                    }
                    action={
                      artworks.length === 0 ? (
                        <Link
                          to="/admin/add-artwork"
                          className="inline-flex items-center gap-2 border-b border-black pb-1 text-[10px] uppercase tracking-[0.18em]"
                        >
                          Add your first artwork
                          <ArrowUpRight size={12} strokeWidth={1.4} />
                        </Link>
                      ) : null
                    }
                  />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredArtworks.map((artwork) => (
                      <article
                        key={artwork.id}
                        className="group flex flex-col border border-black/10 bg-white"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e3da]">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                          />

                          <div className="absolute left-3 top-3">
                            <StatusPill
                              styles={ARTWORK_STATUS_STYLES[artwork.status]}
                            >
                              {ARTWORK_STATUS_LABELS[artwork.status]}
                            </StatusPill>
                          </div>

                          {artwork.status === "sold" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <span className="border border-white/50 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white">
                                Sold
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-light text-[#171717]">
                                {artwork.title}
                              </h3>
                              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-black/40">
                                {CATEGORY_LABELS[artwork.category] ||
                                  artwork.category}
                                {artwork.year ? ` · ${artwork.year}` : ""}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm tabular-nums text-[#171717]">
                              {formatNaira(artwork.price)}
                            </p>
                          </div>

                          <p className="mt-3 text-xs leading-5 text-black/40">
                            {artwork.collection ||
                              artwork.medium ||
                              truncate(artwork.description, 72)}
                          </p>

                          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                            <button
                              type="button"
                              onClick={() => setEditingArtwork(artwork)}
                              className="inline-flex items-center gap-1.5 border border-black/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-black/55 transition hover:border-black/40 hover:text-black"
                            >
                              <Pencil size={12} strokeWidth={1.5} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={artwork.status === "sold"}
                              onClick={() => openSaleModal(artwork.id)}
                              className="inline-flex items-center gap-1.5 border border-black/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-black/55 transition hover:border-black/40 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Banknote size={12} strokeWidth={1.5} />
                              Sell
                            </button>

                            <button
                              type="button"
                              disabled={busyId === artwork.id}
                              onClick={() => handleDeleteArtwork(artwork)}
                              aria-label={`Delete ${artwork.title}`}
                              className="ml-auto flex h-8 w-8 items-center justify-center border border-transparent text-black/30 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            >
                              {busyId === artwork.id ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={13} strokeWidth={1.6} />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "sales" && (
              <section className="mt-8">
                <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <FilterChips
                    value={saleFilter}
                    onChange={setSaleFilter}
                    options={[
                      { value: "all", label: "All", count: sales.length },
                      {
                        value: "pending",
                        label: "Pending",
                        count: sales.filter(
                          (sale) => sale.status === "pending",
                        ).length,
                      },
                      {
                        value: "paid",
                        label: "Paid",
                        count: sales.filter((sale) => sale.status === "paid")
                          .length,
                      },
                      {
                        value: "cancelled",
                        label: "Cancelled",
                        count: sales.filter(
                          (sale) => sale.status === "cancelled",
                        ).length,
                      },
                    ]}
                  />

                  {sellableCount > 0 && (
                    <button
                      type="button"
                      onClick={() => openSaleModal()}
                      className="flex w-fit items-center gap-2 bg-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-black"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                      Record sale
                    </button>
                  )}
                </div>

                {filteredSales.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title={
                      sales.length === 0
                        ? "No sales yet"
                        : "No sales match this filter"
                    }
                    text={
                      sales.length === 0
                        ? "Sales recorded here and purchase requests from the shop will appear in this list."
                        : "Choose another status to see your sales."
                    }
                    action={
                      sellableCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => openSaleModal()}
                          className="inline-flex items-center gap-2 border-b border-black pb-1 text-[10px] uppercase tracking-[0.18em]"
                        >
                          Record a sale
                          <ArrowUpRight size={12} strokeWidth={1.4} />
                        </button>
                      ) : null
                    }
                  />
                ) : (
                  <>
                    <div className="hidden overflow-x-auto border border-black/10 bg-white md:block">
                      <table className="w-full min-w-[820px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-black/10 bg-[#f2f0ea]">
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Artwork
                            </th>
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Buyer
                            </th>
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Date
                            </th>
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-black/40">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredSales.map((sale) => (
                            <tr
                              key={sale.id}
                              className="border-b border-black/10 align-top last:border-b-0"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-14 w-12 shrink-0 overflow-hidden bg-[#e7e3da]">
                                    {sale.artworkImage ? (
                                      <img
                                        src={sale.artworkImage}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : null}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[180px] truncate text-sm text-[#171717]">
                                      {sale.artworkTitle}
                                    </p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/30">
                                      Ref {sale.id.slice(0, 8).toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm text-[#171717]">
                                  {sale.buyerName || "—"}
                                </p>

                                {sale.buyerEmail && (
                                  <a
                                    href={`mailto:${sale.buyerEmail}`}
                                    className="mt-1 block max-w-[190px] truncate text-xs text-black/45 hover:text-black"
                                  >
                                    {sale.buyerEmail}
                                  </a>
                                )}

                                {sale.buyerPhone && (
                                  <a
                                    href={`tel:${sale.buyerPhone}`}
                                    className="mt-0.5 block text-xs text-black/45 hover:text-black"
                                  >
                                    {sale.buyerPhone}
                                  </a>
                                )}

                                {sale.notes && (
                                  <p className="mt-2 max-w-[200px] text-xs leading-5 text-black/35">
                                    {truncate(sale.notes, 90)}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4 text-sm tabular-nums text-[#171717]">
                                {formatNaira(sale.amount)}
                              </td>

                              <td className="px-4 py-4 text-xs text-black/50">
                                {formatDate(sale.saleDate)}
                              </td>

                              <td className="px-4 py-4">
                                <StatusPill
                                  styles={SALE_STATUS_STYLES[sale.status]}
                                >
                                  {SALE_STATUS_LABELS[sale.status]}
                                </StatusPill>
                              </td>

                              <td className="px-4 py-4">
                                <SaleActions
                                  sale={sale}
                                  busy={busyId}
                                  onStatus={handleSaleStatus}
                                  onDelete={handleDeleteSale}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-4 md:hidden">
                      {filteredSales.map((sale) => (
                        <article
                          key={sale.id}
                          className="border border-black/10 bg-white p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-16 w-14 shrink-0 overflow-hidden bg-[#e7e3da]">
                              {sale.artworkImage ? (
                                <img
                                  src={sale.artworkImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm text-[#171717]">
                                  {sale.artworkTitle}
                                </p>
                                <StatusPill
                                  styles={SALE_STATUS_STYLES[sale.status]}
                                >
                                  {SALE_STATUS_LABELS[sale.status]}
                                </StatusPill>
                              </div>

                              <p className="mt-1 text-xs text-black/45">
                                {sale.buyerName || "No buyer name"}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/30">
                                {formatDate(sale.saleDate)} · Ref{" "}
                                {sale.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                            <p className="text-base tabular-nums text-[#171717]">
                              {formatNaira(sale.amount)}
                            </p>

                            <SaleActions
                              sale={sale}
                              busy={busyId}
                              onStatus={handleSaleStatus}
                              onDelete={handleDeleteSale}
                            />
                          </div>

                          {(sale.buyerEmail || sale.buyerPhone) && (
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/40">
                              {sale.buyerEmail && (
                                <a
                                  href={`mailto:${sale.buyerEmail}`}
                                  className="hover:text-black"
                                >
                                  {sale.buyerEmail}
                                </a>
                              )}
                              {sale.buyerPhone && (
                                <a
                                  href={`tel:${sale.buyerPhone}`}
                                  className="hover:text-black"
                                >
                                  {sale.buyerPhone}
                                </a>
                              )}
                            </div>
                          )}

                          {sale.notes && (
                            <p className="mt-2 text-xs leading-5 text-black/35">
                              {truncate(sale.notes, 140)}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-6 border-t border-black/10 pt-5">
                  <p className="max-w-2xl text-xs leading-5 text-black/35">
                    Pending requests come from the public shop. Mark a request
                    as paid once you have confirmed payment, or cancel it to put
                    the artwork back on sale. Revenue only counts paid sales.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <ArtworkEditModal
        artwork={editingArtwork}
        onClose={() => setEditingArtwork(null)}
        onSaved={async () => {
          setEditingArtwork(null);
          await refresh();
        }}
      />

      {saleModal.open && (
        <RecordSaleModal
          artworks={artworks}
          initialArtworkId={saleModal.artworkId}
          onClose={closeSaleModal}
          onSaved={async () => {
            closeSaleModal();
            setTab("sales");
            await refresh();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
