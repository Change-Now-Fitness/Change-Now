import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import ExerciseLibrary from "../app/(tabs)/exerciselibrary";
import { checkLogin } from "../services/auth";
import { createExercise, fetchExercises } from "../lib/api";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../services/auth", () => ({
  checkLogin: jest.fn(),
}));

jest.mock("../lib/api", () => ({
  fetchExercises: jest.fn(),
  createExercise: jest.fn(),
}));

describe("Exercise library screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", async () => {
    (checkLogin as jest.Mock).mockResolvedValue({ success: false, user_id: "" });

    render(<ExerciseLibrary />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("loads and shows fetched exercise list", async () => {
    (checkLogin as jest.Mock).mockResolvedValue({ success: true, user_id: "1" });
    (fetchExercises as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: "Barbell Curl",
        type: "strength",
        muscleGroup: "biceps",
        equipment: "barbell",
        isCustom: false,
        userId: 1,
      },
    ]);

    const { findByText } = render(<ExerciseLibrary />);

    expect(await findByText("Barbell Curl")).toBeTruthy();
  });

  it("creates a custom exercise and appends it to list", async () => {
    (checkLogin as jest.Mock).mockResolvedValue({ success: true, user_id: "1" });
    (fetchExercises as jest.Mock).mockResolvedValue([]);
    (createExercise as jest.Mock).mockResolvedValue({
      id: 99,
      name: "Adam Press",
      type: "strength",
      muscleGroup: "chest",
      equipment: "barbell",
      isCustom: true,
      userId: 1,
    });

    const { getByLabelText, getByPlaceholderText, getByText, findByText } = render(
      <ExerciseLibrary />
    );

    await waitFor(() => {
      expect(fetchExercises).toHaveBeenCalledWith(1);
    });

    fireEvent.press(getByLabelText("Add custom exercise"));
    fireEvent.changeText(getByPlaceholderText("e.g. Adam Press"), "Adam Press");
    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(createExercise).toHaveBeenCalled();
    });

    expect(await findByText("Adam Press")).toBeTruthy();
    expect(await findByText("Custom")).toBeTruthy();
  });
});
