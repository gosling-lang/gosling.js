import type { GoslingSpec, SingleTrack, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding, DataDeep, MultivecData, Y } from '../core/gosling.schema';
import type { GoslingSpecFixed, AltTrackDataFields, AltSpecComposition, AltTrackPosition, AltTrackAppearance, AltTrackData, AltTrackDataDetails, AltTrackAppearanceDetails, AltTrackPositionDetails, AltTrack, AltEncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, AltCounter, AltParentValues, AltGoslingSpec, SingleTrackFixed } from './alt-gosling-schema';
import { attributeExists, attributeExistsDefaultString, attributeHasChildValue, attributeExistsAndChildHasValue} from './util';
import { determineSpecialCases } from './special-cases';
import { IsChannelDeep } from '../core/gosling.schema.guards';

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



export function getAltSpec(
    spec: GoslingSpec
): AltGoslingSpec {
    var altSpec = {} as AltGoslingSpec;
    altSpec.tracks = {} as AltTrack[];

    altSpec.title =  spec.title;
    altSpec.subtitle =  spec.subtitle;

    var counter = {"nTracks" : 0, "rowViews" : 0, "colViews" : 0};
    var altParentValues = {} as AltParentValues;
    altParentValues.arrangement = 'vertical';
    altParentValues.layout = 'linear';

    determineStructure(spec, altSpec, altParentValues, counter)

    var composition: AltSpecComposition = { description: "", nTracks: counter.nTracks, allSame: altParentValues, counter: counter }
    altSpec.composition = composition;

    altSpec.alt = "";
    altSpec.longDescription = "";

    return altSpec;
}

