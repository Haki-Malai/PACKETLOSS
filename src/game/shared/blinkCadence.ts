export function resolveNextBlinkToggleAt(
  fromElapsedMs: number,
  durationMs: number,
  intervals: { blinkStartIntervalMs: number; blinkEndIntervalMs: number },
): number {
  if (fromElapsedMs >= durationMs) {
    return 0;
  }

  let intervalMs = intervals.blinkStartIntervalMs;
  if (!(durationMs <= 0)) {
    const progress = Math.max(0, Math.min(1, fromElapsedMs / durationMs));
    const interval =
      intervals.blinkStartIntervalMs + (intervals.blinkEndIntervalMs - intervals.blinkStartIntervalMs) * progress;
    intervalMs = Math.max(1, Math.round(interval));
  }

  const nextToggleAtMs = fromElapsedMs + intervalMs;
  return nextToggleAtMs >= durationMs ? durationMs : nextToggleAtMs;
}

/** Samples the recovery cadence from simulation time, including authoritative online snapshots. */
export function sampleBlinkCadence(elapsedMs: number, durationMs: number,
  intervals: { blinkStartIntervalMs: number; blinkEndIntervalMs: number }): { visible: boolean; nextToggleAtMs: number } {
  if (elapsedMs >= durationMs) return { visible: true, nextToggleAtMs: 0 };
  let visible = true;
  let nextToggleAtMs = resolveNextBlinkToggleAt(0, durationMs, intervals);
  while (nextToggleAtMs > 0 && elapsedMs >= nextToggleAtMs) {
    visible = !visible;
    nextToggleAtMs = resolveNextBlinkToggleAt(nextToggleAtMs, durationMs, intervals);
  }
  return { visible, nextToggleAtMs };
}
