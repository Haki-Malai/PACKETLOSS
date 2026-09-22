import { Component, StrictMode, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GameShell } from './game/ui/GameShell';
import { MenuButton, MenuPanel, buttonLayout } from './game/ui/MenuPanel';
import { resolveMapVariantFromEnv } from './game/app/mapRuntimeConfig';
import { IS_DEV } from './config/environment';
import { useEnvironment } from './config/EnvironmentContext';
import type { PreloadedGameResources } from './game/app/preloadGameResources';
import type { MapVariant } from './game/app/mapRuntimeConfig';
import { preloadMenuPreviews } from './game/ui/MenuPreviews';

const AssetShowcase = IS_DEV ? lazy(() => import('./dev/assets/AssetShowcase')) : null;

export function App() {
    const { isDev } = useEnvironment();
    const assetPath = IS_DEV
        ? new URL('dev/assets', new URL(import.meta.env.BASE_URL, `${window.location.origin}/`))
              .pathname
        : '';
    const gallery =
        IS_DEV && isDev && [assetPath, `${assetPath}/`].includes(window.location.pathname);
    return (
        <StrictMode>
            <StartupBoundary>
                {gallery && AssetShowcase ? (
                    <Suspense fallback={<StartupMessage>Loading asset previews…</StartupMessage>}>
                        <AssetShowcase />
                    </Suspense>
                ) : (
                    <>
                        <GameBootstrap
                            mapVariant={resolveMapVariantFromEnv(import.meta.env.VITE_GAME_ENV)}
                        />
                        {IS_DEV &&
                            isDev &&
                            createPortal(
                                <a
                                    href={assetPath}
                                    className={`packet-button packet-dev-link px-4 py-3 ${buttonLayout}`}
                                >
                                    Assets
                                </a>,
                                document.body
                            )}
                    </>
                )}
            </StartupBoundary>
        </StrictMode>
    );
}

function GameBootstrap({ mapVariant }: { mapVariant: MapVariant }) {
    const [attempt, setAttempt] = useState(0);
    const [resources, setResources] = useState<PreloadedGameResources | null>(null);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
        const abort = new AbortController();
        let loaded: PreloadedGameResources | null = null;
        let active = true;
        setResources(null);
        setError(null);
        /** Prepares network assets and lazy runtime/menu modules before revealing the title. */
        async function initialize() {
            const [resourceResult, previewResult, runtimeResult] = await Promise.allSettled([
                import('./game/app/preloadGameResources').then(({ preloadGameResources }) =>
                    preloadGameResources(abort.signal)
                ),
                preloadMenuPreviews(),
                import('./game/app/createPacketGame'),
            ]);
            if (resourceResult.status === 'fulfilled') loaded = resourceResult.value;
            const failure = [resourceResult, previewResult, runtimeResult].find(
                (result) => result.status === 'rejected'
            );
            try {
                if (failure?.status === 'rejected') throw failure.reason;
                if (!active) {
                    loaded?.dispose();
                    return;
                }
                if (!loaded) throw new Error('The game assets could not load.');
                setResources(loaded);
            } catch (reason) {
                if (!active || abort.signal.aborted) {
                    loaded?.dispose();
                    loaded = null;
                    return;
                }
                loaded?.dispose();
                loaded = null;
                setError(
                    reason instanceof Error
                        ? reason
                        : new Error('The game could not load. Please try again.')
                );
            }
        }
        void initialize();
        return () => {
            active = false;
            abort.abort();
            loaded?.dispose();
        };
    }, [attempt]);

    if (error)
        return (
            <StartupMessage
                error
                title="Unable to load"
                action={
                    <MenuButton
                        action="retry"
                        variant="primary"
                        onClick={() => setAttempt((value) => value + 1)}
                    >
                        Retry
                    </MenuButton>
                }
            >
                {error.message}
            </StartupMessage>
        );
    if (!resources)
        return (
            <StartupMessage title="PACKETLOSS">Loading the maze and game assets…</StartupMessage>
        );
    return <GameShell mapVariant={mapVariant} preloadedResources={resources} />;
}

function StartupMessage({
    children,
    error = false,
    title = 'Asset Lab',
    action,
}: {
    children: ReactNode;
    error?: boolean;
    title?: string;
    action?: ReactNode;
}) {
    return (
        <div
            className="game-shell flex h-full items-center justify-center p-6"
            data-menu-motion="system"
        >
            <MenuPanel
                title={error && title === 'Asset Lab' ? 'Unable to start' : title}
                actions={action}
            >
                <p className="packet-copy" role={error ? 'alert' : 'status'}>
                    {children}
                </p>
            </MenuPanel>
        </div>
    );
}

class StartupBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null as Error | null };
    /** Converts a caught render or lazy-load failure into displayable error state. */
    static getDerivedStateFromError(error: unknown) {
        return {
            error:
                error instanceof Error
                    ? error
                    : new Error('The game could not start. Please reload and try again.'),
        };
    }
    render() {
        return this.state.error ? (
            <StartupMessage error>{this.state.error.message}</StartupMessage>
        ) : (
            this.props.children
        );
    }
}
