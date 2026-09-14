import { Component, StrictMode, Suspense, lazy, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GameShell } from './game/ui/GameShell';
import { MenuPanel, buttonLayout } from './game/ui/MenuPanel';
import { resolveMapVariantFromEnv } from './game/app/mapRuntimeConfig';
import { IS_DEV } from './config/environment';
import { useEnvironment } from './config/EnvironmentContext';

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
                        <GameShell
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

function StartupMessage({ children, error = false }: { children: ReactNode; error?: boolean }) {
    return (
        <div
            className="game-shell flex h-full items-center justify-center p-6"
            data-menu-motion="system"
        >
            <MenuPanel
                eyebrow={error ? 'Signal interrupted' : 'Connecting'}
                title={error ? 'Unable to start' : 'Asset Lab'}
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
