import type { ChaseJob, JobScheduler } from "@/application/ports/job-scheduler";

const runAtMs = (job: ChaseJob) => Date.parse(`${job.runAt.slice(0, 16)}:00Z`);

/**
 * A scheduler on a virtual clock. The demo keeps no server state, so the jobs come in with the
 * session and go back out with it; `advanceTo` runs whatever is due when the story clock moves.
 */
export class InProcessScheduler implements JobScheduler {
  private readonly jobs = new Map<string, ChaseJob>();

  constructor(jobs: readonly ChaseJob[] = []) {
    for (const job of jobs) this.jobs.set(job.id, job);
  }

  schedule(job: ChaseJob): Promise<void> {
    this.jobs.set(job.id, job);
    return Promise.resolve();
  }

  cancel(jobId: string): Promise<void> {
    this.jobs.delete(jobId);
    return Promise.resolve();
  }

  pending(): ChaseJob[] {
    return [...this.jobs.values()].sort((a, b) => runAtMs(a) - runAtMs(b));
  }

  /** Runs every job due at `time`, earliest first, including jobs a handler schedules on the way. */
  async advanceTo(time: string, handler: (job: ChaseJob) => void | Promise<void>): Promise<void> {
    const until = runAtMs({ id: "", requestId: "", runAt: time });
    for (let due = this.nextDue(until); due; due = this.nextDue(until)) {
      this.jobs.delete(due.id);
      await handler(due);
    }
  }

  private nextDue(until: number): ChaseJob | undefined {
    const first = this.pending()[0];
    return first && runAtMs(first) <= until ? first : undefined;
  }
}
