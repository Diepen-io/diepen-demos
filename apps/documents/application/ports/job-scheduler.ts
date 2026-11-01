/** A chase that is due at a story time. */
export type ChaseJob = { id: string; requestId: string; runAt: string };

/**
 * Runs chases later. The demo uses an in-process adapter on a virtual clock; a client build uses
 * a durable one such as Trigger.dev (decision D6). Scheduling an existing id replaces that job.
 */
export interface JobScheduler {
  schedule(job: ChaseJob): Promise<void>;
  cancel(jobId: string): Promise<void>;
}
