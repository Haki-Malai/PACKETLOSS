import { EMPTY_DEBUG, type DebugSnapshot } from '../shared/events/DebugSnapshot';

/**
 * Keeps frame diagnostics local to their React subscriber.
 *
 * @returns A store with stable snapshots and subscriptions for useSyncExternalStore.
 */
export function createDebugStore() {
    let snapshot = EMPTY_DEBUG;
    const listeners = new Set<() => void>();
    return {
        /** Returns the same snapshot reference until diagnostic values change. */
        getSnapshot: () => snapshot,
        /**
         * Registers a listener for diagnostic changes.
         *
         * @returns A cleanup function that removes this listener.
         */
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        /** Replaces the snapshot and notifies subscribers only when a displayed value changes. */
        publish: (next: DebugSnapshot) => {
            if (
                snapshot.enabled === next.enabled &&
                snapshot.collisionText === next.collisionText &&
                snapshot.runtimeText === next.runtimeText
            )
                return;
            snapshot = next;
            listeners.forEach((listener) => listener());
        },
    };
}

export type DebugStore = ReturnType<typeof createDebugStore>;
