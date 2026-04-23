/**
 * Exercise identifier helpers.
 *
 * How it fits:
 * - The frontend can treat all exercise types as a single `id` string.
 * - The backend decodes/encodes that id to map requests to the right tables.
 */
const TEMPLATE_SOURCE = "template";
const CUSTOM_SOURCE = "custom";
const LEGACY_SOURCE = "legacy";

/**
 * Encode `(source, numericId)` into a stable string id for API responses.
 */
const serializeExerciseId = (source, id) => `${source}:${id}`;

/**
 * Parse an encoded exercise id used by API routes.
 *
 * Accepts:
 * - `template:<n>` / `custom:<n>`
 * - legacy numeric ids (`<n>`) for back-compat
 */
const parseExerciseId = (value) => {
  const rawValue = typeof value === "string" ? value.trim() : String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const compositeMatch = rawValue.match(/^(template|custom):(\d+)$/);
  if (compositeMatch) {
    return {
      source: compositeMatch[1],
      id: Number.parseInt(compositeMatch[2], 10),
    };
  }

  if (/^\d+$/.test(rawValue)) {
    return {
      source: LEGACY_SOURCE,
      id: Number.parseInt(rawValue, 10),
    };
  }

  return null;
};

module.exports = {
  CUSTOM_SOURCE,
  LEGACY_SOURCE,
  TEMPLATE_SOURCE,
  parseExerciseId,
  serializeExerciseId,
};
