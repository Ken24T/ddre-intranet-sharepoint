import "@testing-library/jest-dom";
import { initializeIcons } from "@fluentui/react";

// Initialize Fluent UI icons for tests to avoid console warnings
initializeIcons();

// Mock window.matchMedia for theme detection tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
