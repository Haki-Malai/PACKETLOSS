import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreatePacketGameOptions } from '../game/app/createPacketGame';
import type { RunResult, RuntimeState } from '../game/app/contracts';
import { LocalProfileStore } from '../game/infrastructure/adapters/LocalProfileStore';
import { GameShell } from '../game/ui/GameShell';
import { mountEnemyPortraits } from '../game/ui/EnemyPortraits';
import { mountTitleWordmark } from '../game/ui/TitleWordmark';
import { FakeDocument, FakeElement } from './helpers/fakeDom';

vi.mock('../game/ui/TitleWordmark', () => ({ mountTitleWordmark: vi.fn() }));
vi.mock('../game/ui/EnemyPortraits', () => ({ mountEnemyPortraits: vi.fn() }));

const shells: GameShell[] = [];

const loss: RunResult = {
  outcome: 'lost', score: 140, lives: 0, elapsedMs: 64_500,
  pointsCollected: 14, totalPoints: 50,
};

function pendingStart() {
  let resolve!: () => void;
  let reject!: (_reason: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

async function flushStart(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function setup(starts: Promise<void>[] = []) {
  const document = new FakeDocument();
  const window = new EventTarget();
  vi.stubGlobal('document', document);
  vi.stubGlobal('window', window);
  let id = 0;
  vi.stubGlobal('crypto', { randomUUID: () => `run-${++id}` });

  const root = document.createElement('main');
  document.body.append(root);
  let saved: string | null = null;
  const storage = {
    getItem: () => saved,
    setItem: vi.fn((_key: string, value: string) => { saved = value; }),
  };
  const store = new LocalProfileStore(storage);
  const makeGame = (options: CreatePacketGameOptions) => ({
    options,
    start: vi.fn(() => starts.shift() ?? Promise.resolve()),
    pause: vi.fn(),
    resume: vi.fn(),
    destroy: vi.fn(),
    emit: (state: RuntimeState) => options.onStateChange?.(state),
  });
  const games: ReturnType<typeof makeGame>[] = [];
  const createGame = vi.fn((options: CreatePacketGameOptions) => {
    const game = makeGame(options);
    games.push(game);
    return game;
  });
  const shell = new GameShell(root as unknown as HTMLElement, { mapVariant: 'demo', store, createGame });
  shells.push(shell);

  function find(selector: string): FakeElement {
    const found = root.querySelector(selector);
    if (!found) throw new Error(`Missing element: ${selector}`);
    return found;
  }
  function action(name: string): FakeElement {
    return find(`[data-action="${name}"]`);
  }
  function key(key: string, target = document.activeElement, shiftKey = false): Event {
    const event = new Event('keydown', { cancelable: true });
    Object.defineProperty(event, 'target', { value: target });
    Object.assign(event, { key, code: key === ' ' ? 'Space' : key, shiftKey, repeat: false });
    window.dispatchEvent(event);
    return event;
  }
  function screen(): string | null {
    return find('[data-screen]').getAttribute('data-screen');
  }
  return { root, document, window, shell, store, storage, games, createGame, find, action, key, screen };
}

beforeEach(() => {
  vi.mocked(mountTitleWordmark).mockReset().mockReturnValue(() => {});
  vi.mocked(mountEnemyPortraits).mockReset().mockReturnValue(() => {});
});

afterEach(async () => {
  for (const shell of shells.splice(0)) shell.destroy();
  await vi.dynamicImportSettled();
  vi.unstubAllGlobals();
});

describe('GameShell', () => {
  it('keeps one ambient layer across menu navigation, settings changes, gameplay and results', async () => {
    const page = setup();
    await vi.dynamicImportSettled();
    const ambient = page.find('.packet-ambient');
    const digits = [...ambient.children];
    const viewport = page.find('.packet-menu-viewport');
    expect(ambient.getAttribute('aria-hidden')).toBe('true');
    expect(viewport.contains(ambient)).toBe(false);

    for (const action of ['help', 'settings', 'profile']) {
      viewport.scrollTop = 200;
      page.action(action).click();
      expect(page.find('.packet-ambient')).toBe(ambient);
      expect(ambient.children).toEqual(digits);
      expect(viewport.scrollTop).toBe(0);
      if (action === 'settings') {
        const motion = page.find('[data-control="motion"]');
        motion.value = 'full';
        motion.dispatchEvent(new Event('change'));
        expect(page.find('.packet-ambient')).toBe(ambient);
        expect(page.root.getAttribute('data-menu-motion')).toBe('full');
      }
      page.action('back').click();
      await vi.dynamicImportSettled();
    }
    page.action('start').click();
    await flushStart();
    expect(page.find('[data-screen]').hidden).toBe(true);
    expect(page.find('.packet-ambient')).toBe(ambient);
    page.games[0].emit({ paused: true, result: null });
    page.action('help').click();
    page.key('Escape');
    page.games[0].emit({ paused: true, result: loss });
    expect(page.find('[data-screen]').hidden).toBe(false);
    expect(page.find('.packet-ambient')).toBe(ambient);
    page.shell.destroy();
    expect(page.root.contains(ambient)).toBe(false);
  });

  it.each(['settings', 'help', 'profile'])('uses the shared header Back control in %s and restores parent focus', async (screen) => {
    const page = setup();
    await vi.dynamicImportSettled();
    page.action(screen).click();
    const back = page.action('back');
    expect(page.find('.packet-panel-header').contains(back)).toBe(true);
    expect(page.find('.packet-panel-actions').contains(back)).toBe(false);
    expect(page.root.querySelectorAll('[data-action="back"]')).toHaveLength(1);
    expect(back.getAttribute('aria-label')).toBe('Back');
    expect(back.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
    expect(page.find('[role="dialog"]').getAttribute('aria-labelledby')).toBe(page.find('h1').id);
    page.key('Tab');
    expect(page.document.activeElement).toBe(back);
    expect(page.key(' ', back).defaultPrevented).toBe(false);
    back.click();
    expect(page.screen()).toBe('title');
    expect(page.document.activeElement).toBe(page.action(screen));
  });

  it.each(['title', 'paused'] as const)('opens animated enemy guidance from %s and releases it on Back', async (parent) => {
    const dispose = vi.fn();
    vi.mocked(mountEnemyPortraits).mockReturnValue(dispose);
    const page = setup();
    page.action('settings').click();
    const motion = page.find('[data-control="motion"]');
    motion.value = 'reduced';
    motion.dispatchEvent(new Event('change'));
    page.action('back').click();
    if (parent === 'paused') {
      page.action('start').click();
      await flushStart();
      page.games[0].emit({ paused: true, result: null });
    }
    page.action('help').click();
    await vi.dynamicImportSettled();
    expect(page.find('h1').textContent).toBe('HOW TO PLAY');
    expect(page.root.querySelectorAll('dt').map((node) => node.textContent)).toEqual(['Move', 'Collect', 'Survive', 'Pause']);
    expect(page.root.querySelectorAll('h3').map((node) => node.textContent)).toEqual(['Firewall', 'Virus', 'Ping', 'Spam', 'Lag']);
    const guide = page.find('.packet-enemies');
    expect(guide.getAttribute('aria-labelledby')).toBe('packet-enemies-heading');
    expect(mountEnemyPortraits).toHaveBeenCalledExactlyOnceWith(guide, 'reduced');
    for (const preview of guide.querySelectorAll('[data-enemy]')) {
      expect(preview.querySelector('img')?.src).toContain(`/enemies/${preview.getAttribute('data-enemy')}.png`);
    }
    if (parent === 'title') expect(page.createGame).not.toHaveBeenCalled();
    else expect(page.games[0].resume).not.toHaveBeenCalled();
    page.key('Escape');
    expect(page.screen()).toBe(parent);
    expect(page.document.activeElement).toBe(page.action('help'));
    expect(dispose).toHaveBeenCalledOnce();
    page.shell.destroy();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('ignores a delayed portrait import after leaving help or destroying the shell', async () => {
    const page = setup();
    await vi.dynamicImportSettled();
    page.action('help').click();
    page.action('back').click();
    await vi.dynamicImportSettled();
    expect(mountEnemyPortraits).not.toHaveBeenCalled();
    page.action('help').click();
    page.shell.destroy();
    await vi.dynamicImportSettled();
    expect(mountEnemyPortraits).not.toHaveBeenCalled();
  });

  it('keeps all enemy descriptions and fallback portraits when previews cannot initialize', async () => {
    vi.mocked(mountEnemyPortraits).mockImplementationOnce(() => { throw new Error('WebGL unavailable'); });
    const page = setup();
    page.action('help').click();
    await vi.dynamicImportSettled();
    expect(page.screen()).toBe('help');
    expect(page.root.querySelectorAll('.packet-enemy-name')).toHaveLength(5);
    expect(page.root.querySelectorAll('img').map((portrait) => portrait.alt)).toEqual(['Firewall enemy', 'Virus enemy', 'Ping enemy', 'Spam enemy', 'Lag enemy']);
    page.action('back').click();
    expect(page.screen()).toBe('title');
    expect(page.createGame).not.toHaveBeenCalled();
  });

  it('mounts the title with the current motion preference and releases it when leaving', async () => {
    const dispose = vi.fn();
    vi.mocked(mountTitleWordmark).mockReturnValue(dispose);
    const page = setup();
    await vi.dynamicImportSettled();
    const host = page.find('.packet-wordmark');
    expect(mountTitleWordmark).toHaveBeenCalledWith(host, 'system');
    expect(host.getAttribute('data-ready')).toBe('true');
    expect(page.find('h1').textContent).toBe('PACKETLOSS');
    expect(page.createGame).not.toHaveBeenCalled();
    page.action('settings').click();
    expect(dispose).toHaveBeenCalledOnce();
    const motion = page.find('[data-control="motion"]');
    motion.value = 'reduced';
    motion.dispatchEvent(new Event('change'));
    page.action('back').click();
    await vi.dynamicImportSettled();
    expect(mountTitleWordmark).toHaveBeenLastCalledWith(page.find('.packet-wordmark'), 'reduced');
    page.shell.destroy();
    expect(dispose).toHaveBeenCalledTimes(2);
  });

  it('does not mount a delayed title import after navigation or shell destruction', async () => {
    const page = setup();
    page.action('settings').click();
    await vi.dynamicImportSettled();
    expect(mountTitleWordmark).not.toHaveBeenCalled();
    page.action('back').click();
    page.shell.destroy();
    await vi.dynamicImportSettled();
    expect(mountTitleWordmark).not.toHaveBeenCalled();
  });

  it('keeps the text title and menu usable when the 3D title fails or loses its context', async () => {
    vi.mocked(mountTitleWordmark).mockImplementationOnce(() => { throw new Error('WebGL unavailable'); });
    const page = setup();
    await vi.dynamicImportSettled();
    expect(page.find('.packet-wordmark').getAttribute('data-ready')).toBeNull();
    expect(page.find('h1').textContent).toBe('PACKETLOSS');
    page.action('settings').click();
    page.action('back').click();
    await vi.dynamicImportSettled();
    const host = page.find('.packet-wordmark');
    expect(host.getAttribute('data-ready')).toBe('true');
    host.dispatchEvent(new Event('packet-wordmark-unavailable'));
    expect(host.getAttribute('data-ready')).toBeNull();
    page.action('start').click();
    await flushStart();
    expect(page.screen()).toBe('playing');
  });

  it('opens the title without creating a runtime and starts exactly once during loading', async () => {
    const pending = pendingStart();
    const page = setup([pending.promise]);
    expect(page.screen()).toBe('title');
    expect(page.find('h1').textContent).toBe('PACKETLOSS');
    expect(page.createGame).not.toHaveBeenCalled();

    const start = page.action('start');
    start.click();
    start.click();
    expect(page.screen()).toBe('loading');
    expect(page.createGame).toHaveBeenCalledOnce();
    expect(page.games[0].start).toHaveBeenCalledOnce();
    expect(page.games[0].options).toMatchObject({ mountId: 'packet-scene', mapVariant: 'demo' });
    expect(typeof page.games[0].options.onStateChange).toBe('function');
    expect(page.find('[role="status"]').textContent).toBe('Preparing your run…');

    pending.resolve();
    await flushStart();
    expect(page.screen()).toBe('playing');
    expect(page.find('[data-screen]').hidden).toBe(true);
  });

  it.each(['resolve', 'reject'] as const)('cancels loading and ignores a late %s or callback after a new run', async (completion) => {
    const pending = pendingStart();
    const page = setup([pending.promise]);
    page.action('start').click();
    const cancelled = page.games[0];
    page.action('main-menu').click();
    expect(cancelled.destroy).toHaveBeenCalledOnce();
    expect(page.screen()).toBe('title');
    page.action('start').click();
    await flushStart();
    expect(page.screen()).toBe('playing');

    if (completion === 'resolve') pending.resolve();
    else pending.reject(new Error('Late loading failure'));
    cancelled.emit({ paused: false, result: loss });
    await flushStart();
    expect(page.screen()).toBe('playing');
    expect(page.games[1].destroy).not.toHaveBeenCalled();
    expect(page.store.getRecentRecords('demo')).toEqual([]);
  });

  it('shows a startup error and retries with a fresh runtime', async () => {
    const pending = pendingStart();
    const page = setup([pending.promise]);
    page.action('start').click();
    pending.reject(new Error('WebGL 2 is required.'));
    await flushStart();
    expect(page.screen()).toBe('error');
    expect(page.find('[role="alert"]').textContent).toBe('WebGL 2 is required.');
    expect(page.games[0].destroy).toHaveBeenCalledOnce();

    page.action('retry').click();
    await flushStart();
    expect(page.screen()).toBe('playing');
    expect(page.createGame).toHaveBeenCalledTimes(2);
  });

  it('keeps submenu navigation paused, restores focus, and resumes only through an explicit action', async () => {
    const page = setup();
    page.action('start').click();
    await flushStart();
    const game = page.games[0];
    game.emit({ paused: true, result: null });
    expect(page.screen()).toBe('paused');
    page.find('[data-screen]').click();
    expect(game.resume).not.toHaveBeenCalled();

    page.action('settings').click();
    expect(page.screen()).toBe('settings');
    expect(game.pause).toHaveBeenCalled();
    expect(page.action('sound').disabled).toBe(true);
    expect(page.root.querySelector('[data-action="fullscreen"]')).toBeNull();
    const motion = page.find('[data-control="motion"]');
    motion.value = 'reduced';
    motion.dispatchEvent(new Event('change'));
    expect(page.store.getMotion()).toBe('reduced');
    expect(page.root.getAttribute('data-menu-motion')).toBe('reduced');
    page.key('Escape');
    expect(page.screen()).toBe('paused');
    expect(page.document.activeElement).toBe(page.action('settings'));
    expect(game.resume).not.toHaveBeenCalled();
    page.action('resume').click();
    expect(game.resume).toHaveBeenCalledOnce();
    expect(page.screen()).toBe('playing');
  });

  it('reflects actual fullscreen state and keeps settings usable when a request is rejected', async () => {
    const page = setup();
    const fullscreen = Object.assign(page.document, {
      fullscreenEnabled: true,
      fullscreenElement: null as FakeElement | null,
      exitFullscreen: vi.fn(() => Promise.resolve()),
    });
    const requestFullscreen = vi.fn(() => Promise.resolve());
    Object.assign(page.root, { requestFullscreen });
    page.action('settings').click();
    expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');
    page.action('fullscreen').click();
    await flushStart();
    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');

    fullscreen.fullscreenElement = page.root;
    fullscreen.dispatchEvent(new Event('fullscreenchange'));
    expect(page.action('fullscreen').textContent).toBe('Exit fullscreen');
    page.action('fullscreen').click();
    await flushStart();
    expect(fullscreen.exitFullscreen).toHaveBeenCalledOnce();
    fullscreen.fullscreenElement = null;
    fullscreen.dispatchEvent(new Event('fullscreenchange'));
    expect(page.action('fullscreen').textContent).toBe('Enter fullscreen');
    expect(page.storage.setItem).not.toHaveBeenCalled();

    requestFullscreen.mockRejectedValueOnce(new Error('Browser denied fullscreen'));
    page.action('fullscreen').click();
    await flushStart();
    expect(page.screen()).toBe('settings');
    expect(page.find('[role="status"]').textContent).toContain('Fullscreen is unavailable');
    page.action('back').click();
    expect(page.screen()).toBe('title');
  });

  it('keeps a completed result in memory and explains when local saving fails', async () => {
    const page = setup();
    page.storage.setItem.mockImplementation(() => { throw new Error('Storage blocked'); });
    page.action('start').click();
    await flushStart();
    page.games[0].emit({ paused: false, result: loss });
    expect(page.screen()).toBe('result');
    expect(page.store.getRecentRecords('demo')).toMatchObject([{ ...loss, id: 'run-1' }]);
    expect(page.find('[role="status"]').textContent).toContain('this visit only');
    const copy = page.root.querySelectorAll('p').map((node) => node.textContent).join('\n');
    expect(copy).toContain('Your result is available for this session.');
    expect(copy).not.toContain('saved on this device');
    page.action('main-menu').click();
    page.action('profile').click();
    expect(page.find('.packet-record-name').textContent).toContain('PLAYER');
  });

  it('requires confirmation before restarting or abandoning an unfinished run', async () => {
    const page = setup();
    page.action('start').click();
    await flushStart();
    const firstGame = page.games[0];
    firstGame.emit({ paused: true, result: null });
    page.action('restart').click();
    expect(page.screen()).toBe('confirm');
    page.action('cancel').click();
    expect(page.screen()).toBe('paused');
    expect(page.document.activeElement).toBe(page.action('restart'));
    expect(firstGame.destroy).not.toHaveBeenCalled();
    page.action('restart').click();
    page.action('confirm').click();
    await flushStart();
    expect(firstGame.destroy).toHaveBeenCalledOnce();
    expect(page.games).toHaveLength(2);
    expect(page.screen()).toBe('playing');

    page.games[1].emit({ paused: true, result: null });
    page.action('main-menu').click();
    expect(page.screen()).toBe('confirm');
    page.action('confirm').click();
    expect(page.screen()).toBe('title');
    expect(page.games[1].destroy).toHaveBeenCalledOnce();
    expect(page.store.getRecentRecords('demo')).toEqual([]);
  });

  it.each(['lost', 'cleared'] as const)('shows %s results and saves the run once with its starting nickname', async (outcome) => {
    const page = setup();
    page.store.setNickname('START NAME');
    page.action('start').click();
    await flushStart();
    page.store.setNickname('LATER NAME');
    const result: RunResult = { ...loss, outcome };
    const game = page.games[0];
    game.emit({ paused: false, result });
    game.emit({ paused: false, result });
    expect(page.screen()).toBe('result');
    expect(page.find('h1').textContent).toBe(outcome === 'lost' ? 'PACKET LOST' : 'MAZE CLEARED');
    expect(page.find('[data-outcome]').getAttribute('data-outcome')).toBe(outcome);
    expect(page.find('dl').querySelectorAll('dd').map((node) => node.textContent)).toEqual(['140', '14 / 50', '1:04']);
    expect(page.store.getRecentRecords('demo')).toMatchObject([{
      ...result, id: 'run-1', nickname: 'START NAME', map: 'demo',
    }]);
    expect(page.storage.setItem).toHaveBeenCalledTimes(3);

    page.key(' ');
    game.emit({ paused: false, result: null });
    expect(page.screen()).toBe('result');
    expect(game.resume).not.toHaveBeenCalled();
    page.action('main-menu').click();
    expect(page.screen()).toBe('title');
    expect(game.destroy).toHaveBeenCalledOnce();
  });

  it('saves profile text through its form and clears records only after confirmation', () => {
    const page = setup();
    page.store.saveRun({ ...loss, id: 'past', nickname: '<b>OLD</b>', map: 'demo', completedAt: '2026-09-13T12:00:00Z' });
    page.action('profile').click();
    const nickname = page.find('[data-control="nickname"]');
    nickname.value = ' <b>ME</b> ';
    const typed = page.key(' ', nickname);
    expect(typed.defaultPrevented).toBe(false);
    const submit = new Event('submit', { cancelable: true });
    page.find('form').dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    expect(page.store.getNickname()).toBe('<b>ME</b>');
    expect(page.find('[data-control="nickname"]').value).toBe('<b>ME</b>');
    expect(page.find('.packet-record-name').textContent).toContain('1. <b>OLD</b>');
    expect(page.root.querySelector('b')).toBeNull();
    expect(page.document.activeElement).toBe(page.find('[data-control="nickname"]'));

    page.action('clear-records').click();
    expect(page.store.getRecentRecords('demo')).toHaveLength(1);
    page.key('Escape');
    expect(page.screen()).toBe('profile');
    page.action('clear-records').click();
    page.action('confirm').click();
    expect(page.store.getRecentRecords('demo')).toEqual([]);
    expect(page.store.getNickname()).toBe('<b>ME</b>');
    page.action('back').click();
    expect(page.screen()).toBe('title');
    expect(page.find('.packet-identity').querySelector('span')?.textContent).toBe('<b>ME</b>');
  });

  it('contains keyboard focus and preserves native button Space before supporting pause shortcuts', async () => {
    const page = setup();
    expect(page.document.activeElement).toBe(page.find('[role="dialog"]'));
    expect(page.key('Tab').defaultPrevented).toBe(true);
    expect(page.document.activeElement).toBe(page.action('start'));
    page.key('Tab', undefined, true);
    expect(page.document.activeElement).toBe(page.action('help'));
    page.key('Tab');
    expect(page.document.activeElement).toBe(page.action('start'));
    page.action('start').click();
    await flushStart();
    const game = page.games[0];
    game.emit({ paused: true, result: null });
    const settings = page.action('settings');
    settings.focus();
    expect(page.key(' ', settings).defaultPrevented).toBe(false);
    expect(game.resume).not.toHaveBeenCalled();
    settings.click();
    expect(page.screen()).toBe('settings');
    page.key('Tab');
    expect(page.document.activeElement).toBe(page.action('back'));
    page.key('Escape');
    page.find('[role="dialog"]').focus();
    expect(page.key(' ').defaultPrevented).toBe(true);
    expect(game.resume).toHaveBeenCalledOnce();
    expect(page.screen()).toBe('playing');
  });

  it('disposes once and ignores startup completion and keyboard events after destruction', async () => {
    const pending = pendingStart();
    const page = setup([pending.promise]);
    page.action('start').click();
    page.shell.destroy();
    page.shell.destroy();
    pending.resolve();
    page.games[0].emit({ paused: false, result: loss });
    await flushStart();
    page.key('Escape');
    expect(page.root.children).toEqual([]);
    expect(page.games[0].destroy).toHaveBeenCalledOnce();
    expect(page.games[0].resume).not.toHaveBeenCalled();
    expect(page.store.getRecentRecords('demo')).toEqual([]);
  });
});
