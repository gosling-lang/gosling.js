import type { GoslingSpec, SingleTrack, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding } from '../core/gosling.schema';
import type { GoslingSpecFixed, AltTrackPosition, AltTrackAppearance, AltTrackData, AltTrackDataDetails, AltTrackAppearanceDetails, AltTrackPositionDetails, AltTrack, AltEncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, AltCounter, AltParentValues, AltGoslingSpec, SingleTrackFixed } from './alt-gosling-schema';
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

    determineStructure(spec, altSpec, altParentValues, counter)

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
                counter.nTracks ++;
            } else if (IsStackedTracks(specPart)) {
                altStackedTracks(specPart, altParentValues, counter);
                counter.nTracks ++;
            } else {
                for (const i in specPart.tracks) {
                    const track =  specPart.tracks[i] as SingleTrack;
                    altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValues, counter);
                    counter.nTracks ++;
                }
            }
         
        } else {
            const track = specPart.tracks[0] as SingleTrack;
            altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValues, counter);
            counter.nTracks ++;
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

function altSingleTrack(
    track: SingleTrack,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrack {
    var altTrack = {} as AltTrack;
    
    var positionDetails: AltTrackPositionDetails = {trackNumber: counter.nTracks, rowNumber: counter.rowViews, colNumber: counter.colViews}

    var appearanceDetails = {} as AltTrackAppearanceDetails;

    appearanceDetails.assembly = track.assembly;
    appearanceDetails.layout = track.layout;
    appearanceDetails.overlaid = false;
    appearanceDetails.mark = track.mark;
    appearanceDetails.encodingSeparated = checkEncodings(track);
    
    var dataDetails: AltTrackDataDetails = {data: track.data};
   
    var position: AltTrackPosition = {description: "", details: positionDetails}
    var appearance: AltTrackAppearance = {description: "", details: appearanceDetails};
    var data: AltTrackData = {description: "", details: dataDetails};


    altTrack.position = position;
    altTrack.appearance = appearance;
    altTrack.title = track.title;
    altTrack.data = data;
    altTrack.type = determineSpecialCases(altTrack);

    console.log(altTrack)

    return altTrack;
    
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

function altFlatTracks() {

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
