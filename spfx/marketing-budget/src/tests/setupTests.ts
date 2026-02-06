import "@testing-library/jest-dom";
import { initializeIcons } from "@fluentui/react";

// Initialise Fluent UI icons for tests to avoid console warnings
initializeIcons();

// Mock window.matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
