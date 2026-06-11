import type { ParsedGrepCommand, ParseOptions, ParseResult } from "./types";

const SUPPORTED_FLAGS = new Set(["E", "i", "n", "o"]);

export function parseGrepCommand(input: string, options: ParseOptions = {}): ParseResult {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Commands must start with grep." };
  }

  const tokenResult = tokenize(raw);
  if (!tokenResult.ok) {
    return tokenResult;
  }

  const tokens = tokenResult.tokens;
  if (tokens[0] !== "grep") {
    return { ok: false, error: "Commands must start with grep." };
  }

  const flags: ParsedGrepCommand["flags"] = {
    extended: false,
    ignoreCase: false,
    lineNumber: false,
    onlyMatching: false
  };

  const args = tokens.slice(1);
  const values: string[] = [];
  let redirectTo: ParsedGrepCommand["redirectTo"];

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === ">") {
      if (!options.allowRedirect) {
        return {
          ok: false,
          error: "Output redirection is only available in the capstone lesson."
        };
      }

      const target = args[index + 1];
      if (target !== "findings.txt") {
        return { ok: false, error: "Only > findings.txt is supported in this lesson." };
      }

      if (index + 2 < args.length) {
        return { ok: false, error: "Only one output file is supported." };
      }

      redirectTo = "findings.txt";
      break;
    }

    if (token.startsWith("-") && token.length > 1 && values.length === 0) {
      const flagResult = applyFlags(token.slice(1), flags);
      if (!flagResult.ok) {
        return flagResult;
      }
      continue;
    }

    values.push(token);
  }

  if (values.length === 0) {
    return { ok: false, error: "Add a pattern after grep." };
  }

  if (values.length === 1) {
    return { ok: false, error: "Add the sample filename after the pattern." };
  }

  if (values.length > 2) {
    return { ok: false, error: "Use one pattern and one sample filename." };
  }

  return {
    ok: true,
    command: {
      raw,
      pattern: values[0],
      filename: values[1],
      flags,
      ...(redirectTo ? { redirectTo } : {})
    }
  };
}

function applyFlags(
  rawFlags: string,
  flags: ParsedGrepCommand["flags"]
): { ok: true } | { ok: false; error: string } {
  for (const flag of rawFlags) {
    if (!SUPPORTED_FLAGS.has(flag)) {
      return { ok: false, error: `Unsupported flag -${flag}. Try -E, -i, -n, or -o.` };
    }

    if (flag === "E") flags.extended = true;
    if (flag === "i") flags.ignoreCase = true;
    if (flag === "n") flags.lineNumber = true;
    if (flag === "o") flags.onlyMatching = true;
  }

  return { ok: true };
}

function tokenize(input: string): { ok: true; tokens: string[] } | { ok: false; error: string } {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    if (char === ">") {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }

    current += char;
  }

  if (quote) {
    return { ok: false, error: "Close the quoted pattern before running grep." };
  }

  if (current) {
    tokens.push(current);
  }

  return { ok: true, tokens };
}
