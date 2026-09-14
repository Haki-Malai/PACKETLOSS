import type { TilePosition } from '../domain/valueObjects/TilePosition';

export type TutorialLessonId = 'movement' | 'firewall' | 'portal' | 'power' | 'virus' | 'ping' | 'spam' | 'lag' | 'suppression';
export type TutorialPhase = 'introduction' | 'playing' | 'explanation' | 'success' | 'retry';

export interface TutorialSnapshot {
  readonly lesson: TutorialLessonId;
  readonly phase: TutorialPhase;
  readonly objective: string;
  readonly message: string;
  readonly marker: Readonly<TilePosition> | null;
}

export const TUTORIAL_LESSONS = [
  {
    id: 'movement', title: 'Move and turn',
    introduction: 'Use the arrow keys, WASD, or a swipe. Head right, then queue Up before the far corner. Your turn waits until the corridor allows it.',
    objective: 'Move right, turn up at the far corner, and collect the marked data bit.',
  },
  {
    id: 'firewall', title: 'Meet Firewall',
    introduction: 'Firewall repeats a fixed patrol instead of chasing you. Every enemy body is dangerous unless it is scared. Contact here lets you retry this lesson.',
    objective: 'Move right to the data bit while Firewall follows its patrol.',
  },
  {
    id: 'portal', title: 'Use a portal',
    introduction: 'Portals link distant corridors. Keep moving out through the opening to emerge at its partner. Afterward, your blinking Packet is briefly protected.',
    objective: 'Move left through the portal at the end of this corridor.',
  },
  {
    id: 'power', title: 'Turn the chase around',
    introduction: 'The large star is a power core. Collect it before touching Firewall, then catch the scared enemy while your power lasts.',
    objective: 'Move right to collect the power core, then catch Firewall.',
  },
  {
    id: 'virus', title: 'Evade Virus',
    introduction: 'Virus follows the shortest route to your current position, including portal shortcuts. Keep moving to stay ahead.',
    objective: 'Move left to the data bit while Virus follows you.',
  },
  {
    id: 'ping', title: 'Escape a scan',
    introduction: 'Ping scans every three seconds, detecting you through walls within eight tiles. Wait for the green scan to see the position it remembers.',
    objective: 'Wait for Ping to mark your position.',
  },
  {
    id: 'spam', title: 'Watch Spam split',
    introduction: 'Spam tries to make a smaller copy every four seconds. Copies can also split, up to four Spam bodies. Wait for its first copy.',
    objective: 'Watch Spam create a copy.',
  },
  {
    id: 'lag', title: 'Cross a slowdown zone',
    introduction: 'Lag moves slowly and leaves yellow zones behind. Its body is dangerous, but its zones only slow you down. Watch it leave a zone.',
    objective: 'Watch Lag leave a yellow zone.',
  },
  {
    id: 'suppression', title: 'Switch off their abilities',
    introduction: 'A yellow zone is already active in this checkpoint. Power cores clear existing zones and stop Ping scans, Spam copies, and new Lag zones while those enemies are scared.',
    objective: 'Move right to the power core to clear the zone and suppress all three abilities.',
  },
] as const satisfies readonly {
  id: TutorialLessonId;
  title: string;
  introduction: string;
  objective: string;
}[];

export function getTutorialLesson(id: TutorialLessonId): (typeof TUTORIAL_LESSONS)[number] {
  return TUTORIAL_LESSONS.find((lesson) => lesson.id === id)!;
}
