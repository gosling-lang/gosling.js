import type { GoslingSpec, SingleTrack,ChannelTypes, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding, DataDeep, MultivecData, X, Y, Color, Size, Text, Stroke, StrokeWidth, Opacity, Row } from '../core/gosling.schema';
import type { GoslingSpecFixed, EncodingValue, AltTrackDataFields, AltSpecComposition, AltTrackPosition, AltTrackAppearance, AltTrackData, AltTrackDataDetails, AltTrackAppearanceDetails, AltTrackPositionDetails, AltTrack, AltEncodingSeparated, TrackFixed, RootSpecWithSingleViewFixed, AltCounter, AltParentValues, AltGoslingSpec, SingleTrackFixed, EncodingValueSingle, EncodingDeepSingle } from './alt-gosling-schema';
import { attributeExists, attributeExistsDefaultString, attributeHasChildValue, attributeExistsAndChildHasValue} from './util';
import { SUPPORTED_CHANNELS } from './../core/mark/index';
import { determineSpecialCases } from './special-cases';
import { getGenomicChannelFromTrack } from './../core/utils/validate';

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
    IsChannelDeep
    IsChannelValue
} from '../core/gosling.schema.guards';



export function getAltSpec(
    spec: GoslingSpec
): AltGoslingSpec {
    var altSpec = {} as AltGoslingSpec;
    altSpec.tracks = {} as AltTrack[];

    altSpec.title =  spec.title;
    altSpec.subtitle =  spec.subtitle;

    var counter = {'nTracks' : 0, 'rowViews' : 0, 'colViews' : 0, 'allPositions': [[0,0]] as number[][], 'totalRows': 0, 'totalCols': 0, 'matrix': {} as number[][]};
    var altParentValues = {} as AltParentValues;
    altParentValues.arrangement = 'vertical';
    altParentValues.layout = 'linear';

    determineStructure(spec, altSpec, altParentValues, counter);

    getPositionMatrix(counter);

    var composition: AltSpecComposition = { description: '', nTracks: counter.nTracks, parentValues: altParentValues, counter: counter }
    altSpec.composition = composition;

    altSpec.alt = '';
    altSpec.longDescription = '';

    return altSpec;
}


