import type { GoslingSpec, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding } from '../core/gosling.schema';
import type { GoslingSpecFixed, EncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, Counter, allSameValues, TrackSingleAlt, TrackMultipleAlt, TrackOverlaidAlt, AttributesAlt, GoslingSpecAlt, SingleTrackFixed } from './alt-gosling-schema';
// import { attributeExists, attributeExistsAndChildHasValue} from './util';
import { determineSpecialCases } from './special-cases';
// import { ExtendedSpecToAlt } from './write-alt';
import {
    // single tracks
    IsSingleTrack,
    IsOverlaidTrack,
    IsTemplateTrack,
    // multiple tracks
    IsFlatTracks,
    IsOverlaidTracks,
    IsStackedTracks,
    // other
    IsChannelValue
} from '../core/gosling.schema.guards';


export function getAlt(
    spec: GoslingSpec,
    specCopy: GoslingSpec
): string {
    const altText = 'test';
    console.log(spec)
    //let altSpecDef = AltExtendSpec(specCopy);
    // console.log(altSpecDef);

    // function isMultiple(sp: (RootSpecWithSingleView & ResponsiveSpecOfSingleView) | (RootSpecWithMultipleViews & ResponsiveSpecOfMultipleViews)): sp is (RootSpecWithSingleView & ResponsiveSpecOfSingleView) {
    //     return true
    // }

    //let altTextGen = ExtendedSpecToAlt(altSpecDef);
    //console.log(altTextGen);
    return altText;
}


export function getAltSpec(
    spec: GoslingSpec
): GoslingSpecAlt {
    var altSpec = {} as GoslingSpecAlt;
    var counter = {"nTracks" : 0, "rowViews" : 0, "colViews" : 0};

    return altSpec;
}

export function determineStructure(
    spec: GoslingSpec,
    specPart: GoslingSpec
): any {
    // singleview
    if ('tracks' in specPart) { 
        // multiple tracks
        if (specPart.tracks.length > 1) {
            specPart.tracks.forEach(t => {
                
            });
        } else {
            // one track
        }
    }
    // multiview
    else if ('views' in specPart) {
    }
}


function altFlatTracks() {

}

function altStackedTracks() {
    
}

function altOverlaidTracks() {

}


