import { fetchExerciseHistory } from "../lib/api";

describe("fetchExerciseHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it("should call history endpoint and return grouped history", async () => {
    const mockHistory = {
      "2026-04-05": [{ weight: 100, reps: 10 }],
      "2026-04-04": [{ weight: 95, reps: 12 }],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockHistory),
    });

    const result = await fetchExerciseHistory("template:2", 9);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts/template:2/history?userId=9")
    );
    expect(result).toEqual(mockHistory);
  });

  it('should throw "Failed to fetch history" when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    await expect(fetchExerciseHistory("legacy:5", 1)).rejects.toThrow(
      "Failed to fetch history"
    );
  });
});
