type TerminalBuddyStatus = "idle" | "hint" | "fail" | "success" | "complete";

interface TerminalBuddyProps {
  hints: string[];
  hintCount: number;
  status: TerminalBuddyStatus;
  onShowHint: () => void;
}

const mascotSprites: Record<TerminalBuddyStatus, string> = {
  idle: "/terminal-buddy-idle.png",
  hint: "/terminal-buddy-hint.png",
  fail: "/terminal-buddy-fail.png",
  success: "/terminal-buddy-success.png",
  complete: "/terminal-buddy-complete.png"
};

function getStatusCopy(status: TerminalBuddyStatus, hintCount: number) {
  if (status === "complete") {
    return "Path complete. Strong regex energy.";
  }

  if (status === "success") {
    return "Nice match. Ready for the next one.";
  }

  if (status === "fail") {
    return "Need a nudge? I can reveal the next clue.";
  }

  if (status === "hint" || hintCount > 0) {
    return "Hint stream open.";
  }

  return "Stuck? Ask for a small clue.";
}

export function TerminalBuddy({ hints, hintCount, status, onShowHint }: TerminalBuddyProps) {
  const visibleHints = hints.slice(0, hintCount);
  const hasMoreHints = hintCount < hints.length;
  const buttonLabel = hasMoreHints ? "Ask Terminal Buddy for a hint" : "No more hints from Terminal Buddy";

  return (
    <aside className={`terminal-buddy is-${status}`} aria-label="Terminal Buddy hints">
      <div className="terminal-buddy-avatar-wrap">
        <img
          alt="Terminal Buddy"
          className="terminal-buddy-avatar"
          height="64"
          src={mascotSprites[status]}
          width="64"
        />
      </div>

      <div className="terminal-buddy-panel">
        <p className="terminal-buddy-status">{getStatusCopy(status, hintCount)}</p>

        {visibleHints.length > 0 ? (
          <ol className="terminal-buddy-hints" aria-live="polite">
            {visibleHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ol>
        ) : null}

        <button
          aria-label={buttonLabel}
          className="terminal-buddy-button"
          disabled={!hasMoreHints}
          onClick={onShowHint}
          type="button"
        >
          {hasMoreHints ? "Ask Buddy" : "No more hints"}
        </button>
      </div>
    </aside>
  );
}
