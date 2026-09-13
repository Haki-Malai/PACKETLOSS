import { vi } from 'vitest';
import { InputSystem } from '../../game/systems/InputSystem';
import type { PointerState } from '../../game/infrastructure/adapters/BrowserInputAdapter';
import type { WorldState } from '../../game/domain/world/WorldState';
import type { BrowserInputAdapter } from '../../game/infrastructure/adapters/BrowserInputAdapter';

class MockInput {
  private keyDownListeners: Array<(_event: KeyboardEvent) => void> = [];
  private pointerMoveListeners: Array<(_pointer: PointerState) => void> = [];
  private pointerDownListeners: Array<(_pointer: PointerState) => void> = [];
  private pointerUpListeners: Array<(_pointer: PointerState) => void> = [];
  private pointerCancelListeners: Array<(_pointer: PointerState) => void> = [];
  private keys = new Set<string>();
  private resetListeners = new Set<() => void>();

  reset(): void {
    this.keys.clear();
    this.resetListeners.forEach((listener) => listener());
  }

  onReset(listener: () => void): () => void {
    this.resetListeners.add(listener);
    return () => { this.resetListeners.delete(listener); };
  }

  setKeyDown(code: string, down: boolean): void {
    if (down) {
      this.keys.add(code);
    } else {
      this.keys.delete(code);
    }
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  onKeyDown(listener: (_event: KeyboardEvent) => void): () => void {
    this.keyDownListeners.push(listener);
    return () => {
      this.keyDownListeners = this.keyDownListeners.filter((entry) => entry !== listener);
    };
  }

  emitKeyDown(event: KeyboardEvent): void {
    this.keyDownListeners.forEach((listener) => listener(event));
  }

  onPointerMove(listener: (_pointer: PointerState) => void): () => void {
    this.pointerMoveListeners.push(listener);
    return () => {
      this.pointerMoveListeners = this.pointerMoveListeners.filter((entry) => entry !== listener);
    };
  }

  onPointerDown(listener: (_pointer: PointerState) => void): () => void {
    this.pointerDownListeners.push(listener);
    return () => {
      this.pointerDownListeners = this.pointerDownListeners.filter((entry) => entry !== listener);
    };
  }

  onPointerUp(listener: (_pointer: PointerState) => void): () => void {
    this.pointerUpListeners.push(listener);
    return () => {
      this.pointerUpListeners = this.pointerUpListeners.filter((entry) => entry !== listener);
    };
  }

  onPointerCancel(listener: (_pointer: PointerState) => void): () => void {
    this.pointerCancelListeners.push(listener);
    return () => {
      this.pointerCancelListeners = this.pointerCancelListeners.filter((entry) => entry !== listener);
    };
  }

  emitPointerDown(pointer: PointerState): void {
    this.pointerDownListeners.forEach((listener) => listener(pointer));
  }

  emitPointerMove(pointer: PointerState): void {
    this.pointerMoveListeners.forEach((listener) => listener(pointer));
  }

  emitPointerUp(pointer: PointerState): void {
    this.pointerUpListeners.forEach((listener) => listener(pointer));
  }

  emitPointerCancel(pointer: PointerState): void {
    this.pointerCancelListeners.forEach((listener) => listener(pointer));
  }
}

export function pointer(overrides: Partial<PointerState> = {}): PointerState {
  return {
    x: 0,
    y: 0,
    buttons: 1,
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    ...overrides,
  };
}

function createWorld(): WorldState {
  return {
    packet: {
      direction: {
        current: 'left',
        next: 'left',
      },
    },
    ghosts: [],
    lagZones: [],
    enemyEffects: [],
    collisionDebugEnabled: false,
    hoveredDebugTile: null,
    debugPanelText: '',
    pointerScreen: null,
    isMoving: true,
    outcome: null,
  } as unknown as WorldState;
}

export function createHarness(): {
  input: MockInput;
  world: WorldState;
  togglePause: ReturnType<typeof vi.fn>;
  system: InputSystem;
} {
  const input = new MockInput();
  const world = createWorld();
  const togglePause = vi.fn();
  const system = new InputSystem(input as unknown as BrowserInputAdapter, world, { togglePause });
  system.start();

  return { input, world, togglePause, system };
}
