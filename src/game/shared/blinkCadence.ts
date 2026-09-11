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
