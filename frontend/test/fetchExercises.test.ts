import { fetchExercises } from "../lib/api";

describe("fetchExercises", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it("should call exercises endpoint with userId and return exercise list", async () => {
    const mockExercises = [
      {
        id: "template:1",
        name: "Barbell Bench Press",
        type: "strength",
        muscleGroup: "chest",
        isCustom: false,
        userId: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockExercises),
    });

    const result = await fetchExercises(7);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/exercises?userId=7")
    );
    expect(result).toEqual(mockExercises);
  });

  it('should throw ApiError when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: "Failed to fetch exercises" }),
    });

    await expect(fetchExercises(7)).rejects.toMatchObject({
      status: 500,
      message: "Failed to fetch exercises",
    });
  });
});
