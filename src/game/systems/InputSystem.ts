import {
  COARSE_POINTER_MEDIA_QUERY,
  MOBILE_SWIPE_AXIS_LOCK_RATIO,
  MOBILE_SWIPE_THRESHOLD_PX,
  MOBILE_TAP_MAX_DELTA_PX,
} from '../../config/constants';
import { IS_DEV } from '../../config/environment';
import type { Direction } from '../domain/valueObjects/Direction';
import { WorldState } from '../domain/world/WorldState';
import { BrowserInputAdapter, isInteractiveInputTarget, PointerState } from '../infrastructure/adapters/BrowserInputAdapter';
import { handleDebugKeyDown } from './DebugInput';

interface PauseController {
  togglePause(): void;
}

interface TouchGesture {
  pointerId: number;
  startX: number;
  startY: number;
  hasCommittedSwipe: boolean;
}

const DIRECTIONAL_KEY_PRIORITY: ReadonlyArray<{ codes: readonly string[]; direction: Direction }> = [
  { codes: ['ArrowLeft', 'KeyA'], direction: 'left' },
  { codes: ['ArrowRight', 'KeyD'], direction: 'right' },
  { codes: ['ArrowUp', 'KeyW'], direction: 'up' },
  { codes: ['ArrowDown', 'KeyS'], direction: 'down' },
];
const BROWSER_SCROLL_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
const PAUSE_EVENT_KEYS = new Set([' ', 'Spacebar']);

export class InputSystem {
  private disposers: Array<() => void> = [];
  private activeTouchGesture: TouchGesture | null = null;

  constructor(
    private readonly input: BrowserInputAdapter,
    private readonly world: WorldState,
    private readonly pauseController: PauseController,
    private readonly allowPowerShortcut = true,
  ) {}

  start(): void {
    this.disposers.push(this.input.onKeyDown((event) => this.handleKeyDown(event)));
    this.disposers.push(this.input.onPointerMove((pointer) => this.handlePointerMove(pointer)));
    this.disposers.push(this.input.onPointerDown((pointer) => this.handlePointerDown(pointer)));
    this.disposers.push(this.input.onPointerUp((pointer) => this.handlePointerUp(pointer)));
    this.disposers.push(this.input.onPointerCancel((pointer) => this.handlePointerCancel(pointer)));
    this.disposers.push(this.input.onReset(() => { this.activeTouchGesture = null; }));
  }

  update(): void {
    if (!this.world.isMoving || this.world.outcome) return;
    const keyboardDirection = this.getDirectionalKeyboardIntent();
    if (keyboardDirection) {
      this.world.packet.direction.next = keyboardDirection;
    }
  }

  destroy(): void {
    this.disposers.forEach((dispose) => {
      dispose();
    });
    this.disposers = [];
    this.activeTouchGesture = null;
  }

