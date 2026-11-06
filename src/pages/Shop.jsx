import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Mail,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import Modal from "../component/Modal";
import { fetchArtworks } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../lib/format";
import {
  ARTWORK_STATUS_LABELS,
  ARTWORK_STATUS_STYLES,
  CATEGORY_LABELS,
} from "../lib/constants";

const Shop = () => {
  const { addItem } = useCart();

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const loadArtworks = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (loadError) {
      setError(
        loadError.message ||
          "Could not load the collection. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const categories = useMemo(() => {
    const seen = new Set(artworks.map((artwork) => artwork.category));
    return Array.from(seen);
  }, [artworks]);

  const filtered = useMemo(() => {
    if (category === "all") return artworks;
    return artworks.filter((artwork) => artwork.category === category);
  }, [artworks, category]);

  const handleAdd = (artwork) => {
    if (artwork.status !== "available") return;

    addItem(artwork);
    setAddedId(artwork.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === artwork.id ? null : current));
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <Navbar />

      <main className="pt-[78px] sm:pt-[84px] md:pt-[88px] lg:pt-[92px]">
        <section className="border-b border-black/10 px-6 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24 lg:px-14">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
                  Shop — Original works
                </p>

                <h1 className="max-w-4xl text-[clamp(3.2rem,8vw,7.5rem)] font-light leading-[0.88] tracking-[-0.055em]">
                  Take a piece
                  <br />
                  <span className="ml-[7%] italic">home.</span>
                </h1>
              </div>

              <div className="max-w-sm lg:pb-2">
                <p className="text-sm leading-7 text-black/55 md:text-base md:leading-8">
                  Original works from the studio. Every piece is one of one.
                  Add a work to your cart to send a purchase request, and the
                  studio will be in touch to arrange payment and delivery.
                </p>

                <Link
                  to="/cart"
                  className="group mt-6 inline-flex items-center gap-3 border-b border-black/30 pb-1.5 text-[10px] uppercase tracking-[0.2em] transition hover:border-black"
                >
                  <ShoppingBag size={14} strokeWidth={1.4} />
                  View your cart
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.3}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-14 md:px-10 md:py-20 lg:px-14">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`text-[10px] uppercase tracking-[0.18em] transition ${
                    category === "all"
                      ? "text-black"
                      : "text-black/40 hover:text-black"
                  }`}
                >
                  All works
                </button>

                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`text-[10px] uppercase tracking-[0.18em] transition ${
                      category === item
                        ? "text-black"
                        : "text-black/40 hover:text-black"
                    }`}
                  >
                    {CATEGORY_LABELS[item] || item}
                  </button>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                {filtered.length}{" "}
                {filtered.length === 1 ? "work" : "works"}
              </p>
            </div>

            {error && (
              <div className="mb-8 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={loadArtworks}
                  className="flex w-fit items-center gap-2 border-b border-red-300 pb-0.5 text-[10px] uppercase tracking-[0.16em]"
                >
                  <RefreshCw size={12} strokeWidth={1.6} />
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[4/5] bg-black/5" />
                    <div className="mt-4 h-4 w-1/2 bg-black/5" />
                    <div className="mt-2 h-3 w-1/3 bg-black/5" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-black/15 px-6 py-20 text-center">
                <p className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-black/10">
                  <ShoppingBag
                    size={19}
                    strokeWidth={1.2}
                    className="text-black/35"
                  />
                </p>
                <h2 className="text-2xl font-light">
                  {artworks.length === 0
                    ? "The collection is being prepared"
                    : "No works in this category yet"}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                  {artworks.length === 0
                    ? "New pieces will appear here as soon as they leave the studio."
                    : "Explore another category or return to the full collection."}
                </p>
                {artworks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className="mt-6 border-b border-black pb-0.5 text-[10px] uppercase tracking-[0.18em]"
                  >
                    View all works
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((artwork) => {
                  const available = artwork.status === "available";

                  return (
                    <article key={artwork.id} className="group">
                      <button
                        type="button"
                        onClick={() => setSelected(artwork)}
                        className="relative block w-full overflow-hidden bg-[#dedbd3] text-left"
                        aria-label={`View ${artwork.title}`}
                      >
                        <div className="aspect-[4/5]">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="absolute left-4 top-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${ARTWORK_STATUS_STYLES[artwork.status]}`}
                          >
                            {ARTWORK_STATUS_LABELS[artwork.status]}
                          </span>
                        </div>

                        {!available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="border border-white/50 px-5 py-2.5 text-[10px] uppercase tracking-[0.28em] text-white">
                              {ARTWORK_STATUS_LABELS[artwork.status]}
                            </span>
                          </div>
                        )}
                      </button>

                      <div className="mt-5 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelected(artwork)}
                            className="block max-w-full truncate text-left text-xl font-light text-[#171717] transition hover:opacity-60"
                          >
                            {artwork.title}
                          </button>

                          <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-black/40">
                            {CATEGORY_LABELS[artwork.category] ||
                              artwork.category}
                            {artwork.year ? ` · ${artwork.year}` : ""}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm tabular-nums text-[#171717]">
                          {formatNaira(artwork.price)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          disabled={!available}
                          onClick={() => handleAdd(artwork)}
                          className="inline-flex items-center gap-2 border border-black/20 px-3.5 py-2.5 text-[9px] uppercase tracking-[0.16em] text-black/70 transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/25 disabled:hover:bg-transparent"
                        >
                          {addedId === artwork.id ? (
                            <>
                              <Check size={12} strokeWidth={1.8} />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={12} strokeWidth={1.5} />
                              {available ? "Add to cart" : "Unavailable"}
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelected(artwork)}
                          className="group/link inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-black/40 transition hover:text-black"
                        >
                          View details
                          <ArrowUpRight
                            size={11}
                            strokeWidth={1.4}
                            className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow="Artwork"
        title={selected?.title || ""}
        size="lg"
        footer={
          selected ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-black/50">
                {formatNaira(selected.price)}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:hello@stanartstudio.com?subject=${encodeURIComponent(
                    `Enquiry about "${selected.title}"`,
                  )}`}
                  className="inline-flex items-center justify-center gap-2 border border-black/15 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-black/60 transition hover:border-black/40 hover:text-black"
                >
                  <Mail size={13} strokeWidth={1.5} />
                  Enquire
                </a>

                <button
                  type="button"
                  disabled={selected.status !== "available"}
                  onClick={() => handleAdd(selected)}
                  className="inline-flex items-center justify-center gap-2 bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selected.status === "available" ? (
                    <>
                      <ShoppingBag size={13} strokeWidth={1.5} />
                      Add to cart
                    </>
                  ) : (
                    ARTWORK_STATUS_LABELS[selected.status]
                  )}
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="grid gap-7 md:grid-cols-[0.95fr_1.05fr]">
            <div className="overflow-hidden bg-[#dedbd3]">
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${ARTWORK_STATUS_STYLES[selected.status]}`}
                >
                  {ARTWORK_STATUS_LABELS[selected.status]}
                </span>

                <span className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                  Original work
                </span>
              </div>

              <p className="mt-6 text-sm leading-7 text-black/60">
                {selected.description}
              </p>

              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/10 pt-6 text-sm">
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                    Category
                  </dt>
                  <dd className="mt-1 text-black/70">
                    {CATEGORY_LABELS[selected.category] || selected.category}
                  </dd>
                </div>

                {selected.collection && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                      Collection
                    </dt>
                    <dd className="mt-1 text-black/70">
                      {selected.collection}
                    </dd>
                  </div>
                )}

                {selected.medium && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                      Medium
                    </dt>
                    <dd className="mt-1 text-black/70">{selected.medium}</dd>
                  </div>
                )}

                {selected.dimensions && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                      Dimensions
                    </dt>
                    <dd className="mt-1 text-black/70">
                      {selected.dimensions}
                    </dd>
                  </div>
                )}

                {selected.year && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                      Year
                    </dt>
                    <dd className="mt-1 text-black/70">{selected.year}</dd>
                  </div>
                )}
              </dl>

              <p className="mt-6 text-xs leading-5 text-black/35">
                Purchase requests are not payments. The studio will confirm
                availability and contact you with payment and delivery details.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
