export interface RecoveryState { phase: 'idle' | 'waiting' | 'connecting' | 'manual'; attempt: number }
export type RecoveryResult = 'connected' | 'retry' | 'stop';
const DELAYS = [500, 1000, 2000, 4000, 8000] as const;

/** Runs one bounded five-attempt recovery cycle; cancellation invalidates every pending completion. */
export class MultiplayerRecovery {
  private controller: AbortController | null = null;
  private manual = false;

  /** Publishes only recovery transitions, independently of gameplay snapshots. */
  constructor(private readonly publish: (_state: RecoveryState) => void) {}

  /** Starts only once for a disconnect, retaining the original room reservation deadline. */
  start(deadlineMs: number, attempt: (_signal: AbortSignal) => Promise<RecoveryResult>): void {
    if (this.controller || this.manual) return;
    const controller = new AbortController();
    this.controller = controller;
    void this.run(controller, deadlineMs, attempt);
  }

  /** Cancels pending timers and admissions for navigation, logout, or a manual retry. */
  cancel(): void {
    this.controller?.abort(); this.controller = null; this.manual = false;
    this.publish({ phase: 'idle', attempt: 0 });
  }

  /** Gives each admission five seconds, stopping earlier on expiry or terminal failure. */
  private async run(controller: AbortController, deadlineMs: number,
    attempt: (_signal: AbortSignal) => Promise<RecoveryResult>): Promise<void> {
    let count = 0;
    for (const delay of DELAYS) {
      if (Date.now() + delay >= deadlineMs) break;
      this.publish({ phase: 'waiting', attempt: count + 1 });
      if (!await wait(delay, controller.signal)) return;
      count += 1;
      this.publish({ phase: 'connecting', attempt: count });
      const admission = new AbortController();
      const cancel = () => admission.abort();
      controller.signal.addEventListener('abort', cancel, { once: true });
      const timeout = globalThis.setTimeout(cancel, Math.min(5000, Math.max(0, deadlineMs - Date.now())));
      let aborted: (() => void) | undefined;
      const outcome = await Promise.race([
        attempt(admission.signal).catch((): RecoveryResult => 'retry'),
        new Promise<RecoveryResult>((resolve) => {
          aborted = () => resolve('retry');
          admission.signal.addEventListener('abort', aborted, { once: true });
          if (admission.signal.aborted) aborted();
        }),
      ]);
      globalThis.clearTimeout(timeout);
      controller.signal.removeEventListener('abort', cancel);
      if (aborted) admission.signal.removeEventListener('abort', aborted);
      admission.abort();
      if (controller.signal.aborted) return;
      if (outcome === 'connected') {
        this.controller = null;
        this.publish({ phase: 'idle', attempt: 0 });
        return;
      }
      if (outcome === 'stop') break;
    }
    if (controller.signal.aborted) return;
    this.controller = null; this.manual = true;
    this.publish({ phase: 'manual', attempt: count });
  }
}

/** Resolves cancellable backoff without leaving a timer or abort listener behind. */
function wait(ms: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (completed: boolean) => {
      globalThis.clearTimeout(timer); signal.removeEventListener('abort', abort); resolve(completed);
    };
    const abort = () => done(false);
    const timer = globalThis.setTimeout(() => done(true), ms);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}
