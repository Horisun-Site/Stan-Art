import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Modal from "../Modal";
import { updateArtwork } from "../../lib/api";
import { CATEGORY_OPTIONS } from "../../lib/constants";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "other",
  collection: "",
  medium: "",
  dimensions: "",
  year: "",
  status: "available",
};

const fieldClass =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#171717] outline-none transition placeholder:text-black/25 focus:border-black";

const labelClass =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-black/45";

const ArtworkEditModal = ({ artwork, onClose, onSaved }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!artwork) return;

    setForm({
      title: artwork.title || "",
      description: artwork.description || "",
      price: String(artwork.price ?? ""),
      category: artwork.category || "other",
      collection: artwork.collection || "",
      medium: artwork.medium || "",
      dimensions: artwork.dimensions || "",
      year: artwork.year ? String(artwork.year) : "",
      status: artwork.status || "available",
    });
    setError("");
  }, [artwork]);

  if (!artwork) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updated = await updateArtwork(artwork.id, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        collection: form.collection,
        medium: form.medium,
        dimensions: form.dimensions,
        year: form.year === "" ? null : Number(form.year),
        status: form.status,
      });

      onSaved(updated);
    } catch (saveError) {
      if (saveError.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin" },
        });
        return;
      }

      setError(saveError.message || "Could not save the artwork.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(artwork)}
      onClose={onClose}
      eyebrow="Artwork"
      title="Edit artwork details"
      size="lg"
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
            form="edit-artwork-form"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form id="edit-artwork-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[1.4fr_0.6fr]">
          <div>
            <label className={labelClass} htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="edit-price">
              Price (₦)
            </label>
            <input
              id="edit-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-description">
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="edit-category">
              Category
            </label>
            <select
              id="edit-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={fieldClass}
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="edit-status">
              Status
            </label>
            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="edit-collection">
              Collection
            </label>
            <input
              id="edit-collection"
              name="collection"
              value={form.collection}
              onChange={handleChange}
              placeholder="e.g. African Heritage"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="edit-medium">
              Medium
            </label>
            <input
              id="edit-medium"
              name="medium"
              value={form.medium}
              onChange={handleChange}
              placeholder="e.g. Acrylic on canvas"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="edit-dimensions">
              Dimensions
            </label>
            <input
              id="edit-dimensions"
              name="dimensions"
              value={form.dimensions}
              onChange={handleChange}
              placeholder="e.g. 24 × 36 inches"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="edit-year">
              Year
            </label>
            <input
              id="edit-year"
              name="year"
              type="number"
              min="1900"
              max="2100"
              value={form.year}
              onChange={handleChange}
              placeholder="2026"
              className={fieldClass}
            />
          </div>
        </div>

        <p className="text-xs leading-5 text-black/40">
          Status changes made here are manual. Recording or cancelling a sale
          will keep the artwork status in sync with its sales history.
        </p>
      </form>
    </Modal>
  );
};

export default ArtworkEditModal;
