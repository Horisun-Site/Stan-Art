import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Modal from "../Modal";
import { recordSale } from "../../lib/api";
import { formatNaira, todayInputValue } from "../../lib/format";

const fieldClass =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-black";

const labelClass =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-black/45";

const RecordSaleModal = ({
  artworks,
  initialArtworkId,
  onClose,
  onSaved,
}) => {
  const navigate = useNavigate();
  const sellable = artworks.filter((artwork) => artwork.status !== "sold");

  const [form, setForm] = useState({
    artworkId: "",
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    amount: "",
    saleDate: todayInputValue(),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fallbackId = sellable[0]?.id || "";
    const artworkId = initialArtworkId || fallbackId;
    const artwork = sellable.find((item) => item.id === artworkId) || sellable[0];

    setForm({
      artworkId: artwork?.id || "",
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
      amount: artwork ? String(artwork.price) : "",
      saleDate: todayInputValue(),
      notes: "",
    });
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialArtworkId, artworks.length]);

  const selectedArtwork = sellable.find(
    (artwork) => artwork.id === form.artworkId,
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "artworkId") {
      const artwork = sellable.find((item) => item.id === value);

      setForm((current) => ({
        ...current,
        artworkId: value,
        amount: artwork ? String(artwork.price) : current.amount,
      }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const sale = await recordSale({
        artworkId: form.artworkId,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone,
        amount: Number(form.amount),
        saleDate: form.saleDate,
        notes: form.notes,
      });

      onSaved(sale);
    } catch (saveError) {
      if (saveError.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin" },
        });
        return;
      }

      setError(saveError.message || "Could not record the sale.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="Sales"
      title="Record a sale"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-black/15 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-black/60 transition hover:border-black/40 hover:text-black"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="record-sale-form"
            disabled={saving || !sellable.length}
            className="flex items-center justify-center gap-2 bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Record sale"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sellable.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm leading-6 text-black/50">
            Every artwork is marked as sold. Add a new artwork before recording
            another sale.
          </p>
        </div>
      ) : (
        <form id="record-sale-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} htmlFor="sale-artwork">
              Artwork
            </label>
            <select
              id="sale-artwork"
              name="artworkId"
              value={form.artworkId}
              onChange={handleChange}
              required
              className={fieldClass}
            >
              {sellable.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title} — {formatNaira(artwork.price)}
                  {artwork.status === "reserved" ? " (reserved)" : ""}
                </option>
              ))}
            </select>

            {selectedArtwork?.status === "reserved" && (
              <p className="mt-2 text-xs leading-5 text-amber-700">
                This piece has a pending shop request. Recording a paid sale
                here will mark it as sold.
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="sale-buyer">
                Buyer name
              </label>
              <input
                id="sale-buyer"
                name="buyerName"
                value={form.buyerName}
                onChange={handleChange}
                required
                placeholder="Full name"
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="sale-amount">
                Amount received (₦)
              </label>
              <input
                id="sale-amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="sale-email">
                Buyer email
              </label>
              <input
                id="sale-email"
                name="buyerEmail"
                type="email"
                value={form.buyerEmail}
                onChange={handleChange}
                placeholder="optional"
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="sale-phone">
                Buyer phone
              </label>
              <input
                id="sale-phone"
                name="buyerPhone"
                value={form.buyerPhone}
                onChange={handleChange}
                placeholder="optional"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="sale-date">
              Sale date
            </label>
            <input
              id="sale-date"
              name="saleDate"
              type="date"
              value={form.saleDate}
              onChange={handleChange}
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="sale-notes">
              Notes
            </label>
            <textarea
              id="sale-notes"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              placeholder="Delivery details, payment reference, etc."
              className={`${fieldClass} resize-none`}
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default RecordSaleModal;
