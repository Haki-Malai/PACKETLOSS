import { afterEach, describe, expect, it, vi } from 'vitest';
import { InputManager } from '../engine/input';

function keyEvent(type: string, code: string, repeat = false): KeyboardEvent {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, { code: { value: code }, repeat: { value: repeat } });
  return event as KeyboardEvent;
}

describe('InputManager menu boundaries', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('clears held input on reset and waits for a fresh press instead of accepting stale repeats', () => {
    const browser = new EventTarget();
    vi.stubGlobal('window', browser);
    const input = new InputManager(new EventTarget() as HTMLElement);
    const onReset = vi.fn();
    input.onReset(onReset);
    browser.dispatchEvent(keyEvent('keydown', 'ArrowUp'));
    expect(input.isKeyDown('ArrowUp')).toBe(true);
    input.reset();
    browser.dispatchEvent(keyEvent('keydown', 'ArrowUp', true));
    expect(input.isKeyDown('ArrowUp')).toBe(false);
    expect(onReset).toHaveBeenCalledOnce();
    browser.dispatchEvent(keyEvent('keyup', 'ArrowUp'));
    browser.dispatchEvent(keyEvent('keydown', 'ArrowUp'));
    expect(input.isKeyDown('ArrowUp')).toBe(true);
    browser.dispatchEvent(new Event('blur'));
    expect(input.isKeyDown('ArrowUp')).toBe(false);
    input.destroy();
  });

  it('does not capture keys already consumed by a menu or typed into an interactive target', () => {
    const browser = new EventTarget();
    vi.stubGlobal('window', browser);
    const input = new InputManager(new EventTarget() as HTMLElement);
    const listener = vi.fn();
    input.onKeyDown(listener);
    const consumed = keyEvent('keydown', 'Space');
    consumed.preventDefault();
    browser.dispatchEvent(consumed);
    const typing = keyEvent('keydown', 'KeyW');
    Object.defineProperty(typing, 'target', { value: { closest: () => ({}) } });
    browser.dispatchEvent(typing);
    expect(input.isKeyDown('Space')).toBe(false);
    expect(input.isKeyDown('KeyW')).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    input.destroy();
  });
});
