import { IS_DEV } from '../../config/environment';
import { WorldState } from '../domain/world/WorldState';
import { BrowserInputAdapter, isInteractiveInputTarget, PointerState } from '../infrastructure/adapters/BrowserInputAdapter';
import { handleDebugKeyDown } from './DebugInput';
import { DirectionalInput } from '../infrastructure/adapters/DirectionalInput';

interface PauseController {
  togglePause(): void;
}

const BROWSER_SCROLL_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
const PAUSE_EVENT_KEYS = new Set([' ', 'Spacebar']);

export class InputSystem {
  readonly updatePhase = 'beforeSimulation' as const;
  private disposers: Array<() => void> = [];
  private readonly directions: DirectionalInput;

  /** Receives the platform input and shares direction interpretation with online play. */
  constructor(
    private readonly input: BrowserInputAdapter,
    private readonly world: WorldState,
    private readonly pauseController: PauseController,
    private readonly allowPowerShortcut = true,
  ) {
    this.directions = new DirectionalInput((code) => this.input.isKeyDown(code));
  }

  /** Subscribes to gameplay gestures and resets without owning the platform adapter. */
  start(): void {
    this.disposers.push(this.input.onKeyDown((event) => this.handleKeyDown(event)));
    this.disposers.push(this.input.onPointerMove((pointer) => this.handlePointerMove(pointer)));
    this.disposers.push(this.input.onPointerDown((pointer) => this.handlePointerDown(pointer)));
    this.disposers.push(this.input.onPointerUp((pointer) => this.handlePointerUp(pointer)));
    this.disposers.push(this.input.onPointerCancel((pointer) => this.handlePointerCancel(pointer)));
    this.disposers.push(this.input.onReset(() => this.directions.reset()));
  }

  /** Applies held keyboard intent before the local simulation advances. */
  update(): void {
    if (!this.world.isMoving || this.world.outcome) return;
    const keyboardDirection = this.directions.keyboardDirection();
    if (keyboardDirection) {
      this.world.packet.direction.next = keyboardDirection;
    }
  }

  /** Releases subscriptions and drops any partially completed gesture. */
  destroy(): void {
    this.disposers.forEach((dispose) => {
      dispose();
    });
    this.disposers = [];
    this.directions.reset();
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

    const swipeDirection = this.directions.move(pointer);
    if (!swipeDirection) {
      return;
    }

    this.world.packet.direction.next = swipeDirection;
  }

  /** Starts touch gestures or pauses mouse play, recording inspection coordinates in development. */
  private handlePointerDown(pointer: PointerState): void {
    if (!this.world.isMoving || this.world.outcome) return;
    if (IS_DEV) this.world.pointerScreen = { x: pointer.x, y: pointer.y };

    if (!this.directions.start(pointer)) {
      this.pauseController.togglePause();
    }
  }

  /** Ends a gesture and applies the solo-only tap-to-pause action. */
  private handlePointerUp(pointer: PointerState): void {
    if (!this.world.isMoving || this.world.outcome) {
      this.directions.reset();
      return;
    }
    if (this.directions.end(pointer)) {
      this.pauseController.togglePause();
    }
  }

  /** Drops an interrupted gesture without committing a direction or pausing. */
  private handlePointerCancel(pointer: PointerState): void {
    this.directions.cancel(pointer.pointerId);
  }
}
