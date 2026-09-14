import { createContext, useContext, type ReactNode } from 'react';
import { IS_DEV } from './environment';

const environment = { isDev: IS_DEV } as const;
const EnvironmentContext = createContext(environment);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
    return <EnvironmentContext value={environment}>{children}</EnvironmentContext>;
}

/** Reads the build's development flag for UI features from the shared environment context. */
export function useEnvironment() {
    return useContext(EnvironmentContext);
}
