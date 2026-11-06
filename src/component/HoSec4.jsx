import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { fetchArtworks } from "../lib/api";
import { formatNaira } from "../lib/format";
import {
  ARTWORK_STATUS_LABELS,
  ARTWORK_STATUS_STYLES,
  CATEGORY_LABELS,
} from "../lib/constants";

const HoSec4 = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchArtworks()
      .then((data) => {
        if (active) setArtworks(data.slice(0, 3));
      })
      .catch(() => {
        if (active) setArtworks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-[#f8f7f3] px-6 py-24 md:px-10 md:py-32 lg:px-14 lg:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col gap-8 border-b border-black/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">
              04 — Selected Works
            </p>

            <h2 className="max-w-4xl text-5xl font-light leading-[0.95] tracking-[-0.05em] text-[#171717] md:text-7xl lg:text-[7rem]">
              A selection
              <br />
              of recent works.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-black/55 md:text-base md:leading-8">
            A small collection of artworks from the studio. Each piece carries
            its own story, emotion, and perspective.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-black/5" />
                <div className="mt-5 h-5 w-1/2 bg-black/5" />
                <div className="mt-2 h-3 w-1/3 bg-black/5" />
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="border border-dashed border-black/15 px-6 py-16 text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/35">
              The collection is being prepared
            </p>

            <h3 className="mx-auto mt-4 max-w-xl text-2xl font-light leading-tight md:text-4xl">
              New works will appear here as soon as they leave the studio.
            </h3>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 border-b border-black pb-1 text-[10px] uppercase tracking-[0.2em]"
            >
              Visit the shop
              <ArrowUpRight size={12} strokeWidth={1.4} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                to="/shop"
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#d9d5cc]">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                  <div className="absolute left-4 top-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${ARTWORK_STATUS_STYLES[artwork.status]}`}
                    >
                      {ARTWORK_STATUS_LABELS[artwork.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-light text-[#171717]">
                      {artwork.title}
                    </h3>

                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-black/40">
                      {CATEGORY_LABELS[artwork.category] || artwork.category}
                      {artwork.year ? ` · ${artwork.year}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm tabular-nums text-black/70">
                      {formatNaira(artwork.price)}
                    </p>

                    <ArrowRight
                      size={20}
                      strokeWidth={1.3}
                      className="ml-auto mt-2 text-black/40 transition-transform duration-500 group-hover:translate-x-2"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 border-t border-black/10 pt-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-black/40">
                Continue Exploring
              </p>

              <h3 className="max-w-3xl text-3xl font-light leading-tight tracking-[-0.03em] text-[#171717] md:text-5xl">
                Discover the complete collection
                and explore the studio&apos;s work.
              </h3>
            </div>

            <Link
              to="/shop"
              className="group flex items-center gap-4 border-b border-black pb-2 text-[11px] uppercase tracking-[0.2em] text-black"
            >
              Visit the Shop

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition-all duration-500 group-hover:bg-black group-hover:text-white">
                <ArrowRight size={17} strokeWidth={1.2} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HoSec4;
