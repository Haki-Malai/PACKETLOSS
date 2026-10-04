import { useEffect, useRef, useState } from 'react';
import type {
    GameRegion,
    MultiplayerApi,
    MultiplayerCapabilities,
    MultiplayerStatus,
} from '../infrastructure/adapters/MultiplayerClient';

export type AvailabilityLabel =
    | 'Checking'
    | 'Starting'
    | 'Offline'
    | 'Unavailable'
    | 'Ready';

interface AvailabilityState {
    label: AvailabilityLabel;
    status: MultiplayerStatus | null;
    capabilities: MultiplayerCapabilities;
    message: string;
    busy: boolean;
}

const INITIAL_STATE: AvailabilityState = {
    label: 'Checking',
    status: null,
    capabilities: { canStart: false },
    message: '',
    busy: false,
};

function labelFor(status: MultiplayerStatus): AvailabilityLabel {
    if (status.phase === 'ready' && status.websocketUrl) return 'Ready';
    if (status.phase === 'starting') return 'Starting';
    if (status.phase === 'stopped' || status.phase === 'stopping') return 'Offline';
    return 'Unavailable';
}

/** Polls readiness without ever issuing a server-start request. */
export function useMultiplayerAvailability(
    api: MultiplayerApi | null,
    visible: boolean,
    authenticated: boolean
) {
    const [state, setState] = useState<AvailabilityState>(() =>
        api ? INITIAL_STATE : { ...INITIAL_STATE, label: 'Unavailable' }
    );
    const [pageVisible, setPageVisible] = useState(
        () => typeof document === 'undefined' || !document.hidden
    );
    const [refreshGeneration, setRefreshGeneration] = useState(0);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const updateVisibility = () => setPageVisible(!document.hidden);
        document.addEventListener('visibilitychange', updateVisibility);
        return () => document.removeEventListener('visibilitychange', updateVisibility);
    }, []);

    useEffect(() => {
        if (!api || !visible || !pageVisible) return;
        let cancelled = false;
        let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
        let controller: AbortController | undefined;

        async function refresh(): Promise<void> {
            controller?.abort();
            controller = new AbortController();
            try {
                const status = await api!.getMultiplayerStatus(controller.signal);
                if (cancelled) return;
                let capabilities = { canStart: false };
                if (authenticated) {
                    try {
                        capabilities = await api!.getMultiplayerCapabilities(controller.signal);
                    } catch {
                        // Status remains useful if the optional owner-capability check fails.
                    }
                }
                if (cancelled) return;
                const label = labelFor(status);
                setState((current) => ({
                    ...current,
                    status,
                    capabilities,
                    label,
                    message: '',
                }));
                timer = globalThis.setTimeout(
                    () => void refresh(),
                    label === 'Starting' ? 3_000 : 15_000
                );
            } catch (error) {
                if (cancelled || controller.signal.aborted) return;
                setState((current) => ({
                    ...current,
                    label: 'Unavailable',
                    message: error instanceof Error ? error.message : 'Availability check failed.',
                }));
                timer = globalThis.setTimeout(() => void refresh(), 30_000);
            }
        }

        setState((current) => ({ ...current, label: current.status ? labelFor(current.status) : 'Checking' }));
        void refresh();
        return () => {
            cancelled = true;
            controller?.abort();
            if (timer) globalThis.clearTimeout(timer);
        };
    }, [api, authenticated, pageVisible, refreshGeneration, visible]);

    /** Starts the chosen region only from the separate owner control. */
    async function start(region: GameRegion): Promise<boolean> {
        if (!api || state.busy || !state.capabilities.canStart) return false;
        setState((current) => ({ ...current, busy: true, message: '' }));
        try {
            await api.startMultiplayerServer(region);
            if (mounted.current) {
                setState((current) => ({ ...current, busy: false, label: 'Starting' }));
                setRefreshGeneration((generation) => generation + 1);
            }
            return true;
        } catch (error) {
            if (mounted.current) {
                setState((current) => ({
                    ...current,
                    busy: false,
                    message: error instanceof Error ? error.message : 'The server could not start.',
                }));
            }
            return false;
        }
    }

    return { state, start };
}
