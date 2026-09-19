import type { TilePosition } from '../domain/valueObjects/TilePosition';

export type TutorialLessonId = 'movement' | 'firewall' | 'power' | 'virus' | 'ping' | 'spam' | 'lag' | 'quarantine' | 'trojan';
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
    introduction: 'The Packet moves on its own. Use the arrow keys, WASD, or a swipe to steer, then queue Up before the far corner. Your turn waits until the corridor allows it.',
    objective: 'Use turns to recover all four marked data bits around the maze.',
  },
  {
    id: 'firewall', title: 'Meet Firewall',
    introduction: 'Firewall picks a patrol destination, travels there, and repeats a long loop instead of chasing you. Every enemy body is dangerous unless it is scared. Contact here lets you retry this lesson.',
    objective: 'Find a route to the marked data bit while Firewall travels to its patrol.',
  },
  {
    id: 'virus', title: 'Meet Virus',
    introduction: 'Virus follows the shortest physical route to your current position but cannot use portals. Keep moving to stay ahead.',
    objective: 'Reach the marked data bit at the bottom-right while Virus follows you.',
  },
  {
    id: 'ping', title: 'Meet Ping',
    introduction: 'Ping scans every three seconds, detecting you through walls within eight tiles. Keep moving until the green scan shows the position it remembers.',
    objective: 'Keep moving until Ping marks your position.',
  },
  {
    id: 'spam', title: 'Meet Spam',
    introduction: 'Spam tries to make a smaller copy every four seconds. Copies can also split, up to four Spam bodies. Keep moving while it creates its first copy.',
    objective: 'Keep moving and watch Spam create a copy.',
  },
  {
    id: 'lag', title: 'Meet Lag',
    introduction: 'Lag moves slowly and leaves yellow zones behind. Its body is dangerous, but its zones only slow you down. Keep moving while it leaves a zone.',
    objective: 'Keep moving and watch Lag leave a yellow zone.',
  },
  {
    id: 'quarantine', title: 'Meet Quarantine',
    introduction: 'Quarantine grows purple sections from existing maze walls to close passages or trap you. Keep moving until it changes a route.',
    objective: 'Watch Quarantine extend a maze wall.',
  },
  {
    id: 'trojan', title: 'Meet Trojan',
    introduction: 'Trojan walks to an empty spot on a route you already cleared, then changes into a data bit there. Move right to leave a trail and keep your distance while it approaches.',
    objective: 'Watch Trojan hide on an empty part of your route.',
  },
  {
    id: 'power', title: 'Turn the chase around',
    introduction: 'Firewall follows its usual long patrol. Steer to the nearby large power core, then follow the marker and catch the scared enemy while power lasts. Power cores clear Lag zones and Quarantine walls, reveal hidden Trojans, and suppress enemy abilities while fear lasts.',
    objective: 'Move around the wall to collect the power core, then catch Firewall.',
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
