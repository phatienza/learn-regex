import { useEffect, useRef, useState } from "react";

export type TerminalBuddyStatus = "idle" | "hint" | "fail" | "success" | "complete";

export interface TerminalBuddyProps {
  feedback?: string;
  hints: string[];
  hintCount: number;
  progressLabel?: string;
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
    return "Ready for the next one.";
  }

  if (status === "fail") {
    return "Need a nudge? I can reveal the next clue.";
  }

  if (status === "hint" || hintCount > 0) {
    return "Hint stream open.";
  }

  return "Ask me for hints when you get stuck.";
}

export function TerminalBuddy({
  feedback,
  hints,
  hintCount,
  progressLabel,
  status,
  onShowHint
}: TerminalBuddyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserCollapsed, setIsUserCollapsed] = useState(false);
  const [motionState, setMotionState] = useState<"idle" | "cling" | "hop">("idle");
  const rootRef = useRef<HTMLElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const clingTimerRef = useRef<number | undefined>(undefined);
  const hopTimerRef = useRef<number | undefined>(undefined);
  const normalizedHintCount = Number.isFinite(hintCount) ? Math.trunc(hintCount) : 0;
  const revealedHintCount = Math.min(Math.max(0, normalizedHintCount), hints.length);
  const visibleHints = hints.slice(0, revealedHintCount);
  const hasMoreHints = revealedHintCount < hints.length;
  const hasMessage = status !== "idle" || revealedHintCount > 0 || Boolean(feedback);
  const messageKey = [status, revealedHintCount, feedback ?? "", progressLabel ?? ""].join("|");
  const isPanelOpen = hasMessage ? !isUserCollapsed : isExpanded;
  const buttonLabel = hasMoreHints ? "Ask Terminal Buddy for a hint" : "No more hints from Terminal Buddy";
  const showHintButton = status !== "success" && status !== "complete";

  useEffect(() => {
    return () => {
      if (clingTimerRef.current) window.clearTimeout(clingTimerRef.current);
      if (hopTimerRef.current) window.clearTimeout(hopTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsUserCollapsed(false);
  }, [messageKey]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;

      const bounds = avatarButtonRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > 120) return;

      const nudgeX = Math.max(-18, Math.min(18, Math.round(deltaX * 0.5)));
      const nudgeY = Math.max(-14, Math.min(14, Math.round(deltaY * 0.5)));

      rootRef.current?.style.setProperty("--buddy-nudge-x", `${nudgeX}px`);
      rootRef.current?.style.setProperty("--buddy-nudge-y", `${nudgeY}px`);
      setMotionState("cling");

      if (clingTimerRef.current) window.clearTimeout(clingTimerRef.current);
      if (hopTimerRef.current) window.clearTimeout(hopTimerRef.current);

      clingTimerRef.current = window.setTimeout(() => {
        setMotionState("hop");
        rootRef.current?.style.setProperty("--buddy-nudge-x", "0px");
        rootRef.current?.style.setProperty("--buddy-nudge-y", "0px");
      }, 850);

      hopTimerRef.current = window.setTimeout(() => {
        setMotionState("idle");
      }, 1250);
    }

    document.addEventListener("pointermove", handlePointerMove);

    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <aside
      className={`terminal-buddy is-floating is-${status}${isPanelOpen ? " is-expanded" : " is-compact"}${
        motionState === "cling" ? " is-clinging" : ""
      }${motionState === "hop" ? " is-hopping" : ""}`}
      aria-label="Terminal Buddy hints"
      ref={rootRef}
    >
      <button
        aria-expanded={isPanelOpen}
        aria-label={isPanelOpen ? "Close Terminal Buddy" : "Open Terminal Buddy"}
        className="terminal-buddy-avatar-button"
        onClick={() => {
          if (hasMessage) {
            setIsUserCollapsed((current) => !current);
            return;
          }

          setIsExpanded((current) => !current);
        }}
        ref={avatarButtonRef}
        type="button"
      >
        <img
          alt="Terminal Buddy"
          className="terminal-buddy-avatar"
          height="64"
          src={mascotSprites[status]}
          width="64"
        />
      </button>

      {isPanelOpen ? (
        <div className="terminal-buddy-panel">
          {progressLabel ? <p className="terminal-buddy-progress">{progressLabel}</p> : null}
          {feedback ? (
            <p className="terminal-buddy-feedback" role="status">
              {feedback}
            </p>
          ) : null}
          <p className="terminal-buddy-status">{getStatusCopy(status, revealedHintCount)}</p>

          <ol className="terminal-buddy-hints" aria-live="polite" aria-atomic="false">
            {visibleHints.map((hint, index) => (
              <li key={`${index}-${hint}`}>{hint}</li>
            ))}
          </ol>

          {showHintButton ? (
            <button
              aria-label={buttonLabel}
              className="terminal-buddy-button"
              disabled={!hasMoreHints}
              onClick={onShowHint}
              type="button"
            >
              {hasMoreHints ? "Ask Buddy" : "No more hints"}
            </button>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
