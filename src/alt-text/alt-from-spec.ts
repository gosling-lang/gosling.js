import type { GoslingSpec, SingleTrack, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding } from '../core/gosling.schema';
import type { GoslingSpecFixed, EncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, Counter, allSameValues, TrackSingleAlt, TrackMultipleAlt, TrackOverlaidAlt, AttributesAlt, GoslingSpecAlt, SingleTrackFixed } from './alt-gosling-schema';
import { attributeExists, attributeHasChildValue, attributeExistsAndChildHasValue} from './util';
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

    const altSpec = getAltSpec(spec);
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
    determineStructure(spec, spec, counter)

    return altSpec;
}

export function determineStructure(
    spec: any,
    specPart: GoslingSpec,
    counter: Counter,
): any {
    // singleview
    if ('tracks' in specPart) { 
        // multiple tracks
        if (specPart.tracks.length > 1) {
            if (IsOverlaidTracks(specPart)) {

            } 

            specPart.tracks.forEach(t => {
                
            });
        } else {
            const track = specPart.tracks[0] as SingleTrack;
            console.log(specPart.tracks)
            altSingleTrack(track, counter);
        }
    }
    // multiview
    else if ('views' in specPart) {
    }
}


function altFlatTracks() {

}

function altSingleTrack(
    track: SingleTrack,
    // specAlt: GoslingSpecAlt,
    //  savedAttributes: AttributesAlt, 
    counter: Counter
) {
    var trackSingle = {} as TrackSingleAlt;

    trackSingle.trackNumber = counter.nTracks;
    trackSingle.rowNumber = counter.rowViews;
    trackSingle.colNumber = counter.colViews;

    trackSingle.title = track.title;
    trackSingle.assembly = track.assembly;
    trackSingle.layout = track.layout;
    trackSingle.mark = track.mark;

    trackSingle.encodingSeparated = checkEncodings(track);
    trackSingle.data = track.data;

    trackSingle.specialDesc = determineSpecialCases(trackSingle);

    console.log(trackSingle)

//     return trackSingle;
    
}


function checkEncodings(
    track: SingleTrack
): EncodingSeparated {

    var encodingField = {} as Encoding;
    var encodingStatic = {} as Encoding;

    const supportedEncodings = ['x', 'y', 'xe', 'ye', 'x1', 'y1', 'x1e', 'y1e', 'row', 'color', 'size', 'text', 'stroke', 'strokeWidth', 'opacity'];

    for (const i in supportedEncodings) {
        const encoding = supportedEncodings[i];
        if (attributeExists(track, encoding)) {
            if(attributeExists(track[encoding],'field')) {
                encodingField[encoding] = track[encoding];
            } else {
                encodingStatic[encoding] = track[encoding];
            }
        }
    }
    
    // bundle together into one object
    const encodingSeparated: EncodingSeparated = {encodingField: encodingField, encodingStatic: encodingStatic}
    return encodingSeparated;
}

function altStackedTracks() {
    
}

function altOverlaidTracks() {

}


