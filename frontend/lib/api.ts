// lib/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
console.log('BASE_URL:', BASE_URL);

export async function fetchCurrentSets(exerciseId: string, userId: number, date: string) {
  const res = await fetch(
    `${BASE_URL}/workouts/${exerciseId}/current?userId=${userId}&date=${date}`
  );
  if (!res.ok) throw new Error('Failed to fetch sets');
  return res.json();
}

export async function addSet(exerciseId: string, userId: number, weight: number, reps: number) {
  const res = await fetch(`${BASE_URL}/workouts/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId, userId, weight, reps }),
  });
  if (!res.ok) throw new Error('Failed to save set');
  return res.json();
}