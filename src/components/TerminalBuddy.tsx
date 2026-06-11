export type TerminalBuddyStatus = "idle" | "hint" | "fail" | "success" | "complete";

export interface TerminalBuddyProps {
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
  const revealedHintCount = Math.min(Math.max(0, hintCount), hints.length);
  const visibleHints = hints.slice(0, revealedHintCount);
  const hasMoreHints = revealedHintCount < hints.length;
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
        <p className="terminal-buddy-status">{getStatusCopy(status, revealedHintCount)}</p>

        <ol className="terminal-buddy-hints" aria-live="polite" aria-atomic="false">
          {visibleHints.map((hint, index) => (
            <li key={`${index}-${hint}`}>{hint}</li>
          ))}
        </ol>

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
