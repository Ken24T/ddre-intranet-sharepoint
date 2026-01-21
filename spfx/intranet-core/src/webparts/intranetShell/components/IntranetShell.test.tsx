import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import IntranetShell from "./IntranetShell";
import { TasksProvider } from "./tasks/TasksContext";

// Helper to wrap components with TasksProvider
const renderWithProviders = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(
    <TasksProvider autoLoad={false}>
      {ui}
    </TasksProvider>
  );
};

describe("IntranetShell", () => {
  const defaultProps = {
    userDisplayName: "John Doe",
    userEmail: "john.doe@example.com",
    siteTitle: "DDRE Intranet",
    appVersion: "0.4.0",
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the shell with all four regions", () => {
    renderWithProviders(<IntranetShell {...defaultProps} />);

    // Navbar
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.siteTitle)).toBeInTheDocument();

    // Sidebar - check for Home within sidebar (also appears in hero)
    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByText("Home")).toBeInTheDocument();

    // Content area - welcome message now uses first name only
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument();

    // Status bar
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText(`${defaultProps.userDisplayName} (4)`)).toBeInTheDocument();
  });

  it("displays nav items in sidebar", () => {
    renderWithProviders(<IntranetShell {...defaultProps} isAdmin={true} />);

    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(within(sidebar).getByText("Document Library")).toBeInTheDocument();
    expect(within(sidebar).getByText("Administration")).toBeInTheDocument();
    expect(within(sidebar).getByText("Office")).toBeInTheDocument();
    expect(within(sidebar).getByText("Property Management")).toBeInTheDocument();
    expect(within(sidebar).getByText("Sales")).toBeInTheDocument();
  });

  it("displays status indicators in status bar", () => {
    renderWithProviders(<IntranetShell {...defaultProps} />);

    const statusBar = screen.getByRole("contentinfo");
    expect(within(statusBar).getByText("Vault")).toBeInTheDocument();
    expect(within(statusBar).getByText("PropertyMe")).toBeInTheDocument();
  });

  it("restores favourites from storage", () => {
    localStorage.setItem(
      "ddre-intranet-favourites",
      JSON.stringify([
        {
          cardId: "quick-links",
          sourceHubKey: "home",
          addedAt: "2026-01-18T00:00:00.000Z",
        },
      ])
    );

    renderWithProviders(<IntranetShell {...defaultProps} />);

    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(within(sidebar).getByText("Favourites")).toBeInTheDocument();
  });

  it("hides favourites hub when none stored", () => {
    renderWithProviders(<IntranetShell {...defaultProps} />);

    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(within(sidebar).queryByText("Favourites")).not.toBeInTheDocument();
  });
});
