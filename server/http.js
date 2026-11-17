import multer from "multer";

export function notFound(_req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image is too large. Please use an image under 10MB."
        : "The image could not be uploaded.";
    res.status(400).json({ error: message });
    return;
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error("[server]", error);
  }

  res.status(status).json({
    error:
      error.status && error.message
        ? error.message
        : "Something went wrong. Please try again.",
  });
}
