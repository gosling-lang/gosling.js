
import { GeminiSpec } from "./gemini.schema";
import { GeminiModel } from './gemini-model';

export function compile(_gm: GeminiSpec) {

    // TODO: Early return with invalid specs.
    // ...

    const gm = new GeminiModel(_gm);
}