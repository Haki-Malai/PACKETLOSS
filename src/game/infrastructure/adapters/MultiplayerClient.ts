export const GAME_REGIONS = ['eu', 'na'] as const;

export type GameRegion = (typeof GAME_REGIONS)[number];
export type GameServerPhase =
    | 'stopped'
    | 'starting'
    | 'ready'
    | 'failed'
    | 'draining'
    | 'stopping';

export interface RegionalServerStatus {
    region: GameRegion;
    phase: GameServerPhase;
    ready: boolean;
    hostname: string;
    updatedAt: string;
}

export interface MultiplayerStatus {
    phase: GameServerPhase;
    activeRegion: GameRegion | null;
    instanceRunId: string | null;
    processGeneration: string | null;
    websocketUrl: string | null;
    protocolVersion: number | null;
    regions: Record<GameRegion, RegionalServerStatus>;
}

export interface MultiplayerCapabilities {
    canStart: boolean;
}

export interface StartServerResponse {
    phase: GameServerPhase;
    region: GameRegion;
    operationId: string;
}

export type JoinOperation = 'create' | 'join' | 'reconnect';

export interface JoinCredentialRequest {
    operation: JoinOperation;
    region: GameRegion;
    roomCode?: string;
}

export interface JoinCredential {
    ticket: string;
    expiresAt: string;
    websocketUrl: string;
    processGeneration: string;
}

export interface MultiplayerStanding {
    playerId: string;
    nickname: string;
    color: string;
    score: number;
    rank: number;
    connected: boolean;
}

export interface MultiplayerMatchResult {
    matchId: string;
    roomId: string;
    region: GameRegion;
    startedAt: string;
    completedAt: string | null;
    outcome: 'completed' | 'aborted';
    reason: string | null;
    standings: MultiplayerStanding[];
}

/** Authenticated multiplayer operations implemented by the account HTTP adapter. */
export interface MultiplayerApi {
    getMultiplayerStatus(_signal?: AbortSignal): Promise<MultiplayerStatus>;
    getMultiplayerCapabilities(_signal?: AbortSignal): Promise<MultiplayerCapabilities>;
    startMultiplayerServer(_region: GameRegion): Promise<StartServerResponse>;
    createJoinCredential(_request: JoinCredentialRequest): Promise<JoinCredential>;
    getMultiplayerMatch(_matchId: string): Promise<MultiplayerMatchResult>;
}

/** Narrows account-only test adapters without requiring multiplayer methods. */
export function isMultiplayerApi(value: object | null): value is MultiplayerApi {
    return !!value &&
        'getMultiplayerStatus' in value &&
        typeof value.getMultiplayerStatus === 'function' &&
        'createJoinCredential' in value &&
        typeof value.createJoinCredential === 'function';
}
