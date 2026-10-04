import { COARSE_POINTER_MEDIA_QUERY, MOBILE_SWIPE_AXIS_LOCK_RATIO,
  MOBILE_SWIPE_THRESHOLD_PX, MOBILE_TAP_MAX_DELTA_PX } from '../../../config/constants';
import type { Direction } from '../../domain/valueObjects/Direction';
import type { PointerState } from './BrowserInputAdapter';

const KEY_PRIORITY: ReadonlyArray<{ codes: readonly string[]; direction: Direction }> = [
  { codes: ['ArrowLeft', 'KeyA'], direction: 'left' },
  { codes: ['ArrowRight', 'KeyD'], direction: 'right' },
  { codes: ['ArrowUp', 'KeyW'], direction: 'up' },
  { codes: ['ArrowDown', 'KeyS'], direction: 'down' },
];

/** Owns the identical held-key priority and one-swipe-per-gesture policy in solo and online play. */
export class DirectionalInput {
  private gesture: { pointerId: number; x: number; y: number; committed: boolean } | null = null;

  /** Reads held keys from the platform adapter without owning its listeners. */
  constructor(private readonly isKeyDown: (_code: string) => boolean) {}

  /** Returns the highest-priority held direction, or null while no movement key is held. */
  keyboardDirection(): Direction | null {
    return KEY_PRIORITY.find((intent) => intent.codes.some(this.isKeyDown))?.direction ?? null;
  }

  /** Starts a touch/coarse-pointer gesture; returns false for a desktop mouse action. */
  start(pointer: PointerState): boolean {
    const touchLike = pointer.pointerType === 'touch'
      || pointer.isPrimary && typeof window !== 'undefined'
        && window.matchMedia?.(COARSE_POINTER_MEDIA_QUERY).matches;
    if (!touchLike) return false;
    this.gesture = { pointerId: pointer.pointerId, x: pointer.x, y: pointer.y, committed: false };
    return true;
  }

  /** Commits an axis-locked swipe during movement, unless keyboard input currently takes priority. */
  move(pointer: PointerState): Direction | null {
    const gesture = this.gesture;
    if (!gesture || gesture.pointerId !== pointer.pointerId || gesture.committed || this.keyboardDirection()) return null;
    const dx = pointer.x - gesture.x, dy = pointer.y - gesture.y;
    const dominant = Math.max(Math.abs(dx), Math.abs(dy)), minor = Math.min(Math.abs(dx), Math.abs(dy));
    if (dominant < MOBILE_SWIPE_THRESHOLD_PX || minor > 0 && dominant / minor < MOBILE_SWIPE_AXIS_LOCK_RATIO) return null;
    gesture.committed = true;
    return Math.abs(dx) >= Math.abs(dy) ? dx >= 0 ? 'right' : 'left' : dy >= 0 ? 'down' : 'up';
  }

  /** Ends the matching gesture and reports a tap for modes that support pausing. */
  end(pointer: PointerState): boolean {
    const gesture = this.gesture;
    if (!gesture || gesture.pointerId !== pointer.pointerId) return false;
    this.gesture = null;
    return !gesture.committed
      && Math.max(Math.abs(pointer.x - gesture.x), Math.abs(pointer.y - gesture.y)) <= MOBILE_TAP_MAX_DELTA_PX;
  }

  /** Cancels only the pointer owning the active gesture. */
  cancel(pointerId: number): void {
    if (this.gesture?.pointerId === pointerId) this.reset();
  }

  /** Clears pending gestures across focus, menu, and session transitions. */
  reset(): void { this.gesture = null; }
}
