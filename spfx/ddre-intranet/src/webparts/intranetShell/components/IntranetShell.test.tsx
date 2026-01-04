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

  it("escapes user-controlled strings", () => {
    render(
      <IntranetShell
        description="<i>desc</i>"
        isDarkTheme={false}
        environmentMessage="Local workbench"
        hasTeamsContext={false}
        userDisplayName="<b>John</b>"
      />,
    );

    expect(screen.queryByText("<b>John</b>")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Well done, &lt;b&gt;John&lt;/b&gt;!",
    );

    expect(screen.queryByText("<i>desc</i>")).not.toBeInTheDocument();
    expect(screen.getByText("&lt;i&gt;desc&lt;/i&gt;")).toBeInTheDocument();
  });
});
