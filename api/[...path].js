import app from "../server/app.js";
import { errorHandler, notFound } from "../server/http.js";

app.use(notFound);
app.use(errorHandler);

// Use an explicit Node-style handler. Vercel can then invoke the Express
// application for every /api/* request without treating this module as a
// static export.
export default function handler(req, res) {
  return app(req, res);
}

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};
