const TEMPLATE_SOURCE = "template";
const CUSTOM_SOURCE = "custom";
const LEGACY_SOURCE = "legacy";

const serializeExerciseId = (source, id) => `${source}:${id}`;

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
