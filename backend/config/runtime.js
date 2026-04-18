const parseBoolean = (value, fallback = false) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const normalizeUrl = (value) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    return "";
  }

  try {
    return new URL(rawValue).toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

const parseOriginList = (value) =>
  String(value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isPrivateHostname = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

const describeMissingCorsConfig = () =>
  "CORS_ALLOWED_ORIGINS is empty. Browser-based clients will fail unless CORS_ALLOW_ALL=true.";

const isProduction = process.env.NODE_ENV === "production";

const cookieSecure = parseBoolean(process.env.COOKIE_SECURE, isProduction);
const cookieSameSite = process.env.COOKIE_SAME_SITE || (cookieSecure ? "none" : "lax");
const allowAllCorsOrigins = parseBoolean(process.env.CORS_ALLOW_ALL, false);
const configuredCorsOrigins = parseOriginList(process.env.CORS_ALLOWED_ORIGINS);
const shouldTrustProxy = parseBoolean(process.env.TRUST_PROXY, isProduction);

const getPublicApiUrl = (port) =>
  normalizeUrl(process.env.PUBLIC_API_URL) || `http://localhost:${port}`;

const getPublicApiUrlInfo = () => {
  const publicApiUrl = normalizeUrl(process.env.PUBLIC_API_URL);
  if (!publicApiUrl) {
    return null;
  }

  try {
    return new URL(publicApiUrl);
  } catch {
    return null;
  }
};

const buildTokenCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  path: "/",
  ...(typeof maxAge === "number" ? { maxAge } : {}),
});

const buildTokenCookieClearOptions = () => ({
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  path: "/",
});

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowAllCorsOrigins || configuredCorsOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    if (!isProduction && ["http:", "https:"].includes(parsedOrigin.protocol)) {
      return isPrivateHostname(parsedOrigin.hostname);
    }
  } catch {
    return false;
  }

  return false;
};

const getCorsOptions = () => ({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
});

const getRuntimeConfigIssues = () => {
  const errors = [];
  const warnings = [];
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasJwtSecret = Boolean(
    process.env.JWT_SECRET?.trim() || process.env.JWT_KEY?.trim()
  );
  const publicApiUrlInfo = getPublicApiUrlInfo();

  if (isProduction) {
    if (!hasDatabaseUrl) {
      errors.push("DATABASE_URL is required in production.");
    }

    if (!hasJwtSecret) {
      errors.push("JWT_SECRET or JWT_KEY is required in production.");
    }

    if (!publicApiUrlInfo) {
      errors.push("PUBLIC_API_URL is required in production.");
    } else {
      if (publicApiUrlInfo.protocol !== "https:") {
        errors.push("PUBLIC_API_URL must use https in production.");
      }

      if (isPrivateHostname(publicApiUrlInfo.hostname)) {
        errors.push("PUBLIC_API_URL cannot point to localhost or a private network in production.");
      }
    }
  }

  if (!allowAllCorsOrigins && configuredCorsOrigins.length === 0) {
    warnings.push(describeMissingCorsConfig());
  }

  if (allowAllCorsOrigins && isProduction) {
    warnings.push("CORS_ALLOW_ALL=true is enabled in production. Tighten CORS before wider rollout.");
  }

  if (isProduction && !cookieSecure) {
    warnings.push("COOKIE_SECURE=false in production. Web cookies will be less reliable on HTTPS.");
  }

  if (cookieSameSite === "none" && !cookieSecure) {
    warnings.push("COOKIE_SAME_SITE=none without COOKIE_SECURE=true will be rejected by modern browsers.");
  }

  return { errors, warnings };
};

const assertValidRuntimeConfig = () => {
  const { errors } = getRuntimeConfigIssues();
  if (errors.length > 0) {
    throw new Error(
      ["Invalid runtime configuration:", ...errors.map((error) => `- ${error}`)].join("\n")
    );
  }
};

module.exports = {
  assertValidRuntimeConfig,
  buildTokenCookieClearOptions,
  buildTokenCookieOptions,
  configuredCorsOrigins,
  cookieSameSite,
  cookieSecure,
  getRuntimeConfigIssues,
  getCorsOptions,
  getPublicApiUrl,
  isProduction,
  shouldTrustProxy,
};
