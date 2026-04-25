import { fetchCurrentSets } from "../lib/api";

describe("fetchCurrentSets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;

    // Make tz deterministic for CI
    jest.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "America/New_York" }),
    } as any);
  });

  afterEach(() => {
    (Intl.DateTimeFormat as unknown as jest.Mock | undefined)?.mockRestore?.();
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

    const result = await fetchCurrentSets("template:1", 2);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;

    expect(calledUrl).toContain("/workouts/template:1/current");
    expect(calledUrl).toContain("userId=2");
    expect(calledUrl).toContain("tz=America%2FNew_York"); // URLSearchParams encodes the slash

    expect(result).toEqual(mockRows);
  });

  it('should throw "Failed to fetch sets" when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    await expect(fetchCurrentSets("custom:3", 1)).rejects.toThrow(
      "Failed to fetch sets"
    );
  });
});