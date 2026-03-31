import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import LoginScreen from "../app/index";
import { checkLogin, login } from "../services/auth";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@expo-google-fonts/bebas-neue", () => ({
  useFonts: () => [true],
  BebasNeue_400Regular: {},
}));

jest.mock("../services/auth", () => ({
  checkLogin: jest.fn(),
  login: jest.fn(),
}));

describe("Login screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (checkLogin as jest.Mock).mockResolvedValue({ success: false, user_id: "" });
  });

  it("renders login form fields and actions", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Log In")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("navigates to signup screen when pressing Sign Up", () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Sign Up"));

    expect(mockPush).toHaveBeenCalledWith("/signupscreen");
  });

  it("calls login service and redirects on success", async () => {
    (login as jest.Mock).mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/maindashboard");
    });
  });
});
