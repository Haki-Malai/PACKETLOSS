import type { ServerMessage } from '../src/game/protocol/messages';
import { SYNCHRONIZATION } from '../src/game/simulation/types';

interface OutboundSocket {
  readonly readyState: number;
  readonly bufferedAmount: number;
  send(_data: string, _callback: (_error?: Error) => void): void;
  close(_code: number, _reason: string): void;
}

/** Bounds reliable writes while replacing obsolete snapshots that have not reached the socket. */
export class SnapshotSender {
  private readonly queue: ServerMessage[] = [];
  private writing = false;
  private lastProgress: number;
  private stopped = false;

  /** Injects transport and monotonic time so backpressure requires no simulation or renderer. */
  constructor(private readonly socket: OutboundSocket, private readonly now: () => number,
    private readonly onCoalesce: () => void) {
    this.lastProgress = now();
  }

  /** Preserves reliable control barriers and terminal snapshots while coalescing playing snapshots. */
  send(message: ServerMessage): void {
    if (this.stopped || this.socket.readyState !== 1) return;
    if (!this.writing && this.queue.length === 0) this.lastProgress = this.now();
    if (message.type === 'snapshot') {
      for (let index = this.queue.length - 1; index >= 0; index -= 1) {
        const queued = this.queue[index];
        if (queued.type === 'snapshot' && queued.snapshot.phase === 'playing'
          && queued.snapshot.matchId === message.snapshot.matchId) {
          this.queue.splice(index, 1); this.onCoalesce();
        }
      }
    }
    if (message.type === 'map' || message.type === 'left') {
      for (let index = this.queue.length - 1; index >= 0; index -= 1) {
        const queued = this.queue[index];
        if (queued.type === 'snapshot' && queued.snapshot.phase === 'playing') {
          this.queue.splice(index, 1); this.onCoalesce();
        }
      }
    }
    this.queue.push(message);
    if (this.queue.length > 64) { this.stop(); return; }
    this.check();
  }

  /** Checks sustained congestion even when no new game snapshots are being produced. */
  check(): void {
    if (this.stopped || this.socket.readyState !== 1) return;
    if ((this.writing || this.queue.length > 0) && this.now() - this.lastProgress >= SYNCHRONIZATION.timeoutMs) {
      this.stop(); return;
    }
    if (this.writing || this.socket.bufferedAmount > 0) return;
    const message = this.queue.shift();
    if (!message) return;
    this.writing = true;
    this.socket.send(JSON.stringify(message), (error) => {
      this.writing = false;
      if (error) { this.stop(); return; }
      this.lastProgress = this.now();
      this.check();
    });
  }

  /** Releases queued messages on close; callbacks from an old socket cannot resume sending. */
  dispose(): void { this.stopped = true; this.queue.length = 0; }

  /** Ends a persistently blocked connection so its room reservation can recover. */
  private stop(): void {
    this.dispose();
    this.socket.close(4408, 'Client too slow');
  }
}
