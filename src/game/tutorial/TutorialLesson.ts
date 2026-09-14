import type { TilePosition } from '../domain/valueObjects/TilePosition';

export type TutorialLessonId = 'movement' | 'firewall' | 'power' | 'virus' | 'ping' | 'spam' | 'lag';
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
    introduction: 'Firewall starts at the top-left and stays on its short patrol instead of chasing you. Every enemy body is dangerous unless it is scared. Contact here lets you retry this lesson.',
    objective: 'Find a route to the marked data bit while Firewall follows its patrol.',
  },
  {
    id: 'virus', title: 'Meet Virus',
    introduction: 'Virus follows the shortest route to your current position, including portal shortcuts. Keep moving to stay ahead.',
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
    id: 'power', title: 'Turn the chase around',
    introduction: 'Firewall starts on the same top-left patrol. Steer to the nearby large power core before entering its route, then catch the scared enemy while power lasts. Power cores also clear existing Lag zones and stop Ping scans, Spam copies, and new Lag zones while those enemies are scared.',
    objective: 'Move around the wall to collect the power core, then enter Firewall’s patrol.',
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
