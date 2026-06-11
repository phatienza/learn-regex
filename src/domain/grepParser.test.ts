import { describe, expect, it } from "vitest";
import { parseGrepCommand } from "./grepParser";

describe("parseGrepCommand", () => {
  it("parses a quoted pattern and filename", () => {
    expect(parseGrepCommand("grep 'ERROR' app.log")).toEqual({
      ok: true,
      command: {
        raw: "grep 'ERROR' app.log",
        pattern: "ERROR",
        filename: "app.log",
        flags: {
          extended: false,
          ignoreCase: false,
          lineNumber: false,
          onlyMatching: false
        }
      }
    });
  });

  it("parses supported grep flags in separate or combined form", () => {
    expect(parseGrepCommand('grep -E -i -n -o "\\d+" data.csv')).toMatchObject({
      ok: true,
      command: {
        pattern: "\\d+",
        filename: "data.csv",
        flags: {
          extended: true,
          ignoreCase: true,
          lineNumber: true,
          onlyMatching: true
        }
      }
    });

    expect(parseGrepCommand("grep -Eino 'api' routes.txt")).toMatchObject({
      ok: true,
      command: {
        pattern: "api",
        filename: "routes.txt",
        flags: {
          extended: true,
          ignoreCase: true,
          lineNumber: true,
          onlyMatching: true
        }
      }
    });
  });

  it("rejects unsupported commands, flags, and incomplete commands with helpful errors", () => {
    expect(parseGrepCommand("cat app.log")).toEqual({
      ok: false,
      error: "Commands must start with grep."
    });

    expect(parseGrepCommand("grep -r 'error' .")).toEqual({
      ok: false,
      error: "Unsupported flag -r. Try -E, -i, -n, or -o."
    });

    expect(parseGrepCommand("grep 'error'")).toEqual({
      ok: false,
      error: "Add the sample filename after the pattern."
    });
  });

  it("allows capstone redirection only to findings.txt", () => {
    expect(parseGrepCommand("grep -E 'ERROR|WARN' incident.log > findings.txt")).toMatchObject({
      ok: false,
      error: "Output redirection is only available in the capstone lesson."
    });

    expect(
      parseGrepCommand("grep -E 'ERROR|WARN' incident.log > findings.txt", {
        allowRedirect: true
      })
    ).toMatchObject({
      ok: true,
      command: {
        redirectTo: "findings.txt"
      }
    });

    expect(
      parseGrepCommand("grep -E 'ERROR|WARN' incident.log > other.txt", {
        allowRedirect: true
      })
    ).toEqual({
      ok: false,
      error: "Only > findings.txt is supported in this lesson."
    });
  });
});
