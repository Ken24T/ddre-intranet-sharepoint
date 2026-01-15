import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import IntranetShell from "./IntranetShell";

describe("IntranetShell", () => {
  const defaultProps = {
    userDisplayName: "John Doe",
    userEmail: "john.doe@example.com",
    siteTitle: "DDRE Intranet",
  };

  it("renders the shell with all four regions", () => {
    render(<IntranetShell {...defaultProps} />);

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
    expect(screen.getByText(defaultProps.userEmail)).toBeInTheDocument();
  });

  it("displays nav items in sidebar", () => {
    render(<IntranetShell {...defaultProps} />);

    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(within(sidebar).getByText("Document Library")).toBeInTheDocument();
    expect(within(sidebar).getByText("Administration")).toBeInTheDocument();
    expect(within(sidebar).getByText("Office")).toBeInTheDocument();
    expect(within(sidebar).getByText("Property Management")).toBeInTheDocument();
    expect(within(sidebar).getByText("Sales")).toBeInTheDocument();
  });

  it("displays status indicators in status bar", () => {
    render(<IntranetShell {...defaultProps} />);

    const statusBar = screen.getByRole("contentinfo");
    expect(within(statusBar).getByText("Vault")).toBeInTheDocument();
    expect(within(statusBar).getByText("PropertyMe")).toBeInTheDocument();
  });
});
