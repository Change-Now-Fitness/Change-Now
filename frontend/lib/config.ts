const FALLBACK_API_BASE_URL = "http://localhost:4000";

export const normalizeApiBaseUrl = (value?: string) => {
  const rawValue = value?.trim();

  if (!rawValue) {
    return FALLBACK_API_BASE_URL;
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
    return FALLBACK_API_BASE_URL;
  }
};

export const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
