import { InputManager } from '../../../engine/input';
import type { PointerState } from '../../../engine/input';

export type { PointerState };
export { isInteractiveInputTarget } from '../../../engine/input';

export class BrowserInputAdapter {
  private readonly input: InputManager;

  constructor(element: HTMLElement) {
    this.input = new InputManager(element);
  }

  isKeyDown(code: string): boolean {
    return this.input.isKeyDown(code);
  }

  reset(): void {
    this.input.reset();
  }

  onReset(listener: () => void): () => void {
    return this.input.onReset(listener);
  }

  onKeyDown(listener: (_event: KeyboardEvent) => void): () => void {
    return this.input.onKeyDown(listener);
  }

  onPointerMove(listener: (_pointer: PointerState) => void): () => void {
    return this.input.onPointerMove(listener);
  }

  onPointerDown(listener: (_pointer: PointerState) => void): () => void {
    return this.input.onPointerDown(listener);
  }

  onPointerUp(listener: (_pointer: PointerState) => void): () => void {
    return this.input.onPointerUp(listener);
  }

  onPointerCancel(listener: (_pointer: PointerState) => void): () => void {
    return this.input.onPointerCancel(listener);
  }

  destroy(): void {
    this.input.destroy();
  }
}
