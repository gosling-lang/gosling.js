/**
 * This file stands for converting HiGlass-Lite options to HiGlass options.
 */

import { Track as HLTrack } from "./higlass-lite.schema";

function sizeToWidthOrHeight(track: HLTrack) {
    const { position, size, width: hlwidth, height: hlheight } = track;
    let width: number | undefined, height: number | undefined;
    if (position === "center") return { width: size ? size : hlwidth, height: size ? size : hlheight };
    else if (position === "left" || position === "right") return { width: size ? size : hlwidth };
    else if (position === "top" || position === "bottom") return { height: size ? size : hlheight };
    else return { width, height };
}

export default {
    sizeToWidthOrHeight,
}