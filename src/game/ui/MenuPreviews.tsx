import { useEffect, useRef, useState } from 'react';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';

// Concurrent effect setups share imports, while each setup owns its preview resources.
let titleModule: Promise<typeof import('./TitleWordmark')> | undefined;
let portraitModule: Promise<typeof import('./EnemyPortraits')> | undefined;

/** Primes both optional Three.js menu views before the title screen is revealed. */
export async function preloadMenuPreviews(): Promise<void> {
    await Promise.allSettled([
        (titleModule ??= import('./TitleWordmark')),
        (portraitModule ??= import('./EnemyPortraits')),
    ]);
}

export function TitleHeading({ id, motion }: { id: string; motion: MenuMotion }) {
    const host = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const node = host.current;
        if (!node) return;
        let active = true;
        let dispose: (() => void) | undefined;
        /** Restores the text heading when the optional WebGL wordmark becomes unavailable. */
        const unavailable = () => setReady(false);
        node.addEventListener('packet-wordmark-unavailable', unavailable);
        /** Loads the optional wordmark, mounting it only while this effect still owns the host. */
        async function initialize() {
            try {
                const { mountTitleWordmark } = await (titleModule ??= import('./TitleWordmark'));
                if (!active) return;
                dispose = mountTitleWordmark(node!, motion);
                setReady(true);
            } catch {
                // Keep the real text heading usable if the optional WebGL title cannot load.
                if (active) setReady(false);
            }
        }
        void initialize();
        return () => {
            active = false;
            node.removeEventListener('packet-wordmark-unavailable', unavailable);
            dispose?.();
        };
    }, [motion]);
    return (
        <div ref={host} className="packet-wordmark" data-ready={ready ? 'true' : undefined}>
            <h1 id={id} className="packet-heading">
                PACKETLOSS
            </h1>
        </div>
    );
}

const enemies = [
    ['Firewall', 'Patrols a fixed route. Watch its loop before crossing its path.'],
    ['Virus', 'Chases you along the shortest route, including portal shortcuts.'],
    [
        'Ping',
        'Scans nearby every three seconds, even through walls, then chases your last detected position.',
    ],
    ['Spam', 'Splits into smaller copies every four seconds, up to four Spam at once.'],
    ['Lag', 'Moves slowly and leaves temporary zones that cut your movement speed in half.'],
] as const;

export function EnemyGuide({ motion }: { motion: MenuMotion }) {
    const host = useRef<HTMLElement>(null);
    useEffect(() => {
        const node = host.current;
        if (!node) return;
        let active = true;
        let dispose: (() => void) | undefined;
        /** Loads portraits for this effect, retaining static fallbacks on failure or cancellation. */
        async function initialize() {
            try {
                const { mountEnemyPortraits } = await (portraitModule ??=
                    import('./EnemyPortraits'));
                if (active) dispose = mountEnemyPortraits(node!, motion);
            } catch {
                // The existing portraits keep the guide readable if previews cannot load.
            }
        }
        void initialize();
        return () => {
            active = false;
            dispose?.();
        };
    }, [motion]);
    return (
        <section ref={host} aria-labelledby="packet-enemies-heading">
            <h2 className="packet-record-heading mt-0" id="packet-enemies-heading">
                Enemies
            </h2>
            <ul className="m-0 list-none p-0">
                {enemies.map(([name, description]) => (
                    <li
                        key={name}
                        className="packet-enemy grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 border-b border-packet-line py-4"
                    >
                        <span
                            className="packet-enemy-portrait pointer-events-none relative block size-20"
                            data-enemy={name.toLowerCase()}
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}assets/images/enemies/${name.toLowerCase()}.png`}
                                alt={`${name} enemy`}
                                width={256}
                                height={256}
                                loading="lazy"
                                decoding="async"
                            />
                        </span>
                        <div>
                            <h3 className="packet-enemy-name">{name}</h3>
                            <p className="packet-copy">{description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
