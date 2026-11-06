export const CATEGORY_OPTIONS = [
  { value: "abstract", label: "Abstract" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "contemporary", label: "Contemporary" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
);

export const ARTWORK_STATUS_LABELS = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const SALE_STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const ARTWORK_STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reserved: "bg-amber-50 text-amber-700 border-amber-200",
  sold: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export const SALE_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
};
