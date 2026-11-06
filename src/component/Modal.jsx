import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  size = "md",
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden bg-[#f8f7f3] shadow-2xl sm:rounded-2xl ${widths[size]}`}
      >
        <div className="flex items-start justify-between gap-6 border-b border-black/10 px-6 py-5 sm:px-8">
          <div>
            {eyebrow && (
              <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/40">
                {eyebrow}
              </p>
            )}

            <h2 className="text-xl font-light tracking-[-0.02em] text-[#171717] sm:text-2xl">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-black/30 hover:text-black"
          >
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>

        {footer && (
          <div className="border-t border-black/10 bg-white/40 px-6 py-4 sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
