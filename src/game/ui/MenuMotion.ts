import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';

/** Shared motion/visibility policy for menu previews, independent of gameplay time. */
export function observeMenuMotion(
    motion: MenuMotion,
    onChange: (active: boolean) => void
): () => void {
    const preference =
        motion === 'system' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : undefined;
    const synchronize = (): void => {
        onChange(motion !== 'reduced' && !preference?.matches && !document.hidden);
    };
    document.addEventListener('visibilitychange', synchronize);
    preference?.addEventListener('change', synchronize);
    synchronize();
    return () => {
        document.removeEventListener('visibilitychange', synchronize);
        preference?.removeEventListener('change', synchronize);
    };
}
