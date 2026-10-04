export type SimulationMode = 'classic' | 'endless' | 'tutorial' | 'data-race';
export type RunMode = Extract<SimulationMode, 'classic' | 'endless'>;
export interface ModeRules {
  allowsPause: boolean;
  power: 'shared-enemy-scared' | 'personal-hunting';
  lives: number | null;
  pickupCompletion: 'checkpoint' | 'none' | 'refill';
  scoring: 'level-and-bonus' | 'bonus' | 'base';
  speed: 'level' | 'score' | 'constant';
  durationMs: number | null;
}
export const MODE_RULES: Readonly<Record<SimulationMode, Readonly<ModeRules>>> = {
  classic: { allowsPause: true, power: 'shared-enemy-scared', lives: 3, pickupCompletion: 'checkpoint',
    scoring: 'level-and-bonus', speed: 'level', durationMs: null },
  endless: { allowsPause: true, power: 'shared-enemy-scared', lives: 3, pickupCompletion: 'none',
    scoring: 'bonus', speed: 'score', durationMs: null },
  tutorial: { allowsPause: true, power: 'shared-enemy-scared', lives: 3, pickupCompletion: 'none',
    scoring: 'base', speed: 'constant', durationMs: null },
  'data-race': { allowsPause: false, power: 'personal-hunting', lives: null, pickupCompletion: 'refill',
    scoring: 'base', speed: 'constant', durationMs: 180000 },
};
