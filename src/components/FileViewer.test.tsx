import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileViewer } from "./FileViewer";
import type { PracticeFile } from "../domain/types";

const file: PracticeFile = {
  id: "app-log",
  filename: "app.log",
  lines: ["INFO boot sequence complete", "ERROR payment worker failed"]
};

describe("FileViewer", () => {
  it("renders sample files with editor chrome", () => {
    render(<FileViewer file={file} matchSpans={[]} />);

    expect(screen.getByRole("tab", { name: "app.log" })).toBeInTheDocument();
    expect(screen.getByText("~/learn-regex/samples/app.log")).toBeInTheDocument();
    expect(screen.getByText("read-only")).toBeInTheDocument();
    expect(screen.getByText("2 lines")).toBeInTheDocument();
    expect(screen.getByLabelText("app.log contents")).toBeInTheDocument();
  });
});
