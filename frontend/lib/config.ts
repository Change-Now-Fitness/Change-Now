const DEV_FALLBACK_API_BASE_URL = "http://localhost:4000";
const MISSING_API_BASE_URL_MESSAGE =
  "EXPO_PUBLIC_API_URL is required for release builds.";

const isDevEnvironment =
  typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production";

export const normalizeApiBaseUrl = (value?: string) => {
  const rawValue = value?.trim();

  if (!rawValue) {
    return "";
  }

  try {
    const parsedUrl = new URL(rawValue);

    if (
      parsedUrl.protocol === "https:" &&
      ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname)
    ) {
      parsedUrl.protocol = "http:";
    }

    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

const configuredApiBaseUrl = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

export const API_BASE_URL =
  configuredApiBaseUrl || (isDevEnvironment ? DEV_FALLBACK_API_BASE_URL : "");

export const getApiConfigurationError = () =>
  API_BASE_URL ? null : MISSING_API_BASE_URL_MESSAGE;

export const buildApiUrl = (path: string) => {
  const configurationError = getApiConfigurationError();
  if (configurationError) {
    throw new Error(configurationError);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
