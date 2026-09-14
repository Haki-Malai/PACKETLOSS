/** Enables development tools in the local server and explicitly selected development builds. */
export const IS_DEV = import.meta.env.DEV || import.meta.env.MODE === 'development';
