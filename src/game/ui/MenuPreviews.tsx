import { useEffect, useRef, useState } from 'react';
import type { MenuMotion } from '../infrastructure/adapters/LocalProfileStore';
import { MenuColumns } from './MenuPanel';
import { SCORE_BONUS_TIERS } from '../domain/valueObjects/ScoreBonus';

// Concurrent effect setups share imports, while each setup owns its preview resources.
let titleModule: Promise<typeof import('./TitleWordmark')> | undefined;
let portraitModule: Promise<typeof import('./EnemyPortraits')> | undefined;
let bonusModule: Promise<typeof import('./ScoreBonusPreviews')> | undefined;

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
    ['Firewall', 'Moves faster than you to a random patrol area, then repeats a long loop without chasing.'],
    ['Virus', 'Chases you more slowly along the shortest physical route without using portals.'],
    [
        'Ping',
        'Scans nearby every three seconds, even through walls, then chases your last detected position.',
    ],
    ['Spam', 'Splits into smaller copies every four seconds, up to four Spam at once.'],
    ['Lag', 'Moves slowly and leaves up to two 20-second zones that cut your movement speed in half.'],
    ['Quarantine', 'Extends maze walls with purple sections that can trap you. They vanish after seven seconds or when you collect a power core.'],
    ['Trojan', 'Hides as a data bit on cleared routes, away from real points. When it reveals its horse form, escape before it becomes dangerous.'],
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
            <MenuColumns>
                {[enemies.slice(0, 4), enemies.slice(4)].map((group, index) => (
                    <section key={index} aria-label={index === 0 ? 'Firewall through Spam' : 'Lag through Trojan'}>
                        <ul className="m-0 list-none p-0">
                            {group.map(([name, description]) => (
                                <li
                                    key={name}
                                    className="packet-enemy grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 border-b border-packet-line py-1"
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
                ))}
            </MenuColumns>
        </section>
    );
}

export function ScoreBonusGuide() {
    const host = useRef<HTMLElement>(null);
    useEffect(() => {
        const node = host.current;
        if (!node) return;
        let active = true;
        let dispose: (() => void) | undefined;
        /** Mounts optional model previews only while this scoring page owns the host. */
        async function initialize() {
            try {
                const { mountScoreBonusPreviews } = await (bonusModule ??= import('./ScoreBonusPreviews'));
                if (active) dispose = mountScoreBonusPreviews(node!);
            } catch {
                // Text values and fallback badges remain readable without WebGL.
            }
        }
        void initialize();
        return () => {
            active = false;
            dispose?.();
        };
    }, []);

    return (
        <section ref={host} aria-labelledby="packet-bonus-heading">
            <h3 id="packet-bonus-heading" className="packet-record-heading">Timed multipliers</h3>
            <p className="packet-copy">
                One icon appears near the pen after 35% and 70% of the level’s data and cores are recovered.
                Collect it within 45 seconds for a 15-second boost to every score award. The icon changes with each level.
            </p>
            <ul className="mt-3 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-5">
                {SCORE_BONUS_TIERS.map(({ kind, multiplier }) => (
                    <li key={kind} className="flex min-w-0 flex-col items-center border border-packet-line bg-packet-raised px-2 py-2 text-center">
                        <span className="relative flex size-16 items-center justify-center text-packet-cyan" data-bonus={kind}>
                            <span aria-hidden="true">◇</span>
                        </span>
                        <span className="font-heading text-xs text-packet-text capitalize">{kind}</span>
                        <strong className="font-heading text-sm text-packet-gold">×{multiplier}</strong>
                    </li>
                ))}
            </ul>
            <p className="packet-copy mt-3">Each level offers two chances. Missed icons expire; boosts end on death and do not stack.</p>
        </section>
    );
}
