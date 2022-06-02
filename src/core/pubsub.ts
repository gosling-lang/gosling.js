import type { _EventMap } from './gosling.schema';

export function publish<Name extends keyof _EventMap>(name: Name, data: _EventMap[Name]): void {
    PubSub.publish(name, data);
}

export function subscribe<Name extends keyof _EventMap>(
    name: Name,
    callback: (msg: string, data: _EventMap[Name]) => void
): void {
    PubSub.subscribe(name, callback);
}

export function unsubscribe<Name extends keyof _EventMap>(name: Name): void {
    PubSub.unsubscribe(name);
}
