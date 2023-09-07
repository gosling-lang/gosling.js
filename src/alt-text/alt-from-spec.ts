import type { GoslingSpec, Mark, Track, SingleTrack, ChannelTypes, View, PartialTrack, RootSpecWithSingleView, ResponsiveSpecOfSingleView, RootSpecWithMultipleViews, ResponsiveSpecOfMultipleViews, ChannelValue, Encoding, DataDeep, MultivecData, X, Y, Color, Size, Text, Stroke, StrokeWidth, Opacity, Row, OverlaidTrack, OverlaidTracks } from '@gosling-lang/gosling-schema';
import type { AltTrackDataFields, AltTrack, AltTrackOverlaidByDataInd,  AltTrackOverlaidByMark, AltTrackOverlaidByData, AltTrackAppearanceDetailsOverlaid, AltTrackAppearanceOverlaid, AltSpecComposition, AltTrackPosition, AltTrackAppearance, AltTrackData, AltTrackDataDetails, AltTrackAppearanceDetails, AltTrackPositionDetails, AltTrackSingle, AltTrackOverlaid, AltEncodingSeparated, AltCounter, AltParentValues, AltGoslingSpec, EncodingValueSingle, EncodingDeepSingle } from './alt-gosling-schema';
import { attributeExists, attributeExistsDefaultString, attributeHasChildValue, attributeExistsAndChildHasValue} from './util';
import { SUPPORTED_CHANNELS } from './../core/mark/index';
import { determineSpecialCases } from './chart-types';
import { getGenomicChannelFromTrack } from './../gosling-schema/validate';
import { convertToFlatTracks } from './../compiler/spec-preprocess';
import { spreadTracksByData } from './../core/utils/overlay';

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
    IsChannelDeep,
    IsChannelValue
} from '@gosling-lang/gosling-schema';



