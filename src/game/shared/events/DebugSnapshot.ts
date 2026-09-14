export interface DebugSnapshot {
    readonly enabled: boolean;
    readonly collisionText: string;
    readonly runtimeText: string;
}

export const EMPTY_DEBUG: DebugSnapshot = { enabled: false, collisionText: '', runtimeText: '' };
