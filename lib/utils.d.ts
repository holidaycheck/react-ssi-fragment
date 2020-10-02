export declare const createSSITag: (url: string) => string;
export declare const getInitialHtml: (id: string, defaultHtml: string, isOnClient?: boolean | undefined) => string;
export declare const ownFetch: (url: string) => Promise<unknown>;
export declare const isFallbackNecessary: (url: string, initialHtml: string) => boolean;
export declare const remountScripts: (id: string) => void;
