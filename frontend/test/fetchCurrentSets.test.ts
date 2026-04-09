import { fetchCurrentSets } from "../lib/api";

describe("fetchCurrentSets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it("should call current sets endpoint and return rows", async () => {
    const mockRows = [
      { id: 1, reps: 8, weight: "135" },
      { id: 2, reps: 6, weight: "145" },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockRows),
    });

    const result = await fetchCurrentSets("template:1", 2, "2026-04-07");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts/template:1/current?userId=2&date=2026-04-07")
    );
    expect(result).toEqual(mockRows);
  });

  it('should throw "Failed to fetch sets" when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    await expect(
      fetchCurrentSets("custom:3", 1, "2026-01-15")
    ).rejects.toThrow("Failed to fetch sets");
  });
});