  /** Routes active gameplay keys, with inspection and cheat shortcuts available only in development. */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.repeat || event.defaultPrevented || isInteractiveInputTarget(event.target)
      || !this.world.isMoving || this.world.outcome) {
      return;
    }

    if (this.isPauseToggleEvent(event)) {
      event.preventDefault();
      this.pauseController.togglePause();
      return;
    }

    if (IS_DEV) handleDebugKeyDown(this.world, event, this.allowPowerShortcut);

    if (BROWSER_SCROLL_KEYS.has(event.code)) {
      event.preventDefault();
    }
  }

  private isPauseToggleEvent(event: Pick<KeyboardEvent, 'code' | 'key'>): boolean {
    return event.code === 'Escape' || event.code === 'Space' || PAUSE_EVENT_KEYS.has(event.key);
  }

  /** Tracks swipe intent and, in development, the pointer position used by collision inspection. */
  private handlePointerMove(pointer: PointerState): void {
    if (!this.world.isMoving || this.world.outcome) return;
    if (IS_DEV) this.world.pointerScreen = { x: pointer.x, y: pointer.y };

    const gesture = this.getActiveGesture(pointer.pointerId);
    if (!gesture || gesture.hasCommittedSwipe || this.hasDirectionalKeyboardInput()) {
      return;
    }

    const swipeDirection = this.resolveSwipeDirection(gesture, pointer);
    if (!swipeDirection) {
      return;
    }

    this.world.packet.direction.next = swipeDirection;
    gesture.hasCommittedSwipe = true;
  }

  /** Starts touch gestures or pauses mouse play, recording inspection coordinates in development. */
  private handlePointerDown(pointer: PointerState): void {
    if (!this.world.isMoving || this.world.outcome) return;
    if (IS_DEV) this.world.pointerScreen = { x: pointer.x, y: pointer.y };

    if (!this.isTouchLikePointer(pointer)) {
      this.pauseController.togglePause();
      return;
    }

    this.activeTouchGesture = {
      pointerId: pointer.pointerId,
      startX: pointer.x,
      startY: pointer.y,
      hasCommittedSwipe: false,
    };
  }

  private handlePointerUp(pointer: PointerState): void {
    if (!this.world.isMoving || this.world.outcome) {
      this.activeTouchGesture = null;
      return;
    }
    const gesture = this.getActiveGesture(pointer.pointerId);
    if (!gesture) {
      return;
    }

    if (this.isTapGesture(gesture, pointer)) {
      this.pauseController.togglePause();
    }

    this.activeTouchGesture = null;
  }

  private handlePointerCancel(pointer: PointerState): void {
    if (this.activeTouchGesture?.pointerId === pointer.pointerId) {
      this.activeTouchGesture = null;
    }
  }

  private getActiveGesture(pointerId: number): TouchGesture | null {
    if (!this.activeTouchGesture || this.activeTouchGesture.pointerId !== pointerId) {
      return null;
    }

    return this.activeTouchGesture;
  }

  private isTapGesture(gesture: TouchGesture, pointer: PointerState): boolean {
    if (gesture.hasCommittedSwipe) {
      return false;
    }

    const { absX, absY } = this.getGestureMagnitude(gesture, pointer);
    return Math.max(absX, absY) <= MOBILE_TAP_MAX_DELTA_PX;
  }

  private resolveSwipeDirection(gesture: TouchGesture, pointer: PointerState): Direction | null {
    const { dx, dy, absX, absY } = this.getGestureMagnitude(gesture, pointer);
    const dominant = Math.max(absX, absY);

    if (dominant < MOBILE_SWIPE_THRESHOLD_PX) {
      return null;
    }

    const minor = Math.min(absX, absY);
    if (minor > 0 && dominant / minor < MOBILE_SWIPE_AXIS_LOCK_RATIO) {
      return null;
    }

    if (absX >= absY) {
      return dx >= 0 ? 'right' : 'left';
    }

    return dy >= 0 ? 'down' : 'up';
  }

  private getGestureMagnitude(
    gesture: Pick<TouchGesture, 'startX' | 'startY'>,
    pointer: Pick<PointerState, 'x' | 'y'>,
  ): { dx: number; dy: number; absX: number; absY: number } {
    const dx = pointer.x - gesture.startX;
    const dy = pointer.y - gesture.startY;

    return {
      dx,
      dy,
      absX: Math.abs(dx),
      absY: Math.abs(dy),
    };
  }

  private hasDirectionalKeyboardInput(): boolean {
    return this.getDirectionalKeyboardIntent() !== null;
  }

  private getDirectionalKeyboardIntent(): Direction | null {
    for (const intent of DIRECTIONAL_KEY_PRIORITY) {
      if (intent.codes.some((code) => this.input.isKeyDown(code))) {
        return intent.direction;
      }
    }

    return null;
  }

  private isTouchLikePointer(pointer: PointerState): boolean {
    if (pointer.pointerType === 'touch') {
      return true;
    }

    if (!pointer.isPrimary) {
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    return !!window.matchMedia?.(COARSE_POINTER_MEDIA_QUERY).matches;
  }
}
