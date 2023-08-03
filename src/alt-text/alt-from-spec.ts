import type { GoslingSpec, SingleTrack, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding } from '../core/gosling.schema';
import type { GoslingSpecFixed, AltTrack, AltEncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, AltCounter, AltParentValues, AltGoslingSpec, SingleTrackFixed } from './alt-gosling-schema';
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
): AltGoslingSpec {
    var altSpec = {} as AltGoslingSpec;
    var counter = {"nTracks" : 0, "rowViews" : 0, "colViews" : 0};
    var altParentValues = {} as AltParentValues;
    altParentValues.arrangement = 'vertical';
    altParentValues.layout = 'linear';

    determineStructure(spec, spec, altParentValues, counter)

    return altSpec;
}

export function determineStructure(
    specPart: GoslingSpec,
    altSpec: AltGoslingSpec,
    altParentValues: AltParentValues,
    counter: AltCounter,
): any {
    // singleview
    if ('tracks' in specPart) { 
        // multiple tracks
        if (specPart.tracks.length > 1) {
            if (IsOverlaidTracks(specPart)) {
                altOverlaidTracks(specPart, altParentValues, counter);
            } else if (IsStackedTracks(specPart)) {
                altStackedTracks(specPart, altParentValues, counter);
            } else {
                specPart.tracks.forEach(t => {
                     altSingleTrack(t, altParentValues, counter)
                });
            }
         
        } else {
            const track = specPart.tracks[0] as SingleTrack;
            console.log(specPart.tracks)
            altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValues, counter);
        }
    }
    // multiview
    else if ('views' in specPart) {
        const currRow = counter.rowViews;
        const currCol = counter.colViews;

        specPart.views.forEach((view, i) => {
            if (i !== 0) {
                if (altParentValues.arrangement === "vertical" || altParentValues.arrangement === "parallel") {
                    counter.rowViews ++;
                } else {
                    counter.colViews ++;
                }
            }
            const altParentValuesCopy = altUpdateParentValues(view, altParentValues);
            determineStructure(view, altSpec, altParentValuesCopy, counter);
        });

        if (altParentValues.arrangement === "vertical" || altParentValues.arrangement === "parallel") {
            counter.rowViews = currRow;
        } else {
            counter.colViews = currCol;
        }
    }
}

function altUpdateParentValues(
    specPart: any,
    altParentValues: AltParentValues
) {
    var altParentValuesCopy = JSON.parse(JSON.stringify(altParentValues));

    if (attributeExists(specPart, 'arrangement')) {
        altParentValuesCopy.arrangement = specPart.arrangement;
    }
    if (attributeExists(specPart, 'layout')) {
        altParentValuesCopy.layout = specPart.layout;
    }
    return altParentValuesCopy;
}

function altFlatTracks() {

}

function altSingleTrack(
    track: SingleTrack,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrack {
    var trackSingle = {} as AltTrack;

    trackSingle.position.details.trackNumber = counter.nTracks;
    trackSingle.position.details.rowNumber = counter.rowViews;
    trackSingle.position.details.colNumber = counter.colViews;

    trackSingle.title = track.title;
    
    trackSingle.appearance.details.assembly = track.assembly;
    trackSingle.appearance.details.layout = track.layout;
    trackSingle.appearance.details.overlaid = false;
    trackSingle.appearance.details.mark = track.mark;
    trackSingle.appearance.details.encodingSeparated = checkEncodings(track);
    
    trackSingle.data.details.data = track.data;

    trackSingle.type = determineSpecialCases(trackSingle);

    console.log(trackSingle)

    return trackSingle;
    
}



function checkEncodings(
    track: SingleTrack
): AltEncodingSeparated {

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
    const encodingSeparated: AltEncodingSeparated = {encodingField: encodingField, encodingStatic: encodingStatic}
    return encodingSeparated;
}

function altStackedTracks(
    specPart: any,
    altParentValues: AltParentValues, 
    counter: AltCounter
) {
    
}

function altOverlaidTracks(
    specPart: any,
    altParentValues: AltParentValues, 
    counter: AltCounter
) {

}
