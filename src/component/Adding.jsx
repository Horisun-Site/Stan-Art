import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { createArtwork } from "../lib/api";
import { CATEGORY_OPTIONS } from "../lib/constants";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  collectionName: "",
  medium: "",
  dimensions: "",
  year: "",
  status: "available",
};

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900";

const labelClass = "mb-2 block text-sm font-medium text-neutral-800";

const Adding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!imagePreview) return undefined;

    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const selectImage = (file) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image is too large. Please use a file under 10MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
    setSuccess("");
  };

  const handleImageChange = (event) => {
    selectImage(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    selectImage(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!imageFile) {
      setError("Please select an artwork image.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter the artwork title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter an artwork description.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid artwork price.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    const payload = new FormData();
    payload.append("image", imageFile);
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("price", formData.price);
    payload.append("category", formData.category);
    payload.append("collectionName", formData.collectionName.trim());
    payload.append("medium", formData.medium.trim());
    payload.append("dimensions", formData.dimensions.trim());
    payload.append("year", formData.year);
    payload.append("status", formData.status);

    try {
      setLoading(true);
      await createArtwork(payload);

      setSuccess("Artwork published successfully.");
      setFormData(initialForm);
      setImageFile(null);
      setImagePreview(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      if (submitError.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }

      setError(
        submitError.message ||
          "Something went wrong while publishing the artwork.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            to="/admin"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-neutral-900">
                Add artwork
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Upload a piece, set its price and publish it to the shop.
              </p>
            </div>

            <p className="text-xs text-neutral-400">
              Images are stored on your studio server — no paid storage needed.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle size={18} />
              {success}
            </span>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.16em]">
              <Link
                to="/admin"
                className="border-b border-green-700/40 pb-0.5 transition hover:border-green-800"
              >
                Dashboard
              </Link>
              <Link
                to="/shop"
                className="border-b border-green-700/40 pb-0.5 transition hover:border-green-800"
              >
                View shop
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-lg font-medium text-neutral-900">
                  Artwork image
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Upload the main image of your artwork.
                </p>
              </div>

              {!imagePreview ? (
                <label
                  htmlFor="artwork-image"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition ${
                    dragging
                      ? "border-neutral-900 bg-neutral-100"
                      : "border-neutral-300 bg-neutral-50 hover:border-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <Upload size={24} className="text-neutral-700" />
                  </div>

                  <h3 className="text-base font-medium text-neutral-900">
                    Upload artwork
                  </h3>

                  <p className="mt-2 max-w-xs text-sm text-neutral-500">
                    Click to choose a file, or drag and drop an image here.
                  </p>

                  <span className="mt-4 text-xs text-neutral-400">
                    JPG, PNG or WEBP · up to 10MB
                  </span>

                  <input
                    id="artwork-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-xl bg-neutral-100">
                  <img
                    src={imagePreview}
                    alt="Artwork preview"
                    className="h-[420px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Remove image"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition hover:bg-neutral-100"
                  >
                    <X size={18} />
                  </button>

                  <div className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white">
                    {imageFile?.name}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-neutral-900">
                  Artwork details
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  This information appears on the shop and in your dashboard.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass} htmlFor="title">
                    Artwork title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Sunset Memories"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe the artwork..."
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="price">
                    Price (₦)
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="250000"
                    min="0"
                    step="0.01"
                    className={fieldClass}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="collectionName">
                      Collection
                    </label>
                    <input
                      id="collectionName"
                      type="text"
                      name="collectionName"
                      value={formData.collectionName}
                      onChange={handleChange}
                      placeholder="e.g. African Heritage"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="medium">
                      Medium
                    </label>
                    <input
                      id="medium"
                      type="text"
                      name="medium"
                      value={formData.medium}
                      onChange={handleChange}
                      placeholder="e.g. Acrylic on canvas"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="dimensions">
                      Dimensions
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      placeholder="e.g. 24 × 36 inches"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="year">
                      Year
                    </label>
                    <input
                      id="year"
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="2026"
                      min="1900"
                      max="2100"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                    </select>
                    <p className="mt-1.5 text-xs text-neutral-400">
                      Reserved is applied automatically when someone requests a
                      piece.
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={18} />
                        Publish artwork
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Adding;
