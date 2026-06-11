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
      "TRACE retry GET /health",
      "POST /reports?method=GET"
    ]
  },
  {
    id: "feature-flags",
    filename: "feature-flags.env",
    lines: [
      "SEARCH_ENABLED=true",
      "BILLING_SYNC=false",
      "CACHE_WARMUP=true # temporary",
      "DEBUG_MODE=false",
      "AUDIT_MODE=true"
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
    id: "version-notes",
    filename: "version-notes.txt",
    lines: [
      "release v1.2.0 passed smoke tests",
      "release v1-2-0 used a draft tag",
      "release v1x2x0 is not a version",
      "release v2.10.4 passed smoke tests"
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
    id: "request-ids",
    filename: "request-ids.txt",
    lines: ["job-7", "job-42", "job-314", "job-", "job-A"]
  },
  {
    id: "log-shapes",
    filename: "log-shapes.txt",
    lines: ["lg", "log", "loog", "looog", "lag"]
  },
  {
    id: "alert-codes",
    filename: "alert-codes.log",
    lines: [
      "ERR-12 api timeout",
      "ERR1234 web latency",
      "ERR--44 double dash",
      "ERRX55 bad prefix",
      "WARN-44 queue depth"
    ]
  },
  {
    id: "job-codes",
    filename: "job-codes.log",
    lines: [
      "JOB-7 queued",
      "JOB-42 queued",
      "JOB-314 done",
      "JOB-9001 done",
      "JOB-12345 too long",
      "TASK-55 ignored"
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
      "db replica caught up",
      "api retry succeeded"
    ]
  },
  {
    id: "targets",
    filename: "targets.txt",
    lines: [
      "api-12 healthy",
      "web-7 degraded",
      "api gateway online",
      "job-3 queued",
      "api-42 failed"
    ]
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
