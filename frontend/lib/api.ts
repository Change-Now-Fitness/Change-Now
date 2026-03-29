// lib/api.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";


const TOKEN_KEY = "auth_token";
const normalizeApiBaseUrl = (value?: string) => {
  const rawValue = value?.trim();

  if (!rawValue) {
    return "http://localhost:4000";
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
    return "http://localhost:4000";
  }
};

const BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);
console.log("BASE_URL:", BASE_URL);

export interface ApiError {
  status: number;
  message: string;
}

export interface Exercise {
  id: string | number;
  name: string;
  type: string;
  muscleGroup: string;
  equipment: string;
  isCustom: boolean;
  userId: number | null;
}

const buildApiError = async (
  res: Response,
  fallbackMessage: string
): Promise<ApiError> => {
  try {
    const data = await res.json();
    return {
      status: res.status,
      message: data.message || data.error || fallbackMessage,
    };
  } catch {
    return {
      status: res.status,
      message: fallbackMessage,
    };
  }
};
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}
//apiFetch will bring token in headers which you can use middleware in backend transit it into userid
//RECOMMEND YOU USE THIS FUNCTION TO FETCH ANY DATA IN BACKEND
export async function apiFetch<T = any>(
    path: string,
    opts:{
        method? : "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        body?: unknown;
        auth?: boolean;
    } = {}
): Promise<T> {
    const {method = "GET",body, auth = true } = opts;
    const headers: Record<string,string> = {
        "Content-Type" : "application/json",
    };
    if (auth) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw { status: res.status, message } as ApiError;
  }

  return data as T;
}


export async function fetchExercises(userId: number) {
  const res = await fetch(
    `${BASE_URL}/exercises?userId=${encodeURIComponent(userId.toString())}`
  );

  if (!res.ok) {
    throw await buildApiError(res, "Failed to fetch exercises");
  }

  return (await res.json()) as Exercise[];
}

export async function createExercise(
  payload: Pick<Exercise, "name" | "type" | "muscleGroup" | "equipment"> & {
    userId: number;
  }
) {
  const res = await fetch(`${BASE_URL}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await buildApiError(res, "Failed to create exercise");
  }

  return (await res.json()) as Exercise;
}

export async function fetchCurrentSets(exerciseId: string, userId: number, date: string) {
  const res = await fetch(
    `${BASE_URL}/workouts/${exerciseId}/current?userId=${userId}&date=${date}`
  );
  if (!res.ok) throw new Error("Failed to fetch sets");
  return res.json();
}

export async function addSet(exerciseId: string, userId: number, weight: number, reps: number) {
  const res = await fetch(`${BASE_URL}/workouts/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, userId, weight, reps }),
  });
  if (!res.ok) throw new Error("Failed to save set");
  return res.json();
}

export async function fetchExerciseHistory(exerciseId: string, userId: number) {
  const res = await fetch(`${BASE_URL}/workouts/${exerciseId}/history?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}