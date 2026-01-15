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

    // Sidebar
    expect(screen.getByRole("complementary", { name: /sidebar/i })).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();

    // Content area
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();

    // Status bar
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText(defaultProps.userEmail)).toBeInTheDocument();
  });

  it("displays nav items in sidebar", () => {
    render(<IntranetShell {...defaultProps} />);

    const sidebar = screen.getByRole("complementary", { name: /sidebar/i });
    expect(within(sidebar).getByText("Document Library")).toBeInTheDocument();
    expect(within(sidebar).getByText("AI Assistant")).toBeInTheDocument();
    expect(within(sidebar).getByText("PropertyMe")).toBeInTheDocument();
    expect(within(sidebar).getByText("Vault")).toBeInTheDocument();
  });

  it("displays status indicators in status bar", () => {
    render(<IntranetShell {...defaultProps} />);

    const statusBar = screen.getByRole("contentinfo");
    expect(within(statusBar).getByText("Vault")).toBeInTheDocument();
    expect(within(statusBar).getByText("PropertyMe")).toBeInTheDocument();
  });
});