export function getAltSpec(
    spec: GoslingSpec
): AltGoslingSpec {
    var altSpec = {} as AltGoslingSpec;
    altSpec.tracks = {} as (AltTrack)[];

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

            // check if overlaid
            if (IsOverlaidTracks(specPart)) {
                const track =  specPart as OverlaidTracks;
                altSpec.tracks[counter.nTracks] = altOverlaidTracks(track, altParentValuesCopy, counter);
                if (counter.nTracks > 0) {
                    counter.allPositions = [...counter.allPositions, [counter.rowViews, counter.colViews]]
                }
                counter.nTracks ++;

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

// function altTrackBase(
//     track: SingleTrack | OverlaidTracks,
//     altParentValues: AltParentValues, 
//     counter: AltCounter
// ) {

//     // position
//     var positionDetails: AltTrackPositionDetails = {trackNumber: counter.nTracks, rowNumber: counter.rowViews, colNumber: counter.colViews}



// }

function altSingleTrack(
    track: SingleTrack,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrackSingle {
    var altTrack = {} as AltTrackSingle;
    altTrack.alttype === 'single';

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

    appearanceDetails.assembly = track.assembly;
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
    altTrack.charttype = determineSpecialCases(altTrack);

    // empty description, to be filled in.
    altTrack.description = '';

    console.log(altTrack)

    return altTrack;
    
}


function altOverlaidTracks(
    specPart: OverlaidTracks,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrackOverlaid {
    let tracks: Track[] = convertToFlatTracks(specPart);
    tracks = spreadTracksByData(tracks);

    // test if overlaid track has multiple data sources
    if (tracks.length > 1) {
        return altOverlaidByData(specPart, tracks, altParentValues, counter);
    } else {
        // if (IsOverlaidTrack(specPart)) {}
        return altOverlaidByMark(specPart, altParentValues, counter);
    }
}

function altOverlaidByMark(
    track: OverlaidTracks,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrackOverlaidByMark {
    var altTrack = {} as AltTrackOverlaidByMark;
    altTrack.alttype === 'ov-mark';

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
    var appearanceDetails = {} as AltTrackAppearanceDetailsOverlaid;
    
    appearanceDetails.assembly = track.assembly;
    appearanceDetails.layout = altParentValues.layout;
    appearanceDetails.overlaid = true;
    appearanceDetails.encodings = getSeparatedEncodings(track);
    
    var marks = [] as Mark[];
    var encodingsByMark = [] as AltEncodingSeparated[];
    if (track.mark) {
        marks.push(track.mark);
    } 
    for (let o of track.tracks) {
        let partialOverlaidTrack = o as Partial<OverlaidTrack>;
        if (partialOverlaidTrack.mark) {
            marks.push(partialOverlaidTrack.mark);
        }
        encodingsByMark.push(getSeparatedEncodings(partialOverlaidTrack));
        
    }
    appearanceDetails.mark = marks;
    appearanceDetails.encodingsByMark = encodingsByMark;
    
    // data
    if (track.data) {
        var dataFields = determineFields(track.data, appearanceDetails.encodings);
        var dataDetails: AltTrackDataDetails = {data: track.data, fields: dataFields};
        var data: AltTrackData = {description: '', details: dataDetails};
        altTrack.data = data;
    }

    // add temporary empty descriptions
    var position: AltTrackPosition = {description: '', details: positionDetails}
    var appearance: AltTrackAppearanceOverlaid = {description: '', details: appearanceDetails};
   
    // add to altTrack
    altTrack.uid = uid;
    altTrack.position = position;
    altTrack.appearance = appearance;
    altTrack.title = track.title;
   
    
    // determine type if possible
    var charttypes = [] as string[];
    for (let i = 0; i < marks.length; i++) {
        let charttype = determineSpecialCases(altTrack, i);
        if (charttype) {
            charttypes.push(charttype);
        }
    }
    altTrack.charttype = charttypes

    // empty description, to be filled in.
    altTrack.description = '';

    return altTrack;
}

function altOverlaidByData(
    specPart: OverlaidTracks,
    tracks: Track[],
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrackOverlaidByData {
    var altTrack = {} as AltTrackOverlaidByData;
    altTrack.alttype === 'ov-data';

    // position
    var positionDetails: AltTrackPositionDetails = {trackNumber: counter.nTracks, rowNumber: counter.rowViews, colNumber: counter.colViews}

    var uids = [] as string[]
    var altTrackInd = [] as AltTrackOverlaidByDataInd[];
    for (var t of tracks) {
        let track = t as SingleTrack;
        // uid
        if (track.id !== 'unknown') {
            var uid = track.id as string;
        } else {
            // figure out how to get the uid.
            var uid = '';
        }
        uids.push(uid);
        altTrackInd.push(altOverlaidByDataSingleTrack(track, altParentValues, counter));
    }

    var position: AltTrackPosition = {description: '', details: positionDetails};
    altTrack.position = position;
    
    altTrack.title = specPart.title;

    altTrack.appearance = {details: {layout: 'linear'}}; // only linear is supported at this time

    altTrack.tracks = altTrackInd;
    altTrack.uids = uids;
    altTrack.description = '';

    return altTrack;
}



function altOverlaidByDataSingleTrack(
    track: SingleTrack,
    altParentValues: AltParentValues, 
    counter: AltCounter
): AltTrackOverlaidByDataInd {
    var altTrack = {} as AltTrackOverlaidByDataInd;

    // appearance (anything from mark to layout to encodings)
    var appearanceDetails = {} as AltTrackAppearanceDetails;

    appearanceDetails.assembly = track.assembly;
    appearanceDetails.layout = altParentValues.layout;
    appearanceDetails.overlaid = false;
    appearanceDetails.mark = track.mark;
    appearanceDetails.encodings = getSeparatedEncodings(track);

    // data
    // add genomic_field, value_field, category_field for data retrieval
    var dataFields = determineFields(track.data, appearanceDetails.encodings);
    var dataDetails: AltTrackDataDetails = {data: track.data, fields: dataFields};
   
    // add temporary empty descriptions
    var appearance: AltTrackAppearance = {description: '', details: appearanceDetails};
    var data: AltTrackData = {description: '', details: dataDetails};
    
    // add to altTrack
    altTrack.appearance = appearance;
    altTrack.data = data;
    
    // determine type if possible
    altTrack.charttype = determineSpecialCases(altTrack);

    // empty description, to be filled in.
    altTrack.description = '';

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
}

export function getSeparatedEncodings(track: SingleTrack | OverlaidTracks | Partial<OverlaidTrack>): AltEncodingSeparated {
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