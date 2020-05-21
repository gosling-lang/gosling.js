import { TrackPosition, TrackType as HLTrackType } from "../higlass-lite.schema";
import uuid from "uuid";

export const TRACK_LOCATIONS: TrackPosition[] = [
    'top',
    'left',
    'right',
    'bottom',
    'center',
    'whole',
    'gallery'
];

export function generateReadableTrackUid(pre: string | undefined, n: number) {
    // TODO: Add track type

    // TODO: This is to properly update higlass upon editor changes. Ultimately, remove this.
    // (Refer to https://github.com/sehilyi/higlass-lite/issues/7)
    const id = uuid.v1();
    if (pre) return `${pre}-track-${n}-(${id})`;
    else return `track-${n}-${id}`;
}

export function hgToHlTrackType(t: HLTrackType, p: TrackPosition) {
    switch (t) {
        case "heatmap":
            return "heatmap";
        case "gene-annotation":
            if (p === "left" || p === "right") return "vertical-gene-annotations";
            else return "horizontal-gene-annotations";
        default:
            return "heatmap";
    }
}

export function parseServerAndTilesetUidFromUrl(url: string) {
    if (!url.includes("tileset_info/?d=") || (
        !url.includes("https:") && !url.includes("http:")
    )) {
        // TODO: Add RE to validate the format.
        console.warn("Data url format is incorrect.");
        return { server: undefined, tilesetUid: undefined };
    }

    const pre = url.includes("https:") ? "https:" : "http:";

    const server = url.split("tileset_info/?d=")[0].split(pre)[1];
    const tilesetUid = url.split("tileset_info/?d=")[1]
    return { server, tilesetUid };
}