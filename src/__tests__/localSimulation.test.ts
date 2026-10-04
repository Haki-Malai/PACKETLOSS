import { describe, expect, it } from 'vitest';
import { LocalSimulation } from '../game/simulation/LocalSimulation';

describe('browser-independent local simulation scheduling', () => {
  it('preserves phase order, bounded slices, active-time accounting, and per-session disposal', () => {
    const order: string[] = [];
    let active = true;
    const simulation = new LocalSimulation({ active: () => active,
      before: [{ update: () => { order.push('before'); } }], after: [{ update: () => { order.push('after'); } }],
      systems: [{ getSimulationBoundaryMs: (maximum) => Math.min(10, maximum), update: (elapsed) => { order.push(`move:${elapsed}`); } }],
      beforeStep: () => { order.push('tick'); }, advanceTimers: () => { order.push('timer'); }, afterStep: () => { order.push('progress'); } });
    simulation.recordTime(100); simulation.advance(20, 20);
    expect(order).toEqual(['before', 'tick', 'timer', 'move:10', 'progress', 'tick', 'timer', 'move:10', 'progress', 'after']);
    active = false; simulation.recordTime(1000); simulation.advance(20, 20);
    expect(simulation.activeTimeMs).toBe(100);
    active = true; simulation.destroy(); simulation.recordTime(500); simulation.advance(20, 20);
    expect(order).toHaveLength(10); expect(simulation.activeTimeMs).toBe(100);
  });
});
