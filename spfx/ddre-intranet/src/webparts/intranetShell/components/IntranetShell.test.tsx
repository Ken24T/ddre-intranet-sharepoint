import * as React from "react";
import { render, screen } from "@testing-library/react";
import IntranetShell from "./IntranetShell";

describe("IntranetShell", () => {
  it("renders greeting, environment message, and description", () => {
    render(
      <IntranetShell
        description="Test description"
        isDarkTheme={false}
        environmentMessage="Local workbench"
        hasTeamsContext={false}
        userDisplayName="John Doe"
      />,
    );

    expect(screen.getByText(/Well done,\s*John Doe!/i)).toBeInTheDocument();
    expect(screen.getByText(/Local workbench/i)).toBeInTheDocument();
    expect(screen.getByText(/Web part property value:/i)).toBeInTheDocument();
    expect(screen.getByText(/Test description/i)).toBeInTheDocument();
  });
});