export function determineStructure(
    specPart: GoslingSpec,
    altSpec: AltGoslingSpec,
    altParentValues: AltParentValues,
    counter: AltCounter,
) {
    // singleview
    if ('tracks' in specPart) { 

        const altParentValuesCopy = altUpdateParentValues(specPart, altParentValues);

        // multiple tracks
        if (specPart.tracks.length > 1) {

            // check if overlaid or stacked
            if (IsOverlaidTracks(specPart)) {
                altOverlaidTracks(specPart, altParentValuesCopy, counter);
                counter.nTracks ++;
            } else if (IsStackedTracks(specPart)) {
                altStackedTracks(specPart, altParentValuesCopy, counter);
                counter.nTracks ++;
            } else {
                // otherwise treat every track as a single track
                for (const i in specPart.tracks) {
                    const track =  specPart.tracks[i] as SingleTrack;
                    altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValuesCopy, counter);
                    counter.nTracks ++;
                }
            }
         
        // if only one track is present, it has to be a single track
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
    
    // position
    var positionDetails: AltTrackPositionDetails = {trackNumber: counter.nTracks, rowNumber: counter.rowViews, colNumber: counter.colViews}

    // appearance (anything from mark to layout to encodings)
    var appearanceDetails = {} as AltTrackAppearanceDetails;

    // appearanceDetails.assembly = track.assembly;
    appearanceDetails.layout = altParentValues.layout;
    appearanceDetails.overlaid = false;
    appearanceDetails.mark = track.mark;
    appearanceDetails.encodings = checkEncodings(track);
    
    // data
    // add genomic_field, value_field, category_field for data retrieval
    var dataFields = determineFields(track.data);
    var dataDetails: AltTrackDataDetails = {data: track.data, fields: dataFields};
   
    // add temporary empty descriptions
    var position: AltTrackPosition = {description: "", details: positionDetails}
    var appearance: AltTrackAppearance = {description: "", details: appearanceDetails};
    var data: AltTrackData = {description: "", details: dataDetails};
    
    // add to altTrack
    altTrack.position = position;
    altTrack.appearance = appearance;
    altTrack.title = track.title;
    altTrack.data = data;
    
    // determine type if possible
    altTrack.type = determineSpecialCases(altTrack);

    // empty description, to be filled in.
    altTrack.description = "";

    //console.log(altTrack)

    return altTrack;
    
}


function determineFields(
    data: DataDeep
): AltTrackDataFields {
    const fields = {} as AltTrackDataFields;

    if (data.type === 'multivec') {
        let dataMultivec = data as MultivecData;
        if (dataMultivec.row !== 'unknown') {
            fields.categoryField = dataMultivec.row;
        }
        fields.genomicField = attributeExistsDefaultString(dataMultivec.start, 'position');
        fields.valueField = attributeExistsDefaultString(dataMultivec.start, 'value');
    }

    return fields;
}

function checkEncodings(
    track: SingleTrack
): AltEncodingSeparated {

    var encodingFields = {} as Encoding;
    var encodingStatics = {} as Encoding;

    // supportedEncodings = ['x', 'y', 'xe', 'ye', 'x1', 'y1', 'x1e', 'y1e', 'row', 'color', 'size', 'text', 'stroke', 'strokeWidth', 'opacity'];

    if (IsChannelDeep(track.x)) {
        encodingFields.x = track.x;
    } else if (IsChannelValue(track.x)) {
        encodingStatics.x = track.x;
    }

    if (IsChannelDeep(track.y)) {
        encodingFields.y = track.y;
    } else if (IsChannelValue(track.y)) {
        encodingStatics.y = track.y;
    }

    if (IsChannelDeep(track.xe)) {
        encodingFields.xe = track.xe;
    } else if (IsChannelValue(track.xe)) {
        encodingStatics.xe = track.xe;
    }

    if (IsChannelDeep(track.ye)) {
        encodingFields.ye = track.ye;
    } else if (IsChannelValue(track.ye)) {
        encodingStatics.ye = track.ye;
    }

    if (IsChannelDeep(track.x1)) {
        encodingFields.x1 = track.x1;
    } else if (IsChannelValue(track.x1)) {
        encodingStatics.x1 = track.x1;
    }

    if (IsChannelDeep(track.y1)) {
        encodingFields.y1 = track.y1;
    } else if (IsChannelValue(track.y1)) {
        encodingStatics.y1 = track.y1;
    }

    if (IsChannelDeep(track.x1e)) {
        encodingFields.x1e = track.x1e;
    } else if (IsChannelValue(track.x1e)) {
        encodingStatics.x1e = track.x1e;
    }

    if (IsChannelDeep(track.y1e)) {
        encodingFields.y1e = track.y1e;
    } else if (IsChannelValue(track.y1e)) {
        encodingStatics.y1e = track.y1e;
    }

    if (IsChannelDeep(track.row)) {
        encodingFields.row = track.row;
    } else if (IsChannelValue(track.row)) {
        encodingStatics.row = track.row;
    }

    if (IsChannelDeep(track.color)) {
        encodingFields.color = track.color;
    } else if (IsChannelValue(track.color)) {
        encodingStatics.color = track.color;
    }

    if (IsChannelDeep(track.size)) {
        encodingFields.size = track.size;
    } else if (IsChannelValue(track.size)) {
        encodingStatics.size = track.size;
    }

    if (IsChannelDeep(track.text)) {
        encodingFields.text = track.text;
    } else if (IsChannelValue(track.text)) {
        encodingStatics.text = track.text;
    }

    if (IsChannelDeep(track.stroke)) {
        encodingFields.stroke = track.stroke;
    } else if (IsChannelValue(track.stroke)) {
        encodingStatics.stroke = track.stroke;
    }

    if (IsChannelDeep(track.strokeWidth)) {
        encodingFields.strokeWidth = track.strokeWidth;
    } else if (IsChannelValue(track.strokeWidth)) {
        encodingStatics.strokeWidth = track.strokeWidth;
    }

    if (IsChannelDeep(track.opacity)) {
        encodingFields.opacity = track.opacity;
    } else if (IsChannelValue(track.opacity)) {
        encodingStatics.opacity = track.opacity;
    }

    // bundle together into one object
    const encodingSeparated: AltEncodingSeparated = {encodingField: encodingFields, encodingStatic: encodingStatics}
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
