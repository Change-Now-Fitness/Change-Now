import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignupScreen from "../app/screens/signup";
import { signUp } from "../services/auth";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@expo-google-fonts/bebas-neue", () => ({
  useFonts: () => [true],
  BebasNeue_400Regular: {},
}));

jest.mock("../services/auth", () => ({
  signUp: jest.fn(),
}));

describe("Signup screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows error when passwords do not match", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignupScreen />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("First Name"), "John");
    fireEvent.changeText(getByPlaceholderText("Last Name"), "Smith");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "different123");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Passwords do not match")).toBeTruthy();
  });

  it("shows error when password is too short", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignupScreen />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("First Name"), "John");
    fireEvent.changeText(getByPlaceholderText("Last Name"), "Smith");
    fireEvent.changeText(getByPlaceholderText("Password"), "123");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "123");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Password must be at least 6 characters")).toBeTruthy();
  });

  it("calls signUp and redirects on successful signup", async () => {
    (signUp as jest.Mock).mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("First Name"), "John");
    fireEvent.changeText(getByPlaceholderText("Last Name"), "Smith");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password123");
    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith("test@example.com", "password123", "John", "Smith");
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/exerciselibrary");
    });
  });
});
