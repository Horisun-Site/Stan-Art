import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useCart } from "../context/CartContext";
import { submitOrder } from "../lib/api";
import { formatNaira } from "../lib/format";
import { CATEGORY_LABELS } from "../lib/constants";

const fieldClass =
  "w-full border border-black/15 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-black";

const labelClass =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-black/45";

const Cart = () => {
  const { items, count, total, removeItem, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitOrder({
        items: items.map((item) => item.id),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        note: form.note,
      });

      setConfirmation({ ...result, customerName: form.name });
      clearCart();
      setForm({ name: "", email: "", phone: "", note: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError.message ||
          "Could not send your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717]">
      <Navbar />

      <main className="min-h-[70vh] px-6 pb-20 pt-[calc(78px+3.5rem)] sm:pt-[calc(84px+4rem)] md:px-10 lg:px-14 lg:pt-[calc(92px+5rem)]">
        <div className="mx-auto max-w-[1200px]">
          {confirmation ? (
            <div className="mx-auto max-w-2xl border border-black/10 bg-white px-6 py-14 text-center sm:px-12">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={24} strokeWidth={1.4} />
              </div>

              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-black/40">
                Request received
              </p>

              <h1 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">
                Thank you,{" "}
                {confirmation.customerName?.split(" ")[0] || "collector"}.
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-black/55">
                {confirmation.message}
              </p>

              <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 border-y border-black/10 py-6 text-left">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                    Reference
                  </p>
                  <p className="mt-1.5 text-sm tabular-nums text-black/75">
                    {confirmation.reference}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                    Request total
                  </p>
                  <p className="mt-1.5 text-sm tabular-nums text-black/75">
                    {formatNaira(confirmation.total)}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                    Works requested
                  </p>
                  <p className="mt-1.5 text-sm tabular-nums text-black/75">
                    {confirmation.count}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-black/35">
                    Next step
                  </p>
                  <p className="mt-1.5 text-sm text-black/75">
                    Studio contact
                  </p>
                </div>
              </div>

              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-[#171717] px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-black"
                >
                  Continue browsing
                  <ArrowUpRight size={13} strokeWidth={1.4} />
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center border border-black/15 px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] text-black/55 transition hover:border-black/40 hover:text-black"
                >
                  Back to the studio
                </Link>
              </div>
            </div>
          ) : count === 0 ? (
            <div className="mx-auto max-w-2xl border border-dashed border-black/15 px-6 py-20 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-black/10">
                <ShoppingBag size={22} strokeWidth={1.2} className="text-black/35" />
              </div>

              <h1 className="text-3xl font-light tracking-[-0.04em]">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/45">
                Browse the collection and add an original work to start a
                purchase request with the studio.
              </p>

              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-2 bg-[#171717] px-5 py-3.5 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-black"
              >
                Explore the shop
                <ArrowUpRight size={13} strokeWidth={1.4} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-black/10 pb-6">
                <div>
                  <Link
                    to="/shop"
                    className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/40 transition hover:text-black"
                  >
                    <ArrowLeft size={13} strokeWidth={1.4} />
                    Continue shopping
                  </Link>

                  <h1 className="text-4xl font-light tracking-[-0.05em] sm:text-5xl">
                    Your cart
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove every artwork from your cart?")) {
                      clearCart();
                    }
                  }}
                  className="text-[10px] uppercase tracking-[0.16em] text-black/40 transition hover:text-red-600"
                >
                  Clear cart
                </button>
              </div>

              <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                <section>
                  <div className="border-t border-black/10">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b border-black/10 py-5 sm:gap-6"
                      >
                        <Link
                          to="/shop"
                          className="h-28 w-24 shrink-0 overflow-hidden bg-[#dedbd3] sm:h-32 sm:w-28"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h2 className="truncate text-lg font-light sm:text-xl">
                                {item.title}
                              </h2>

                              <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-black/35">
                                {CATEGORY_LABELS[item.category] ||
                                  item.category}
                                {item.year ? ` · ${item.year}` : ""}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm tabular-nums text-black/70">
                              {formatNaira(item.price)}
                            </p>
                          </div>

                          <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-black/30">
                            Original work · one available
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-black/35 transition hover:text-red-600"
                          >
                            <Trash2 size={12} strokeWidth={1.5} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 max-w-xl text-xs leading-5 text-black/35">
                    This is a purchase request, not an online payment. Submitting
                    your request reserves the work while the studio confirms
                    payment and delivery with you.
                  </p>
                </section>

                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <div className="border border-black/10 bg-white p-6 sm:p-8">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/40">
                      Purchase request
                    </p>

                    <h2 className="text-2xl font-light tracking-[-0.03em]">
                      Tell us where to reach you
                    </h2>

                    {error && (
                      <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className={labelClass} htmlFor="cart-name">
                          Full name
                        </label>
                        <input
                          id="cart-name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          autoComplete="name"
                          required
                          placeholder="Your name"
                          className={fieldClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="cart-email">
                          Email
                        </label>
                        <input
                          id="cart-email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          autoComplete="email"
                          required
                          placeholder="you@example.com"
                          className={fieldClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="cart-phone">
                          Phone (optional)
                        </label>
                        <input
                          id="cart-phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          placeholder="+234..."
                          className={fieldClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass} htmlFor="cart-note">
                          Note (optional)
                        </label>
                        <textarea
                          id="cart-note"
                          name="note"
                          rows="3"
                          value={form.note}
                          onChange={handleChange}
                          placeholder="Delivery city, questions, etc."
                          className={`${fieldClass} resize-none`}
                        />
                      </div>

                      <div className="border-t border-black/10 pt-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-black/50">
                            {count} {count === 1 ? "work" : "works"}
                          </span>
                          <span className="text-lg tabular-nums">
                            {formatNaira(total)}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] leading-4 text-black/30">
                          Final amount is confirmed by the studio before
                          payment.
                        </p>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="mt-5 flex w-full items-center justify-center gap-2 bg-[#171717] px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Sending request...
                            </>
                          ) : (
                            <>
                              Send purchase request
                              <ArrowUpRight size={13} strokeWidth={1.4} />
                            </>
                          )}
                        </button>

                        <p className="mt-4 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-black/30">
                          <ShieldCheck size={12} strokeWidth={1.4} />
                          No payment is taken on this site
                        </p>
                      </div>
                    </form>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
