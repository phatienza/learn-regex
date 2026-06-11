import type { PracticeFile } from "../domain/types";

export const practiceFiles: PracticeFile[] = [
  {
    id: "app-log",
    filename: "app.log",
    lines: [
      "INFO boot sequence complete",
      "DEBUG cache warmup took 18ms",
      "ERROR payment worker failed",
      "INFO retry scheduled"
    ]
  },
  {
    id: "team-notes",
    filename: "team-notes.txt",
    lines: [
      "TODO rotate staging credentials",
      "note: confirm deploy window",
      "todo document rollback steps",
      "Done: update incident template"
    ]
  },
  {
    id: "routes",
    filename: "routes.txt",
    lines: [
      "GET /api/users",
      "POST /api/users",
      "GET /health",
      "DELETE /api/users/42"
    ]
  },
  {
    id: "feature-flags",
    filename: "feature-flags.env",
    lines: [
      "SEARCH_ENABLED=true",
      "BILLING_SYNC=false",
      "CACHE_WARMUP=true",
      "DEBUG_MODE=false"
    ]
  },
  {
    id: "versions",
    filename: "versions.txt",
    lines: [
      "release v1.2.0",
      "release v1-2-0",
      "release v1.20",
      "release v2.2.0"
    ]
  },
  {
    id: "users",
    filename: "users.csv",
    lines: ["Alice,dev", "Bob,ops", "Carla,qa", "Dina,pm", "Eli,support"]
  },
  {
    id: "tasks",
    filename: "tasks.txt",
    lines: [
      "A1 deploy dashboard",
      "B2 rotate logs",
      "AA missing digit",
      "C3 reboot cache",
      "4D backwards code"
    ]
  },
  {
    id: "alerts",
    filename: "alerts.log",
    lines: [
      "ERR-12 api timeout",
      "ERR1234 web latency",
      "ERR-12345 too many digits",
      "WARN-44 queue depth",
      "ERR-7 too short"
    ]
  },
  {
    id: "release-manifest",
    filename: "release-manifest.txt",
    lines: [
      "REL-2026-06-10 v1.24.0",
      "REL-2026-6-10 v1.24.0",
      "REL-2026-06-11 v2.03.4",
      "REL-2026-06-12 version 3"
    ]
  },
  {
    id: "service-events",
    filename: "service-events.log",
    lines: [
      "api timeout after 30s",
      "worker job completed",
      "web latency above threshold",
      "db replica caught up"
    ]
  },
  {
    id: "targets",
    filename: "targets.txt",
    lines: ["api-12 healthy", "web-7 degraded", "job-3 queued", "api-42 failed"]
  },
  {
    id: "incident",
    filename: "incident.log",
    lines: [
      "INFO api-12 deployment started",
      "WARN web-7 latency above 900ms",
      "ERROR api-42 payment worker failed",
      "INFO job-3 retry scheduled",
      "WARN db-2 replica lag rising"
    ]
  }
];

export function findPracticeFile(id: string): PracticeFile | undefined {
  return practiceFiles.find((file) => file.id === id);
}
