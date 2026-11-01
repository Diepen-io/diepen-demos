import type { ChaseJob } from "@/application/ports/job-scheduler";
import { describe, expect, it } from "vitest";
import { InProcessScheduler } from "./in-process-scheduler";

function job(id: string, runAt: string): ChaseJob {
  return { id, requestId: "okafor-2025", runAt };
}

describe("InProcessScheduler @documents.chase", () => {
  it("runs due jobs in runAt order and leaves later ones waiting", async () => {
    const scheduler = new InProcessScheduler();
    await scheduler.schedule(job("b", "2026-03-11T09:00"));
    await scheduler.schedule(job("later", "2026-03-20T09:00"));
    await scheduler.schedule(job("a", "2026-03-10T09:00"));
    await scheduler.schedule(job("c", "2026-03-12T09:00"));

    const ran: string[] = [];
    await scheduler.advanceTo("2026-03-12T09:00", (due) => {
      ran.push(due.id);
    });
    expect(ran).toEqual(["a", "b", "c"]);

    await scheduler.advanceTo("2026-03-21T09:00", (due) => {
      ran.push(due.id);
    });
    expect(ran).toEqual(["a", "b", "c", "later"]);
  });

  it("replaces a job that is scheduled again with the same id", async () => {
    const scheduler = new InProcessScheduler();
    await scheduler.schedule(job("reminder", "2026-03-10T09:00"));
    await scheduler.schedule(job("other", "2026-03-11T09:00"));
    await scheduler.schedule(job("reminder", "2026-03-12T09:00"));

    const ran: ChaseJob[] = [];
    await scheduler.advanceTo("2026-03-13T09:00", (due) => {
      ran.push(due);
    });
    expect(ran.map((due) => [due.id, due.runAt])).toEqual([
      ["other", "2026-03-11T09:00"],
      ["reminder", "2026-03-12T09:00"],
    ]);
  });

  it("never runs a cancelled job", async () => {
    const scheduler = new InProcessScheduler();
    await scheduler.schedule(job("kept", "2026-03-10T09:00"));
    await scheduler.schedule(job("cancelled", "2026-03-10T10:00"));
    await scheduler.cancel("cancelled");

    const ran: string[] = [];
    await scheduler.advanceTo("2026-03-30T09:00", (due) => {
      ran.push(due.id);
    });
    expect(ran).toEqual(["kept"]);
  });
});
