import { afterEach, describe, expect, it, vi } from 'vitest';
import { MultiplayerRecovery } from '../game/infrastructure/adapters/MultiplayerRecovery';

afterEach(() => vi.useRealTimers());

describe('bounded automatic multiplayer recovery', () => {
  it('makes exactly five attempts with fresh admissions, then requires manual retry', async () => {
    vi.useFakeTimers();
    const publish = vi.fn(), attempt = vi.fn(() => Promise.resolve('retry' as const));
    const recovery = new MultiplayerRecovery(publish);
    recovery.start(Date.now() + 30_000, attempt);
    for (const [index, delay] of [500, 1000, 2000, 4000, 8000].entries()) {
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(attempt).toHaveBeenCalledTimes(index);
      await vi.advanceTimersByTimeAsync(1);
      expect(attempt).toHaveBeenCalledTimes(index + 1);
    }
    expect(publish).toHaveBeenLastCalledWith({ phase: 'manual', attempt: 5 });
    recovery.start(Date.now() + 30_000, attempt);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(attempt).toHaveBeenCalledTimes(5);
    expect(vi.getTimerCount()).toBe(0);
    recovery.cancel();
  });

  it('aborts each hung admission after five seconds and stops when the reservation expires', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const publish = vi.fn();
    const recovery = new MultiplayerRecovery(publish);
    recovery.start(Date.now() + 12_000, (signal) => {
      signals.push(signal); return new Promise(() => {});
    });
    await vi.advanceTimersByTimeAsync(5500);
    expect(signals).toHaveLength(1); expect(signals[0].aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(6500);
    expect(signals).toHaveLength(2); expect(signals[1].aborted).toBe(true);
    expect(publish).toHaveBeenLastCalledWith({ phase: 'manual', attempt: 2 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['connected', 'stop'] as const)('ends recovery on %s without scheduling another attempt', async (outcome) => {
    vi.useFakeTimers();
    const publish = vi.fn(), attempt = vi.fn(() => Promise.resolve(outcome));
    const recovery = new MultiplayerRecovery(publish);
    recovery.start(Date.now() + 30_000, attempt);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(attempt).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenLastCalledWith({ phase: outcome === 'connected' ? 'idle' : 'manual', attempt: outcome === 'connected' ? 0 : 1 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels backoff and an in-flight admission, ignoring its late result', async () => {
    vi.useFakeTimers();
    const publish = vi.fn(), recovery = new MultiplayerRecovery(publish);
    let resolve!: (_result: 'connected') => void;
    let signal: AbortSignal | undefined;
    const attempt = vi.fn((value: AbortSignal) => {
      signal = value; return new Promise<'connected'>((done) => { resolve = done; });
    });
    recovery.start(Date.now() + 30_000, attempt);
    recovery.cancel();
    await vi.advanceTimersByTimeAsync(500);
    expect(attempt).not.toHaveBeenCalled();
    recovery.start(Date.now() + 30_000, attempt);
    await vi.advanceTimersByTimeAsync(500);
    recovery.cancel();
    expect(signal?.aborted).toBe(true);
    resolve('connected');
    await vi.advanceTimersByTimeAsync(30_000);
    expect(attempt).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenLastCalledWith({ phase: 'idle', attempt: 0 });
    expect(vi.getTimerCount()).toBe(0);
  });
});