function determineStructure(
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
                if (counter.nTracks > 0) {
                    counter.allPositions = [...counter.allPositions, [counter.rowViews, counter.colViews]]
                }
                counter.nTracks ++;
               
            // } else if (IsStackedTracks(specPart)) {
            //     altStackedTracks(specPart, altParentValuesCopy, counter);
            //     counter.nTracks ++;
            } else {
                // otherwise treat every track as a single track
                for (const i in specPart.tracks) {
                    const track =  specPart.tracks[i] as SingleTrack;
                    altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValuesCopy, counter);
                    if (counter.nTracks > 0) {
                        counter.allPositions = [...counter.allPositions, [counter.rowViews, counter.colViews]]
                    }
                    counter.nTracks ++;
                }
            }
         
        // if only one track is present, it has to be a single track
        } else {
            const track = specPart.tracks[0] as SingleTrack;
            altSpec.tracks[counter.nTracks] = altSingleTrack(track, altParentValues, counter);
            if (counter.nTracks > 0) {
                counter.allPositions = [...counter.allPositions, [counter.rowViews, counter.colViews]]
            }
            counter.nTracks ++;
        }
    }
    // multiview
    else if ('views' in specPart) {
        const currRow = counter.rowViews;
        const currCol = counter.colViews;

        specPart.views.forEach((view, i) => {
            if (i !== 0) {
                if (altParentValues.arrangement === 'vertical' || altParentValues.arrangement === 'parallel') {
                    counter.rowViews ++;
                } else {
                    counter.colViews ++;
                }
            }
            const altParentValuesCopy = altUpdateParentValues(view, altParentValues);
            determineStructure(view, altSpec, altParentValuesCopy, counter);
        });

        if (altParentValues.arrangement === 'vertical' || altParentValues.arrangement === 'parallel') {
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

    // uid
    if (track.id !== 'unknown') {
        var uid = track.id as string;
    } else {
        // figure out how to get the uid.
        var uid = '';
    }
    
    
    // position
    var positionDetails: AltTrackPositionDetails = {trackNumber: counter.nTracks, rowNumber: counter.rowViews, colNumber: counter.colViews}

    // appearance (anything from mark to layout to encodings)
    var appearanceDetails = {} as AltTrackAppearanceDetails;

    // appearanceDetails.assembly = track.assembly;
    appearanceDetails.layout = altParentValues.layout;
    appearanceDetails.overlaid = false;
    appearanceDetails.mark = track.mark;
    appearanceDetails.encodings = getSeparatedEncodings(track);
    
    // data
    // add genomic_field, value_field, category_field for data retrieval
    var dataFields = determineFields(track.data, appearanceDetails.encodings);
    var dataDetails: AltTrackDataDetails = {data: track.data, fields: dataFields};
   
    // add temporary empty descriptions
    var position: AltTrackPosition = {description: '', details: positionDetails}
    var appearance: AltTrackAppearance = {description: '', details: appearanceDetails};
    var data: AltTrackData = {description: '', details: dataDetails};
    
    // add to altTrack
    altTrack.uid = uid;
    altTrack.position = position;
    altTrack.appearance = appearance;
    altTrack.title = track.title;
    altTrack.data = data;
    
    // determine type if possible
    altTrack.type = determineSpecialCases(altTrack);

    // empty description, to be filled in.
    altTrack.description = '';

    //console.log(altTrack)

    return altTrack;
    
}


function determineFields(
    data: DataDeep,
    AltEncodingSeparated: AltEncodingSeparated
): AltTrackDataFields {
    const fields = {} as AltTrackDataFields;

    // retrieve genomicField
    if (AltEncodingSeparated.encodingDeepGenomic.length > 0) {
        if (AltEncodingSeparated.encodingDeepGenomic[0].details.field) {
            fields.genomicField = AltEncodingSeparated.encodingDeepGenomic[0].details.field;
        } else {
            fields.genomicField === 'position';
        }
    }

    // retrieve valueField
    if (AltEncodingSeparated.encodingDeepQuantitative.length > 0) {
        if (AltEncodingSeparated.encodingDeepQuantitative[0].details.field) {
            fields.valueField = AltEncodingSeparated.encodingDeepQuantitative[0].details.field;
        } else {
            fields.valueField === 'value';
        }
    }

    // retrieve categoryField
    if (AltEncodingSeparated.encodingDeepNominal.length > 0) {
        if (AltEncodingSeparated.encodingDeepNominal[0].details.field) {
            fields.categoryField = AltEncodingSeparated.encodingDeepNominal[0].details.field;
        } else {
            fields.categoryField === 'sample';
        }
    }

    return fields;

    // // retrieve genomicField
    // if (attributeExists(encodingField, 'x')) {
    //     fields.genomicField = (encodingField.x as X).field as string; // x is always genomic
    // } else if (attributeExists(encodingField, 'y')) {
    //     if ((encodingField.y as Y).type == 'genomic') {
    //         fields.genomicField = (encodingField.y as Y).field as string;
    //     }
    // } else {
    //     fields.genomicField = 'position';
    // }

    // // retrieve valueField
    // if (attributeExists(encodingField, 'y')) {
    //     if ((encodingField.y as Y).type == 'quantitative') {
    //         fields.valueField = (encodingField.y as Y).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'color')) {
    //     if ((encodingField.color as Color).type == 'quantitative') {
    //         fields.valueField = (encodingField.color as Color).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'size')) {
    //     if ((encodingField.size as Size).type == 'quantitative') {
    //         fields.valueField = (encodingField.size as Size).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'text')) {
    //     if ((encodingField.text as Text).type == 'quantitative') {
    //         fields.valueField = (encodingField.size as Size).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'stroke')) {
    //     if ((encodingField.stroke as Stroke).type == 'quantitative') {
    //         fields.valueField = (encodingField.stroke as Stroke).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'strokeWidth')) {
    //     if ((encodingField.strokeWidth as StrokeWidth).type == 'quantitative') {
    //         fields.valueField = (encodingField.strokeWidth as StrokeWidth).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'opacity')) {
    //     if ((encodingField.opacity as Opacity).type == 'quantitative') {
    //         fields.valueField = (encodingField.opacity as Opacity).field as string;
    //     }
    // } else {
    //     fields.valueField = 'value';
    // }

    // // retrieve categoryField
    // if (attributeExists(encodingField, 'row')) {
    //     if ((encodingField.row as Row).type == 'nominal') {
    //         fields.categoryField = (encodingField.row as Row).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'color')) {
    //     if ((encodingField.color as Color).type == 'nominal') {
    //         fields.categoryField = (encodingField.color as Color).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'y')) {
    //     if ((encodingField.y as Y).type == 'nominal') {
    //         fields.categoryField = (encodingField.y as Y).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'size')) {
    //     if ((encodingField.size as Size).type == 'nominal') {
    //         fields.categoryField = (encodingField.size as Size).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'text')) {
    //     if ((encodingField.text as Text).type == 'nominal') {
    //         fields.categoryField = (encodingField.size as Size).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'stroke')) {
    //     if ((encodingField.stroke as Stroke).type == 'nominal') {
    //         fields.categoryField = (encodingField.stroke as Stroke).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'nominal')) {
    //     if ((encodingField.strokeWidth as StrokeWidth).type == 'nominal') {
    //         fields.categoryField = (encodingField.strokeWidth as StrokeWidth).field as string;
    //     }
    // } else if (attributeExists(encodingField, 'nominal')) {
    //     if ((encodingField.opacity as Opacity).type == 'nominal') {
    //         fields.categoryField = (encodingField.opacity as Opacity).field as string;
    //     }
    // } else {
    //    fields.categoryField = ''; 
    // }

    // return fields;
}

export function getSeparatedEncodings(track: SingleTrack): AltEncodingSeparated {
    const encodingDeepGenomic: EncodingDeepSingle[] = [];
    const encodingDeepQuantitative: EncodingDeepSingle[] = [];
    const encodingDeepNominal: EncodingDeepSingle[] = [];
    const encodingValue: EncodingValueSingle[] = [];
    SUPPORTED_CHANNELS.forEach(k => {
        const c = track[k];
        if (IsChannelDeep(c)) {
            if (c.type === 'genomic') {
                encodingDeepGenomic.push({name: k, description: '', details: c});
            } else if (c.type === 'quantitative') {
                encodingDeepQuantitative.push({name: k, description: '', details: c});
            } else {
                encodingDeepNominal.push({name: k, description: '', details: c});
            }
        } else if (IsChannelValue(c)) {
            encodingValue.push({name: k, description: '', details: c});
        }
    });
    // bundle together
    const encodingSeparated: AltEncodingSeparated = {encodingDeepGenomic: encodingDeepGenomic, encodingDeepQuantitative: encodingDeepQuantitative, encodingDeepNominal: encodingDeepNominal, encodingValue: encodingValue};
    return encodingSeparated;
}

// function checkEncodings(
//     track: SingleTrack
// ): AltEncodingSeparated {

    

//     var encodingDeepGenomic = {} as EncodingDeep;
//     var encodingDeepQuantitative = {} as EncodingDeep;
//     var encodingDeepNominal = {} as EncodingDeep;
//     var encodingValue = {} as EncodingValue;

//     const supportedEncodings = ['x', 'y', 'xe', 'ye', 'x1', 'y1', 'x1e', 'y1e', 'row', 'color', 'size', 'text', 'stroke', 'strokeWidth', 'opacity'];
    
    

//     [keyof typeof ChannelTypes, keyof typeof ChannelTypes];

//     if (track.x, 'x') {
//         var e = track.x;
//         var name = 'x';
//         if (IsChannelDeep(e)) {
//             if (e.type === 'genomic') {
//                 encodingDeepGenomic[name] = {description: '', details: e};
//             } else if (e.type === 'quantitative') {
//                 encodingDeepQuantitative[name] = {description: '', details: e};
//             } else {
//                 encodingDeepNominal[name] = {description: '', details: e;
//             }
//         } else if (IsChannelValue(e)) {
//             encodingValue[name] = {description: '', details: e};
//         }
//     }

//     if (IsChannelDeep(track.x)) {
//         // has to be genomic
//         encodingDeepGenomic['x'] = {description: '', details: track.x};
//     } else if (IsChannelValue(track.x)) {
//         encodingValue['x'] = {description: '', details: track.x};
//     }

//     if (IsChannelDeep(track.y)) {
//         if (track.y.type === 'genomic') {
//             encodingDeepGenomic['y'] = {description: '', details: track.y};
//         } else if (track.y.type === 'quantitative') {
//             encodingDeepQuantitative['y'] = {description: '', details: track.y};
//         } else {
//             encodingDeepNominal['y'] = {description: '', details: track.y};
//         }
//     } else if (IsChannelValue(track.y)) {
//         encodingValue['y'] = {description: '', details: track.y};
//     }

//     if (IsChannelDeep(track.xe)) {
//         if (track.xe.type === 'genomic') {
//             encodingDeepGenomic['xe'] = {description: '', details: track.xe};
//         } else if (track.xe.type === 'quantitative') {
//             encodingDeepQuantitative['xe'] = {description: '', details: track.xe};
//         } else {
//             encodingDeepNominal['xe'] = {description: '', details: track.xe};
//         }
//     } else if (IsChannelValue(track.xe)) {
//         encodingValue['xe'] = {description: '', details: track.xe};
//     }


//     if (IsChannelDeep(track.y)) {
//         encodingFields.y = track.y;
//     } else if (IsChannelValue(track.y)) {
//         encodingStatics.y = track.y;
//     }

//     if (IsChannelDeep(track.xe)) {
//         encodingFields.xe = track.xe;
//     } else if (IsChannelValue(track.xe)) {
//         encodingStatics.xe = track.xe;
//     }

//     if (IsChannelDeep(track.ye)) {
//         encodingFields.ye = track.ye;
//     } else if (IsChannelValue(track.ye)) {
//         encodingStatics.ye = track.ye;
//     }

//     if (IsChannelDeep(track.x1)) {
//         encodingFields.x1 = track.x1;
//     } else if (IsChannelValue(track.x1)) {
//         encodingStatics.x1 = track.x1;
//     }

//     if (IsChannelDeep(track.y1)) {
//         encodingFields.y1 = track.y1;
//     } else if (IsChannelValue(track.y1)) {
//         encodingStatics.y1 = track.y1;
//     }

//     if (IsChannelDeep(track.x1e)) {
//         encodingFields.x1e = track.x1e;
//     } else if (IsChannelValue(track.x1e)) {
//         encodingStatics.x1e = track.x1e;
//     }

//     if (IsChannelDeep(track.y1e)) {
//         encodingFields.y1e = track.y1e;
//     } else if (IsChannelValue(track.y1e)) {
//         encodingStatics.y1e = track.y1e;
//     }

//     if (IsChannelDeep(track.row)) {
//         encodingFields.row = track.row;
//     } else if (IsChannelValue(track.row)) {
//         encodingStatics.row = track.row;
//     }

//     if (IsChannelDeep(track.color)) {
//         encodingFields.color = track.color;
//     } else if (IsChannelValue(track.color)) {
//         encodingStatics.color = track.color;
//     }

//     if (IsChannelDeep(track.size)) {
//         encodingFields.size = track.size;
//     } else if (IsChannelValue(track.size)) {
//         encodingStatics.size = track.size;
//     }

//     if (IsChannelDeep(track.text)) {
//         encodingFields.text = track.text;
//     } else if (IsChannelValue(track.text)) {
//         encodingStatics.text = track.text;
//     }

//     if (IsChannelDeep(track.stroke)) {
//         encodingFields.stroke = track.stroke;
//     } else if (IsChannelValue(track.stroke)) {
//         encodingStatics.stroke = track.stroke;
//     }

//     if (IsChannelDeep(track.strokeWidth)) {
//         encodingFields.strokeWidth = track.strokeWidth;
//     } else if (IsChannelValue(track.strokeWidth)) {
//         encodingStatics.strokeWidth = track.strokeWidth;
//     }

//     if (IsChannelDeep(track.opacity)) {
//         encodingFields.opacity = track.opacity;
//     } else if (IsChannelValue(track.opacity)) {
//         encodingStatics.opacity = track.opacity;
//     }

//     // bundle together into one object
//     const encodingSeparated: AltEncodingSeparated = {encodingField: encodingFields, encodingStatic: encodingStatics}
//     return encodingSeparated;
// }

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




function getPositionMatrix(counter: AltCounter) {
    counter.totalRows = Math.max(...counter.allPositions.map(t => t[0])) + 1;
    counter.totalCols = Math.max(...counter.allPositions.map(t => t[1])) + 1;

    let matrix = {} as number[][];
    for (let i = 0; i < counter.totalRows; i++) {
        let colValsI  = counter.allPositions.filter(t => t[0] === i).map(t => t[1])
        let colValsIStructured = {} as number[];
        for (let j of colValsI) {
            if (colValsIStructured[j]) {
                colValsIStructured[j] = colValsIStructured[j] + 1;
            } else {
                colValsIStructured[j] = 1;
            }
        }
        matrix[i] = colValsIStructured;
    }
    counter.matrix = matrix;
}