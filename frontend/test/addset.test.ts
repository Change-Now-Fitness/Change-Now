import { addSet } from "../lib/api";

describe("addSet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it("should post set payload and return saved set on success", async () => {
    const mockResponse = { id: 1, exerciseId: "template:1", userId: 2, weight: 135, reps: 8 };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await addSet("template:1", 2, 135, 8);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts/sets"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: "template:1",
          userId: 2,
          weight: 135,
          reps: 8,
        }),
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw "Failed to save set" when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    await expect(addSet("template:1", 2, 135, 8)).rejects.toThrow("Failed to save set");
  });
});
