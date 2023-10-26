// for envs where crypto.randomUUID is not available (i.e., Node).
function fallback(): string {
    return Math.random().toString(36).substring(2, 10);
}

export function uuid(): string {
    return globalThis.crypto.randomUUID?.() ?? fallback();
}
